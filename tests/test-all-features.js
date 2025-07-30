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

// Test summary
const testSummary = {
  email: { total: 0, passed: 0, failed: 0 },
  storage: { total: 0, passed: 0, failed: 0 },
  push: { total: 0, passed: 0, failed: 0 }
};

// Helper function to run a test
async function runTest(module, testName, testFn) {
  testSummary[module].total++;
  try {
    console.log(`\n📌 ${testName}...`);
    await testFn();
    console.log(`✅ ${testName} - PASSED`);
    testSummary[module].passed++;
  } catch (error) {
    console.error(`❌ ${testName} - FAILED`);
    console.error(`   Error: ${error.message}`);
    testSummary[module].failed++;
  }
}

// Email tests
async function runEmailTests() {
  console.log('\n📧 EMAIL MODULE TESTS\n' + '='.repeat(50));
  
  let templateId, contactId, listId;

  await runTest('email', 'Send Simple Email', async () => {
    const result = await client.email.sendEmail({
      to: [{ email: 'test@example.com', name: 'Test User' }],
      subject: 'SDK Test Email',
      text: 'Testing email functionality',
      html: '<p>Testing email functionality</p>'
    });
    if (!result.id) throw new Error('No email ID returned');
  });

  await runTest('email', 'Create Email Template', async () => {
    const template = await client.email.createTemplate({
      name: 'Test Template',
      subject: 'Hello {{name}}',
      html: '<p>Welcome {{name}}!</p>',
      variables: [{ name: 'name', type: 'string', required: true }]
    });
    templateId = template.id;
    if (!templateId) throw new Error('No template ID returned');
  });

  await runTest('email', 'Send Template Email', async () => {
    const result = await client.email.sendTemplateEmail(templateId, {
      to: [{ email: 'test@example.com' }],
      variables: { name: 'John' }
    });
    if (!result.id) throw new Error('No email ID returned');
  });

  await runTest('email', 'Create Contact', async () => {
    const contact = await client.email.createContact({
      email: 'contact@example.com',
      name: 'Test Contact',
      subscribed: true
    });
    contactId = contact.id;
    if (!contactId) throw new Error('No contact ID returned');
  });

  await runTest('email', 'Create Email List', async () => {
    const list = await client.email.createList({
      name: 'Test List',
      description: 'SDK test list'
    });
    listId = list.id;
    if (!listId) throw new Error('No list ID returned');
  });

  // Cleanup
  if (templateId) await client.email.deleteTemplate(templateId).catch(() => {});
  if (contactId) await client.email.deleteContact(contactId).catch(() => {});
  if (listId) await client.email.deleteList(listId).catch(() => {});
}

// Storage tests
async function runStorageTests() {
  console.log('\n\n📦 STORAGE MODULE TESTS\n' + '='.repeat(50));
  
  const bucketName = 'test-bucket-' + Date.now();
  let bucketCreated = false;

  await runTest('storage', 'Create Bucket', async () => {
    const bucket = await client.storage.createBucket(bucketName, {
      acl: 'private'
    });
    bucketCreated = true;
    if (!bucket.name) throw new Error('No bucket name returned');
  });

  await runTest('storage', 'Upload File', async () => {
    const content = Buffer.from('Test file content');
    const file = await client.storage.uploadFile(
      bucketName,
      content,
      'test.txt',
      { contentType: 'text/plain' }
    );
    if (!file.name) throw new Error('No file name returned');
  });

  await runTest('storage', 'List Files', async () => {
    const files = await client.storage.listFiles(bucketName);
    if (files.total < 1) throw new Error('No files found');
  });

  await runTest('storage', 'Download File', async () => {
    const content = await client.storage.downloadFile(bucketName, 'test.txt');
    if (!content || content.length === 0) throw new Error('No content downloaded');
  });

  await runTest('storage', 'Get File URL', async () => {
    const url = await client.storage.getFileUrl(bucketName, 'test.txt', {
      expiresIn: 3600
    });
    if (!url.url) throw new Error('No URL returned');
  });

  // Cleanup
  if (bucketCreated) {
    await client.storage.deleteBucket(bucketName, true).catch(() => {});
  }
}

// Push notification tests
async function runPushTests() {
  console.log('\n\n📱 PUSH NOTIFICATION MODULE TESTS\n' + '='.repeat(50));
  
  const deviceToken = 'test-token-' + Date.now();
  const userId = 'test-user-' + Date.now();
  let templateId;

  await runTest('push', 'Register Device', async () => {
    const device = await client.push.registerDevice({
      userId,
      deviceToken,
      platform: 'ios',
      tags: ['test']
    });
    if (!device.id) throw new Error('No device ID returned');
  });

  await runTest('push', 'Send Push Notification', async () => {
    const result = await client.push.send({
      to: userId,
      targetType: 'user',
      title: 'Test Push',
      body: 'Testing push notifications'
    });
    if (!result.messageId) throw new Error('No message ID returned');
  });

  await runTest('push', 'Create Push Template', async () => {
    const template = await client.push.createTemplate({
      name: 'Test Push Template',
      title: 'Hello {{name}}',
      body: 'Welcome to the app, {{name}}!',
      variables: [{ name: 'name', type: 'string', required: true }]
    });
    templateId = template.id;
    if (!templateId) throw new Error('No template ID returned');
  });

  await runTest('push', 'Send Template Push', async () => {
    const result = await client.push.sendWithTemplate(templateId, {
      to: userId,
      targetType: 'user',
      variables: { name: 'John' }
    });
    if (!result.messageId) throw new Error('No message ID returned');
  });

  await runTest('push', 'Get Push Stats', async () => {
    const stats = await client.push.getStats();
    if (typeof stats.total !== 'number') throw new Error('Invalid stats returned');
  });

  // Cleanup
  if (templateId) await client.push.deleteTemplate(templateId).catch(() => {});
  await client.push.unregisterDevice(deviceToken).catch(() => {});
}

// Integration test
async function runIntegrationTest() {
  console.log('\n\n🔗 INTEGRATION TEST\n' + '='.repeat(50));
  
  const bucketName = 'integration-bucket-' + Date.now();
  const userId = 'integration-user-' + Date.now();
  const deviceToken = 'integration-device-' + Date.now();

  await runTest('integration', 'Cross-Module Integration', async () => {
    // Create storage bucket
    await client.storage.createBucket(bucketName);
    
    // Upload an image
    const imageContent = Buffer.from('fake-image-data');
    const image = await client.storage.uploadFile(
      bucketName,
      imageContent,
      'notification-image.png',
      { contentType: 'image/png' }
    );
    
    // Get public URL
    const imageUrl = await client.storage.getPublicUrl(bucketName, 'notification-image.png');
    
    // Register device
    await client.push.registerDevice({
      userId,
      deviceToken,
      platform: 'ios'
    });
    
    // Send push with storage image
    const push = await client.push.send({
      to: userId,
      targetType: 'user',
      title: 'New Photo',
      body: 'Check out this photo!',
      image: imageUrl.url
    });
    
    // Send email about the push
    await client.email.sendEmail({
      to: [{ email: 'user@example.com' }],
      subject: 'Push Notification Sent',
      html: `<p>We sent you a push notification with message ID: ${push.messageId}</p>`
    });
    
    // Cleanup
    await client.storage.deleteBucket(bucketName, true);
    await client.push.unregisterDevice(deviceToken);
  });
}

// Main test runner
async function runAllTests() {
  console.log('🚀 AppAtOnce Node SDK Comprehensive Test Suite');
  console.log('=' .repeat(60));
  console.log(`API Endpoint: ${BASE_URL}`);
  console.log(`API Key: ${API_KEY.substring(0, 10)}...`);
  console.log('=' .repeat(60));

  const startTime = Date.now();

  try {
    // Test connection
    console.log('\n🔌 Testing connection...');
    const ping = await client.ping();
    console.log('✅ Connected successfully:', ping);

    // Run module tests
    await runEmailTests();
    await runStorageTests();
    await runPushTests();
    await runIntegrationTest();

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
  }

  // Print summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n\n📊 TEST SUMMARY\n' + '=' .repeat(60));
  
  for (const [module, stats] of Object.entries(testSummary)) {
    const passRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0;
    console.log(`\n${module.toUpperCase()} Module:`);
    console.log(`  Total:  ${stats.total}`);
    console.log(`  Passed: ${stats.passed} ✅`);
    console.log(`  Failed: ${stats.failed} ❌`);
    console.log(`  Pass Rate: ${passRate}%`);
  }

  const totalTests = Object.values(testSummary).reduce((sum, stats) => sum + stats.total, 0);
  const totalPassed = Object.values(testSummary).reduce((sum, stats) => sum + stats.passed, 0);
  const totalFailed = Object.values(testSummary).reduce((sum, stats) => sum + stats.failed, 0);
  const overallPassRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;

  console.log('\n' + '=' .repeat(60));
  console.log('OVERALL:');
  console.log(`  Total Tests: ${totalTests}`);
  console.log(`  Passed: ${totalPassed} ✅`);
  console.log(`  Failed: ${totalFailed} ❌`);
  console.log(`  Pass Rate: ${overallPassRate}%`);
  console.log(`  Duration: ${duration}s`);
  console.log('=' .repeat(60));

  // Exit with appropriate code
  process.exit(totalFailed > 0 ? 1 : 0);
}

// Run all tests
runAllTests().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});