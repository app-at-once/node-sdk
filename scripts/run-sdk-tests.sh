#!/bin/bash

# Node SDK Test Runner
# Uses the centralized test environment from server

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SDK_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SERVER_DIR="$(cd "$SDK_DIR/../server" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  AppAtOnce Node SDK Test Runner${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to start test environment
start_test_env() {
    echo -e "${BLUE}Starting test environment from server...${NC}"
    cd "$SERVER_DIR"
    ./scripts/start-test-environment.sh start
    cd "$SDK_DIR"
}

# Function to run SDK tests
run_tests() {
    echo -e "${BLUE}Running Node SDK tests...${NC}"
    
    # Build SDK first
    echo -e "${BLUE}Building SDK...${NC}"
    npm run build
    
    # Run the test suite
    echo -e "${BLUE}Running test suite...${NC}"
    cd "$SDK_DIR/sdk-test-suite"
    
    # Run the actual tests
    node tests/where-clause-tests.js
}

# Main execution
case "${1:-test}" in
    start)
        start_test_env
        ;;
    test)
        start_test_env
        run_tests
        ;;
    stop)
        cd "$SERVER_DIR"
        ./scripts/start-test-environment.sh stop
        ;;
    cleanup)
        cd "$SERVER_DIR"
        ./scripts/start-test-environment.sh cleanup
        ;;
    *)
        echo "Usage: $0 {test|start|stop|cleanup}"
        exit 1
        ;;
esac