#!/bin/bash

# Script to clean Git history and remove all commits with sensitive data

echo "⚠️  WARNING: This will completely reset your Git history!"
echo "Make sure you have:"
echo "1. Committed all your current changes"
echo "2. Backed up anything important"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]
then
    echo "Aborted."
    exit 1
fi

# Save current branch name
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "📋 Current branch: $CURRENT_BRANCH"
echo ""

# Create a backup branch just in case
echo "1️⃣ Creating backup branch..."
git branch backup-before-history-clean

# Create a new orphan branch (no history)
echo "2️⃣ Creating new orphan branch..."
git checkout --orphan clean-history

# Add all files
echo "3️⃣ Adding all files..."
git add -A

# Create a new initial commit
echo "4️⃣ Creating new initial commit..."
git commit -m "Initial commit - Clean history without credentials"

# Delete the old branch
echo "5️⃣ Deleting old branch..."
git branch -D $CURRENT_BRANCH

# Rename the current branch to the original name
echo "6️⃣ Renaming branch..."
git branch -m $CURRENT_BRANCH

# Force push to remote (this will overwrite history)
echo "7️⃣ Force pushing to remote..."
echo "⚠️  This will overwrite the remote repository history!"
read -p "Continue with force push? (yes/no): " -r
echo

if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]
then
    git push -f origin $CURRENT_BRANCH
    echo "✅ History cleaned and pushed to remote!"
    echo ""
    echo "⚠️  IMPORTANT: All collaborators need to:"
    echo "   1. Delete their local repository"
    echo "   2. Clone fresh from GitHub: git clone git@github.com:app-at-once/node-sdk.git"
    echo ""
    echo "📝 The backup branch 'backup-before-history-clean' is kept locally."
    echo "   You can delete it later with: git branch -D backup-before-history-clean"
else
    echo "❌ Force push cancelled. Your local history is cleaned but remote is unchanged."
    echo "   To push later, run: git push -f origin $CURRENT_BRANCH"
fi