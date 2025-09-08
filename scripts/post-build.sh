#!/bin/bash

# Post-build script to copy README and LICENSE to dist
echo "📄 Copying README.md to dist..."
cp README.md dist/README.md

echo "📄 Copying LICENSE to dist..."
cp LICENSE dist/LICENSE

echo "✅ Post-build complete!"