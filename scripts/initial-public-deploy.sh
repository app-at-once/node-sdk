#!/bin/bash

# Script to do the initial deployment to public repository

echo "🚀 Initial Deployment to Public Repository"
echo "=========================================="
echo ""
echo "This script will create the first commit in your public repository"
echo "without any Git history or sensitive data."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the SDK directory?"
    exit 1
fi

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
echo "📁 Creating temporary directory: $TEMP_DIR"

# Copy all files except sensitive ones
echo "📋 Copying files..."
rsync -av --exclude='.git' \
          --exclude='.env*' \
          --exclude='**/test-credentials.json' \
          --exclude='**/*.credentials.js' \
          --exclude='node_modules' \
          --exclude='coverage' \
          --exclude='dist' \
          --exclude='.DS_Store' \
          --exclude='*.log' \
          --exclude='PRIVATE_TO_PUBLIC_SETUP.md' \
          --exclude='GIT_HISTORY_CLEANUP_GUIDE.md' \
          --exclude='CREDENTIAL_CLEANUP_SUMMARY.md' \
          --exclude='scripts/clean-git-history.sh' \
          --exclude='scripts/remove-sensitive-data.sh' \
          --exclude='scripts/initial-public-deploy.sh' \
          . "$TEMP_DIR/"

# Use the public README
if [ -f "README.public.md" ]; then
    echo "📝 Using public README..."
    cp README.public.md "$TEMP_DIR/README.md"
    rm -f "$TEMP_DIR/README.public.md"
fi

# Navigate to temp directory
cd "$TEMP_DIR"

# Install dependencies and build
echo "📦 Installing dependencies..."
npm ci

echo "🔨 Building SDK..."
npm run build

# Initialize Git repository
echo "🔧 Initializing Git repository..."
git init
git add -A

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit - AppAtOnce Node.js SDK v2.0.0

This is the official Node.js SDK for AppAtOnce, providing:
- Simple API for all backend operations
- Built-in authentication
- Real-time updates
- AI integration
- File storage
- Full-text search
- And much more!

Visit https://appatonce.com for more information."

# Add public repository as remote
echo "🔗 Adding public repository remote..."
git remote add origin git@github.com:app-at-once/node-sdk.git

# Show what will be pushed
echo ""
echo "📊 Repository statistics:"
echo "------------------------"
echo "Files: $(find . -type f -not -path './.git/*' | wc -l)"
echo "Size: $(du -sh . | cut -f1)"
echo ""

# Confirm before pushing
echo "🎯 Ready to push to: git@github.com:app-at-once/node-sdk.git"
echo ""
read -p "Do you want to push to the public repository? (yes/no): " -r
echo

if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]
then
    echo "📤 Pushing to public repository..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully deployed to public repository!"
        echo ""
        echo "🎉 Your public SDK is now available at:"
        echo "   https://github.com/app-at-once/node-sdk"
        echo ""
        echo "📋 Next steps:"
        echo "1. Add PUBLIC_REPO_DEPLOY_TOKEN to your private repo secrets"
        echo "2. Future pushes to private repo will auto-deploy to public"
        echo "3. Consider adding branch protection rules to public repo"
    else
        echo "❌ Push failed. Please check your permissions and try again."
    fi
else
    echo "❌ Push cancelled."
    echo "💡 You can manually push later from: $TEMP_DIR"
fi

# Return to original directory
cd - > /dev/null

echo ""
echo "📁 Temporary files are in: $TEMP_DIR"
echo "   (You can delete this after verifying the deployment)"