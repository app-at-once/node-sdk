#!/bin/bash

# Comprehensive CI/CD script for AppAtOnce Node SDK
# This script replicates GitHub Actions workflows locally

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
NODE_VERSIONS=("16" "18" "20")
DEFAULT_NODE_VERSION="18"
SKIP_INTEGRATION_TESTS="${SKIP_INTEGRATION_TESTS:-true}"
NPM_DRY_RUN="${NPM_DRY_RUN:-true}"

# Functions
print_header() {
    echo -e "\n${BLUE}==== $1 ====${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if running in CI environment
is_ci() {
    [ -n "${CI}" ] || [ -n "${GITHUB_ACTIONS}" ] || [ -n "${JENKINS_HOME}" ]
}

# Check if nvm is available
check_nvm() {
    if command -v nvm &> /dev/null; then
        return 0
    elif [ -s "$HOME/.nvm/nvm.sh" ]; then
        source "$HOME/.nvm/nvm.sh"
        return 0
    fi
    return 1
}

# Setup Node.js version
setup_node_version() {
    local version=$1
    
    if check_nvm; then
        print_header "Setting up Node.js v${version}"
        nvm install "${version}"
        nvm use "${version}"
        print_success "Using Node.js $(node --version)"
    else
        print_warning "nvm not found. Using system Node.js $(node --version)"
        if ! node --version | grep -q "v${version}"; then
            print_warning "System Node.js version doesn't match requested v${version}"
        fi
    fi
}

# Install dependencies
install_dependencies() {
    print_header "Installing dependencies"
    cd "${PROJECT_ROOT}"
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    print_success "Dependencies installed"
}

# Build the SDK
build_sdk() {
    print_header "Building SDK"
    cd "${PROJECT_ROOT}"
    npm run build
    
    if [ -d "dist" ]; then
        print_success "Build completed successfully"
        echo "Build artifacts:"
        find dist -type f -name "*.js" -o -name "*.d.ts" | head -10
        echo "..."
    else
        print_error "Build failed - dist directory not found"
        exit 1
    fi
}

# Run linting
run_lint() {
    print_header "Running ESLint"
    cd "${PROJECT_ROOT}"
    
    if npm run lint; then
        print_success "Linting passed"
    else
        print_error "Linting failed"
        if [ "$1" == "fix" ]; then
            print_header "Attempting to fix lint errors"
            npm run lint:fix
        fi
        exit 1
    fi
}

# Check for credentials
check_credentials() {
    print_header "Checking for credentials"
    cd "${PROJECT_ROOT}"
    
    if npm run check:credentials; then
        print_success "No credentials found"
    else
        print_error "Credentials detected in codebase"
        exit 1
    fi
}

# Run tests
run_tests() {
    local node_version=$1
    
    print_header "Running tests on Node.js v${node_version}"
    
    # Unit tests
    echo "Running unit tests..."
    if npm test; then
        print_success "Unit tests passed"
    else
        print_error "Unit tests failed"
        exit 1
    fi
    
    # Coverage report
    echo "Running tests with coverage..."
    if npm run test:coverage; then
        print_success "Coverage report generated"
        if [ -f "coverage/lcov.info" ]; then
            echo "Coverage summary:"
            grep -A 3 "Lines" coverage/lcov.info || true
        fi
    fi
    
    # Integration tests (optional)
    if [ "${SKIP_INTEGRATION_TESTS}" != "true" ]; then
        echo "Running integration tests..."
        if [ -n "${APPATONCE_TEST_API_KEY}" ]; then
            if npm run test:integration; then
                print_success "Integration tests passed"
            else
                print_error "Integration tests failed"
                exit 1
            fi
        else
            print_warning "Skipping integration tests - APPATONCE_TEST_API_KEY not set"
        fi
    else
        print_warning "Skipping integration tests - SKIP_INTEGRATION_TESTS=true"
    fi
}

# Version management
bump_version() {
    local bump_type=$1  # patch, minor, major
    
    print_header "Bumping version (${bump_type})"
    cd "${PROJECT_ROOT}"
    
    # Get current version
    current_version=$(node -p "require('./package.json').version")
    echo "Current version: ${current_version}"
    
    # Bump version
    npm version "${bump_type}" --no-git-tag-version
    
    # Get new version
    new_version=$(node -p "require('./package.json').version")
    echo "New version: ${new_version}"
    
    print_success "Version bumped from ${current_version} to ${new_version}"
}

# Generate changelog
generate_changelog() {
    print_header "Generating changelog"
    cd "${PROJECT_ROOT}"
    
    # Get latest version
    version=$(node -p "require('./package.json').version")
    date=$(date +"%Y-%m-%d")
    
    # Create changelog entry
    changelog_entry="## [${version}] - ${date}

### Added
- New features go here

### Changed
- Changes go here

### Fixed
- Bug fixes go here

### Security
- Security updates go here

"
    
    # Prepend to CHANGELOG.md
    if [ -f "CHANGELOG.md" ]; then
        echo "${changelog_entry}" > CHANGELOG.tmp
        cat CHANGELOG.md >> CHANGELOG.tmp
        mv CHANGELOG.tmp CHANGELOG.md
    else
        echo "# Changelog

All notable changes to this project will be documented in this file.

${changelog_entry}" > CHANGELOG.md
    fi
    
    print_success "Changelog updated for version ${version}"
}

# Publish to npm
publish_npm() {
    local tag=$1  # latest, beta, dev
    
    print_header "Publishing to npm (${tag})"
    cd "${PROJECT_ROOT}"
    
    # Check if logged in to npm
    if ! npm whoami &> /dev/null; then
        print_error "Not logged in to npm. Please run 'npm login' first"
        exit 1
    fi
    
    # Dry run first
    if [ "${NPM_DRY_RUN}" == "true" ]; then
        print_warning "Running in dry-run mode"
        npm publish --dry-run --tag "${tag}"
        print_warning "To actually publish, set NPM_DRY_RUN=false"
    else
        npm publish --tag "${tag}"
        print_success "Published to npm with tag '${tag}'"
    fi
}

# Clean build artifacts
clean() {
    print_header "Cleaning build artifacts"
    cd "${PROJECT_ROOT}"
    
    rm -rf dist coverage node_modules
    print_success "Cleaned build artifacts"
}

# Main CI/CD pipeline
run_pipeline() {
    local node_version=$1
    
    print_header "Running CI/CD Pipeline for Node.js v${node_version}"
    
    setup_node_version "${node_version}"
    install_dependencies
    check_credentials
    build_sdk
    run_lint
    run_tests "${node_version}"
}

# Show usage
usage() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  test              Run tests on all Node versions"
    echo "  test-single       Run tests on single Node version (default: ${DEFAULT_NODE_VERSION})"
    echo "  lint              Run linting"
    echo "  lint-fix          Run linting with auto-fix"
    echo "  build             Build the SDK"
    echo "  publish-dev       Publish development version to npm"
    echo "  publish-release   Publish release version to npm"
    echo "  bump-patch        Bump patch version (x.x.X)"
    echo "  bump-minor        Bump minor version (x.X.0)"
    echo "  bump-major        Bump major version (X.0.0)"
    echo "  changelog         Generate changelog entry"
    echo "  pipeline          Run full CI/CD pipeline"
    echo "  clean             Clean build artifacts"
    echo ""
    echo "Environment Variables:"
    echo "  SKIP_INTEGRATION_TESTS  Skip integration tests (default: true)"
    echo "  NPM_DRY_RUN            Run npm publish in dry-run mode (default: true)"
    echo "  APPATONCE_TEST_API_KEY  API key for integration tests"
    echo ""
    echo "Examples:"
    echo "  $0 test                    # Run tests on all Node versions"
    echo "  $0 publish-dev             # Publish dev version (dry-run by default)"
    echo "  NPM_DRY_RUN=false $0 publish-release  # Actually publish to npm"
}

# Main script logic
case "${1:-}" in
    test)
        for version in "${NODE_VERSIONS[@]}"; do
            run_pipeline "${version}"
        done
        print_success "All tests passed on all Node.js versions!"
        ;;
    
    test-single)
        run_pipeline "${2:-${DEFAULT_NODE_VERSION}}"
        ;;
    
    lint)
        setup_node_version "${DEFAULT_NODE_VERSION}"
        install_dependencies
        run_lint
        ;;
    
    lint-fix)
        setup_node_version "${DEFAULT_NODE_VERSION}"
        install_dependencies
        run_lint "fix"
        ;;
    
    build)
        setup_node_version "${DEFAULT_NODE_VERSION}"
        install_dependencies
        build_sdk
        ;;
    
    publish-dev)
        setup_node_version "${DEFAULT_NODE_VERSION}"
        install_dependencies
        check_credentials
        build_sdk
        run_lint
        run_tests "${DEFAULT_NODE_VERSION}"
        
        # Bump prerelease version
        current_version=$(node -p "require('./package.json').version")
        if [[ $current_version == *"-dev."* ]]; then
            npm version prerelease --no-git-tag-version
        else
            npm version preminor --preid=dev --no-git-tag-version
        fi
        
        publish_npm "dev"
        ;;
    
    publish-release)
        # Run full test suite first
        for version in "${NODE_VERSIONS[@]}"; do
            run_pipeline "${version}"
        done
        
        generate_changelog
        publish_npm "latest"
        
        # Create git tag
        version=$(node -p "require('./package.json').version")
        git add package.json package-lock.json CHANGELOG.md
        git commit -m "Release v${version}"
        git tag -a "v${version}" -m "Release v${version}"
        
        print_success "Released v${version}"
        print_warning "Don't forget to push the tag: git push origin v${version}"
        ;;
    
    bump-patch)
        bump_version "patch"
        ;;
    
    bump-minor)
        bump_version "minor"
        ;;
    
    bump-major)
        bump_version "major"
        ;;
    
    changelog)
        generate_changelog
        ;;
    
    pipeline)
        # Run full pipeline on all Node versions
        for version in "${NODE_VERSIONS[@]}"; do
            run_pipeline "${version}"
        done
        print_success "CI/CD pipeline completed successfully!"
        ;;
    
    clean)
        clean
        ;;
    
    *)
        usage
        exit 0
        ;;
esac