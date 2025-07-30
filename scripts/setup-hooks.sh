#!/bin/bash

# Setup pre-commit hooks for the project

echo "Setting up git hooks..."

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

echo "Running pre-commit checks..."

# Check for credentials
echo "Checking for credentials..."
node scripts/check-credentials.js
if [ $? -ne 0 ]; then
    echo "❌ Pre-commit check failed: Credentials detected"
    exit 1
fi

# Run linter
echo "Running linter..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Pre-commit check failed: Linting errors"
    exit 1
fi

echo "✅ All pre-commit checks passed!"
EOF

# Make hook executable
chmod +x .git/hooks/pre-commit

echo "✅ Git hooks setup complete!"
echo ""
echo "The following checks will run before each commit:"
echo "  - Credential detection"
echo "  - ESLint"
echo ""
echo "To bypass hooks (use with caution): git commit --no-verify"