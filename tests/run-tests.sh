#!/bin/bash

# AppAtOnce SDK Test Runner
# This script runs comprehensive tests against the SDK

echo "=== AppAtOnce SDK Test Runner ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if API key is provided
if [ -z "$APPATONCE_TEST_API_KEY" ]; then
  echo -e "${YELLOW}Warning: APPATONCE_TEST_API_KEY not set${NC}"
  echo "Using default test configuration..."
  export APPATONCE_TEST_API_KEY="test-api-key"
fi

# Set base URL if not provided
if [ -z "$APPATONCE_TEST_BASE_URL" ]; then
  export APPATONCE_TEST_BASE_URL="http://localhost:8091"
fi

echo "Test Configuration:"
echo "  API Key: ${APPATONCE_TEST_API_KEY:0:10}..."
echo "  Base URL: $APPATONCE_TEST_BASE_URL"
echo ""

# Build the SDK first
echo "Building SDK..."
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}Build failed!${NC}"
  exit 1
fi

# Run comprehensive test
echo ""
echo "Running comprehensive SDK test..."
node tests/comprehensive-sdk-test.js
COMPREHENSIVE_EXIT_CODE=$?

# Run Jest tests if available
if command -v jest &> /dev/null; then
  echo ""
  echo "Running Jest unit tests..."
  npm test
  JEST_EXIT_CODE=$?
else
  echo ""
  echo -e "${YELLOW}Jest not installed. Skipping unit tests.${NC}"
  JEST_EXIT_CODE=0
fi

# Summary
echo ""
echo "=== Test Summary ==="
if [ $COMPREHENSIVE_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✓ Comprehensive tests passed${NC}"
else
  echo -e "${RED}✗ Comprehensive tests failed${NC}"
fi

if [ $JEST_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✓ Unit tests passed${NC}"
else
  echo -e "${RED}✗ Unit tests failed${NC}"
fi

# Exit with error if any tests failed
if [ $COMPREHENSIVE_EXIT_CODE -ne 0 ] || [ $JEST_EXIT_CODE -ne 0 ]; then
  exit 1
fi

echo ""
echo -e "${GREEN}All tests passed! SDK is ready for deployment.${NC}"
exit 0