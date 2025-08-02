# Self-Hosted Runner Setup Instructions

Quick guide to set up GitHub self-hosted runners for the Node SDK repository.

## 🚀 Quick Setup (Recommended)

### Step 1: Get Runner Token
1. Go to: https://github.com/app-at-once/node-sdk-dev/settings/actions/runners/new
2. Copy the token (starts with `A...`)

### Step 2: Run Automated Setup
1. Go to: https://github.com/app-at-once/node-sdk-dev/actions/workflows/setup-runner.yml
2. Click **"Run workflow"**
3. Paste your token in the **"GitHub Runner Token"** field
4. Click **"Run workflow"**
5. Wait for completion (~3-5 minutes)

### Step 3: Verify Setup
1. Go to: https://github.com/app-at-once/node-sdk-dev/settings/actions/runners
2. Look for your runner with status **"Idle"**
3. ✅ You're done!

## 🔧 Manual Setup (Advanced)

If the automated setup fails or you prefer manual control:

### Prerequisites
- Google Cloud access to `instance2`
- `gcloud` CLI configured

### Manual Steps

```bash
# 1. SSH to the instance
gcloud compute ssh instance2 --zone=us-central1-a

# 2. Create runner directory
sudo mkdir -p /opt/github-runners/node-sdk-runner
sudo chown $(whoami):$(whoami) /opt/github-runners/node-sdk-runner
cd /opt/github-runners/node-sdk-runner

# 3. Download runner
curl -o actions-runner-linux-x64-2.327.1.tar.gz -L https://github.com/actions/runner/releases/download/v2.327.1/actions-runner-linux-x64-2.327.1.tar.gz
tar xzf ./actions-runner-linux-x64-2.327.1.tar.gz
rm actions-runner-linux-x64-2.327.1.tar.gz

# 4. Configure runner (replace YOUR_TOKEN with actual token)
./config.sh --url https://github.com/app-at-once/node-sdk-dev \\
           --token YOUR_TOKEN \\
           --name node-sdk-runner \\
           --work _work \\
           --labels gcloud,self-hosted,linux,x64,node-sdk \\
           --unattended

# 5. Install as service
sudo ./svc.sh install
sudo ./svc.sh start

# 6. Check status
sudo ./svc.sh status
```

## 🔍 Verification

### Check Runner Status
```bash
# On the instance
cd /opt/github-runners/node-sdk-runner
sudo ./svc.sh status
```

### View Runner Logs
```bash
# Real-time logs
sudo journalctl -u actions.runner.* -f

# Recent logs
sudo journalctl -u actions.runner.* --since "1 hour ago"
```

### Test Runner
1. Push a small change to trigger CI
2. Watch the workflow run with `runs-on: self-hosted`
3. Verify it uses your runner

## 🚨 Troubleshooting

### Runner Not Appearing
- **Check token**: Make sure you copied the full token
- **Check connectivity**: Ensure instance can reach github.com
- **Check permissions**: Verify token has `repo` permissions

### Runner Offline
```bash
# Restart the service
sudo ./svc.sh stop
sudo ./svc.sh start

# Check logs for errors
sudo journalctl -u actions.runner.* --since "10 minutes ago"
```

### Service Won't Start
```bash
# Remove and reconfigure
sudo ./svc.sh uninstall
./config.sh remove --token NEW_TOKEN
# Then reconfigure with fresh token
```

### Multiple Runners Conflict
```bash
# List all runners
ls -la /opt/github-runners/

# Stop specific runner
cd /opt/github-runners/node-sdk-runner
sudo ./svc.sh stop
```

## 📊 Current Infrastructure

### Existing Runners
- **Frontend**: `/opt/github-runners/actions-runner-1`
- **Server**: `/opt/github-runners/actions-runner-2`  
- **Node SDK**: `/opt/github-runners/node-sdk-runner` (new)

### Instance Details
- **Instance**: `instance2`
- **Zone**: `us-central1-a`
- **Machine Type**: Standard (check with `gcloud compute instances describe instance2 --zone=us-central1-a`)

## 🔐 Security Notes

### Token Security
- Runner tokens expire after ~1 hour if unused
- Tokens are single-use for configuration
- Never commit tokens to repositories

### Instance Access
- Runners run as dedicated service user
- Limited filesystem access
- Network access restricted to necessary endpoints

### Maintenance
```bash
# Regular cleanup (run monthly)
cd /opt/github-runners/node-sdk-runner
sudo ./svc.sh stop
sudo rm -rf _work/*  # Clear work directory
sudo ./svc.sh start
```

## 🎯 Benefits

| Feature | GitHub Runners | Self-Hosted |
|---------|---------------|-------------|
| **Cost** | ~$0.008/minute | Free after setup |
| **Performance** | Shared resources | Dedicated hardware |
| **Storage** | Fresh each time | Persistent cache |
| **Custom Software** | Limited | Full control |
| **Network** | Public internet | Your infrastructure |

## 📞 Need Help?

1. **Check logs first**: `sudo journalctl -u actions.runner.*`
2. **Review GitHub docs**: https://docs.github.com/en/actions/hosting-your-own-runners
3. **Check runner status**: GitHub → Settings → Actions → Runners
4. **Contact team**: Create issue in private repository

## 🔄 Updating Runners

### When to Update
- New GitHub Actions runner versions
- Security updates
- Performance improvements

### Update Process
```bash
# 1. Stop current runner
sudo ./svc.sh stop
sudo ./svc.sh uninstall

# 2. Download new version
curl -o actions-runner-linux-x64-NEW_VERSION.tar.gz -L https://github.com/actions/runner/releases/download/NEW_VERSION/actions-runner-linux-x64-NEW_VERSION.tar.gz

# 3. Extract and reconfigure
tar xzf ./actions-runner-linux-x64-NEW_VERSION.tar.gz
./config.sh --url https://github.com/app-at-once/node-sdk-dev --token NEW_TOKEN ...

# 4. Reinstall service
sudo ./svc.sh install
sudo ./svc.sh start
```

---

Last updated: $(date +'%Y-%m-%d')