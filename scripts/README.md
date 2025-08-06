# Node SDK Scripts

This directory contains CI/CD and development automation scripts for the AppAtOnce Node SDK.

## Scripts Overview

### `ci-cd.sh` - Comprehensive CI/CD Pipeline

The main CI/CD script that replicates GitHub Actions workflows locally. This script provides a complete pipeline for testing, building, and publishing the SDK.

#### Features:
- **Multi-Node Version Testing**: Tests across Node.js 16, 18, and 20
- **Linting and Code Quality**: ESLint with auto-fix capability
- **Comprehensive Testing**: Unit tests, integration tests, and coverage reports
- **Build Management**: TypeScript compilation and dist verification
- **Version Management**: Semantic versioning with patch, minor, and major bumps
- **Changelog Generation**: Automatic CHANGELOG.md updates
- **NPM Publishing**: Support for both dev and production releases
- **Credential Detection**: Prevents accidental credential commits

#### Usage:

```bash
# Run full test suite on all Node versions
./scripts/ci-cd.sh test

# Run tests on a single Node version
./scripts/ci-cd.sh test-single 18

# Run linting
./scripts/ci-cd.sh lint

# Run linting with auto-fix
./scripts/ci-cd.sh lint-fix

# Build the SDK
./scripts/ci-cd.sh build

# Bump version
./scripts/ci-cd.sh bump-patch    # 1.0.0 -> 1.0.1
./scripts/ci-cd.sh bump-minor    # 1.0.0 -> 1.1.0
./scripts/ci-cd.sh bump-major    # 1.0.0 -> 2.0.0

# Generate changelog
./scripts/ci-cd.sh changelog

# Publish to npm (dry-run by default)
./scripts/ci-cd.sh publish-dev      # Publish dev version
./scripts/ci-cd.sh publish-release  # Publish production version

# Actually publish (no dry-run)
NPM_DRY_RUN=false ./scripts/ci-cd.sh publish-release

# Run full CI/CD pipeline
./scripts/ci-cd.sh pipeline

# Clean build artifacts
./scripts/ci-cd.sh clean
```

#### Environment Variables:
- `SKIP_INTEGRATION_TESTS`: Skip integration tests (default: true)
- `NPM_DRY_RUN`: Run npm publish in dry-run mode (default: true)
- `APPATONCE_TEST_API_KEY`: API key for integration tests
- `CI`: Set automatically in CI environments

### `setup-hooks.sh` - Git Hooks Setup

Comprehensive git hooks setup supporting both manual hooks and Husky integration.

#### Features:
- **Manual Git Hooks**: Direct .git/hooks installation
- **Husky Support**: Modern git hooks with npm integration
- **Pre-commit Checks**:
  - Credential detection
  - ESLint validation
  - Unit test execution
  - Auto-build if dist is outdated
- **Pre-push Checks**:
  - Comprehensive test suite
  - Version tag validation
- **Commit Message Validation**: Enforces conventional commit format

#### Usage:

```bash
# Install manual git hooks (default)
./scripts/setup-hooks.sh

# Install with Husky
./scripts/setup-hooks.sh --husky

# Remove all hooks
./scripts/setup-hooks.sh remove

# Check hooks status
./scripts/setup-hooks.sh status
```

#### Conventional Commit Format:
```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert

Examples:
- feat(auth): add OAuth2 support
- fix(realtime): resolve connection timeout issue
- docs: update API documentation
```

### Other Scripts

- **`check-credentials.js`**: Scans codebase for sensitive information
- **`fix-test-credentials.js`**: Fixes test credential issues
- **`clean-git-history.sh`**: Cleans sensitive data from git history
- **`push-dist-to-public.sh`**: Pushes dist to public repository
- **`update-public-with-dist.sh`**: Updates public repo with latest dist

## Workflow Examples

### Development Workflow
```bash
# Setup hooks
./scripts/setup-hooks.sh

# Make changes and test
./scripts/ci-cd.sh test-single

# Fix linting issues
./scripts/ci-cd.sh lint-fix

# Commit (hooks will run automatically)
git commit -m "feat: add new feature"
```

### Release Workflow
```bash
# Run full test suite
./scripts/ci-cd.sh pipeline

# Bump version
./scripts/ci-cd.sh bump-minor

# Update changelog
./scripts/ci-cd.sh changelog

# Test publish (dry-run)
./scripts/ci-cd.sh publish-release

# Actually publish
NPM_DRY_RUN=false ./scripts/ci-cd.sh publish-release

# Push to git
git push origin main --tags
```

### CI Environment
```bash
# In CI/CD pipeline (e.g., GitHub Actions)
CI=true ./scripts/ci-cd.sh pipeline
```

## Troubleshooting

### nvm Not Found
The scripts will use system Node.js if nvm is not available. To use multiple Node versions:
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell
source ~/.bashrc
```

### Permission Denied
```bash
# Make scripts executable
chmod +x scripts/*.sh
```

### NPM Authentication
```bash
# Login to npm before publishing
npm login
```

### Skip Hook Temporarily
```bash
# Bypass git hooks (use with caution)
git commit --no-verify
```