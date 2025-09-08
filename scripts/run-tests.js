#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🧪 Running AppAtOnce Node SDK test suite...\n');

// Run the test suite
const child = spawn('npm', ['test'], {
    stdio: 'inherit',
    shell: true
});

child.on('exit', (code) => {
    if (code === 0) {
        console.log('\n✅ All tests passed!');
    } else {
        console.log('\n❌ Tests failed with exit code:', code);
    }
    process.exit(code);
});