#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Publishing to npm public registry...\n');

// Check if dist folder exists
const distPath = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distPath)) {
    console.error('❌ Error: dist folder not found. Please run "npm run build" first.');
    process.exit(1);
}

// Check if we're logged in to npm
const checkAuth = spawn('npm', ['whoami'], {
    stdio: 'pipe',
    shell: true
});

let isAuthenticated = false;

checkAuth.stdout.on('data', (data) => {
    console.log(`✅ Logged in as: ${data.toString().trim()}`);
    isAuthenticated = true;
});

checkAuth.on('close', (code) => {
    if (!isAuthenticated) {
        console.error('❌ Not logged in to npm. Please run "npm login" first.');
        process.exit(1);
    }
    
    // Proceed with publishing
    console.log('\n📤 Publishing package...');
    const publish = spawn('npm', ['publish', '--access', 'public'], {
        stdio: 'inherit',
        shell: true
    });
    
    publish.on('exit', (code) => {
        if (code === 0) {
            console.log('\n✅ Package published successfully!');
        } else {
            console.log('\n❌ Publishing failed with exit code:', code);
        }
        process.exit(code);
    });
});