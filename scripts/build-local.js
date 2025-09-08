#!/usr/bin/env node

/**
 * Build script for local development
 * This creates a build with localhost URL for testing
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Building AppAtOnce SDK for local development...\n');

// Step 1: Read the index.ts file
const indexPath = path.join(__dirname, '..', 'src', 'index.ts');
const originalContent = fs.readFileSync(indexPath, 'utf8');

// Step 2: Replace the production URL with localhost
const localContent = originalContent.replace(
  /baseUrl:\s*'https:\/\/api\.appatonce\.com'/g,
  "baseUrl: 'http://localhost:8091'"
);

// Also replace in createWithApiKey function
const localContent2 = localContent.replace(
  /const baseUrl = process\.env\.APPATONCE_LOCAL_BUILD === 'true'[\s\S]*?'https:\/\/api\.appatonce\.com';/,
  "const baseUrl = 'http://localhost:8091'; // Local build"
);

// Step 3: Write the modified content
fs.writeFileSync(indexPath, localContent2);

console.log('✓ Modified index.ts to use localhost:8091');

try {
  // Step 4: Run the TypeScript build
  console.log('\n📦 Building TypeScript...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('\n✅ Local build complete!');
  console.log('   The SDK will now use http://localhost:8091');
  console.log('   Remember to run "npm run build" to restore production URLs');
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
} finally {
  // Step 5: Restore the original content
  fs.writeFileSync(indexPath, originalContent);
  console.log('\n✓ Restored original index.ts');
}