#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Helper function to copy file
function copyFile(source, destination) {
    try {
        const sourcePath = path.resolve(source);
        const destPath = path.resolve(destination);
        
        // Check if source file exists
        if (!fs.existsSync(sourcePath)) {
            console.log(`⚠️  Warning: ${source} not found, skipping...`);
            return;
        }
        
        // Ensure destination directory exists
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        
        // Copy the file
        fs.copyFileSync(sourcePath, destPath);
        console.log(`📄 Copied ${source} to ${destination}`);
    } catch (error) {
        console.error(`❌ Error copying ${source}:`, error.message);
        process.exit(1);
    }
}

console.log('🔧 Running post-build script...');

// Copy README.md to dist
copyFile('README.md', 'dist/README.md');

// Copy LICENSE to dist
copyFile('LICENSE', 'dist/LICENSE');

console.log('✅ Post-build complete!');