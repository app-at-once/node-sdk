#!/usr/bin/env node

/**
 * Code Assistance Features
 * 
 * Demonstrates:
 * - Code generation
 * - Code analysis
 * 
 * Run: node ai/04-code-assistance.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { AppAtOnceClient } = require('../../dist');

const API_KEY = process.env.APPATONCE_API_KEY;
if (!API_KEY) {
  console.error('❌ Please set APPATONCE_API_KEY in your .env file');
  process.exit(1);
}

const client = new AppAtOnceClient(API_KEY);

function printResult(title, result) {
  console.log(`\n✨ ${title}`);
  console.log('─'.repeat(50));
  if (typeof result === 'object') {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(result);
  }
}

async function main() {
  console.log('💻 CODE ASSISTANCE FEATURES\n');

  try {
    // 1. Code Generation - Python
    console.log('1. Generating Python code...');
    const pythonCode = await client.ai.generateCode(
      'REST API endpoint for user authentication',
      'Python',
      { 
        framework: 'FastAPI',
        includeComments: true
      }
    );
    printResult('Generated Python Code', pythonCode.code);

    // 2. Code Generation - JavaScript
    console.log('\n2. Generating JavaScript code...');
    const jsCode = await client.ai.generateCode(
      'Function to validate email addresses',
      'JavaScript',
      {
        style: 'ES6',
        includeComments: true
      }
    );
    printResult('Generated JavaScript Code', jsCode.code);

    // 3. Code Generation - TypeScript
    console.log('\n3. Generating TypeScript code...');
    const tsCode = await client.ai.generateCode(
      'React component for user profile card',
      'TypeScript',
      {
        framework: 'React',
        includeComments: true
      }
    );
    printResult('Generated TypeScript Code', tsCode.code);

    // 4. Code Analysis - Python
    console.log('\n4. Analyzing Python code...');
    const pythonToAnalyze = `
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
    `;
    const pythonAnalysis = await client.ai.analyzeCode(pythonToAnalyze, 'Python');
    printResult('Python Code Analysis', pythonAnalysis);

    // 5. Code Analysis - JavaScript
    console.log('\n5. Analyzing JavaScript code...');
    const jsToAnalyze = `
function bubbleSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    return arr;
}
    `;
    const jsAnalysis = await client.ai.analyzeCode(jsToAnalyze, 'JavaScript');
    printResult('JavaScript Code Analysis', jsAnalysis);

    // 6. Code Generation - SQL
    console.log('\n6. Generating SQL code...');
    const sqlCode = await client.ai.generateCode(
      'Query to find top 10 customers by total purchase amount',
      'SQL',
      {
        includeComments: true
      }
    );
    printResult('Generated SQL Code', sqlCode.code);

    console.log('\n✅ Code assistance examples completed!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
  }
}

main();