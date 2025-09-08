#!/bin/bash

# Comprehensive Git hooks setup script for AppAtOnce Node SDK
# Supports both manual git hooks and husky integration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
USE_HUSKY="${USE_HUSKY:-false}"

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

# Check if husky is installed
check_husky() {
    if [ -f "${PROJECT_ROOT}/node_modules/.bin/husky" ] || command -v husky &> /dev/null; then
        return 0
    fi
    return 1
}

# Setup manual git hooks
setup_manual_hooks() {
    print_header "Setting up manual git hooks"
    
    # Create hooks directory if it doesn't exist
    mkdir -p "${PROJECT_ROOT}/.git/hooks"
    
    # Create pre-commit hook
    cat > "${PROJECT_ROOT}/.git/hooks/pre-commit" << 'EOF'
#!/bin/bash

# Pre-commit hook for AppAtOnce Node SDK

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Running pre-commit checks..."

# Check for credentials
echo "🔍 Checking for credentials..."
if ! node scripts/check-credentials.js; then
    echo -e "${RED}❌ Pre-commit check failed: Credentials detected${NC}"
    echo "Please remove sensitive information before committing."
    exit 1
fi

# Check if dist is up to date
if [ -f "src/index.ts" ] && [ -d "dist" ]; then
    echo "🏗️  Checking if dist is up to date..."
    # Get modification times
    src_time=$(find src -type f -name "*.ts" -exec stat -f %m {} \; 2>/dev/null | sort -n | tail -1 || \
               find src -type f -name "*.ts" -exec stat -c %Y {} \; 2>/dev/null | sort -n | tail -1)
    dist_time=$(find dist -type f -name "*.js" -exec stat -f %m {} \; 2>/dev/null | sort -n | tail -1 || \
                find dist -type f -name "*.js" -exec stat -c %Y {} \; 2>/dev/null | sort -n | tail -1)
    
    if [ -n "$src_time" ] && [ -n "$dist_time" ] && [ "$src_time" -gt "$dist_time" ]; then
        echo -e "${YELLOW}⚠️  Source files are newer than dist files${NC}"
        echo "Building SDK..."
        npm run build
        git add dist
    fi
fi

# Run linter
echo "🔧 Running linter..."
if ! npm run lint; then
    echo -e "${RED}❌ Pre-commit check failed: Linting errors${NC}"
    echo "Run 'npm run lint:fix' to automatically fix some issues"
    exit 1
fi

# Run tests (quick unit tests only)
echo "🧪 Running unit tests..."
if ! npm test -- --testPathIgnorePatterns=integration; then
    echo -e "${RED}❌ Pre-commit check failed: Unit tests failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All pre-commit checks passed!${NC}"
EOF
    
    # Create pre-push hook
    cat > "${PROJECT_ROOT}/.git/hooks/pre-push" << 'EOF'
#!/bin/bash

# Pre-push hook for AppAtOnce Node SDK

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Running pre-push checks..."

# Run comprehensive tests
echo "🧪 Running comprehensive test suite..."
if ! npm run test:ci; then
    echo -e "${RED}❌ Pre-push check failed: Tests failed${NC}"
    echo "Fix failing tests before pushing"
    exit 1
fi

# Check package version vs git tag
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" = "main" ]; then
    echo "📦 Checking package version..."
    package_version=$(node -p "require('./package.json').version")
    if git tag | grep -q "v${package_version}"; then
        echo -e "${YELLOW}⚠️  Warning: Version v${package_version} already exists as a git tag${NC}"
        echo "Consider bumping the version before pushing to main"
    fi
fi

echo -e "${GREEN}✅ All pre-push checks passed!${NC}"
EOF
    
    # Create commit-msg hook
    cat > "${PROJECT_ROOT}/.git/hooks/commit-msg" << 'EOF'
#!/bin/bash

# Commit message hook for AppAtOnce Node SDK

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

commit_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,100}$'
commit_msg=$(cat "$1")

if ! echo "$commit_msg" | grep -qE "$commit_regex"; then
    echo -e "${RED}❌ Invalid commit message format${NC}"
    echo ""
    echo "Commit message must follow conventional commits format:"
    echo "  <type>(<scope>): <subject>"
    echo ""
    echo "Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert"
    echo ""
    echo "Examples:"
    echo "  feat(auth): add OAuth2 support"
    echo "  fix(realtime): resolve connection timeout issue"
    echo "  docs: update API documentation"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Commit message format is valid${NC}"
EOF
    
    # Make hooks executable
    chmod +x "${PROJECT_ROOT}/.git/hooks/pre-commit"
    chmod +x "${PROJECT_ROOT}/.git/hooks/pre-push"
    chmod +x "${PROJECT_ROOT}/.git/hooks/commit-msg"
    
    print_success "Manual git hooks installed"
}

# Setup husky hooks
setup_husky_hooks() {
    print_header "Setting up Husky git hooks"
    
    cd "${PROJECT_ROOT}"
    
    # Install husky if not already installed
    if ! check_husky; then
        print_warning "Husky not found. Installing husky..."
        npm install --save-dev husky
    fi
    
    # Initialize husky
    npx husky install
    
    # Add husky install to prepare script
    npm pkg set scripts.prepare="husky install"
    
    # Create husky pre-commit hook
    npx husky add .husky/pre-commit "npm run check:credentials"
    npx husky add .husky/pre-commit "npm run lint"
    npx husky add .husky/pre-commit "npm test -- --testPathIgnorePatterns=integration"
    
    # Create husky pre-push hook
    npx husky add .husky/pre-push "npm run test:ci"
    
    # Create husky commit-msg hook
    cat > "${PROJECT_ROOT}/.husky/commit-msg" << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Conventional commit format validation
commit_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,100}$'
commit_msg=$(cat "$1")

if ! echo "$commit_msg" | grep -qE "$commit_regex"; then
    echo "❌ Invalid commit message format"
    echo ""
    echo "Format: <type>(<scope>): <subject>"
    echo "Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert"
    echo ""
    exit 1
fi
EOF
    
    chmod +x "${PROJECT_ROOT}/.husky/commit-msg"
    
    print_success "Husky git hooks installed"
}

# Remove hooks
remove_hooks() {
    print_header "Removing git hooks"
    
    # Remove manual hooks
    rm -f "${PROJECT_ROOT}/.git/hooks/pre-commit"
    rm -f "${PROJECT_ROOT}/.git/hooks/pre-push"
    rm -f "${PROJECT_ROOT}/.git/hooks/commit-msg"
    
    # Remove husky
    if [ -d "${PROJECT_ROOT}/.husky" ]; then
        rm -rf "${PROJECT_ROOT}/.husky"
    fi
    
    print_success "Git hooks removed"
}

# Show usage
usage() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  install    Install git hooks (default)"
    echo "  remove     Remove git hooks"
    echo "  status     Show current hooks status"
    echo ""
    echo "Options:"
    echo "  --husky    Use husky instead of manual git hooks"
    echo ""
    echo "Examples:"
    echo "  $0                # Install manual git hooks"
    echo "  $0 --husky        # Install husky git hooks"
    echo "  $0 remove         # Remove all git hooks"
}

# Show hooks status
show_status() {
    print_header "Git hooks status"
    
    echo "Manual hooks:"
    for hook in pre-commit pre-push commit-msg; do
        if [ -f "${PROJECT_ROOT}/.git/hooks/${hook}" ]; then
            echo "  ✅ ${hook}"
        else
            echo "  ❌ ${hook}"
        fi
    done
    
    echo ""
    echo "Husky:"
    if [ -d "${PROJECT_ROOT}/.husky" ]; then
        echo "  ✅ Installed"
        echo "  Hooks:"
        for hook in "${PROJECT_ROOT}/.husky/"*; do
            if [ -f "$hook" ] && [ "$(basename "$hook")" != "_" ]; then
                echo "    - $(basename "$hook")"
            fi
        done
    else
        echo "  ❌ Not installed"
    fi
}

# Parse arguments
COMMAND="install"
for arg in "$@"; do
    case $arg in
        --husky)
            USE_HUSKY="true"
            ;;
        install|remove|status)
            COMMAND="$arg"
            ;;
        -h|--help)
            usage
            exit 0
            ;;
    esac
done

# Main logic
case "$COMMAND" in
    install)
        if [ "$USE_HUSKY" = "true" ]; then
            setup_husky_hooks
        else
            setup_manual_hooks
        fi
        
        echo ""
        print_success "Git hooks setup complete!"
        echo ""
        echo "The following checks will run:"
        echo "  Pre-commit:"
        echo "    - Credential detection"
        echo "    - ESLint"
        echo "    - Unit tests"
        echo "  Pre-push:"
        echo "    - Comprehensive test suite"
        echo "  Commit-msg:"
        echo "    - Conventional commit format"
        echo ""
        echo "To bypass hooks (use with caution): git commit --no-verify"
        ;;
    
    remove)
        remove_hooks
        ;;
    
    status)
        show_status
        ;;
    
    *)
        usage
        exit 1
        ;;
esac