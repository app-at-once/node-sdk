const AppAtOnceClient = require('../dist').AppAtOnceClient;

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
const testUserId = 'test-user-' + Date.now();
const testDeviceToken = 'test-device-token-' + Date.now();
const testDeviceInfo = {
  model: 'iPhone 14 Pro',
  osVersion: '16.0',
  appVersion: '1.0.0',
  locale: 'en-US',
  timezone: 'America/New_York'
};

async function runPushTests() {
  console.log('🚀 Starting Push Notification Module Tests\n');

  let createdTemplateId;
  let createdCampaignId;

  try {
    // Test 1: Register device
    console.log('📱 Test 1: Registering device...');
    const device = await client.push.registerDevice({
      userId: testUserId,
      deviceToken: testDeviceToken,
      platform: 'ios',
      deviceInfo: testDeviceInfo,
      tags: ['test', 'ios', 'premium']
    });
    console.log('✅ Device registered:', device);
    console.log('');

    // Test 2: Send push notification to user
    console.log('📱 Test 2: Sending push notification to user...');
    const userPush = await client.push.send({
      to: testUserId,
      targetType: 'user',
      title: 'Test Notification',
      body: 'This is a test push notification from Node SDK',
      data: { 
        testId: Date.now().toString(),
        action: 'open_app'
      },
      badge: 1,
      sound: 'default',
      priority: 'high'
    });
    console.log('✅ Push notification sent:', userPush);
    console.log('');

    // Test 3: Send push with image
    console.log('📱 Test 3: Sending push notification with image...');
    const imagePush = await client.push.send({
      to: testUserId,
      targetType: 'user',
      title: 'New Photo',
      body: 'Check out this amazing photo!',
      image: 'https://via.placeholder.com/600x400',
      category: 'photo',
      threadId: 'photos-thread'
    });
    console.log('✅ Push with image sent:', imagePush);
    console.log('');

    // Test 4: Send silent push
    console.log('📱 Test 4: Sending silent push notification...');
    const silentPush = await client.push.send({
      to: testUserId,
      targetType: 'user',
      title: 'Background Update',
      body: 'Syncing data...',
      silent: true,
      data: {
        sync: true,
        timestamp: new Date().toISOString()
      }
    });
    console.log('✅ Silent push sent:', silentPush);
    console.log('');

    // Test 5: Send to devices by tag
    console.log('📱 Test 5: Sending push to devices by tag...');
    const tagPush = await client.push.send({
      targetType: 'tag',
      tags: ['premium'],
      title: 'Premium Feature Update',
      body: 'New premium features are now available!',
      data: {
        feature: 'premium_update'
      }
    });
    console.log('✅ Push sent to tagged devices:', tagPush);
    console.log('');

    // Test 6: Create push template
    console.log('📱 Test 6: Creating push template...');
    const template = await client.push.createTemplate({
      name: 'Welcome Push Template',
      title: 'Welcome to {{appName}}!',
      body: 'Hi {{userName}}, thanks for installing {{appName}}',
      data: {
        action: 'welcome',
        template: true
      },
      sound: 'welcome.mp3',
      variables: [
        { name: 'userName', type: 'string', required: true },
        { name: 'appName', type: 'string', required: true }
      ],
      tags: ['onboarding'],
      category: 'welcome'
    });
    createdTemplateId = template.id;
    console.log('✅ Template created:', template);
    console.log('');

    // Test 7: Preview template
    console.log('📱 Test 7: Previewing push template...');
    const preview = await client.push.previewTemplate(template.id, {
      userName: 'John Doe',
      appName: 'MyApp'
    });
    console.log('✅ Template preview:', preview);
    console.log('');

    // Test 8: Send with template
    console.log('📱 Test 8: Sending push with template...');
    const templatePush = await client.push.sendWithTemplate(template.id, {
      to: testUserId,
      targetType: 'user',
      variables: {
        userName: 'John Doe',
        appName: 'MyApp'
      }
    });
    console.log('✅ Template push sent:', templatePush);
    console.log('');

    // Test 9: Send bulk push notifications
    console.log('📱 Test 9: Sending bulk push notifications...');
    const bulkPush = await client.push.sendBulk([
      {
        to: testUserId,
        title: 'Bulk Notification 1',
        body: 'This is bulk notification 1',
        targetType: 'user'
      },
      {
        to: testUserId,
        title: 'Bulk Notification 2',
        body: 'This is bulk notification 2',
        targetType: 'user',
        badge: 2
      }
    ]);
    console.log('✅ Bulk push sent:', bulkPush);
    console.log('');

    // Test 10: Update device
    console.log('📱 Test 10: Updating device information...');
    const updatedDevice = await client.push.updateDevice(testDeviceToken, {
      tags: ['test', 'ios', 'premium', 'beta'],
      deviceInfo: {
        ...testDeviceInfo,
        appVersion: '1.0.1'
      }
    });
    console.log('✅ Device updated:', updatedDevice);
    console.log('');

    // Test 11: List devices
    console.log('📱 Test 11: Listing devices...');
    const devices = await client.push.listDevices({
      userId: testUserId,
      platform: 'ios',
      active: true,
      limit: 10
    });
    console.log('✅ Devices found:', devices.total);
    console.log('');

    // Test 12: Schedule push notification
    console.log('📱 Test 12: Scheduling push notification...');
    const futureDate = new Date();
    futureDate.setMinutes(futureDate.getMinutes() + 15); // 15 minutes from now
    
    const scheduledPush = await client.push.send({
      to: testUserId,
      targetType: 'user',
      title: 'Scheduled Notification',
      body: 'This notification was scheduled 15 minutes ago',
      scheduledAt: futureDate
    });
    console.log('✅ Push scheduled for:', futureDate.toISOString());
    console.log('');

    // Test 13: Create campaign
    console.log('📱 Test 13: Creating push campaign...');
    const campaign = await client.push.createCampaign({
      name: 'Test Campaign',
      title: 'Special Offer!',
      body: 'Get 50% off on premium features',
      targetType: 'segment',
      segment: {
        platform: 'ios',
        lastActiveWithin: 7, // Active in last 7 days
        locale: ['en-US', 'en-GB']
      },
      data: {
        campaign: 'special_offer',
        discount: 50
      },
      image: 'https://via.placeholder.com/800x400',
      scheduledAt: futureDate
    });
    createdCampaignId = campaign.id;
    console.log('✅ Campaign created:', campaign);
    console.log('');

    // Test 14: List campaigns
    console.log('📱 Test 14: Listing campaigns...');
    const campaigns = await client.push.listCampaigns({
      status: 'scheduled',
      limit: 10
    });
    console.log('✅ Campaigns found:', campaigns.total);
    console.log('');

    // Test 15: Track delivery
    console.log('📱 Test 15: Tracking push delivery...');
    await client.push.trackDelivered(userPush.messageId);
    console.log('✅ Delivery tracked');
    console.log('');

    // Test 16: Track open
    console.log('📱 Test 16: Tracking push open...');
    await client.push.trackOpened(userPush.messageId, testUserId);
    console.log('✅ Open tracked');
    console.log('');

    // Test 17: Get message status
    console.log('📱 Test 17: Getting message status...');
    const messageStatus = await client.push.getMessageStatus(userPush.messageId);
    console.log('✅ Message status:', messageStatus);
    console.log('');

    // Test 18: Get push logs
    console.log('📱 Test 18: Getting push logs...');
    const logs = await client.push.getLogs({
      userId: testUserId,
      status: 'sent',
      limit: 10
    });
    console.log('✅ Push logs found:', logs.total);
    console.log('');

    // Test 19: Get push statistics
    console.log('📱 Test 19: Getting push statistics...');
    const stats = await client.push.getStats();
    console.log('✅ Push stats:', stats);
    console.log('');

    // Test 20: Get push analytics
    console.log('📱 Test 20: Getting push analytics...');
    const analytics = await client.push.getAnalytics({
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      end: new Date()
    });
    console.log('✅ Push analytics:', {
      totalSent: analytics.totalSent,
      deliveryRate: analytics.deliveryRate,
      openRate: analytics.openRate
    });
    console.log('');

    // Test 21: Update push configuration
    console.log('📱 Test 21: Updating push configuration...');
    await client.push.updateConfig({
      defaultSettings: {
        sound: 'notification.mp3',
        badge: true,
        priority: 'high'
      }
    });
    console.log('✅ Push configuration updated');
    console.log('');

    // Test 22: Get push configuration
    console.log('📱 Test 22: Getting push configuration...');
    const config = await client.push.getConfig();
    console.log('✅ Push config:', config);
    console.log('');

    // Test 23: Send test push
    console.log('📱 Test 23: Sending test push notification...');
    const testPush = await client.push.sendTest(testDeviceToken, 'ios');
    console.log('✅ Test push sent:', testPush);
    console.log('');

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    
    // Cancel campaign
    if (createdCampaignId) {
      await client.push.cancelCampaign(createdCampaignId);
      await client.push.deleteCampaign(createdCampaignId);
    }
    
    // Delete template
    if (createdTemplateId) {
      await client.push.deleteTemplate(createdTemplateId);
    }
    
    // Unregister device
    await client.push.unregisterDevice(testDeviceToken);
    
    console.log('✅ Cleanup completed');
    console.log('');

    console.log('✅ All push notification tests completed successfully!');

  } catch (error) {
    console.error('❌ Push test failed:', error);
    console.error('Error details:', error.response?.data || error.message);
    
    // Cleanup on error
    try {
      if (createdCampaignId) {
        await client.push.deleteCampaign(createdCampaignId).catch(() => {});
      }
      if (createdTemplateId) {
        await client.push.deleteTemplate(createdTemplateId).catch(() => {});
      }
      await client.push.unregisterDevice(testDeviceToken).catch(() => {});
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError.message);
    }
  }
}

// Run tests
runPushTests().catch(console.error);