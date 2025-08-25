#!/usr/bin/env node

/**
 * Language Processing Features
 * 
 * Demonstrates:
 * - Translation
 * - Text summarization
 * - Writing enhancement
 * - Content moderation
 * 
 * Run: node ai/03-language-processing.js
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
  console.log('🌐 LANGUAGE PROCESSING FEATURES\n');

  try {
    // 1. Translation
    console.log('1. Translating text to Spanish...');
    const translation = await client.ai.translateText(
      'Artificial intelligence is changing the world',
      'Spanish'
    );
    printResult('Spanish Translation', translation.translation);

    // 2. Translation with auto-detection
    console.log('\n2. Translating with language auto-detection...');
    const autoTranslation = await client.ai.translateText(
      'Bonjour, comment allez-vous?',
      'English'
    );
    printResult('English Translation', {
      translation: autoTranslation.translation,
      detectedLanguage: autoTranslation.detectedLanguage
    });

    // 3. Text Summarization
    console.log('\n3. Summarizing text...');
    const longText = `
      Artificial intelligence is rapidly transforming various industries. 
      From healthcare to finance, AI applications are improving efficiency 
      and decision-making. Machine learning algorithms can analyze vast 
      amounts of data to identify patterns humans might miss. This leads
      to better predictions, personalized experiences, and automated processes
      that save time and resources. However, as AI becomes more prevalent,
      we must also consider ethical implications and ensure responsible development.
    `;
    const summary = await client.ai.summarizeText(longText, {
      style: 'bullet',
      maxLength: 100
    });
    printResult('Bullet Summary', summary.summary);

    // 4. Paragraph Summary
    console.log('\n4. Creating paragraph summary...');
    const paragraphSummary = await client.ai.summarizeText(longText, {
      style: 'paragraph',
      maxLength: 150
    });
    printResult('Paragraph Summary', paragraphSummary.summary);

    // 5. Writing Enhancement
    console.log('\n5. Enhancing writing...');
    const roughDraft = 'this is very importnt announcement about our new prodct launch next weak';
    const enhanced = await client.ai.enhanceWriting(roughDraft, {
      tone: 'professional',
      style: 'formal',
      purpose: 'announcement',
      fixGrammar: true
    });
    printResult('Enhanced Writing', enhanced);

    // 6. Content Moderation
    console.log('\n6. Moderating content...');
    const contentToModerate = 'This is a friendly message about our community guidelines.';
    const moderation = await client.ai.moderateContent(contentToModerate);
    printResult('Content Moderation', moderation);

    // 7. Test problematic content (safe example)
    console.log('\n7. Testing content with potential issues...');
    const testContent = 'Buy now! Limited time offer! Click here immediately!!!';
    const testModeration = await client.ai.moderateContent(testContent);
    printResult('Spam Detection', testModeration);

    console.log('\n✅ Language processing examples completed!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
  }
}

main();