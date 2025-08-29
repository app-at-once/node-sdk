#!/bin/bash

# Script to push only dist folder and necessary files to public repo

echo "📦 Pushing dist folder to Public Repository"
echo "=========================================="
echo ""

# Check if dist exists
if [ ! -d "dist" ]; then
    echo "🔨 Building SDK first..."
    npm run build
fi

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
echo "📁 Using temporary directory: $TEMP_DIR"

# Clone the public repo
echo "📥 Cloning public repository..."
git clone git@github.com:app-at-once/node-sdk.git "$TEMP_DIR/node-sdk"
cd "$TEMP_DIR/node-sdk"

# Remove GitHub Actions workflows from public repo
echo "🗑️  Removing GitHub Actions workflows..."
rm -rf .github/workflows

# Copy the dist folder and update other files
echo "📋 Copying dist folder and updating files..."
cp -r "$OLDPWD/dist" .

# Also copy package.json to ensure version is updated
cp "$OLDPWD/package.json" .

# Remove any private documentation
rm -f PRIVATE_*.md
rm -f GIT_HISTORY_*.md
rm -f CREDENTIAL_*.md
rm -f TESTING_SETUP_SUMMARY.md

# Check if there are changes
if git diff --quiet && git diff --staged --quiet; then
    echo "✅ No changes needed!"
    exit 0
fi

# Stage all changes
git add -A

# Show what will be committed
echo ""
echo "📊 Changes to be committed:"
git status --short
echo ""

# Commit and push
echo "💾 Committing changes..."
git commit -m "Update dist folder and remove GitHub Actions

- Latest compiled JavaScript files
- Remove GitHub Actions (runs in private repo only)
- Clean up private documentation"

echo "📤 Pushing to public repository..."
git push origin main

echo ""
echo "✅ Successfully updated public repository!"
echo ""
echo "The public repo now has:"
echo "- ✅ Latest dist folder"
echo "- ✅ No GitHub Actions"
echo "- ✅ Clean public documentation"