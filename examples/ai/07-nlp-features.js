#!/usr/bin/env node

/**
 * Natural Language Processing Features
 * 
 * Demonstrates:
 * - Entity extraction
 * - Sentiment analysis
 * - Keyword extraction
 * 
 * Run: node ai/07-nlp-features.js
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
  console.log('🔍 NATURAL LANGUAGE PROCESSING FEATURES\n');

  try {
    // 1. Entity Extraction
    console.log('1. Extracting entities from text...');
    const textWithEntities = 'Apple CEO Tim Cook announced the new iPhone 15 in Cupertino on September 12, 2024. The event was attended by journalists from The New York Times and Reuters.';
    const entities = await client.ai.extractEntities(textWithEntities);
    printResult('Extracted Entities', entities);

    // 2. Entity Extraction - Complex
    console.log('\n2. Extracting entities from complex text...');
    const complexText = 'Microsoft and Google are competing in the AI space. Satya Nadella met with Sundar Pichai in Seattle last week to discuss potential collaboration. Both companies are investing billions in AI research, with OpenAI and DeepMind leading their respective efforts.';
    const complexEntities = await client.ai.extractEntities(complexText);
    printResult('Complex Entities', complexEntities);

    // 3. Sentiment Analysis - Positive
    console.log('\n3. Analyzing positive sentiment...');
    const positiveText = 'I absolutely love this product! It exceeded all my expectations and the customer service was fantastic.';
    const positiveSentiment = await client.ai.analyzeSentiment(positiveText);
    printResult('Positive Sentiment', positiveSentiment);

    // 4. Sentiment Analysis - Negative
    console.log('\n4. Analyzing negative sentiment...');
    const negativeText = 'This was a terrible experience. The product broke after one day and support never responded to my emails.';
    const negativeSentiment = await client.ai.analyzeSentiment(negativeText);
    printResult('Negative Sentiment', negativeSentiment);

    // 5. Sentiment Analysis - Mixed
    console.log('\n5. Analyzing mixed sentiment...');
    const mixedText = 'The product quality is excellent, but the price is too high. Great features but poor customer support.';
    const mixedSentiment = await client.ai.analyzeSentiment(mixedText);
    printResult('Mixed Sentiment', mixedSentiment);

    // 6. Keyword Extraction
    console.log('\n6. Extracting keywords from technical text...');
    const technicalText = `
      Machine learning is a subset of artificial intelligence that enables 
      systems to learn and improve from experience without being explicitly 
      programmed. Deep learning models use neural networks to process data
      and make predictions. Natural language processing allows computers to
      understand and generate human language.
    `;
    const keywords = await client.ai.extractKeywords(technicalText, 5);
    printResult('Extracted Keywords', keywords);

    // 7. Keyword Extraction with Scores
    console.log('\n7. Extracting keywords with relevance scores...');
    const businessText = `
      Our company specializes in cloud computing solutions for enterprise clients.
      We offer scalable infrastructure, data analytics, and cybersecurity services.
      Our platform enables digital transformation and helps businesses optimize
      their operations through automation and AI-driven insights.
    `;
    const keywordsWithScores = await client.ai.extractKeywords(businessText, 8);
    printResult('Keywords with Scores', keywordsWithScores);

    console.log('\n✅ NLP features examples completed!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
  }
}

main();