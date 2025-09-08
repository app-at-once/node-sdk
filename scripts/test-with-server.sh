#!/bin/bash

# Node SDK Test Runner with Server Test Environment
# This script starts the server's test environment and runs SDK tests

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SDK_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SERVER_DIR="$(cd "$SDK_DIR/../server" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         AppAtOnce Node SDK - Complete Test Suite            ║${NC}"
echo -e "${CYAN}║            Using Server Test Infrastructure                 ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check server directory
check_server_dir() {
    if [ ! -d "$SERVER_DIR" ]; then
        echo -e "${RED}❌ Server directory not found at: $SERVER_DIR${NC}"
        exit 1
    fi
    
    if [ ! -f "$SERVER_DIR/scripts/start-test-environment.sh" ]; then
        echo -e "${RED}❌ Server test script not found${NC}"
        exit 1
    fi
}

# Function to start test environment
start_test_environment() {
    echo -e "${BLUE}📦 Starting test environment from server...${NC}"
    cd "$SERVER_DIR"
    ./scripts/start-test-environment.sh start
    cd "$SDK_DIR"
    echo -e "${GREEN}✅ Test environment ready${NC}"
}

# Function to build SDK
build_sdk() {
    echo -e "${BLUE}🔨 Building Node SDK...${NC}"
    cd "$SDK_DIR"
    npm run build
    echo -e "${GREEN}✅ SDK built successfully${NC}"
}

# Function to setup test credentials
setup_test_credentials() {
    echo -e "${BLUE}🔑 Setting up test credentials...${NC}"
    cd "$SDK_DIR/sdk-test-suite/setup"
    
    # Run the test environment setup
    node test-environment.js setup
    
    echo -e "${GREEN}✅ Test credentials ready${NC}"
}

# Function to run WHERE clause tests
run_where_tests() {
    echo -e "${BLUE}🧪 Running WHERE clause tests...${NC}"
    cd "$SDK_DIR/sdk-test-suite"
    
    # Set environment variables
    export TEST_BASE_URL="http://localhost:3001"
    export NODE_ENV="test"
    export DEBUG="true"
    
    # Run WHERE clause tests
    node tests/where-clause-tests.js
}

# Function to run all tests
run_all_tests() {
    echo -e "${BLUE}🧪 Running all SDK tests...${NC}"
    cd "$SDK_DIR/sdk-test-suite"
    
    # Set environment variables
    export TEST_BASE_URL="http://localhost:3001"
    export NODE_ENV="test"
    
    # Run all test suites
    echo -e "${CYAN}Running WHERE clause tests...${NC}"
    node tests/where-clause-tests.js
    
    echo -e "${CYAN}Running CRUD tests...${NC}"
    node tests/crud-tests.js
    
    echo -e "${CYAN}Running Query Builder tests...${NC}"
    node tests/query-builder-tests.js
}

# Function to stop test environment
stop_test_environment() {
    echo -e "${BLUE}🛑 Stopping test environment...${NC}"
    cd "$SERVER_DIR"
    ./scripts/start-test-environment.sh stop
    echo -e "${GREEN}✅ Test environment stopped${NC}"
}

# Function to cleanup
cleanup() {
    echo -e "${BLUE}🧹 Cleaning up test environment...${NC}"
    cd "$SERVER_DIR"
    ./scripts/start-test-environment.sh cleanup
    echo -e "${GREEN}✅ Cleanup complete${NC}"
}

# Function to show help
show_help() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  test        Run all tests (default)"
    echo "  where       Run WHERE clause tests only"
    echo "  crud        Run CRUD tests only"
    echo "  query       Run Query Builder tests only"
    echo "  start       Start test environment only"
    echo "  stop        Stop test environment"
    echo "  cleanup     Stop and cleanup test environment"
    echo "  help        Show this help message"
    echo ""
    echo "Options:"
    echo "  --no-build  Skip SDK build step"
    echo "  --no-setup  Skip credential setup"
    echo "  --keep      Keep test environment running after tests"
    echo ""
    echo "Examples:"
    echo "  $0                    # Run all tests"
    echo "  $0 where              # Run WHERE tests only"
    echo "  $0 test --no-build    # Run tests without rebuilding SDK"
    echo "  $0 where --keep       # Run WHERE tests and keep environment running"
}

# Parse command line arguments
COMMAND="${1:-test}"
NO_BUILD=false
NO_SETUP=false
KEEP_RUNNING=false

shift || true
while [[ $# -gt 0 ]]; do
    case $1 in
        --no-build)
            NO_BUILD=true
            shift
            ;;
        --no-setup)
            NO_SETUP=true
            shift
            ;;
        --keep)
            KEEP_RUNNING=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Main execution
case "$COMMAND" in
    test|all)
        check_server_dir
        start_test_environment
        
        if [ "$NO_BUILD" = false ]; then
            build_sdk
        fi
        
        if [ "$NO_SETUP" = false ]; then
            setup_test_credentials
        fi
        
        run_all_tests
        
        if [ "$KEEP_RUNNING" = false ]; then
            stop_test_environment
        fi
        ;;
        
    where)
        check_server_dir
        start_test_environment
        
        if [ "$NO_BUILD" = false ]; then
            build_sdk
        fi
        
        if [ "$NO_SETUP" = false ]; then
            setup_test_credentials
        fi
        
        run_where_tests
        
        if [ "$KEEP_RUNNING" = false ]; then
            stop_test_environment
        fi
        ;;
        
    crud)
        check_server_dir
        start_test_environment
        
        if [ "$NO_BUILD" = false ]; then
            build_sdk
        fi
        
        if [ "$NO_SETUP" = false ]; then
            setup_test_credentials
        fi
        
        echo -e "${BLUE}🧪 Running CRUD tests...${NC}"
        cd "$SDK_DIR/sdk-test-suite"
        node tests/crud-tests.js
        
        if [ "$KEEP_RUNNING" = false ]; then
            stop_test_environment
        fi
        ;;
        
    query|query-builder)
        check_server_dir
        start_test_environment
        
        if [ "$NO_BUILD" = false ]; then
            build_sdk
        fi
        
        if [ "$NO_SETUP" = false ]; then
            setup_test_credentials
        fi
        
        echo -e "${BLUE}🧪 Running Query Builder tests...${NC}"
        cd "$SDK_DIR/sdk-test-suite"
        node tests/query-builder-tests.js
        
        if [ "$KEEP_RUNNING" = false ]; then
            stop_test_environment
        fi
        ;;
        
    start)
        check_server_dir
        start_test_environment
        echo -e "${GREEN}Test environment is running at http://localhost:3001${NC}"
        ;;
        
    stop)
        check_server_dir
        stop_test_environment
        ;;
        
    cleanup)
        check_server_dir
        cleanup
        ;;
        
    help)
        show_help
        ;;
        
    *)
        echo -e "${RED}Unknown command: $COMMAND${NC}"
        show_help
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✨ Done!${NC}"