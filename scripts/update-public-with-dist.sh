#!/bin/bash

# Quick script to update the public repo with built files

echo "🔄 Updating Public Repository with Built Files"
echo "============================================="
echo ""

# Check if dist exists
if [ ! -d "dist" ]; then
    echo "📦 Building SDK first..."
    npm run build
fi

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
echo "📁 Using temporary directory: $TEMP_DIR"

# Clone the public repo
echo "📥 Cloning public repository..."
git clone git@github.com:app-at-once/node-sdk.git "$TEMP_DIR/node-sdk"
cd "$TEMP_DIR/node-sdk"

# Copy the dist folder from your current directory
echo "📋 Copying dist folder..."
cp -r "$OLDPWD/dist" .

# Check if there are changes
if git diff --quiet; then
    echo "✅ No changes needed - dist folder already up to date!"
    exit 0
fi

# Commit and push
echo "💾 Committing dist folder..."
git add dist/
git commit -m "Add compiled dist folder for GitHub installation support

This allows the SDK to be installed directly from GitHub:
npm install github:app-at-once/node-sdk"

echo "📤 Pushing to public repository..."
git push origin main

echo ""
echo "✅ Successfully updated public repository with dist folder!"
echo ""
echo "📦 Now users can install with:"
echo "   npm install github:app-at-once/node-sdk"
echo ""
echo "   or in package.json:"
echo '   "@appatonce/node-sdk": "github:app-at-once/node-sdk"'