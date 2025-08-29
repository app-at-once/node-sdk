#!/usr/bin/env node

/**
 * Run All AI Examples
 * 
 * This script runs all AI examples sequentially with a delay between each.
 * 
 * Run: node ai/run-all.js
 */

const { spawn } = require('child_process');
const path = require('path');

const examples = [
  '01-text-generation.js',
  '02-content-creation.js',
  '03-language-processing.js',
  '04-code-assistance.js',
  '05-reasoning-solving.js',
  '06-email-intelligence.js',
  '07-nlp-features.js',
  '08-embeddings.js',
  '10-unified-ai-complete.js',
  '11-image-generation.js',
  '12-audio-generation.js',
  '13-video-generation.js'
];

async function runExample(filename) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running: ${filename}`);
    console.log(`${'='.repeat(60)}\n`);

    const child = spawn('node', [path.join(__dirname, filename)], {
      stdio: 'inherit',
      env: process.env
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`${filename} exited with code ${code}`));
      } else {
        resolve();
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

async function runAll() {
  console.log('🚀 Running all AI examples...\n');
  console.log('This will demonstrate all AI features including text, image, audio, and video generation.');
  console.log('Each example will run separately to avoid timeouts.\n');

  for (const example of examples) {
    try {
      await runExample(example);
      
      // Add a small delay between examples
      if (example !== examples[examples.length - 1]) {
        console.log('\nWaiting 2 seconds before next example...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`\n❌ Error running ${example}:`, error.message);
      console.log('Continuing with next example...');
    }
  }

  console.log('\n✅ All examples completed!');
  console.log('\nTo run individual examples:');
  examples.forEach(example => {
    console.log(`  node ai/${example}`);
  });
}

// Check if .env exists
const fs = require('fs');
const dotenvPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(dotenvPath)) {
  console.error('❌ .env file not found!');
  console.error('Please create a .env file in the examples directory with your API key.');
  console.error('Run: cp .env.example .env');
  process.exit(1);
}

runAll().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});