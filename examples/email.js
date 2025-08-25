#!/usr/bin/env node

/**
 * Email Module Example
 * 
 * This example demonstrates all email features:
 * - Sending transactional emails
 * - Email templates
 * - Bulk email campaigns
 * - Email analytics
 * - Contact management
 * - Suppression lists
 * 
 * Prerequisites:
 * - Set APPATONCE_API_KEY environment variable
 * - Configure email provider in your AppAtOnce dashboard
 */

require('dotenv').config();

const { AppAtOnceClient } = require('@appatonce/node-sdk');

async function emailExample() {
  console.log('📧 AppAtOnce Email Module Example\n');
  
  try {
    // Initialize client
    const client = new AppAtOnceClient(process.env.APPATONCE_API_KEY);
    
    console.log('═'.repeat(60));
    console.log('SENDING TRANSACTIONAL EMAIL');
    console.log('═'.repeat(60));
    
    // 1. Send a simple email
    console.log('1️⃣ Sending simple email...');
    const simpleEmail = await client.email.send({
      to: [{ email: 'user@example.com', name: 'John Doe' }],
      subject: 'Welcome to AppAtOnce!',
      html: '<h1>Welcome!</h1><p>Thanks for joining us.</p>',
      text: 'Welcome! Thanks for joining us.',
      from: { email: 'noreply@yourapp.com', name: 'Your App' }
    });
    console.log('✅ Email sent:', simpleEmail.id);
    console.log('   Status:', simpleEmail.status);
    
    // 2. Create an email template
    console.log('\n═'.repeat(60));
    console.log('EMAIL TEMPLATES');
    console.log('═'.repeat(60));
    
    console.log('2️⃣ Creating email template...');
    const template = await client.email.createTemplate({
      name: 'welcome-email',
      subject: 'Welcome {{name}}!',
      html: `
        <h1>Welcome {{name}}!</h1>
        <p>We're excited to have you on board.</p>
        <p>Your account type: {{accountType}}</p>
        <a href="{{ctaLink}}">Get Started</a>
      `,
      text: 'Welcome {{name}}! Get started at {{ctaLink}}',
      variables: {
        name: 'string',
        accountType: 'string',
        ctaLink: 'string'
      }
    });
    console.log('✅ Template created:', template.id);
    
    // 3. Send email using template
    console.log('\n3️⃣ Sending email with template...');
    const templateEmail = await client.email.sendWithTemplate({
      templateId: template.id,
      to: [{ email: 'user@example.com', name: 'Jane Smith' }],
      variables: {
        name: 'Jane',
        accountType: 'Premium',
        ctaLink: 'https://app.example.com/start'
      }
    });
    console.log('✅ Template email sent:', templateEmail.id);
    
    // 4. Create email list
    console.log('\n═'.repeat(60));
    console.log('EMAIL LISTS & CAMPAIGNS');
    console.log('═'.repeat(60));
    
    console.log('4️⃣ Creating email list...');
    const emailList = await client.email.createList({
      name: 'Newsletter Subscribers',
      description: 'Users who opted in for newsletters'
    });
    console.log('✅ List created:', emailList.id);
    console.log('   Name:', emailList.name);
    
    // 5. Add contacts to list
    console.log('\n5️⃣ Adding contacts to list...');
    const contacts = await client.email.addContacts(emailList.id, [
      { email: 'subscriber1@example.com', name: 'Subscriber One', attributes: { plan: 'free' } },
      { email: 'subscriber2@example.com', name: 'Subscriber Two', attributes: { plan: 'pro' } }
    ]);
    console.log('✅ Added', contacts.added, 'contacts');
    
    // 6. Create email campaign
    console.log('\n6️⃣ Creating email campaign...');
    const campaign = await client.email.createCampaign({
      name: 'Product Launch Campaign',
      subject: 'Introducing Our New Feature!',
      templateId: template.id,
      lists: [emailList.id],
      scheduledAt: new Date(Date.now() + 3600000), // 1 hour from now
      variables: {
        name: '{{contact.name}}',
        accountType: '{{contact.attributes.plan}}',
        ctaLink: 'https://app.example.com/new-feature'
      }
    });
    console.log('✅ Campaign created:', campaign.id);
    console.log('   Recipients:', campaign.recipientCount);
    console.log('   Scheduled:', campaign.scheduledAt);
    
    // 7. Email analytics
    console.log('\n═'.repeat(60));
    console.log('EMAIL ANALYTICS');
    console.log('═'.repeat(60));
    
    console.log('7️⃣ Getting email analytics...');
    const analytics = await client.email.getAnalytics({
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endDate: new Date()
    });
    console.log('✅ Analytics for last 7 days:');
    console.log('   Total sent:', analytics.totalSent);
    console.log('   Delivered:', analytics.totalDelivered, `(${analytics.deliveryRate}%)`);
    console.log('   Opened:', analytics.totalOpened, `(${analytics.openRate}%)`);
    console.log('   Clicked:', analytics.totalClicked, `(${analytics.clickRate}%)`);
    
    // 8. Check domain reputation
    console.log('\n8️⃣ Checking domain reputation...');
    const reputation = await client.email.checkDomainReputation('yourapp.com');
    console.log('✅ Domain reputation:');
    console.log('   Score:', reputation.score, '/100');
    console.log('   Status:', reputation.status);
    console.log('   SPF:', reputation.checks.spf ? '✓' : '✗');
    console.log('   DKIM:', reputation.checks.dkim ? '✓' : '✗');
    console.log('   DMARC:', reputation.checks.dmarc ? '✓' : '✗');
    
    // 9. Manage suppression list
    console.log('\n═'.repeat(60));
    console.log('SUPPRESSION MANAGEMENT');
    console.log('═'.repeat(60));
    
    console.log('9️⃣ Adding to suppression list...');
    await client.email.addToSuppressionList([
      { email: 'unsubscribed@example.com', reason: 'unsubscribe' },
      { email: 'bounced@example.com', reason: 'bounce' }
    ]);
    console.log('✅ Added to suppression list');
    
    // 10. Check if email is suppressed
    console.log('\n🔟 Checking suppression status...');
    const suppressed = await client.email.isEmailSuppressed('unsubscribed@example.com');
    console.log('   Email suppressed:', suppressed ? 'Yes' : 'No');
    
    console.log('\n✅ Email example completed!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
  }
}

// Check if API key is set
if (!process.env.APPATONCE_API_KEY) {
  console.error('❌ APPATONCE_API_KEY not found!');
  console.error('Please set it as an environment variable:');
  console.error('export APPATONCE_API_KEY=your_api_key_here');
  process.exit(1);
}

emailExample();