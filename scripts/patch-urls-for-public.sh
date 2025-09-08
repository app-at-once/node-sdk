#!/bin/bash

# This script patches the hardcoded URLs in the SDK from localhost to api.appatonce.com
# Used when publishing to the public repository

echo "🔧 Patching URLs for public repository..."

# Patch the source TypeScript files
if [ -f "src/constants.ts" ]; then
    echo "  Patching src/constants.ts..."
    sed -i.bak 's|http://localhost:8091/api/v1|https://api.appatonce.com/api/v1|g' src/constants.ts
    rm src/constants.ts.bak
fi

if [ -f "src/browser/index.ts" ]; then
    echo "  Patching src/browser/index.ts..."
    sed -i.bak 's|http://localhost:8091/api/v1|https://api.appatonce.com/api/v1|g' src/browser/index.ts
    rm src/browser/index.ts.bak
fi

# Patch the compiled JavaScript files
if [ -f "dist/constants.js" ]; then
    echo "  Patching dist/constants.js..."
    sed -i.bak 's|http://localhost:8091/api/v1|https://api.appatonce.com/api/v1|g' dist/constants.js
    rm dist/constants.js.bak
fi

# Patch the browser index.js file
if [ -f "dist/browser/index.js" ]; then
    echo "  Patching dist/browser/index.js..."
    sed -i.bak 's|http://localhost:8091/api/v1|https://api.appatonce.com/api/v1|g' dist/browser/index.js
    rm dist/browser/index.js.bak
fi

# Also patch the source map files if they exist
if [ -f "dist/constants.js.map" ]; then
    echo "  Patching dist/constants.js.map..."
    sed -i.bak 's|http://localhost:8091/api/v1|https://api.appatonce.com/api/v1|g' dist/constants.js.map
    rm dist/constants.js.map.bak
fi

if [ -f "dist/browser/index.js.map" ]; then
    echo "  Patching dist/browser/index.js.map..."
    sed -i.bak 's|http://localhost:8091/api/v1|https://api.appatonce.com/api/v1|g' dist/browser/index.js.map
    rm dist/browser/index.js.map.bak
fi

echo "✅ URL patching complete!"