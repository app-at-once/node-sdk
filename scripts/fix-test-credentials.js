#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// The hardcoded API key that appears in many test files
const HARDCODED_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiJjbWRsNTZhbW0wMDA0czVjdHh0NWxxNGkxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsInBlcm1pc3Npb25zIjpbIioiXX0.dlTY4DoV3xG_gIIYgQ2pduzCH-z0ew_7OJZenuhVTFg';

// Another common pattern
const API_KEY_PATTERN = '74041344880af157164cdc44b15dbf4e253f15d60b10d3c404cd47043b87c02';

const replacements = [
  {
    pattern: new RegExp(HARDCODED_API_KEY.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
    replacement: "process.env.APPATONCE_TEST_API_KEY || 'test-api-key'"
  },
  {
    pattern: new RegExp(API_KEY_PATTERN, 'g'),
    replacement: "process.env.APPATONCE_TEST_API_KEY || 'test-api-key'"
  },
  {
    pattern: /apiKey:\s*['"]eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9[^'"]+['"]/g,
    replacement: "apiKey: process.env.APPATONCE_TEST_API_KEY || 'test-api-key'"
  },
  {
    pattern: /apiKey\s*=\s*['"]eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9[^'"]+['"]/g,
    replacement: "apiKey = process.env.APPATONCE_TEST_API_KEY || 'test-api-key'"
  },
  {
    pattern: /['"]74041344880af157164cdc44b15dbf4e253f15d60b10d3c404cd47043b87c02['"]/g,
    replacement: "process.env.APPATONCE_TEST_API_KEY || 'test-api-key'"
  },
  {
    pattern: /['"]app_74041344880af157164cdc44b15dbf4e253f15d60b10d3c40434ece26db84b6c['"]/g,
    replacement: "process.env.APPATONCE_TEST_API_KEY || 'test-api-key'"
  },
  {
    pattern: /APP_API_KEY\s*=\s*['"]app_[^'"]+['"]/g,
    replacement: "APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key'"
  },
  {
    pattern: /password:\s*['"]testpassword123['"]/gi,
    replacement: "password: process.env.TEST_USER_PASSWORD || 'test-password'"
  },
  {
    pattern: /Password\s*=\s*['"]testpassword123['"]/gi,
    replacement: "Password = process.env.TEST_USER_PASSWORD || 'test-password'"
  },
  {
    pattern: /password:\s*['"]appatonce123['"]/gi,
    replacement: "password: process.env.DB_PASSWORD || 'test-db-password'"
  }
];

function fixFile(filePath) {
  console.log(`Fixing ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  replacements.forEach(({ pattern, replacement }) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${filePath}`);
  } else {
    console.log(`ℹ️  No changes needed for ${filePath}`);
  }
}

// Find all test files
const testFiles = [
  ...glob.sync('test*.js', { cwd: path.join(__dirname, '..') }),
  ...glob.sync('tests/**/*.js', { cwd: path.join(__dirname, '..') })
];

console.log(`Found ${testFiles.length} test files to check...\n`);

testFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    fixFile(fullPath);
  }
});

console.log('\n✅ Credential replacement complete!');
console.log('\nMake sure to set these environment variables when running tests:');
console.log('- APPATONCE_TEST_API_KEY: Your test API key');
console.log('- TEST_USER_PASSWORD: Test user password');
console.log('- DB_PASSWORD: Database password (if needed)');