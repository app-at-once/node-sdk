#!/bin/bash

# Quick deployment script for Node SDK to public repository
# This script mimics the GitHub workflow for manual deployment

set -e  # Exit on any error

echo \"🚀 Node SDK Deployment Script\"
echo \"=============================\"
echo \"\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Helper functions
error() {
    echo -e \"${RED}❌ Error: $1${NC}\"
    exit 1
}

success() {
    echo -e \"${GREEN}✅ $1${NC}\"
}

warning() {
    echo -e \"${YELLOW}⚠️  $1${NC}\"
}

info() {
    echo -e \"${BLUE}ℹ️  $1${NC}\"
}

# Check if we're in the right directory
if [ ! -f \"package.json\" ] || [ ! -d \"src\" ]; then
    error \"This script must be run from the node-sdk root directory\"
fi

# Check if git is clean
if [ -n \"$(git status --porcelain)\" ]; then
    warning \"You have uncommitted changes. Commit them first for accurate deployment.\"
    read -p \"Continue anyway? (y/N): \" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get current version
VERSION=$(node -p \"require('./package.json').version\")
COMMIT_HASH=$(git rev-parse HEAD)
BRANCH=$(git rev-parse --abbrev-ref HEAD)

info \"Current version: $VERSION\"
info \"Branch: $BRANCH\"
info \"Commit: $COMMIT_HASH\"
echo \"\"

# Check if public remote exists
if ! git remote get-url public > /dev/null 2>&1; then
    error \"Public remote not found. Add it with: git remote add public git@github.com:app-at-once/node-sdk.git\"
fi

# Step 1: Install dependencies and build
info \"Step 1: Building SDK...\"
npm ci || error \"Failed to install dependencies\"
npm run build || error \"Build failed\"

if [ ! -d \"dist\" ] || [ ! -f \"dist/index.js\" ]; then
    error \"Build output missing - dist/index.js not found\"
fi

success \"Build completed successfully\"
echo \"\"

# Step 2: Run tests
info \"Step 2: Running tests...\"
npm run lint || error \"Linting failed\"
npm test || error \"Tests failed\"

success \"All tests passed\"
echo \"\"

# Step 3: Create temporary directory for public deployment
TEMP_DIR=$(mktemp -d)
info \"Step 3: Preparing public repository content in $TEMP_DIR\"

# Copy necessary files
cp -r dist/ \"$TEMP_DIR/\"
cp package.json \"$TEMP_DIR/\"
cp README.md \"$TEMP_DIR/\" || cp README.public.md \"$TEMP_DIR/README.md\" 2>/dev/null || warning \"No README found\"
cp LICENSE \"$TEMP_DIR/\" 2>/dev/null || warning \"No LICENSE found\"
cp CHANGELOG.md \"$TEMP_DIR/\" 2>/dev/null || warning \"No CHANGELOG found\"

# Create minimal package.json for public use
cd \"$TEMP_DIR\"
node -e \"
const pkg = require('./package.json');
const publicPkg = {
  name: pkg.name,
  version: pkg.version,
  description: pkg.description,
  main: pkg.main,
  types: pkg.types,
  keywords: pkg.keywords,
  author: pkg.author,
  license: pkg.license,
  dependencies: pkg.dependencies,
  repository: {
    type: 'git',
    url: 'https://github.com/app-at-once/node-sdk'
  },
  bugs: {
    url: 'https://github.com/app-at-once/node-sdk/issues'
  },
  homepage: pkg.homepage,
  files: ['dist', 'README.md', 'LICENSE']
};
require('fs').writeFileSync('package.json', JSON.stringify(publicPkg, null, 2));
\"

# Create build info
echo \"{
  \\\"buildTime\\\": \\\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\\\",
  \\\"commitHash\\\": \\\"$COMMIT_HASH\\\",
  \\\"branch\\\": \\\"$BRANCH\\\",
  \\\"version\\\": \\\"$VERSION\\\",
  \\\"deployedBy\\\": \\\"$(whoami)\\\",
  \\\"manual\\\": true
}\" > dist/build-info.json

success \"Public repository content prepared\"
echo \"\"

# Step 4: Initialize git and commit
info \"Step 4: Creating deployment commit...\"

git init
git add .

COMMIT_MSG=\"SDK Release $VERSION - $(date +'%Y-%m-%d %H:%M:%S')

📦 Built from commit: $COMMIT_HASH
🌱 Source branch: $BRANCH
👤 Deployed by: $(whoami)
🔧 Manual deployment

This release contains only the compiled dist files and public documentation.
For development and source code, see the private repository.\"

git commit -m \"$COMMIT_MSG\"

success \"Deployment commit created\"
echo \"\"

# Step 5: Push to public repository
info \"Step 5: Pushing to public repository...\"

# Go back to original directory to get the remote URL
cd - > /dev/null
PUBLIC_REMOTE=$(git remote get-url public)
cd \"$TEMP_DIR\"

git remote add public \"$PUBLIC_REMOTE\"

echo \"Pushing to public repository...\"
git push -f public HEAD:main || error \"Failed to push to public repository\"

success \"Successfully pushed to public repository\"
echo \"\"

# Step 6: Create release tag
info \"Step 6: Creating release tag...\"

TAG_NAME=\"v$VERSION\"
git tag -a \"$TAG_NAME\" -m \"Release $TAG_NAME

📦 Auto-generated release from private repository
👤 Deployed by: $(whoami)
📅 Date: $(date +'%Y-%m-%d %H:%M:%S UTC')

This release includes:
- Compiled TypeScript dist files
- Type definitions
- Public documentation
- Dependencies\"

# Push tag (don't fail if it already exists)
if git push public \"$TAG_NAME\" 2>/dev/null; then
    success \"Release tag $TAG_NAME created\"
else
    warning \"Tag $TAG_NAME already exists, skipping...\"
fi

echo \"\"

# Step 7: Cleanup
info \"Step 7: Cleaning up...\"
cd - > /dev/null
rm -rf \"$TEMP_DIR\"
success \"Cleanup completed\"

echo \"\"
echo \"🎉 Deployment Summary\"
echo \"=====================\"
echo \"Repository: app-at-once/node-sdk\"
echo \"Version: $VERSION\"
echo \"Tag: $TAG_NAME\"
echo \"Branch: main\"
echo \"Commit: $COMMIT_HASH\"
echo \"Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)\"
echo \"\"
echo \"📋 Next Steps:\"
echo \"1. Verify deployment: https://github.com/app-at-once/node-sdk\"
echo \"2. Check release: https://github.com/app-at-once/node-sdk/releases\"
echo \"3. Test npm install: npm install @appatonce/node-sdk\"
echo \"\"
success \"Deployment completed successfully!\"