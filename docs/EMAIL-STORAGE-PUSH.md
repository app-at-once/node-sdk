# Email, Storage, and Push Notification Features

This document describes the email, storage, and push notification features available in the AppAtOnce Node SDK.

## Email Module

The email module provides comprehensive email functionality for your applications.

### Basic Usage

```javascript
const client = new AppAtOnceClient({
  apiKey: 'your-app-api-key',
  baseUrl: 'https://api.appatonce.com'
});

// Send a simple email
const email = await client.email.sendEmail({
  to: [{ email: 'user@example.com', name: 'John Doe' }],
  subject: 'Welcome!',
  text: 'Welcome to our app!',
  html: '<h1>Welcome to our app!</h1>'
});
```

### Email Templates

```javascript
// Create a template
const template = await client.email.createTemplate({
  name: 'Welcome Email',
  subject: 'Welcome {{userName}}!',
  html: '<h1>Hello {{userName}}</h1><p>Welcome to {{appName}}</p>',
  variables: [
    { name: 'userName', type: 'string', required: true },
    { name: 'appName', type: 'string', default: 'MyApp' }
  ]
});

// Send using template
await client.email.sendTemplateEmail(template.id, {
  to: [{ email: 'user@example.com' }],
  variables: {
    userName: 'John',
    appName: 'Awesome App'
  }
});
```

### Bulk Emails

```javascript
// Send bulk emails
const bulk = await client.email.sendBulkEmail({
  emails: [
    {
      to: [{ email: 'user1@example.com' }],
      subject: 'Newsletter',
      template: { id: templateId, variables: { name: 'User 1' } }
    },
    {
      to: [{ email: 'user2@example.com' }],
      subject: 'Newsletter',
      template: { id: templateId, variables: { name: 'User 2' } }
    }
  ]
});
```

### Contact Management

```javascript
// Create contact
const contact = await client.email.createContact({
  email: 'subscriber@example.com',
  name: 'Subscriber Name',
  tags: ['newsletter', 'premium'],
  subscribed: true
});

// Create list
const list = await client.email.createList({
  name: 'Newsletter Subscribers',
  description: 'All newsletter subscribers'
});

// Add contact to list
await client.email.addContactToList(list.id, contact.id);
```

### Email Campaigns

```javascript
// Create campaign
const campaign = await client.email.createCampaign({
  name: 'Summer Sale',
  subject: '50% Off Summer Sale!',
  templateId: template.id,
  lists: [list.id],
  sendAt: new Date('2024-06-01T10:00:00Z')
});

// Launch campaign
await client.email.sendCampaign(campaign.id);
```

### Analytics

```javascript
// Get email analytics
const analytics = await client.email.getEmailAnalytics({
  start: new Date('2024-01-01'),
  end: new Date('2024-12-31')
});

console.log('Delivery rate:', analytics.delivery_rate);
console.log('Open rate:', analytics.open_rate);
console.log('Click rate:', analytics.click_rate);
```

## Storage Module

The storage module provides file storage and management capabilities.

### Basic File Operations

```javascript
// Create bucket
const bucket = await client.storage.createBucket('my-files', {
  acl: 'private',
  versioning: true
});

// Upload file
const file = await client.storage.uploadFile(
  'my-files',
  Buffer.from('Hello World'),
  'hello.txt',
  { contentType: 'text/plain' }
);

// Download file
const content = await client.storage.downloadFile('my-files', 'hello.txt');

// Get file URL
const url = await client.storage.getFileUrl('my-files', 'hello.txt', {
  expiresIn: 3600 // 1 hour
});
```

### Image Processing

```javascript
// Upload image
const image = await client.storage.uploadFile(
  'images',
  imageBuffer,
  'photo.jpg',
  { contentType: 'image/jpeg' }
);

// Resize image
const resized = await client.storage.resizeImage(
  'images',
  'photo.jpg',
  300,
  300,
  {
    quality: 85,
    format: 'webp',
    fit: 'cover'
  }
);

// Optimize image
const optimized = await client.storage.optimizeImage(
  'images',
  'photo.jpg',
  {
    quality: 80,
    progressive: true
  }
);
```

### Bucket Management

```javascript
// List buckets
const buckets = await client.storage.listBuckets();

// Get bucket info
const info = await client.storage.getBucketInfo('my-files');

// Update bucket settings
await client.storage.updateBucket('my-files', {
  acl: 'public-read',
  lifecycle: {
    expiration_days: 90
  }
});
```

### Backup and Restore

```javascript
// Create backup
const backup = await client.storage.createBackup('my-files', {
  name: 'Daily Backup',
  retention_days: 30
});

// Restore from backup
await client.storage.restoreBackup('my-files', backup.id);
```

## Push Notification Module

The push notification module enables sending notifications to iOS, Android, and web devices.

### Device Registration

```javascript
// Register device
const device = await client.push.registerDevice({
  userId: 'user123',
  deviceToken: 'device-token-from-firebase-or-apns',
  platform: 'ios',
  deviceInfo: {
    model: 'iPhone 14',
    osVersion: '16.0',
    appVersion: '1.0.0'
  },
  tags: ['premium', 'ios-users']
});
```

### Sending Notifications

```javascript
// Send to user (all their devices)
const notification = await client.push.send({
  to: 'user123',
  targetType: 'user',
  title: 'New Message',
  body: 'You have a new message!',
  badge: 1,
  sound: 'default',
  data: {
    messageId: 'msg123'
  }
});

// Send to specific devices by tag
await client.push.send({
  targetType: 'tag',
  tags: ['premium'],
  title: 'Premium Feature',
  body: 'New premium features available!',
  image: 'https://example.com/feature.jpg'
});
```

### Push Templates

```javascript
// Create template
const template = await client.push.createTemplate({
  name: 'Order Update',
  title: 'Order {{orderId}} {{status}}',
  body: 'Your order {{orderId}} has been {{status}}',
  variables: [
    { name: 'orderId', type: 'string', required: true },
    { name: 'status', type: 'string', required: true }
  ]
});

// Send with template
await client.push.sendWithTemplate(template.id, {
  to: 'user123',
  targetType: 'user',
  variables: {
    orderId: '12345',
    status: 'shipped'
  }
});
```

### Push Campaigns

```javascript
// Create campaign
const campaign = await client.push.createCampaign({
  name: 'Black Friday Sale',
  title: '50% Off Everything!',
  body: 'Shop now and save big',
  targetType: 'segment',
  segment: {
    platform: 'ios',
    lastActiveWithin: 7, // days
    locale: ['en-US', 'en-GB']
  },
  image: 'https://example.com/sale.jpg',
  scheduledAt: new Date('2024-11-24T00:00:00Z')
});

// Launch campaign
await client.push.launchCampaign(campaign.id);
```

### Analytics and Tracking

```javascript
// Track delivery
await client.push.trackDelivered(notification.messageId);

// Track open
await client.push.trackOpened(notification.messageId, 'user123');

// Get statistics
const stats = await client.push.getStats();
console.log('Delivery rate:', (stats.delivered / stats.sent * 100).toFixed(2) + '%');

// Get detailed analytics
const analytics = await client.push.getAnalytics({
  start: new Date('2024-01-01'),
  end: new Date('2024-12-31')
});
```

### Configuration

```javascript
// Update push configuration
await client.push.updateConfig({
  fcmConfig: {
    projectId: 'your-firebase-project',
    privateKey: '-----BEGIN PRIVATE KEY-----\n...',
    clientEmail: 'firebase-adminsdk@project.iam.gserviceaccount.com'
  },
  apnsConfig: {
    keyId: 'ABC123',
    teamId: 'TEAM123',
    privateKey: '-----BEGIN PRIVATE KEY-----\n...',
    bundleId: 'com.yourcompany.app',
    production: true
  },
  defaultSettings: {
    sound: 'notification.mp3',
    badge: true,
    priority: 'high'
  }
});
```

## Testing

### Running Individual Tests

```bash
# Test email features
node tests/test-email-features.js

# Test storage features
node tests/test-storage-features.js

# Test push notification features
node tests/test-push-features.js
```

### Running All Tests

```bash
# Run comprehensive test suite
node tests/test-all-features.js
```

### Environment Variables

Set these environment variables for testing:

```bash
export TEST_API_KEY="your-test-api-key"
export TEST_BASE_URL="http://localhost:8091"
```

## Error Handling

All methods throw errors with detailed information:

```javascript
try {
  await client.email.sendEmail({
    to: [{ email: 'invalid-email' }],
    subject: 'Test'
  });
} catch (error) {
  console.error('Error:', error.message);
  console.error('Details:', error.response?.data);
}
```

## Best Practices

1. **Email**: Always validate email addresses and use templates for consistent formatting
2. **Storage**: Use appropriate ACLs and implement proper access control
3. **Push**: Register devices on app launch and handle token refresh
4. **General**: Implement proper error handling and retry logic for network failures

## Rate Limits

- Email: 100 emails/second per app
- Storage: 1000 operations/minute per bucket
- Push: 1000 notifications/second per app

## Support

For issues or questions, please contact support@appatonce.com or visit our documentation at https://docs.appatonce.com