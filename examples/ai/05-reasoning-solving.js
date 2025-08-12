#!/usr/bin/env node

/**
 * Reasoning and Problem Solving Features
 * 
 * Demonstrates:
 * - Mathematical problem solving
 * - Logical reasoning
 * - Step-by-step explanations
 * 
 * Run: node ai/05-reasoning-solving.js
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
  console.log('🧠 REASONING & PROBLEM SOLVING FEATURES\n');

  try {
    // 1. Mathematical Problem
    console.log('1. Solving mathematical problem...');
    const mathProblem = await client.ai.solveReasoning(
      'If a store offers 25% off on a $80 item, and then an additional 10% off the discounted price, what is the final price?',
      { 
        stepByStep: true,
        explainReasoning: true
      }
    );
    printResult('Math Problem Solution', mathProblem);

    // 2. Logic Puzzle
    console.log('\n2. Solving logic puzzle...');
    const logicPuzzle = await client.ai.solveReasoning(
      'Three friends (Alice, Bob, and Carol) have different favorite colors (red, blue, green). Alice does not like red. Bob does not like green. Carol likes blue. What is each person\'s favorite color?',
      {
        stepByStep: true,
        verifyAnswer: true
      }
    );
    printResult('Logic Puzzle Solution', logicPuzzle);

    // 3. Word Problem
    console.log('\n3. Solving word problem...');
    const wordProblem = await client.ai.solveReasoning(
      'A train travels 240 miles in 3 hours. If it maintains the same speed, how long will it take to travel 400 miles?',
      {
        stepByStep: true,
        explainReasoning: true
      }
    );
    printResult('Word Problem Solution', wordProblem);

    // 4. Programming Logic
    console.log('\n4. Solving programming logic problem...');
    const programmingProblem = await client.ai.solveReasoning(
      'What is the time complexity of binary search and why is it more efficient than linear search for sorted arrays?',
      {
        explainReasoning: true
      }
    );
    printResult('Programming Logic', programmingProblem);

    // 5. Business Problem
    console.log('\n5. Solving business problem...');
    const businessProblem = await client.ai.solveReasoning(
      'A company has fixed costs of $10,000 per month and variable costs of $50 per unit. If they sell each unit for $150, how many units must they sell to break even?',
      {
        stepByStep: true,
        verifyAnswer: true
      }
    );
    printResult('Business Problem Solution', businessProblem);

    console.log('\n✅ Reasoning and problem solving examples completed!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
  }
}

main();