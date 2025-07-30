#!/bin/bash

# Script to update the public repo with the correct gitignore

echo "🔄 Updating Public Repository .gitignore"
echo "========================================"
echo ""

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
echo "📁 Using temporary directory: $TEMP_DIR"

# Clone the public repo
echo "📥 Cloning public repository..."
git clone git@github.com:app-at-once/node-sdk.git "$TEMP_DIR/node-sdk"
cd "$TEMP_DIR/node-sdk"

# Copy the public gitignore
echo "📋 Updating .gitignore..."
if [ -f "$OLDPWD/.gitignore.public" ]; then
    cp "$OLDPWD/.gitignore.public" .gitignore
    echo "✅ Updated .gitignore to not ignore dist folder"
else
    echo "❌ .gitignore.public not found in source directory"
    exit 1
fi

# Check if there are changes
if git diff --quiet; then
    echo "✅ No changes needed - .gitignore already correct!"
    exit 0
fi

# Commit and push
echo "💾 Committing .gitignore update..."
git add .gitignore
git commit -m "Update .gitignore to include dist folder for GitHub installation

This ensures the compiled JavaScript files are available when installing
the SDK directly from GitHub"

echo "📤 Pushing to public repository..."
git push origin main

echo ""
echo "✅ Successfully updated .gitignore in public repository!"