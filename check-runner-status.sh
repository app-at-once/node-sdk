#!/bin/bash

# Check self-hosted runner status for Node SDK
# This script verifies if the self-hosted runner is properly configured and running

set -e

echo \"🔍 Self-Hosted Runner Status Check\"
echo \"==================================\"
echo \"\"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Helper functions
error() {
    echo -e \"${RED}❌ $1${NC}\"
}

success() {
    echo -e \"${GREEN}✅ $1${NC}\"
}

warning() {
    echo -e \"${YELLOW}⚠️  $1${NC}\"
}

info() {
    echo -e \"${BLUE}ℹ️  $1${NC}\"
}

# Configuration
INSTANCE=\"instance2\"
ZONE=\"us-central1-a\"
RUNNER_PATH=\"/opt/github-runners/node-sdk-runner\"

echo \"Checking runner configuration:\"
echo \"Instance: $INSTANCE\"
echo \"Zone: $ZONE\"
echo \"Path: $RUNNER_PATH\"
echo \"\"

# Check if gcloud is available
if ! command -v gcloud &> /dev/null; then
    error \"gcloud CLI not found. Please install Google Cloud SDK.\"
    exit 1
fi

success \"gcloud CLI found\"

# Check if we can access the instance
info \"Checking instance access...\"
if ! gcloud compute instances describe \"$INSTANCE\" --zone=\"$ZONE\" &> /dev/null; then
    error \"Cannot access instance $INSTANCE in zone $ZONE\"
    echo \"Available instances:\"
    gcloud compute instances list
    exit 1
fi

success \"Instance access confirmed\"

# Check if runner directory exists
info \"Checking runner directory...\"
if ! gcloud compute ssh \"$INSTANCE\" --zone=\"$ZONE\" --command=\"test -d $RUNNER_PATH\" &> /dev/null; then
    error \"Runner directory $RUNNER_PATH not found on instance\"
    echo \"\"
    echo \"To create the runner, either:\"
    echo \"1. Run the automated setup workflow in GitHub Actions\"
    echo \"2. Follow manual setup instructions in RUNNER_SETUP_INSTRUCTIONS.md\"
    exit 1
fi

success \"Runner directory exists\"

# Check if runner is configured
info \"Checking runner configuration...\"
if ! gcloud compute ssh \"$INSTANCE\" --zone=\"$ZONE\" --command=\"test -f $RUNNER_PATH/.runner\" &> /dev/null; then
    warning \"Runner not configured (no .runner file found)\"
    echo \"\"
    echo \"To configure the runner:\"
    echo \"1. Get a new token from: https://github.com/app-at-once/node-sdk-dev/settings/actions/runners/new\"
    echo \"2. Run the setup workflow or configure manually\"
    exit 1
fi

success \"Runner is configured\"

# Check service status
info \"Checking runner service status...\"
SERVICE_STATUS=$(gcloud compute ssh \"$INSTANCE\" --zone=\"$ZONE\" --command=\"cd $RUNNER_PATH && sudo ./svc.sh status\" 2>/dev/null || echo \"inactive\")

if [[ \"$SERVICE_STATUS\" == *\"active (running)\"* ]]; then
    success \"Runner service is active and running\"
elif [[ \"$SERVICE_STATUS\" == *\"inactive\"* ]]; then
    warning \"Runner service is inactive\"
    echo \"\"
    echo \"To start the service:\"
    echo \"gcloud compute ssh $INSTANCE --zone=$ZONE --command 'cd $RUNNER_PATH && sudo ./svc.sh start'\"
elif [[ \"$SERVICE_STATUS\" == *\"failed\"* ]]; then
    error \"Runner service has failed\"
    echo \"\"
    echo \"To check logs:\"
    echo \"gcloud compute ssh $INSTANCE --zone=$ZONE --command 'sudo journalctl -u actions.runner.* --since \\\"1 hour ago\\\"'\"
else
    warning \"Unknown service status: $SERVICE_STATUS\"
fi

# Check recent logs for errors
info \"Checking recent logs...\"
RECENT_LOGS=$(gcloud compute ssh \"$INSTANCE\" --zone=\"$ZONE\" --command=\"sudo journalctl -u actions.runner.* --since '10 minutes ago' --no-pager -q\" 2>/dev/null || echo \"No logs available\")

if [[ \"$RECENT_LOGS\" == *\"error\"* ]] || [[ \"$RECENT_LOGS\" == *\"Error\"* ]]; then
    warning \"Recent errors found in logs\"
    echo \"Recent logs:\"
    echo \"$RECENT_LOGS\"
elif [[ \"$RECENT_LOGS\" == *\"Listening for Jobs\"* ]]; then
    success \"Runner is actively listening for jobs\"
else
    info \"No recent activity in logs\"
fi

# Check if runner appears in GitHub
info \"Checking GitHub runner registration...\"
echo \"\"
echo \"Please manually verify the runner appears at:\"
echo \"https://github.com/app-at-once/node-sdk-dev/settings/actions/runners\"
echo \"\"
echo \"Look for a runner with:\"
echo \"- Name: node-sdk-runner (or similar)\"
echo \"- Status: Idle (green)\"
echo \"- Labels: gcloud, self-hosted, linux, x64, node-sdk\"

# Get runner info
RUNNER_INFO=$(gcloud compute ssh \"$INSTANCE\" --zone=\"$ZONE\" --command=\"cd $RUNNER_PATH && cat .runner 2>/dev/null\" 2>/dev/null || echo \"{}\")

if [[ \"$RUNNER_INFO\" == *\"gitHubUrl\"* ]]; then
    success \"Runner configuration file contains GitHub URL\"
    echo \"Runner details:\"
    echo \"$RUNNER_INFO\" | grep -E '(\"gitHubUrl\"|\"runnerName\"|\"runnerLabels\")' | sed 's/^/  /'
else
    warning \"Could not read runner configuration details\"
fi

echo \"\"
echo \"📊 Summary\"
echo \"==========\"

# Overall status
OVERALL_STATUS=\"HEALTHY\"

if [[ \"$SERVICE_STATUS\" != *\"active (running)\"* ]]; then
    OVERALL_STATUS=\"NEEDS_ATTENTION\"
fi

if [[ \"$OVERALL_STATUS\" == \"HEALTHY\" ]]; then
    success \"Runner appears to be healthy and ready\"
    echo \"\"
    echo \"🎯 Next Steps:\"
    echo \"1. Push a change to trigger a workflow\"
    echo \"2. Monitor workflow execution in GitHub Actions\"
    echo \"3. Verify the workflow uses your self-hosted runner\"
else
    warning \"Runner needs attention\"
    echo \"\"
    echo \"🔧 Troubleshooting:\"
    echo \"1. Check the service status and start if needed\"
    echo \"2. Review logs for specific error messages\"
    echo \"3. Reconfigure runner if configuration is corrupted\"
    echo \"4. Consult RUNNER_SETUP_INSTRUCTIONS.md for detailed steps\"
fi

echo \"\"
echo \"🛠️  Useful Commands:\"
echo \"# Start runner service\"
echo \"gcloud compute ssh $INSTANCE --zone=$ZONE --command 'cd $RUNNER_PATH && sudo ./svc.sh start'\"
echo \"\"
echo \"# Check service status\"
echo \"gcloud compute ssh $INSTANCE --zone=$ZONE --command 'cd $RUNNER_PATH && sudo ./svc.sh status'\"
echo \"\"
echo \"# View logs\"
echo \"gcloud compute ssh $INSTANCE --zone=$ZONE --command 'sudo journalctl -u actions.runner.* -f'\"
echo \"\"
echo \"# SSH to instance\"
echo \"gcloud compute ssh $INSTANCE --zone=$ZONE\"

echo \"\"
success \"Status check completed\"