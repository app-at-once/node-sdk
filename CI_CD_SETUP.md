# CI/CD Setup for Node SDK

This document describes the CI/CD pipeline for the AppAtOnce Node SDK that builds, tests, and publishes the SDK from the private development repository to the public repository.

## 🏗️ Architecture Overview

```
Private Repo (app-at-once/node-sdk-dev)
├── Source Code
├── Tests & Development Tools
├── CI/CD Workflows
└── Self-hosted Runners
    ↓
    Build & Test
    ↓
Public Repo (app-at-once/node-sdk)
├── Compiled dist/ files only
├── Public documentation
├── package.json (minimal)
└── No source code or dev tools
```

## 🔄 Workflows

### 1. CI - Build and Test (`ci-build-and-test.yml`)

**Trigger**: Push or PR to `main` or `develop` branches

**Jobs**:
- **Quick Validation** (GitHub runners)
  - Fast feedback on lint, type check, and build
  - Runs on every push/PR for immediate feedback
  
- **Comprehensive Tests** (Self-hosted runners)
  - Full test suite across Node.js 18 and 20
  - Integration tests with real API (if available)
  - Coverage reporting
  - Build artifact generation
  
- **Security Audit**
  - npm audit for vulnerabilities
  - Credential leak detection
  - Package.json validation

**Features**:
- ✅ Multi-stage validation for fast feedback
- ✅ Self-hosted runners for heavy testing
- ✅ Test result artifacts and coverage
- ✅ Comprehensive security checks

### 2. Publish to Public Repository (`publish-to-public.yml`)

**Trigger**: Push to `main` branch or manual dispatch

**Jobs**:
- **Build for Publishing**
  - Clean build on self-hosted runners
  - Build verification and artifact creation
  - Build metadata generation
  
- **Deploy to Public Repo**
  - Sanitize and prepare public content
  - Create clean git history
  - Force push to public repository
  - Create release tags
  
- **Verify Deployment**
  - Validate public repo accessibility
  - Post deployment summary

**Features**:
- ✅ Automatic sensitive data removal
- ✅ Clean public repository with no dev files
- ✅ Automatic versioning and tagging
- ✅ Force publish option for emergencies

### 3. Setup Self-Hosted Runner (`setup-runner.yml`)

**Trigger**: Manual workflow dispatch only

**Purpose**: Automated setup of self-hosted runners on Google Cloud

**Features**:
- ✅ Automated runner installation
- ✅ Service configuration and startup
- ✅ Comprehensive error handling
- ✅ Troubleshooting guidance

## 🖥️ Self-Hosted Runners

### Why Self-Hosted Runners?

1. **Unlimited Minutes**: No GitHub Actions billing
2. **Better Performance**: Your own hardware
3. **Persistent Environment**: Cached dependencies
4. **Cost Effective**: No per-minute charges

### Current Setup

- **Instance**: `instance2` (Google Cloud)
- **Zone**: `us-central1-a`
- **Path**: `/opt/github-runners/node-sdk-runner/`
- **Labels**: `gcloud`, `self-hosted`, `linux`, `x64`, `node-sdk`

### Setting Up a New Runner

1. **Get Runner Token**:
   - Go to: https://github.com/app-at-once/node-sdk-dev/settings/actions/runners/new
   - Copy the token (starts with 'A...')

2. **Run Setup Workflow**:
   - Go to Actions → Setup Self-Hosted Runner
   - Click "Run workflow"
   - Paste your token
   - Click "Run workflow"

3. **Verify Setup**:
   - Check runners page: https://github.com/app-at-once/node-sdk-dev/settings/actions/runners
   - Look for "Idle" status

### Manual Setup (if needed)

```bash
# SSH to instance
gcloud compute ssh instance2 --zone=us-central1-a

# Navigate to runner directory
cd /opt/github-runners/node-sdk-runner

# Check runner status
sudo ./svc.sh status

# View logs if needed
sudo journalctl -u actions.runner.*
```

## 🔐 Required Secrets

### Repository Secrets

| Secret | Purpose | Where to Get |
|--------|---------|--------------|
| `PUBLIC_REPO_DEPLOY_TOKEN` | Push to public repo | GitHub → Settings → Developer settings → Personal access tokens |
| `APPATONCE_TEST_API_KEY` | Integration tests | AppAtOnce dashboard |
| `APPATONCE_TEST_BASE_URL` | Test environment URL | Usually `https://api.appatonce.com` |
| `GCLOUD_SERVICE_ACCOUNT_KEY` | Runner setup access | Google Cloud Console |
| `GCLOUD_PROJECT_ID` | Google Cloud project | Google Cloud Console |

### Setting Up Secrets

1. Go to: https://github.com/app-at-once/node-sdk-dev/settings/secrets/actions
2. Click "New repository secret"
3. Add each secret from the table above

## 📊 Workflow Status

### Branch Protection

- `main` branch requires status checks to pass
- Required checks: `CI Success` (from ci-build-and-test.yml)
- Auto-deployment to public repo on successful merge

### Monitoring

- **Workflow runs**: https://github.com/app-at-once/node-sdk-dev/actions
- **Public repo**: https://github.com/app-at-once/node-sdk
- **Coverage reports**: Uploaded to Codecov (if configured)

## 🚨 Troubleshooting

### Common Issues

1. **Self-hosted runner offline**:
   ```bash
   gcloud compute ssh instance2 --zone=us-central1-a
   cd /opt/github-runners/node-sdk-runner
   sudo ./svc.sh start
   ```

2. **Tests failing on integration**:
   - Check `APPATONCE_TEST_API_KEY` secret
   - Verify API endpoint accessibility
   - Integration tests are non-blocking by default

3. **Public repo deployment fails**:
   - Check `PUBLIC_REPO_DEPLOY_TOKEN` permissions
   - Verify token has `repo` scope
   - Check if public repo exists and is accessible

4. **Build artifacts missing**:
   - Verify `npm run build` succeeds locally
   - Check TypeScript compilation
   - Ensure `dist/` directory is created

### Debug Commands

```bash
# Check runner status
gcloud compute ssh instance2 --zone=us-central1-a --command "sudo systemctl status actions.runner.*"

# View runner logs
gcloud compute ssh instance2 --zone=us-central1-a --command "sudo journalctl -u actions.runner.* -f"

# Test build locally
npm ci
npm run build
npm test

# Verify public repo access
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/repos/app-at-once/node-sdk
```

## 🔄 Migration from Old Workflows

### Deprecated Workflows

The following workflows have been deprecated and disabled:
- `main.yml` (Test and Publish)
- `test.yml` (Test SDK)
- `deploy-to-public.yml` (Deploy to Public Repository)

### New Workflow Benefits

| Feature | Old Workflows | New Workflows |
|---------|---------------|---------------|
| Test Speed | Single-stage | Multi-stage (fast + thorough) |
| Resource Usage | All on GitHub | Hybrid (GitHub + self-hosted) |
| Public Repo | Basic cleanup | Advanced sanitization |
| Error Handling | Basic | Comprehensive with recovery |
| Monitoring | Limited | Full observability |
| Security | Basic | Multi-layer validation |

## 📈 Performance Metrics

### Expected Build Times

- **Quick validation**: ~2-3 minutes
- **Comprehensive tests**: ~8-12 minutes
- **Public deployment**: ~3-5 minutes
- **Total pipeline**: ~15-20 minutes

### Resource Usage

- **GitHub Actions minutes**: ~5 minutes per build (quick validation only)
- **Self-hosted compute**: Majority of heavy lifting
- **Storage**: Build artifacts retained for 30 days

## 🛡️ Security Features

### Automated Security Checks

1. **Dependency Audit**: `npm audit` with moderate+ severity
2. **Credential Scanning**: Automated detection of leaked credentials
3. **Content Sanitization**: Automatic removal of sensitive files
4. **Clean Git History**: Fresh commit history for public repo

### Public Repository Safety

- No source code or development tools
- No test credentials or API keys
- No CI/CD workflows in public repo
- Minimal package.json with only runtime dependencies

## 🚀 Quick Start Guide

### For Developers

1. **Clone the private repo**:
   ```bash
   git clone git@github.com:app-at-once/node-sdk-dev.git
   cd node-sdk-dev
   ```

2. **Make changes and push**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

3. **CI automatically runs**:
   - Tests your changes
   - Builds the SDK
   - Deploys to public repo (if on main branch)

### For First-Time Setup

1. **Set up self-hosted runner** (one-time):
   - Get token from GitHub
   - Run setup workflow
   - Verify runner is online

2. **Configure secrets** (one-time):
   - Add all required repository secrets
   - Test with a dummy workflow run

3. **Verify setup**:
   - Push a small change
   - Check that all workflows pass
   - Verify public repo updates

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Self-hosted Runners Guide](https://docs.github.com/en/actions/hosting-your-own-runners)
- [AppAtOnce SDK Documentation](https://docs.appatonce.com)
- [Node.js Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## 🆘 Support

If you encounter issues with the CI/CD pipeline:

1. Check the troubleshooting section above
2. Review workflow run logs in GitHub Actions
3. Contact the development team
4. Create an issue in the private repository

Last updated: $(date +'%Y-%m-%d')