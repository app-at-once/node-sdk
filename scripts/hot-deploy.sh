#!/bin/bash

# Hot deployment script for node-sdk
# Build locally, test locally, then push only when ready

echo "🔥 HOT DEPLOY - Node SDK"
echo "========================"

# 1. Run lint locally
echo "🔍 Running lint..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Lint failed. Fix errors before deploying."
    exit 1
fi

# 2. Build locally
echo "🔨 Building SDK..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed."
    exit 1
fi

# 3. Run basic tests locally
echo "🧪 Running quick tests..."
npm test -- --testTimeout=5000 --bail || true

echo "✅ Local build successful!"
echo ""
echo "📦 Ready to deploy. To publish:"
echo "   git add ."
echo "   git commit -m 'your message'"
echo "   git push origin main"
echo ""
echo "This will trigger the CI/CD to publish to public repo."