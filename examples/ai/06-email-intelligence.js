#!/usr/bin/env node

/**
 * Email Intelligence Features
 * 
 * Demonstrates:
 * - Email reply generation
 * - Email subject optimization
 * 
 * Run: node ai/06-email-intelligence.js
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
  console.log('📧 EMAIL INTELLIGENCE FEATURES\n');

  try {
    // 1. Email Reply Generation - Professional
    console.log('1. Generating professional email reply...');
    const originalEmail = `
Hi team,

I wanted to check on the status of the Q4 project. Are we still on track
for the December 15th deadline? Please let me know if you need any resources.

Best regards,
John
    `;
    const reply = await client.ai.generateEmailReply(
      originalEmail,
      'Confirming project is on track with minor delay',
      'professional'
    );
    printResult('Professional Email Reply', reply.reply);

    // 2. Email Reply Generation - Friendly
    console.log('\n2. Generating friendly email reply...');
    const friendlyEmail = `
Hey!

Hope you're doing well! I was wondering if you'd be interested in grabbing
coffee sometime next week to discuss the new partnership opportunities?

Let me know what works for you!

Cheers,
Sarah
    `;
    const friendlyReply = await client.ai.generateEmailReply(
      friendlyEmail,
      'Accepting the invitation enthusiastically',
      'friendly'
    );
    printResult('Friendly Email Reply', friendlyReply.reply);

    // 3. Email Reply Generation - Declining
    console.log('\n3. Generating polite decline email...');
    const inviteEmail = `
Dear [Name],

We would like to invite you to speak at our annual conference on March 20th.
The topic would be "Future of AI in Business" and we expect around 500 attendees.

Please let us know if you're available.

Best,
Conference Team
    `;
    const declineReply = await client.ai.generateEmailReply(
      inviteEmail,
      'Politely declining due to schedule conflicts',
      'professional'
    );
    printResult('Decline Email Reply', declineReply.reply);

    // 4. Email Subject Optimization - Business
    console.log('\n4. Optimizing business email subjects...');
    const businessSubjects = await client.ai.optimizeEmailSubject(
      'Meeting about the new project proposal',
      'business'
    );
    printResult('Optimized Business Subjects', businessSubjects.subjects);

    // 5. Email Subject Optimization - Marketing
    console.log('\n5. Optimizing marketing email subjects...');
    const marketingSubjects = await client.ai.optimizeEmailSubject(
      'New features available in our product',
      'marketing'
    );
    printResult('Optimized Marketing Subjects', marketingSubjects.subjects);

    // 6. Email Subject Optimization - Newsletter
    console.log('\n6. Optimizing newsletter subjects...');
    const newsletterSubjects = await client.ai.optimizeEmailSubject(
      'Monthly update from our team',
      'newsletter'
    );
    printResult('Optimized Newsletter Subjects', newsletterSubjects.subjects);

    console.log('\n✅ Email intelligence examples completed!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
  }
}

main();