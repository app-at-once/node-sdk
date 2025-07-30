const AppAtOnceClient = require('../dist').AppAtOnceClient;
const fs = require('fs');
const path = require('path');

// Test configuration
const API_KEY = process.env.TEST_API_KEY || 'test-api-key';
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:8080';

// Create client
const client = new AppAtOnceClient({
  apiKey: API_KEY,
  baseUrl: BASE_URL,
  debug: true
});

// Test data
const testEmail = 'test@example.com';
const testTemplateData = {
  name: 'Welcome Email Template',
  subject: 'Welcome to {{appName}}!',
  html: '<h1>Welcome {{userName}}!</h1><p>Thank you for joining {{appName}}.</p>',
  text: 'Welcome {{userName}}! Thank you for joining {{appName}}.',
  variables: [
    { name: 'userName', type: 'string', required: true },
    { name: 'appName', type: 'string', default: 'AppAtOnce' }
  ],
  category: 'welcome',
  tags: ['onboarding', 'automated']
};

async function runEmailTests() {
  console.log('🚀 Starting Email Module Tests\n');

  try {
    // Test 1: Send simple email
    console.log('📧 Test 1: Sending simple email...');
    const simpleEmail = await client.email.sendEmail({
      to: [{ email: testEmail, name: 'Test User' }],
      subject: 'Test Email from Node SDK',
      text: 'This is a test email sent from the AppAtOnce Node SDK.',
      html: '<h1>Test Email</h1><p>This is a test email sent from the AppAtOnce Node SDK.</p>',
      tags: { test: 'true', sdk: 'node' },
      metadata: { testId: Date.now().toString() }
    });
    console.log('✅ Simple email sent:', simpleEmail);
    console.log('');

    // Test 2: Create email template
    console.log('📧 Test 2: Creating email template...');
    const template = await client.email.createTemplate(testTemplateData);
    console.log('✅ Template created:', template);
    console.log('');

    // Test 3: List templates
    console.log('📧 Test 3: Listing email templates...');
    const templates = await client.email.listTemplates({
      category: 'welcome',
      limit: 10
    });
    console.log('✅ Templates found:', templates.total);
    console.log('');

    // Test 4: Preview template
    console.log('📧 Test 4: Previewing email template...');
    const preview = await client.email.previewTemplate(template.id, {
      userName: 'John Doe',
      appName: 'MyApp'
    });
    console.log('✅ Template preview:', preview);
    console.log('');

    // Test 5: Send template email
    console.log('📧 Test 5: Sending template email...');
    const templateEmail = await client.email.sendTemplateEmail(template.id, {
      to: [{ email: testEmail, name: 'John Doe' }],
      variables: {
        userName: 'John Doe',
        appName: 'MyApp'
      }
    });
    console.log('✅ Template email sent:', templateEmail);
    console.log('');

    // Test 6: Send bulk emails
    console.log('📧 Test 6: Sending bulk emails...');
    const bulkEmails = await client.email.sendBulkEmail({
      emails: [
        {
          to: [{ email: 'user1@example.com' }],
          subject: 'Bulk Email 1',
          text: 'This is bulk email 1'
        },
        {
          to: [{ email: 'user2@example.com' }],
          subject: 'Bulk Email 2',
          text: 'This is bulk email 2'
        }
      ],
      priority: 'normal'
    });
    console.log('✅ Bulk emails sent:', bulkEmails);
    console.log('');

    // Test 7: Get email status
    console.log('📧 Test 7: Getting email status...');
    const emailStatus = await client.email.getEmailStatus(simpleEmail.id);
    console.log('✅ Email status:', emailStatus);
    console.log('');

    // Test 8: Schedule email
    console.log('📧 Test 8: Scheduling email for future...');
    const futureDate = new Date();
    futureDate.setMinutes(futureDate.getMinutes() + 30); // 30 minutes from now
    
    const scheduledEmail = await client.email.sendEmail({
      to: [{ email: testEmail }],
      subject: 'Scheduled Email Test',
      text: 'This email was scheduled to be sent 30 minutes after creation.',
      sendAt: futureDate
    });
    console.log('✅ Email scheduled for:', futureDate.toISOString());
    console.log('');

    // Test 9: Create contact
    console.log('📧 Test 9: Creating email contact...');
    const contact = await client.email.createContact({
      email: testEmail,
      name: 'Test Contact',
      tags: ['test', 'sdk'],
      metadata: { source: 'node-sdk-test' },
      subscribed: true
    });
    console.log('✅ Contact created:', contact);
    console.log('');

    // Test 10: Create email list
    console.log('📧 Test 10: Creating email list...');
    const list = await client.email.createList({
      name: 'Test SDK List',
      description: 'List created from Node SDK test',
      tags: ['test']
    });
    console.log('✅ List created:', list);
    console.log('');

    // Test 11: Add contact to list
    console.log('📧 Test 11: Adding contact to list...');
    await client.email.addContactToList(list.id, contact.id);
    console.log('✅ Contact added to list');
    console.log('');

    // Test 12: Create campaign
    console.log('📧 Test 12: Creating email campaign...');
    const campaign = await client.email.createCampaign({
      name: 'Test Campaign',
      subject: 'Test Campaign Email',
      templateId: template.id,
      lists: [list.id],
      sendAt: futureDate
    });
    console.log('✅ Campaign created:', campaign);
    console.log('');

    // Test 13: Get email analytics
    console.log('📧 Test 13: Getting email analytics...');
    const analytics = await client.email.getEmailAnalytics();
    console.log('✅ Email analytics:', {
      totalSent: analytics.total_sent,
      deliveryRate: analytics.delivery_rate,
      openRate: analytics.open_rate
    });
    console.log('');

    // Test 14: Send email with attachment
    console.log('📧 Test 14: Sending email with attachment...');
    const attachmentEmail = await client.email.sendEmail({
      to: [{ email: testEmail }],
      subject: 'Email with Attachment',
      text: 'This email contains an attachment.',
      attachments: [{
        filename: 'test.txt',
        content: Buffer.from('This is a test attachment'),
        contentType: 'text/plain'
      }]
    });
    console.log('✅ Email with attachment sent:', attachmentEmail);
    console.log('');

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await client.email.deleteTemplate(template.id);
    await client.email.deleteContact(contact.id);
    await client.email.deleteList(list.id);
    await client.email.deleteCampaign(campaign.id);
    console.log('✅ Cleanup completed');
    console.log('');

    console.log('✅ All email tests completed successfully!');

  } catch (error) {
    console.error('❌ Email test failed:', error);
    console.error('Error details:', error.response?.data || error.message);
  }
}

// Run tests
runEmailTests().catch(console.error);