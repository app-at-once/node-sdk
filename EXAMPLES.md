# AppAtOnce Node.js SDK Examples

This guide provides comprehensive examples for using the AppAtOnce Node.js SDK in various scenarios.

📚 **For the latest documentation and more examples, visit: https://appatonce.com/docs**

## Table of Contents

- [Getting Started](#getting-started)
- [Database Operations](#database-operations)
  - [Basic CRUD](#basic-crud)
  - [Advanced Queries](#advanced-queries)
  - [Transactions](#transactions)
  - [Real-time Subscriptions](#real-time-subscriptions)
- [Authentication & Authorization](#authentication--authorization)
- [File Storage](#file-storage)
- [Email Services](#email-services)
- [AI Integration](#ai-integration)
- [Workflows & Automation](#workflows--automation)
- [Push Notifications](#push-notifications)
- [Real-world Applications](#real-world-applications)
  - [Blog Platform](#blog-platform)
  - [E-commerce System](#e-commerce-system)
  - [Real-time Chat](#real-time-chat)
  - [SaaS Multi-tenant App](#saas-multi-tenant-app)

## Getting Started

### Installation and Setup

```typescript
import { AppAtOnceClient } from '@appatonce/node-sdk';

// Initialize with API key
const client = new AppAtOnceClient({
  apiKey: process.env.APPATONCE_API_KEY,
  baseUrl: 'https://api.appatonce.com', // Optional
  debug: true // Enable debug logging
});

// Or use factory methods
const client = AppAtOnceClient.createWithApiKey('your-api-key');

// Initialize with credentials
const client = await AppAtOnceClient.createWithCredentials(
  'user@example.com',
  'password'
);
```

## Database Operations

### Basic CRUD

```typescript
// Create a table
await client.schema.createTable({
  name: 'products',
  fields: [
    { name: 'id', type: 'uuid', primaryKey: true },
    { name: 'name', type: 'string', required: true },
    { name: 'price', type: 'decimal', required: true },
    { name: 'description', type: 'text' },
    { name: 'category_id', type: 'uuid' },
    { name: 'tags', type: 'jsonb' },
    { name: 'in_stock', type: 'boolean', default: true },
    { name: 'created_at', type: 'timestamp', default: 'now()' }
  ],
  indexes: [
    { fields: ['category_id'] },
    { fields: ['price'] },
    { fields: ['tags'], method: 'gin' }
  ]
});

// Insert single record
const product = await client.table('products').insert({
  name: 'Gaming Laptop',
  price: 1299.99,
  description: 'High-performance gaming laptop',
  category_id: 'cat-123',
  tags: ['gaming', 'laptop', 'high-performance']
});

// Bulk insert
const products = await client.table('products').insert([
  { name: 'Mouse', price: 29.99, category_id: 'cat-456' },
  { name: 'Keyboard', price: 79.99, category_id: 'cat-456' },
  { name: 'Monitor', price: 399.99, category_id: 'cat-789' }
]);

// Update records
await client.table('products')
  .eq('id', product.id)
  .update({ price: 1199.99, tags: ['gaming', 'laptop', 'sale'] });

// Delete records
await client.table('products')
  .eq('in_stock', false)
  .delete();

// Upsert (insert or update)
await client.table('products').upsert({
  id: 'prod-123',
  name: 'Updated Product',
  price: 99.99
}, ['id']);
```

### Advanced Queries

```typescript
// Complex filtering with OR conditions
const results = await client.table('products')
  .select('*, category:categories(name)')
  .or([
    { price: { gte: 100, lte: 500 } },
    { tags: { contains: 'sale' } }
  ])
  .eq('in_stock', true)
  .orderBy('price', 'asc')
  .limit(20)
  .execute();

// JSON/JSONB queries
const gamingProducts = await client.table('products')
  .select('*')
  .jsonContains('tags', 'gaming')
  .jsonHasKey('metadata', 'warranty')
  .execute();

// Full-text search
const searchResults = await client.table('products')
  .select('*, ts_rank')
  .textSearch('name || description', 'wireless headphones', {
    language: 'english',
    highlight: true
  })
  .orderBy('ts_rank', 'desc')
  .execute();

// Aggregations and grouping
const categoryStats = await client.table('products')
  .select(`
    category_id,
    count(*) as product_count,
    avg(price) as avg_price,
    min(price) as min_price,
    max(price) as max_price
  `)
  .groupBy('category_id')
  .having('count(*)', '>', 5)
  .execute();

// Window functions
const rankedProducts = await client.table('products')
  .select(`
    *,
    row_number() OVER (PARTITION BY category_id ORDER BY price DESC) as price_rank,
    percent_rank() OVER (ORDER BY price) as price_percentile
  `)
  .execute();

// Joins with aliases
const orderDetails = await client.table('orders')
  .select(`
    o.id as order_id,
    o.created_at as order_date,
    c.name as customer_name,
    c.email as customer_email,
    p.name as product_name,
    oi.quantity,
    oi.price as item_price
  `)
  .from('orders o')
  .join('customers c', 'o.customer_id = c.id')
  .join('order_items oi', 'o.id = oi.order_id')
  .join('products p', 'oi.product_id = p.id')
  .gte('o.created_at', '2024-01-01')
  .execute();

// Common Table Expressions (CTEs)
const monthlyRevenue = await client.raw(`
  WITH monthly_sales AS (
    SELECT 
      DATE_TRUNC('month', created_at) as month,
      SUM(total) as revenue,
      COUNT(*) as order_count
    FROM orders
    WHERE status = 'completed'
    GROUP BY DATE_TRUNC('month', created_at)
  )
  SELECT 
    month,
    revenue,
    order_count,
    revenue / order_count as avg_order_value,
    SUM(revenue) OVER (ORDER BY month) as cumulative_revenue
  FROM monthly_sales
  ORDER BY month DESC
`);
```

### Transactions

```typescript
// Basic transaction
await client.transaction(async (tx) => {
  // Create order
  const order = await tx.table('orders').insert({
    customer_id: 'cust-123',
    total: 299.97,
    status: 'pending'
  });

  // Create order items
  await tx.table('order_items').insert([
    { order_id: order.id, product_id: 'prod-1', quantity: 2, price: 99.99 },
    { order_id: order.id, product_id: 'prod-2', quantity: 1, price: 99.99 }
  ]);

  // Update inventory
  await tx.raw(`
    UPDATE products 
    SET stock = stock - oi.quantity
    FROM (VALUES 
      ('prod-1', 2),
      ('prod-2', 1)
    ) AS oi(product_id, quantity)
    WHERE products.id = oi.product_id::uuid
  `);

  // Check if any product is out of stock
  const outOfStock = await tx.table('products')
    .select('id')
    .in('id', ['prod-1', 'prod-2'])
    .lte('stock', 0)
    .execute();

  if (outOfStock.data.length > 0) {
    throw new Error('Product out of stock');
  }
});

// Transaction with savepoints
await client.transaction(async (tx) => {
  const user = await tx.table('users').insert({ email: 'user@example.com' });
  
  try {
    await tx.savepoint('user_profile');
    await tx.table('profiles').insert({ user_id: user.id, bio: 'New user' });
    await tx.releaseSavepoint('user_profile');
  } catch (error) {
    await tx.rollbackToSavepoint('user_profile');
    // Handle profile creation error
  }
  
  // Continue with other operations
});
```

### Real-time Subscriptions

```typescript
// Subscribe to all changes on a table
const subscription = client.realtime.subscribe('products', (event) => {
  console.log(`Product ${event.type}:`, event.data);
  
  switch (event.type) {
    case 'INSERT':
      console.log('New product added:', event.data);
      break;
    case 'UPDATE':
      console.log('Product updated:', event.old, '->', event.data);
      break;
    case 'DELETE':
      console.log('Product deleted:', event.old);
      break;
  }
});

// Subscribe with filters
client.realtime.subscribe('orders', 
  (event) => {
    // Send notification for high-value orders
    if (event.data.total > 1000) {
      notifyAdmin('High-value order received!', event.data);
    }
  },
  { 
    status: 'pending',
    total: { gte: 100 }
  }
);

// Subscribe to specific columns only
client.realtime.subscribeToColumns('users', ['last_active', 'status'], (event) => {
  if (event.data.status === 'online') {
    updateUserPresence(event.data.id);
  }
});

// Channel-based pub/sub
const chatChannel = client.realtime.channel('chat-room-123');

// Listen for messages
chatChannel.on('message', (msg) => {
  addMessageToUI(msg);
});

// Send messages
await chatChannel.send({
  type: 'message',
  user: 'John',
  text: 'Hello everyone!',
  timestamp: new Date()
});

// Presence tracking
const presenceChannel = client.realtime.channel('document-edit-456');

presenceChannel.on('presence', { event: 'join' }, (member) => {
  console.log(`${member.user.name} joined the document`);
});

presenceChannel.on('presence', { event: 'leave' }, (member) => {
  console.log(`${member.user.name} left the document`);
});

await presenceChannel.track({
  user: { id: 'user-123', name: 'John' },
  cursor: { x: 100, y: 200 }
});

// Cleanup
subscription.unsubscribe();
chatChannel.unsubscribe();
```

## Authentication & Authorization

```typescript
// User registration with email verification
const { user, session } = await client.auth.signUp({
  email: 'newuser@example.com',
  password: 'SecurePass123!',
  name: 'John Doe',
  metadata: {
    referral_code: 'FRIEND123',
    signup_source: 'mobile_app'
  }
});

// Send verification email
await client.auth.sendEmailVerification();

// Verify email with token
await client.auth.verifyEmail(verificationToken);

// Sign in with MFA
const { user, session, requiresMFA } = await client.auth.signIn({
  email: 'user@example.com',
  password: 'password'
});

if (requiresMFA) {
  // Prompt for MFA code
  await client.auth.verifyMFA(mfaCode);
}

// Social authentication
const { url } = await client.auth.signInWithProvider('google');
// Redirect user to url

// Handle OAuth callback
const session = await client.auth.handleOAuthCallback('google', code, state);

// Password reset flow
await client.auth.resetPassword('user@example.com');
await client.auth.confirmResetPassword(resetToken, 'NewPassword123!');

// Session management
const sessions = await client.auth.getUserSessions();
await client.auth.revokeSession(sessionId);
await client.auth.revokeAllSessions();

// API key management
const apiKey = await client.auth.createApiKey('Mobile App', [
  'read:profile',
  'write:posts',
  'read:comments'
]);

const keys = await client.auth.listApiKeys();
await client.auth.revokeApiKey(keyId);

// Organization management
const org = await client.auth.createOrganization('My Company', 'my-company');
await client.auth.switchOrganization(org.id);

// Invite users
const invitation = await client.auth.inviteUserToOrganization(
  org.id,
  'colleague@example.com',
  'member'
);

// Role-based access control
const hasPermission = await client.auth.checkPermission('posts:write');
const userRoles = await client.auth.getUserRoles();
await client.auth.assignRole(userId, 'editor');
```

## File Storage

```typescript
// Upload file with metadata
const file = await client.storage.upload('avatars/user-123.jpg', fileBuffer, {
  contentType: 'image/jpeg',
  metadata: {
    userId: 'user-123',
    uploadedFrom: 'mobile',
    version: '2'
  },
  acl: 'public-read'
});

// Upload with automatic image processing
const processedImage = await client.storage.upload('products/laptop.jpg', imageBuffer, {
  process: {
    resize: { width: 800, height: 600, fit: 'inside' },
    format: 'webp',
    quality: 85,
    strip: true, // Remove EXIF data
    watermark: {
      text: '© MyStore',
      position: 'bottom-right',
      opacity: 0.5
    }
  }
});

// Generate multiple sizes
const thumbnails = await client.storage.uploadWithVariants('gallery/photo.jpg', imageBuffer, {
  variants: [
    { name: 'thumb', resize: { width: 150, height: 150, fit: 'cover' } },
    { name: 'medium', resize: { width: 800, height: 600, fit: 'inside' } },
    { name: 'large', resize: { width: 1920, height: 1080, fit: 'inside' } }
  ]
});

// Chunked upload for large files
const uploader = client.storage.createChunkedUpload('videos/movie.mp4', {
  chunkSize: 5 * 1024 * 1024, // 5MB chunks
  contentType: 'video/mp4'
});

uploader.on('progress', (progress) => {
  console.log(`Upload progress: ${progress.percent}%`);
});

await uploader.upload(largeFileStream);

// Download with transformations
const resizedImage = await client.storage.download('products/laptop.jpg', {
  transform: {
    width: 400,
    height: 300,
    format: 'jpeg',
    quality: 90
  }
});

// Generate signed URLs
const signedUrl = await client.storage.getSignedUrl('private/document.pdf', {
  expiresIn: 3600, // 1 hour
  responseContentDisposition: 'attachment; filename="report.pdf"'
});

// Direct upload URL for client-side uploads
const { url, fields } = await client.storage.getUploadUrl('user-uploads/', {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  expiresIn: 600 // 10 minutes
});

// List files with pagination
const files = await client.storage.list('products/', {
  limit: 100,
  cursor: lastFile?.id,
  prefix: '2024/',
  delimiter: '/'
});

// Copy and move files
await client.storage.copy('temp/upload.jpg', 'avatars/user-123.jpg');
await client.storage.move('old/file.pdf', 'archive/2024/file.pdf');

// Batch operations
await client.storage.deleteMany([
  'temp/file1.jpg',
  'temp/file2.jpg',
  'temp/file3.jpg'
]);

// Get file metadata
const metadata = await client.storage.getMetadata('documents/report.pdf');
console.log(`File size: ${metadata.size}, Last modified: ${metadata.lastModified}`);
```

## Email Services

```typescript
// Create email template with variables
const template = await client.email.createTemplate({
  name: 'order-confirmation',
  subject: 'Order #{{order_number}} Confirmed - {{company_name}}',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: #007bff; color: white; padding: 20px; }
        .content { padding: 20px; }
        .order-details { background: #f8f9fa; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi {{customer_name}},</p>
          <p>Thank you for your order! Your order #{{order_number}} has been confirmed.</p>
          
          <div class="order-details">
            <h3>Order Details:</h3>
            {{#each items}}
            <p>{{name}} - Quantity: {{quantity}} - ${{price}}</p>
            {{/each}}
            <hr>
            <p><strong>Total: ${{total}}</strong></p>
          </div>
          
          <p>Track your order: <a href="{{tracking_url}}">Click here</a></p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
    Order Confirmed!
    
    Hi {{customer_name}},
    
    Thank you for your order! Your order #{{order_number}} has been confirmed.
    
    Order Details:
    {{#each items}}
    - {{name}} - Quantity: {{quantity}} - ${{price}}
    {{/each}}
    
    Total: ${{total}}
    
    Track your order: {{tracking_url}}
  `,
  variables: [
    { name: 'customer_name', type: 'string', required: true },
    { name: 'order_number', type: 'string', required: true },
    { name: 'items', type: 'array', required: true },
    { name: 'total', type: 'number', required: true },
    { name: 'tracking_url', type: 'string', required: true },
    { name: 'company_name', type: 'string', default: 'MyStore' }
  ]
});

// Send templated email
await client.email.sendWithTemplate(template.id, {
  to: 'customer@example.com',
  data: {
    customer_name: 'John Doe',
    order_number: 'ORD-12345',
    items: [
      { name: 'Gaming Laptop', quantity: 1, price: 1299.99 },
      { name: 'Wireless Mouse', quantity: 2, price: 29.99 }
    ],
    total: 1359.97,
    tracking_url: 'https://mystore.com/track/ORD-12345'
  },
  attachments: [
    {
      filename: 'invoice.pdf',
      content: invoicePdfBuffer,
      contentType: 'application/pdf'
    }
  ]
});

// Send bulk emails with personalization
const recipients = [
  { email: 'user1@example.com', data: { name: 'User 1', code: 'SAVE10' } },
  { email: 'user2@example.com', data: { name: 'User 2', code: 'SAVE20' } },
  // ... more recipients
];

const campaign = await client.email.sendBulk({
  template: 'newsletter',
  recipients,
  scheduledAt: new Date(Date.now() + 3600000), // Send in 1 hour
  tags: ['newsletter', '2024-01'],
  trackOpens: true,
  trackClicks: true
});

// Monitor campaign progress
const status = await client.email.getCampaignStatus(campaign.id);
console.log(`Sent: ${status.sent}, Opened: ${status.opened}, Clicked: ${status.clicked}`);

// Create contact lists
const list = await client.email.createList({
  name: 'Newsletter Subscribers',
  description: 'Users who opted in for newsletters'
});

// Add contacts to list
await client.email.addContactsToList(list.id, [
  { email: 'subscriber1@example.com', name: 'Subscriber 1', tags: ['premium'] },
  { email: 'subscriber2@example.com', name: 'Subscriber 2', tags: ['free'] }
]);

// Manage unsubscribes
await client.email.unsubscribe('user@example.com', {
  lists: ['newsletter'],
  reason: 'Too many emails'
});

// Check email reputation
const reputation = await client.email.getDomainReputation('mystore.com');
console.log(`Domain reputation: ${reputation.score}/100`);

// Verify email addresses
const validation = await client.email.validateEmail('test@example.com');
if (validation.valid && validation.deliverable) {
  // Email is valid and deliverable
}
```

## AI Integration

```typescript
// Generate content with GPT-4
const blogPost = await client.ai.generateText(
  'Write a comprehensive guide about sustainable living in urban environments',
  {
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: 'You are an expert environmental blogger with a friendly, engaging tone.'
  }
);

// Generate multiple variations
const headlines = await client.ai.generateVariations(
  'Create catchy headlines for a fitness app launch',
  {
    count: 5,
    temperature: 0.9,
    maxTokensPerVariation: 50
  }
);

// Chat with context
const chatSession = client.ai.createChatSession();

const response1 = await chatSession.send('What is quantum computing?');
const response2 = await chatSession.send('How is it different from classical computing?');
const response3 = await chatSession.send('What are its practical applications?');

// Generate embeddings for semantic search
const documents = [
  'Introduction to machine learning algorithms',
  'Deep learning neural networks explained',
  'Natural language processing basics',
  'Computer vision fundamentals'
];

const embeddings = await client.ai.generateEmbeddings(documents, {
  model: 'text-embedding-3-large',
  dimensions: 1536
});

// Store embeddings for semantic search
for (let i = 0; i < documents.length; i++) {
  await client.table('documents').insert({
    content: documents[i],
    embedding: embeddings[i],
    metadata: { category: 'ai-tutorials' }
  });
}

// Semantic search
const searchResults = await client.ai.semanticSearch('documents', {
  query: 'How do neural networks work?',
  limit: 5,
  threshold: 0.7,
  includeDistance: true
});

// Image generation with DALL-E
const image = await client.ai.generateImage(
  'A futuristic city with flying cars and green buildings',
  {
    model: 'dall-e-3',
    size: '1024x1024',
    quality: 'hd',
    style: 'vivid',
    n: 1
  }
);

// Save generated image
await client.storage.uploadFromUrl(
  'generated/city-' + Date.now() + '.jpg',
  image.url,
  { metadata: { prompt: image.prompt, model: 'dall-e-3' } }
);

// Image analysis and tagging
const analysis = await client.ai.analyzeImage('products/laptop.jpg', {
  features: ['objects', 'text', 'brands', 'colors', 'categories']
});

// Auto-tag products based on image
await client.table('products')
  .eq('id', productId)
  .update({
    auto_tags: analysis.labels,
    dominant_colors: analysis.colors,
    detected_text: analysis.text
  });

// Text-to-speech
const audio = await client.ai.textToSpeech(
  'Welcome to our store! How can I help you today?',
  {
    voice: 'alloy',
    model: 'tts-1-hd',
    speed: 1.0,
    format: 'mp3'
  }
);

// Transcribe audio
const transcription = await client.ai.transcribeAudio('recording.mp3', {
  model: 'whisper-1',
  language: 'en',
  temperature: 0,
  timestamps: true
});

// Content moderation
const moderation = await client.ai.moderateContent(userInput);
if (moderation.flagged) {
  console.log('Content flagged for:', moderation.categories);
}

// Custom AI pipeline
const pipeline = await client.ai.createPipeline({
  name: 'product-description-enhancer',
  steps: [
    {
      type: 'generate',
      prompt: 'Enhance this product description: {{input}}',
      model: 'gpt-4'
    },
    {
      type: 'moderate',
      action: 'flag'
    },
    {
      type: 'translate',
      targetLanguages: ['es', 'fr', 'de']
    }
  ]
});

const enhanced = await client.ai.runPipeline(pipeline.id, {
  input: 'Basic laptop for everyday use'
});
```

## Workflows & Automation

```typescript
// Create complex e-commerce order workflow
const orderWorkflow = await client.workflow.createWorkflow({
  name: 'order-processing',
  description: 'Complete order processing with inventory, payment, and shipping',
  definition: {
    trigger: {
      type: 'database',
      config: {
        table: 'orders',
        event: 'INSERT',
        condition: 'data.status = "pending"'
      }
    },
    steps: [
      {
        id: 'validate-order',
        name: 'Validate Order',
        type: 'condition',
        config: {
          conditions: [
            { field: 'data.total', operator: '>', value: 0 },
            { field: 'data.items', operator: 'length>', value: 0 }
          ]
        },
        onSuccess: 'check-inventory',
        onError: 'reject-order'
      },
      {
        id: 'check-inventory',
        name: 'Check Inventory',
        type: 'database',
        config: {
          operation: 'query',
          sql: `
            SELECT p.id, p.stock, oi.quantity
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = {{data.id}}
            AND p.stock < oi.quantity
          `
        },
        onSuccess: 'process-payment',
        onError: 'insufficient-stock'
      },
      {
        id: 'process-payment',
        name: 'Process Payment',
        type: 'http',
        config: {
          method: 'POST',
          url: 'https://api.stripe.com/v1/charges',
          headers: {
            'Authorization': 'Bearer {{env.STRIPE_KEY}}'
          },
          body: {
            amount: '{{data.total * 100}}',
            currency: 'usd',
            source: '{{data.payment_token}}',
            description: 'Order {{data.id}}'
          }
        },
        onSuccess: 'update-inventory',
        onError: 'payment-failed'
      },
      {
        id: 'update-inventory',
        name: 'Update Inventory',
        type: 'database',
        config: {
          operation: 'execute',
          sql: `
            UPDATE products p
            SET stock = stock - oi.quantity
            FROM order_items oi
            WHERE p.id = oi.product_id
            AND oi.order_id = {{data.id}}
          `
        },
        onSuccess: 'send-notifications'
      },
      {
        id: 'send-notifications',
        name: 'Send Notifications',
        type: 'parallel',
        config: {
          tasks: [
            {
              type: 'email',
              config: {
                template: 'order-confirmation',
                to: '{{data.customer_email}}',
                data: {
                  order_number: '{{data.id}}',
                  total: '{{data.total}}'
                }
              }
            },
            {
              type: 'webhook',
              config: {
                url: '{{env.WAREHOUSE_WEBHOOK}}',
                method: 'POST',
                body: {
                  order_id: '{{data.id}}',
                  items: '{{data.items}}',
                  shipping: '{{data.shipping_address}}'
                }
              }
            },
            {
              type: 'database',
              config: {
                operation: 'update',
                table: 'orders',
                where: { id: '{{data.id}}' },
                data: { status: 'processing' }
              }
            }
          ]
        }
      }
    ],
    errorHandlers: {
      'reject-order': {
        type: 'database',
        config: {
          operation: 'update',
          table: 'orders',
          where: { id: '{{data.id}}' },
          data: { status: 'rejected', reason: 'Invalid order data' }
        }
      },
      'insufficient-stock': {
        type: 'sequence',
        steps: [
          {
            type: 'database',
            config: {
              operation: 'update',
              table: 'orders',
              where: { id: '{{data.id}}' },
              data: { status: 'pending_stock' }
            }
          },
          {
            type: 'email',
            config: {
              to: '{{data.customer_email}}',
              template: 'stock-notification'
            }
          }
        ]
      },
      'payment-failed': {
        type: 'sequence',
        steps: [
          {
            type: 'database',
            config: {
              operation: 'update',
              table: 'orders',
              where: { id: '{{data.id}}' },
              data: { status: 'payment_failed' }
            }
          },
          {
            type: 'email',
            config: {
              to: '{{data.customer_email}}',
              template: 'payment-failed'
            }
          }
        ]
      }
    }
  }
});

// Schedule recurring workflows
const reportWorkflow = await client.workflow.createWorkflow({
  name: 'daily-sales-report',
  description: 'Generate and send daily sales reports',
  triggers: [{
    type: 'schedule',
    config: {
      cron: '0 9 * * *', // Every day at 9 AM
      timezone: 'America/New_York'
    }
  }],
  definition: {
    steps: [
      {
        id: 'generate-report',
        type: 'database',
        config: {
          operation: 'query',
          sql: `
            SELECT 
              DATE(created_at) as date,
              COUNT(*) as order_count,
              SUM(total) as revenue,
              AVG(total) as avg_order_value
            FROM orders
            WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
            AND created_at < CURRENT_DATE
            AND status = 'completed'
            GROUP BY DATE(created_at)
          `
        }
      },
      {
        id: 'format-report',
        type: 'ai',
        config: {
          operation: 'generate',
          prompt: `
            Create a professional daily sales report based on this data:
            {{steps.generate-report.result}}
            
            Include insights and recommendations.
          `,
          model: 'gpt-4'
        }
      },
      {
        id: 'send-report',
        type: 'email',
        config: {
          to: ['admin@company.com', 'sales@company.com'],
          subject: 'Daily Sales Report - {{date}}',
          html: '{{steps.format-report.result}}'
        }
      }
    ]
  }
});

// Monitor workflow executions
const executions = await client.workflow.listExecutions(orderWorkflow.id, {
  status: 'failed',
  timeRange: {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000),
    end: new Date()
  }
});

// Retry failed executions
for (const execution of executions.executions) {
  await client.workflow.retryExecution(execution.id, {
    fromStep: 'process-payment' // Retry from specific step
  });
}

// Create workflow templates
const template = await client.workflow.createTemplate({
  name: 'customer-onboarding',
  description: 'Standard customer onboarding flow',
  category: 'customer-success',
  definition: {
    // ... workflow definition
  },
  variables: [
    { name: 'welcome_email_template', type: 'string', required: true },
    { name: 'trial_duration_days', type: 'number', default: 14 }
  ]
});

// Use workflow template
const onboardingWorkflow = await client.workflow.createFromTemplate(template.id, {
  name: 'premium-customer-onboarding',
  variables: {
    welcome_email_template: 'premium-welcome',
    trial_duration_days: 30
  }
});
```

## Push Notifications

```typescript
// Register device for push notifications
const device = await client.push.registerDevice({
  userId: 'user-123',
  deviceToken: 'device-token-from-app',
  platform: 'ios',
  deviceInfo: {
    model: 'iPhone 14',
    osVersion: '16.0',
    appVersion: '1.2.3',
    locale: 'en-US',
    timezone: 'America/New_York'
  }
});

// Send push notification to specific user
await client.push.sendToUser('user-123', {
  title: 'New Message',
  body: 'You have a new message from John',
  data: {
    type: 'message',
    messageId: 'msg-456',
    senderId: 'user-789'
  },
  badge: 1,
  sound: 'default',
  priority: 'high'
});

// Send to multiple users
await client.push.sendToUsers(['user-1', 'user-2', 'user-3'], {
  title: 'Flash Sale!',
  body: '50% off everything for the next hour',
  image: 'https://mystore.com/sale-banner.jpg',
  data: {
    type: 'promotion',
    promoId: 'flash-sale-123'
  }
});

// Send to topic subscribers
await client.push.sendToTopic('sports-news', {
  title: 'Game Update',
  body: 'Lakers lead 85-80 in the 4th quarter',
  data: {
    gameId: 'game-123',
    score: { home: 85, away: 80 }
  }
});

// Create push campaign
const campaign = await client.push.createCampaign({
  name: 'Black Friday Sale',
  title: 'Black Friday Starts Now!',
  body: 'Up to 70% off on selected items',
  image: 'https://mystore.com/black-friday.jpg',
  targetType: 'segment',
  segment: {
    tags: ['customer'],
    lastActiveWithin: 30, // days
    platform: ['ios', 'android']
  },
  scheduledAt: new Date('2024-11-29T00:00:00Z'),
  data: {
    type: 'sale',
    saleId: 'black-friday-2024'
  }
});

// Track push metrics
const analytics = await client.push.getAnalytics({
  timeRange: {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  }
});

console.log(`
  Push Notification Analytics (Last 7 days):
  - Sent: ${analytics.totalSent}
  - Delivered: ${analytics.totalDelivered} (${analytics.deliveryRate}%)
  - Opened: ${analytics.totalOpened} (${analytics.openRate}%)
`);

// Manage push templates
const pushTemplate = await client.push.createTemplate({
  name: 'order-shipped',
  title: 'Your order is on its way! 📦',
  body: 'Order #{{orderNumber}} has been shipped and will arrive by {{deliveryDate}}',
  data: {
    type: 'order_update',
    orderId: '{{orderId}}'
  },
  variables: [
    { name: 'orderNumber', type: 'string', required: true },
    { name: 'deliveryDate', type: 'string', required: true },
    { name: 'orderId', type: 'string', required: true }
  ]
});

// Send using template
await client.push.sendWithTemplate(pushTemplate.id, {
  userId: 'user-123',
  data: {
    orderNumber: 'ORD-12345',
    deliveryDate: 'Friday, Dec 15',
    orderId: 'order-12345'
  }
});
```

## Real-world Applications

### Blog Platform

```typescript
// Blog post with comments and reactions
const blogSchema = async () => {
  // Create tables
  await client.schema.createTable({
    name: 'posts',
    fields: [
      { name: 'id', type: 'uuid', primaryKey: true },
      { name: 'title', type: 'string', required: true },
      { name: 'slug', type: 'string', unique: true },
      { name: 'content', type: 'text', required: true },
      { name: 'excerpt', type: 'text' },
      { name: 'author_id', type: 'uuid', required: true },
      { name: 'category_id', type: 'uuid' },
      { name: 'tags', type: 'jsonb' },
      { name: 'featured_image', type: 'string' },
      { name: 'status', type: 'string', default: 'draft' },
      { name: 'published_at', type: 'timestamp' },
      { name: 'view_count', type: 'integer', default: 0 },
      { name: 'created_at', type: 'timestamp', default: 'now()' }
    ],
    indexes: [
      { fields: ['slug'] },
      { fields: ['author_id'] },
      { fields: ['published_at'] },
      { fields: ['tags'], method: 'gin' }
    ]
  });

  await client.schema.createTable({
    name: 'comments',
    fields: [
      { name: 'id', type: 'uuid', primaryKey: true },
      { name: 'post_id', type: 'uuid', required: true },
      { name: 'user_id', type: 'uuid', required: true },
      { name: 'content', type: 'text', required: true },
      { name: 'parent_id', type: 'uuid' }, // For nested comments
      { name: 'is_approved', type: 'boolean', default: true },
      { name: 'created_at', type: 'timestamp', default: 'now()' }
    ],
    indexes: [
      { fields: ['post_id'] },
      { fields: ['user_id'] },
      { fields: ['parent_id'] }
    ]
  });
};

// Auto-generate slug from title
const createPost = async (postData: any) => {
  const slug = postData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  const post = await client.table('posts').insert({
    ...postData,
    slug,
    status: 'published',
    published_at: new Date()
  });

  // Generate AI excerpt if not provided
  if (!post.excerpt) {
    const excerpt = await client.ai.generateText(
      `Create a 150-character excerpt for this blog post: ${post.content}`,
      { maxTokens: 50 }
    );
    
    await client.table('posts')
      .eq('id', post.id)
      .update({ excerpt });
  }

  // Process featured image
  if (post.featured_image) {
    const processed = await client.storage.upload(
      `blog/${post.id}/featured.jpg`,
      post.featured_image,
      {
        process: {
          resize: { width: 1200, height: 630 },
          format: 'jpeg',
          quality: 85
        }
      }
    );
  }

  return post;
};

// Get posts with author and comment count
const getPosts = async (page = 1, limit = 10) => {
  return await client.table('posts')
    .select(`
      *,
      author:users!author_id(name, avatar),
      comment_count:comments(count)
    `)
    .eq('status', 'published')
    .orderBy('published_at', 'desc')
    .offset((page - 1) * limit)
    .limit(limit)
    .execute();
};

// Real-time comment system
client.realtime.subscribe('comments', async (event) => {
  if (event.type === 'INSERT') {
    // Notify post author
    const post = await client.table('posts')
      .select('author_id, title')
      .eq('id', event.data.post_id)
      .single();
    
    await client.push.sendToUser(post.author_id, {
      title: 'New Comment',
      body: `Someone commented on "${post.title}"`,
      data: {
        type: 'comment',
        postId: event.data.post_id,
        commentId: event.data.id
      }
    });
  }
});
```

### E-commerce System

```typescript
// Product catalog with inventory tracking
const ecommerceSetup = async () => {
  // Products with variants
  await client.schema.createTable({
    name: 'products',
    fields: [
      { name: 'id', type: 'uuid', primaryKey: true },
      { name: 'name', type: 'string', required: true },
      { name: 'description', type: 'text' },
      { name: 'category_id', type: 'uuid' },
      { name: 'brand_id', type: 'uuid' },
      { name: 'base_price', type: 'decimal', required: true },
      { name: 'sale_price', type: 'decimal' },
      { name: 'sku', type: 'string', unique: true },
      { name: 'tags', type: 'jsonb' },
      { name: 'attributes', type: 'jsonb' },
      { name: 'images', type: 'jsonb' },
      { name: 'is_active', type: 'boolean', default: true },
      { name: 'created_at', type: 'timestamp', default: 'now()' }
    ],
    indexes: [
      { fields: ['category_id'] },
      { fields: ['brand_id'] },
      { fields: ['tags'], method: 'gin' },
      { fields: ['attributes'], method: 'gin' }
    ]
  });

  // Shopping cart with session support
  await client.schema.createTable({
    name: 'carts',
    fields: [
      { name: 'id', type: 'uuid', primaryKey: true },
      { name: 'user_id', type: 'uuid' },
      { name: 'session_id', type: 'string' },
      { name: 'items', type: 'jsonb', default: '[]' },
      { name: 'expires_at', type: 'timestamp' },
      { name: 'created_at', type: 'timestamp', default: 'now()' },
      { name: 'updated_at', type: 'timestamp', default: 'now()' }
    ],
    indexes: [
      { fields: ['user_id'] },
      { fields: ['session_id'] },
      { fields: ['expires_at'] }
    ]
  });
};

// Advanced product search
const searchProducts = async (query: string, filters: any = {}) => {
  let search = client.table('products')
    .select('*, brand:brands(name), category:categories(name)')
    .eq('is_active', true);

  // Full-text search
  if (query) {
    search = search.textSearch('name || description', query);
  }

  // Price range
  if (filters.minPrice || filters.maxPrice) {
    search = search
      .gte('base_price', filters.minPrice || 0)
      .lte('base_price', filters.maxPrice || 999999);
  }

  // Category filter
  if (filters.category) {
    search = search.eq('category_id', filters.category);
  }

  // Attribute filters (e.g., color, size)
  if (filters.attributes) {
    for (const [key, value] of Object.entries(filters.attributes)) {
      search = search.jsonContains('attributes', { [key]: value });
    }
  }

  // Sorting
  const sortMap = {
    'price-asc': ['base_price', 'asc'],
    'price-desc': ['base_price', 'desc'],
    'newest': ['created_at', 'desc'],
    'popular': ['sales_count', 'desc']
  };

  const [sortField, sortOrder] = sortMap[filters.sort] || ['created_at', 'desc'];
  search = search.orderBy(sortField, sortOrder);

  return search.limit(filters.limit || 20).execute();
};

// Cart management with automatic cleanup
const cartManager = {
  async getCart(userId?: string, sessionId?: string) {
    const query = userId 
      ? { user_id: userId }
      : { session_id: sessionId };

    let cart = await client.table('carts')
      .select('*')
      .match(query)
      .single();

    if (!cart) {
      cart = await client.table('carts').insert({
        ...query,
        items: [],
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });
    }

    return cart;
  },

  async addItem(cartId: string, productId: string, quantity: number) {
    const cart = await client.table('carts')
      .select('items')
      .eq('id', cartId)
      .single();

    const items = cart.items;
    const existingIndex = items.findIndex(item => item.product_id === productId);

    if (existingIndex > -1) {
      items[existingIndex].quantity += quantity;
    } else {
      const product = await client.table('products')
        .select('id, name, base_price, sale_price, images')
        .eq('id', productId)
        .single();

      items.push({
        product_id: productId,
        quantity,
        price: product.sale_price || product.base_price,
        product
      });
    }

    await client.table('carts')
      .eq('id', cartId)
      .update({ 
        items,
        updated_at: new Date()
      });

    return items;
  },

  async checkout(cartId: string, paymentMethod: any) {
    const cart = await client.table('carts')
      .select('*')
      .eq('id', cartId)
      .single();

    // Calculate total
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Create order
    const order = await client.transaction(async (tx) => {
      // Create order
      const order = await tx.table('orders').insert({
        user_id: cart.user_id,
        items: cart.items,
        total,
        status: 'pending',
        payment_method: paymentMethod
      });

      // Update inventory
      for (const item of cart.items) {
        await tx.raw(`
          UPDATE products 
          SET stock = stock - ?
          WHERE id = ?
          AND stock >= ?
        `, [item.quantity, item.product_id, item.quantity]);
      }

      // Clear cart
      await tx.table('carts')
        .eq('id', cartId)
        .update({ items: [] });

      return order;
    });

    // Process payment asynchronously
    await client.workflow.executeWorkflow('order-processing', {
      orderId: order.id
    });

    return order;
  }
};

// Abandoned cart recovery
const abandonedCartWorkflow = await client.workflow.createWorkflow({
  name: 'abandoned-cart-recovery',
  triggers: [{
    type: 'schedule',
    config: { cron: '0 */6 * * *' } // Every 6 hours
  }],
  definition: {
    steps: [
      {
        id: 'find-abandoned',
        type: 'database',
        config: {
          operation: 'query',
          sql: `
            SELECT c.*, u.email, u.name
            FROM carts c
            JOIN users u ON c.user_id = u.id
            WHERE c.items != '[]'::jsonb
            AND c.updated_at < NOW() - INTERVAL '24 hours'
            AND c.updated_at > NOW() - INTERVAL '7 days'
            AND NOT EXISTS (
              SELECT 1 FROM cart_reminders cr
              WHERE cr.cart_id = c.id
              AND cr.sent_at > NOW() - INTERVAL '24 hours'
            )
          `
        }
      },
      {
        id: 'send-reminders',
        type: 'forEach',
        config: {
          items: '{{steps.find-abandoned.result}}',
          do: {
            type: 'parallel',
            tasks: [
              {
                type: 'email',
                config: {
                  template: 'abandoned-cart',
                  to: '{{item.email}}',
                  data: {
                    name: '{{item.name}}',
                    items: '{{item.items}}',
                    cart_url: '{{env.APP_URL}}/cart?recover={{item.id}}'
                  }
                }
              },
              {
                type: 'database',
                config: {
                  operation: 'insert',
                  table: 'cart_reminders',
                  data: {
                    cart_id: '{{item.id}}',
                    user_id: '{{item.user_id}}',
                    sent_at: '{{now()}}'
                  }
                }
              }
            ]
          }
        }
      }
    ]
  }
});
```

### Real-time Chat

```typescript
// Chat application with presence
const chatApp = {
  async createRoom(name: string, members: string[]) {
    const room = await client.table('chat_rooms').insert({
      name,
      members,
      created_at: new Date()
    });

    // Create channel for real-time messaging
    const channel = client.realtime.channel(`room-${room.id}`);
    
    return { room, channel };
  },

  async sendMessage(roomId: string, userId: string, text: string) {
    // Save to database
    const message = await client.table('messages').insert({
      room_id: roomId,
      user_id: userId,
      text,
      created_at: new Date()
    });

    // Broadcast to channel
    await client.realtime.channel(`room-${roomId}`).send({
      type: 'message',
      data: message
    });

    // Send push notifications to offline users
    const room = await client.table('chat_rooms')
      .select('members')
      .eq('id', roomId)
      .single();

    const onlineUsers = await client.realtime
      .channel(`room-${roomId}`)
      .getPresence();

    const offlineUsers = room.members.filter(
      member => !onlineUsers.find(u => u.userId === member)
    );

    if (offlineUsers.length > 0) {
      await client.push.sendToUsers(offlineUsers, {
        title: 'New Message',
        body: text.substring(0, 100),
        data: {
          type: 'chat',
          roomId,
          messageId: message.id
        }
      });
    }

    return message;
  },

  setupRealtimeHandlers(roomId: string) {
    const channel = client.realtime.channel(`room-${roomId}`);

    // Message handling
    channel.on('message', (msg) => {
      console.log('New message:', msg);
      // Update UI
    });

    // Typing indicators
    channel.on('typing', ({ userId, isTyping }) => {
      console.log(`${userId} is ${isTyping ? 'typing' : 'stopped typing'}`);
      // Update UI
    });

    // Presence tracking
    channel.on('presence', { event: 'join' }, ({ userId, user }) => {
      console.log(`${user.name} joined the chat`);
      // Update online users list
    });

    channel.on('presence', { event: 'leave' }, ({ userId, user }) => {
      console.log(`${user.name} left the chat`);
      // Update online users list
    });

    // Join with presence
    channel.subscribe({
      userId: 'current-user-id',
      user: { name: 'John Doe', avatar: 'avatar.jpg' }
    });

    return channel;
  },

  // Send typing indicator
  async sendTypingIndicator(roomId: string, userId: string, isTyping: boolean) {
    await client.realtime.channel(`room-${roomId}`).send({
      type: 'typing',
      userId,
      isTyping
    });
  }
};
```

### SaaS Multi-tenant App

```typescript
// Multi-tenant architecture with row-level security
const multiTenantSetup = {
  async createTenant(tenantData: any) {
    // Create tenant
    const tenant = await client.table('tenants').insert({
      name: tenantData.name,
      slug: tenantData.slug,
      plan: 'trial',
      settings: {
        features: ['basic'],
        limits: {
          users: 5,
          storage: 1024 * 1024 * 1024, // 1GB
          api_calls: 10000
        }
      }
    });

    // Create admin user
    const admin = await client.auth.signUp({
      email: tenantData.adminEmail,
      password: tenantData.adminPassword,
      metadata: {
        tenant_id: tenant.id,
        role: 'admin'
      }
    });

    // Setup tenant-specific resources
    await client.workflow.executeWorkflow('tenant-onboarding', {
      tenantId: tenant.id,
      adminId: admin.user.id
    });

    return { tenant, admin };
  },

  // Middleware to enforce tenant isolation
  async withTenant(tenantId: string, operation: Function) {
    // Set tenant context for row-level security
    await client.raw('SET app.current_tenant_id = ?', [tenantId]);
    
    try {
      return await operation();
    } finally {
      await client.raw('RESET app.current_tenant_id');
    }
  },

  // Tenant-aware queries
  async getTenantData(tenantId: string) {
    return this.withTenant(tenantId, async () => {
      const [users, projects, usage] = await Promise.all([
        client.table('users').count(),
        client.table('projects').count(),
        client.table('api_usage')
          .select('sum(calls) as total_calls')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          .single()
      ]);

      return { users, projects, usage };
    });
  },

  // Usage tracking and billing
  async trackUsage(tenantId: string, resource: string, amount: number) {
    await client.table('usage_events').insert({
      tenant_id: tenantId,
      resource,
      amount,
      timestamp: new Date()
    });

    // Check limits
    const tenant = await client.table('tenants')
      .select('settings')
      .eq('id', tenantId)
      .single();

    const usage = await client.table('usage_events')
      .select('sum(amount) as total')
      .eq('tenant_id', tenantId)
      .eq('resource', resource)
      .gte('timestamp', new Date(new Date().setDate(1))) // Start of month
      .single();

    if (usage.total > tenant.settings.limits[resource]) {
      // Trigger limit exceeded workflow
      await client.workflow.executeWorkflow('limit-exceeded', {
        tenantId,
        resource,
        usage: usage.total,
        limit: tenant.settings.limits[resource]
      });
    }
  },

  // Tenant data export
  async exportTenantData(tenantId: string) {
    const tables = ['users', 'projects', 'documents', 'settings'];
    const exportData = {};

    for (const table of tables) {
      exportData[table] = await this.withTenant(tenantId, async () => {
        return client.table(table).select('*').execute();
      });
    }

    // Create export file
    const exportJson = JSON.stringify(exportData, null, 2);
    const file = await client.storage.upload(
      `exports/tenant-${tenantId}-${Date.now()}.json`,
      Buffer.from(exportJson),
      {
        contentType: 'application/json',
        metadata: { tenantId, exportDate: new Date() }
      }
    );

    // Generate signed URL valid for 24 hours
    return client.storage.getSignedUrl(file.path, { expiresIn: 86400 });
  }
};
```

## Best Practices

### Error Handling

```typescript
// Comprehensive error handling
class AppAtOnceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AppAtOnceError';
  }
}

// Retry logic for operations
async function withRetry<T>(
  operation: () => Promise<T>,
  options = { attempts: 3, delay: 1000 }
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < options.attempts; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors
      if (error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }
      
      // Exponential backoff
      if (i < options.attempts - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, options.delay * Math.pow(2, i))
        );
      }
    }
  }
  
  throw lastError;
}

// Usage
const result = await withRetry(
  () => client.table('users').insert(userData),
  { attempts: 5, delay: 500 }
);
```

### Performance Optimization

```typescript
// Connection pooling
const client = new AppAtOnceClient({
  apiKey: 'your-api-key',
  poolSize: 10,
  idleTimeout: 30000
});

// Batch operations
const batchInsert = async (records: any[]) => {
  const chunks = [];
  const chunkSize = 1000;
  
  for (let i = 0; i < records.length; i += chunkSize) {
    chunks.push(records.slice(i, i + chunkSize));
  }
  
  const results = await Promise.all(
    chunks.map(chunk => client.table('records').insert(chunk))
  );
  
  return results.flat();
};

// Caching with TTL
const cache = new Map();

async function getCachedData(key: string, fetcher: Function, ttl = 60000) {
  const cached = cache.get(key);
  
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  
  const data = await fetcher();
  cache.set(key, {
    data,
    expires: Date.now() + ttl
  });
  
  return data;
}

// Usage
const products = await getCachedData(
  'products-featured',
  () => client.table('products').eq('featured', true).execute(),
  300000 // 5 minutes
);
```

### Testing

```typescript
// Mock client for testing
import { createMockClient } from '@appatonce/node-sdk/testing';

describe('Product Service', () => {
  let client;
  
  beforeEach(() => {
    client = createMockClient({
      tables: {
        products: [
          { id: '1', name: 'Test Product', price: 99.99 }
        ]
      }
    });
  });
  
  test('should get product by id', async () => {
    const product = await client.table('products')
      .eq('id', '1')
      .single();
    
    expect(product.name).toBe('Test Product');
  });
  
  test('should handle errors', async () => {
    client.setError('products', new Error('Database error'));
    
    await expect(
      client.table('products').select('*').execute()
    ).rejects.toThrow('Database error');
  });
});
```

## Troubleshooting

### Common Issues

```typescript
// Connection issues
client.onConnectionChange((connected) => {
  if (!connected) {
    console.log('Connection lost, attempting to reconnect...');
  }
});

// Debug mode
const client = new AppAtOnceClient({
  apiKey: 'your-api-key',
  debug: true,
  logger: {
    log: (message) => console.log(`[AppAtOnce] ${message}`),
    error: (error) => console.error(`[AppAtOnce Error]`, error)
  }
});

// Monitor rate limits
client.onRateLimit((limit) => {
  console.log(`Rate limit: ${limit.remaining}/${limit.limit}`);
  console.log(`Resets at: ${new Date(limit.reset)}`);
});

// Handle token expiration
client.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_EXPIRED') {
    // Refresh token or redirect to login
  }
});
```

## Resources

- [API Reference](https://docs.appatonce.com/api)
- [SDK Documentation](https://docs.appatonce.com/sdk/node)
- [Video Tutorials](https://youtube.com/appatonce)
- [Community Forum](https://community.appatonce.com)
- [GitHub Examples](https://github.com/appatonce/examples)