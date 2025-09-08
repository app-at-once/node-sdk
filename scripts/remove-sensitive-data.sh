#!/bin/bash

# Alternative approach: Remove specific files/patterns from history using BFG Repo-Cleaner

echo "🔍 Alternative approach: Remove sensitive data from Git history"
echo ""
echo "This script helps you remove sensitive data using BFG Repo-Cleaner"
echo "BFG is faster and simpler than git filter-branch"
echo ""

# Check if BFG is installed
if ! command -v bfg &> /dev/null && ! command -v java &> /dev/null
then
    echo "❌ BFG Repo-Cleaner requires Java. Please install Java first."
    echo ""
    echo "On macOS: brew install java"
    echo "On Ubuntu: sudo apt-get install default-jre"
    exit 1
fi

# Download BFG if not present
if [ ! -f "bfg.jar" ]; then
    echo "📥 Downloading BFG Repo-Cleaner..."
    curl -L https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar -o bfg.jar
fi

echo ""
echo "📋 Steps to clean sensitive data:"
echo ""
echo "1. Create a file with patterns to remove:"
cat > passwords.txt << 'EOF'
# Add your sensitive strings here (one per line)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiJjbWRsNTZhbW0wMDA0czVjdHh0NWxxNGkxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsInBlcm1pc3Npb25zIjpbIioiXX0.dlTY4DoV3xG_gIIYgQ2pduzCH-z0ew_7OJZenuhVTFg
74041344880af157164cdc44b15dbf4e253f15d60b10d3c404cd47043b87c02
app_74041344880af157164cdc44b15dbf4e253f15d60b10d3c40434ece26db84b6c
testpassword123
appatonce123
z33Kq0drit07JUFEB5IBgB81380FE
EOF

echo "✅ Created passwords.txt with known sensitive strings"
echo ""
echo "2. Now run these commands:"
echo ""
echo "   # Clone a fresh copy (BFG works on bare repos)"
echo "   git clone --mirror git@github.com:app-at-once/node-sdk.git node-sdk-mirror"
echo ""
echo "   # Remove sensitive data"
echo "   java -jar bfg.jar --replace-text passwords.txt node-sdk-mirror"
echo ""
echo "   # Clean up the repository"
echo "   cd node-sdk-mirror"
echo "   git reflog expire --expire=now --all && git gc --prune=now --aggressive"
echo ""
echo "   # Push the changes"
echo "   git push"
echo ""
echo "3. Tell all collaborators to re-clone:"
echo "   git clone git@github.com:app-at-once/node-sdk.git"
echo ""
echo "⚠️  WARNING: This will rewrite history. All collaborators must re-clone!"