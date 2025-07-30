#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Patterns that might indicate credentials
const CREDENTIAL_PATTERNS = [
  // Common password patterns
  /password\s*[:=]\s*["'][^"']{8,}/gi,
  /pwd\s*[:=]\s*["'][^"']{8,}/gi,
  /pass\s*[:=]\s*["'][^"']{8,}/gi,
  
  // API keys and tokens
  /api[_-]?key\s*[:=]\s*["'][A-Za-z0-9]{20,}/gi,
  /token\s*[:=]\s*["'][A-Za-z0-9]{20,}/gi,
  /bearer\s+[A-Za-z0-9\-._~+\/]{20,}/gi,
  
  // Email patterns with passwords nearby
  /email\s*[:=]\s*["'][^"']+@[^"']+["'][\s\S]{0,50}password\s*[:=]\s*["'][^"']{8,}/gi,
  
  // Specific test user patterns
  /test_\d+_[a-z0-9]+@example\.com/gi,
  
  // Base64 encoded strings that might be credentials
  /[A-Za-z0-9+\/]{40,}={0,2}/g,
];

// Files to exclude from checking
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /dist/,
  /coverage/,
  /\.md$/,
  /package-lock\.json$/,
  /check-credentials\.js$/,
  /fix-test-credentials\.js$/,
];

// Allowed test patterns (these are okay)
const ALLOWED_PATTERNS = [
  /password\s*[:=]\s*["']\$\{[^}]+\}["']/gi, // Template variables
  /password\s*[:=]\s*["']Test\$\{[^}]+\}["']/gi, // Dynamic test passwords
  /test_\$\{[^}]+\}_\$\{[^}]+\}@example\.com/gi, // Dynamic test emails
];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  CREDENTIAL_PATTERNS.forEach(pattern => {
    const matches = content.match(pattern) || [];
    matches.forEach(match => {
      // Check if this match is in the allowed patterns
      let isAllowed = false;
      for (const allowedPattern of ALLOWED_PATTERNS) {
        if (match.match(allowedPattern)) {
          isAllowed = true;
          break;
        }
      }
      
      if (!isAllowed) {
        // Find line number
        const lines = content.substring(0, content.indexOf(match)).split('\n');
        const lineNumber = lines.length;
        
        issues.push({
          file: filePath,
          line: lineNumber,
          match: match.substring(0, 50) + (match.length > 50 ? '...' : ''),
          pattern: pattern.source
        });
      }
    });
  });
  
  return issues;
}

function scanDirectory(dir) {
  const issues = [];
  
  function scan(currentPath) {
    const files = fs.readdirSync(currentPath);
    
    files.forEach(file => {
      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);
      
      // Check if should exclude
      const shouldExclude = EXCLUDE_PATTERNS.some(pattern => pattern.test(fullPath));
      if (shouldExclude) return;
      
      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (stat.isFile() && (fullPath.endsWith('.js') || fullPath.endsWith('.ts') || fullPath.endsWith('.json'))) {
        const fileIssues = checkFile(fullPath);
        issues.push(...fileIssues);
      }
    });
  }
  
  scan(dir);
  return issues;
}

// Main execution
const projectRoot = path.resolve(__dirname, '..');
const issues = scanDirectory(projectRoot);

if (issues.length > 0) {
  console.error('\n❌ Potential credentials found in the following files:\n');
  issues.forEach(issue => {
    console.error(`  ${issue.file}:${issue.line}`);
    console.error(`    Found: ${issue.match}`);
    console.error(`    Pattern: ${issue.pattern}\n`);
  });
  
  console.error('\n⚠️  Please remove or replace these with environment variables before committing.\n');
  console.error('Tips:');
  console.error('  - Use process.env.VARIABLE_NAME for sensitive values');
  console.error('  - Use template literals with dynamic values for test data');
  console.error('  - Add sensitive files to .gitignore\n');
  
  process.exit(1);
} else {
  console.log('✅ No credentials detected in source files\n');
  process.exit(0);
}