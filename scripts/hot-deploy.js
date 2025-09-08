#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Hot Deploy Script\n');

// Build the project first
console.log('🔨 Building the SDK...');
const build = spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    shell: true
});

build.on('exit', (code) => {
    if (code !== 0) {
        console.error('❌ Build failed!');
        process.exit(code);
    }
    
    console.log('\n✅ Build successful!');
    console.log('📦 Ready for deployment.');
    
    // In a real deployment, you would:
    // 1. Copy dist files to deployment location
    // 2. Update package version if needed
    // 3. Publish to npm or private registry
    // 4. Notify deployment services
    
    console.log('\nℹ️  To publish to npm, run: npm run publish:public');
    console.log('   To test locally, run: npm link');
});