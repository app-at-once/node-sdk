#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const command = process.argv[2] || 'test';

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║         AppAtOnce Node SDK - Test Suite                     ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

// Platform-specific message for now
console.log('⚠️  Note: Full test suite requires server environment.');
console.log('   Running basic tests only...\n');

// Map commands to npm scripts
const commandMap = {
    'test': 'test',
    'where': 'test:where',
    'crud': 'test:comprehensive',
    'query': 'test:comprehensive',
    'start': null,  // Server operations not available in cross-platform mode
    'stop': null,
    'cleanup': null
};

const npmScript = commandMap[command];

if (npmScript === null) {
    console.log(`ℹ️  Server operation '${command}' is not available in cross-platform mode.`);
    console.log('   Please use Docker or a Unix-based system for full server testing.');
    process.exit(0);
}

if (!npmScript) {
    console.error(`❌ Unknown command: ${command}`);
    console.log('   Available commands: test, where, crud, query');
    process.exit(1);
}

// Run the appropriate test
console.log(`🧪 Running ${npmScript}...`);
const child = spawn('npm', ['run', npmScript], {
    stdio: 'inherit',
    shell: true
});

child.on('exit', (code) => {
    process.exit(code);
});