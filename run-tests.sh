#!/bin/bash

# AppAtOnce SDK Test Runner

echo "🚀 AppAtOnce SDK Test Runner"
echo "============================"
echo ""

# Check if local server is running
if [ -z "$CI" ]; then
    echo "Checking local server at http://localhost:8091..."
    curl -s http://localhost:8091/api/v1/ping > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "⚠️  Warning: Local server not responding at http://localhost:8091"
        echo "   Integration tests will fail unless you:"
        echo "   1. Start the local server, or"
        echo "   2. Set APPATONCE_TEST_BASE_URL to a running server"
        echo ""
    else
        echo "✅ Local server is running"
        echo ""
    fi
fi

# Setup git hooks if not already done
if [ ! -f .git/hooks/pre-commit ]; then
    echo "Setting up git hooks..."
    ./scripts/setup-hooks.sh
    echo ""
fi

# Check for credentials
echo "Checking for hardcoded credentials..."
node scripts/check-credentials.js
if [ $? -ne 0 ]; then
    echo "❌ Found potential credentials in code!"
    echo "   Please remove them before running tests"
    exit 1
fi
echo ""

# Build the SDK
echo "Building SDK..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo ""

# Run unit tests with mocks
echo "Running unit tests (with mocks)..."
npm test
UNIT_RESULT=$?
echo ""

# Run integration tests if not skipped
if [ "$SKIP_INTEGRATION_TESTS" != "true" ]; then
    echo "Running integration tests (real API)..."
    npm run test:integration
    INTEGRATION_RESULT=$?
else
    echo "Skipping integration tests (SKIP_INTEGRATION_TESTS=true)"
    INTEGRATION_RESULT=0
fi
echo ""

# Summary
echo "Test Summary"
echo "============"
if [ $UNIT_RESULT -eq 0 ]; then
    echo "✅ Unit tests: PASSED"
else
    echo "❌ Unit tests: FAILED"
fi

if [ "$SKIP_INTEGRATION_TESTS" != "true" ]; then
    if [ $INTEGRATION_RESULT -eq 0 ]; then
        echo "✅ Integration tests: PASSED"
    else
        echo "❌ Integration tests: FAILED"
    fi
else
    echo "⏭️  Integration tests: SKIPPED"
fi

# Exit with error if any tests failed
if [ $UNIT_RESULT -ne 0 ] || [ $INTEGRATION_RESULT -ne 0 ]; then
    exit 1
fi

echo ""
echo "🎉 All tests passed!"