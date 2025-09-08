#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting SDK publish process...${NC}"

# Navigate to SDK directory
cd /Users/islamnymul/DEVELOP/appatonce/node-sdk

# Build the SDK
echo -e "${YELLOW}📦 Building SDK...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

# Patch URLs for public repository
echo -e "${YELLOW}🔧 Patching URLs for public repository...${NC}"
./scripts/patch-urls-for-public.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ URL patching failed!${NC}"
    exit 1
fi

# Copy necessary files to dist
echo -e "${YELLOW}📋 Copying package.json and README.md to dist...${NC}"
cp package.json dist/
cp README.md dist/
# Also copy LICENSE if it exists
if [ -f "LICENSE" ]; then
    cp LICENSE dist/
fi

# Clone the public repository
echo -e "${YELLOW}🔄 Cloning public repository...${NC}"
rm -rf temp-public
git clone git@github.com:app-at-once/node-sdk.git temp-public
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to clone public repository!${NC}"
    echo -e "${YELLOW}Make sure you have SSH access to the repository.${NC}"
    exit 1
fi

# Clear the public repo and copy new files
echo -e "${YELLOW}🔄 Updating public repository files...${NC}"
# Preserve .git directory
mv temp-public/.git temp-git
rm -rf temp-public/*
mv temp-git temp-public/.git

# Create the dist directory in the public repo
mkdir -p temp-public/dist

# Copy all dist files to the dist directory
cp -r dist/* temp-public/dist/

# Copy package.json and README to root (not from dist)
cp package.json temp-public/
cp README.md temp-public/
if [ -f "LICENSE" ]; then
    cp LICENSE temp-public/
fi

# Create a .gitignore for the public repo if needed
echo -e "${YELLOW}📝 Creating .gitignore for public repo...${NC}"
cat > temp-public/.gitignore << EOF
node_modules/
*.log
.env
.DS_Store
coverage/
.vscode/
.idea/
EOF

# Commit and push changes
cd temp-public
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo -e "${YELLOW}ℹ️  No changes to commit.${NC}"
else
    echo -e "${YELLOW}💾 Committing changes...${NC}"
    git commit -m "Update SDK build - $(date +%Y-%m-%d' '%H:%M:%S)"
    
    echo -e "${YELLOW}📤 Pushing to public repository...${NC}"
    git push origin main || git push origin master
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Push failed!${NC}"
        cd ..
        rm -rf temp-public
        exit 1
    fi
fi

# Cleanup
cd ..
rm -rf temp-public

echo -e "${GREEN}✅ SDK successfully published to public repository!${NC}"
echo -e "${GREEN}📦 The SDK is now available at: https://github.com/app-at-once/node-sdk${NC}"
echo -e "${GREEN}🌐 It will work with api.appatonce.com${NC}"