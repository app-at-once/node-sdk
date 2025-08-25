#!/usr/bin/env node

/**
 * Push Notifications Example
 * 
 * This example demonstrates all push notification features:
 * - Registering devices
 * - Sending push notifications
 * - Topic-based notifications
 * - Scheduled notifications
 * - Rich notifications (with images)
 * - Analytics and tracking
 * 
 * Prerequisites:
 * - Set APPATONCE_API_KEY environment variable
 * - Configure push providers (FCM/APNS) in your AppAtOnce dashboard
 */

require('dotenv').config();

const { AppAtOnceClient } = require('@appatonce/node-sdk');

async function pushNotificationExample() {
  console.log('📱 AppAtOnce Push Notifications Example\n');
  
  try {
    // Initialize client
    const client = new AppAtOnceClient(process.env.APPATONCE_API_KEY);
    
    console.log('═'.repeat(60));
    console.log('DEVICE REGISTRATION');
    console.log('═'.repeat(60));
    
    // 1. Register a device
    console.log('1️⃣ Registering device for push notifications...');
    const device = await client.push.registerDevice({
      token: 'example-device-token-12345',
      platform: 'ios', // 'ios', 'android', or 'web'
      userId: 'user-123',
      deviceInfo: {
        model: 'iPhone 14',
        os: 'iOS 16.0',
        appVersion: '1.0.0'
      }
    });
    console.log('✅ Device registered:', device.id);
    console.log('   Platform:', device.platform);
    console.log('   User:', device.userId);
    
    // 2. Send simple push notification
    console.log('\n═'.repeat(60));
    console.log('SENDING NOTIFICATIONS');
    console.log('═'.repeat(60));
    
    console.log('2️⃣ Sending simple push notification...');
    const notification = await client.push.send({
      title: 'Hello from AppAtOnce!',
      body: 'This is a test notification',
      tokens: ['example-device-token-12345'],
      data: {
        type: 'test',
        timestamp: new Date().toISOString()
      }
    });
    console.log('✅ Notification sent:', notification.id);
    console.log('   Success:', notification.successCount);
    console.log('   Failed:', notification.failureCount);
    
    // 3. Send notification to user (all their devices)
    console.log('\n3️⃣ Sending notification to user...');
    const userNotification = await client.push.sendToUsers({
      title: 'New Message',
      body: 'You have a new message from John',
      userIds: ['user-123'],
      badge: 1,
      sound: 'default',
      data: {
        messageId: 'msg-456',
        senderId: 'user-789'
      }
    });
    console.log('✅ Sent to user devices:', userNotification.deliveredCount);
    
    // 4. Send rich notification with image
    console.log('\n4️⃣ Sending rich notification...');
    const richNotification = await client.push.send({
      title: '🎉 Special Offer!',
      body: 'Get 50% off on all items today',
      tokens: ['example-device-token-12345'],
      image: 'https://example.com/offer-banner.jpg',
      actions: [
        { id: 'view', title: 'View Offer' },
        { id: 'dismiss', title: 'Not Interested' }
      ],
      data: {
        offerId: 'offer-123',
        expiresAt: new Date(Date.now() + 86400000).toISOString()
      }
    });
    console.log('✅ Rich notification sent');
    
    // 5. Topic management
    console.log('\n═'.repeat(60));
    console.log('TOPIC MANAGEMENT');
    console.log('═'.repeat(60));
    
    console.log('5️⃣ Subscribing device to topics...');
    await client.push.subscribeToTopic('example-device-token-12345', 'news');
    await client.push.subscribeToTopic('example-device-token-12345', 'offers');
    console.log('✅ Subscribed to topics: news, offers');
    
    // 6. Send to topic
    console.log('\n6️⃣ Sending notification to topic...');
    const topicNotification = await client.push.sendToTopic({
      topic: 'news',
      title: '📰 Breaking News',
      body: 'Important update for all subscribers',
      priority: 'high'
    });
    console.log('✅ Sent to topic subscribers');
    
    // 7. Scheduled notification
    console.log('\n7️⃣ Scheduling notification...');
    const scheduledNotification = await client.push.schedule({
      title: '⏰ Reminder',
      body: 'Don\'t forget about your appointment',
      tokens: ['example-device-token-12345'],
      scheduledAt: new Date(Date.now() + 3600000), // 1 hour from now
      timezone: 'America/New_York'
    });
    console.log('✅ Notification scheduled for:', scheduledNotification.scheduledAt);
    
    // 8. Campaign with segmentation
    console.log('\n═'.repeat(60));
    console.log('PUSH CAMPAIGNS');
    console.log('═'.repeat(60));
    
    console.log('8️⃣ Creating push campaign...');
    const campaign = await client.push.createCampaign({
      name: 'Weekend Sale Campaign',
      title: '🛍️ Weekend Sale!',
      body: 'Up to 70% off this weekend only',
      image: 'https://example.com/sale-banner.jpg',
      segments: {
        platform: ['ios', 'android'],
        tags: ['shopping', 'premium'],
        lastActiveWithin: 30 // days
      },
      scheduledAt: new Date('2024-01-20 10:00:00'),
      timezone: 'UTC'
    });
    console.log('✅ Campaign created:', campaign.id);
    console.log('   Target audience:', campaign.estimatedReach);
    
    // 9. Analytics
    console.log('\n═'.repeat(60));
    console.log('ANALYTICS');
    console.log('═'.repeat(60));
    
    console.log('9️⃣ Getting push notification analytics...');
    const analytics = await client.push.getAnalytics({
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date()
    });
    console.log('✅ Push analytics (last 7 days):');
    console.log('   Total sent:', analytics.totalSent);
    console.log('   Delivered:', analytics.totalDelivered);
    console.log('   Opened:', analytics.totalOpened);
    console.log('   Delivery rate:', analytics.deliveryRate + '%');
    console.log('   Open rate:', analytics.openRate + '%');
    
    // 10. Device management
    console.log('\n🔟 Managing devices...');
    
    // Get user devices
    const userDevices = await client.push.getUserDevices('user-123');
    console.log('   User has', userDevices.length, 'registered devices');
    
    // Update device token
    console.log('   Updating device token...');
    await client.push.updateDeviceToken(device.id, 'new-token-67890');
    console.log('   ✅ Token updated');
    
    // Unregister device
    console.log('   Unregistering device...');
    await client.push.unregisterDevice(device.id);
    console.log('   ✅ Device unregistered');
    
    console.log('\n✅ Push notification example completed!');
    
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

pushNotificationExample();