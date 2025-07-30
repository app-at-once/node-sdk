# AppAtOnce Node.js SDK

The official Node.js SDK for AppAtOnce - the revolutionary unified backend platform that combines database, workflows, storage, email, notifications, and AI processing into one code-first SDK.

## Installation

```bash
npm install @appatonce/node-sdk
```

## Quick Start

```javascript
const { AppAtOnceClient } = require('@appatonce/node-sdk');

// Initialize the client
const client = AppAtOnceClient.createWithApiKey(
  'your-api-key-here',
  'https://your-appatonce-server.com'
);

// Create a table
await client.schema.createTable({
  name: 'users',
  columns: [
    { name: 'id', type: 'uuid', primaryKey: true },
    { name: 'email', type: 'varchar', unique: true, required: true },
    { name: 'name', type: 'varchar' },
    { name: 'created_at', type: 'timestamp', defaultValue: 'now()' },
  ],
});

// Insert data
const user = await client.table('users').insert({
  email: 'john@example.com',
  name: 'John Doe',
});

// Query data with fluent API
const users = await client.table('users')
  .select('id', 'email', 'name')
  .where('email', 'like', '%@example.com')
  .orderBy('created_at', 'desc')
  .limit(10)
  .execute();

console.log('Users:', users.data);
```

## Features

### 🗄️ Database Operations
- **Code-first schema management** - Define tables, columns, indexes, and constraints in code
- **Fluent query builder** - Intuitive API for complex queries, joins, and aggregations
- **Real-time subscriptions** - Subscribe to database changes via WebSockets
- **Auto-triggers** - Automatic data processing (email validation, image processing, etc.)

### 🤖 AI Integration
- **Text generation** - Generate content, blog posts, captions, and more
- **Image generation** - Create images from text prompts
- **Audio generation** - Text-to-speech and voice cloning
- **Video generation** - Generate videos from prompts
- **Embeddings** - Generate vector embeddings for semantic search
- **Content analysis** - Sentiment analysis, SEO optimization, readability scoring

### 📧 Email & Communications
- **Template-based emails** - Rich email templates with variables
- **Bulk email campaigns** - Send emails to thousands of recipients
- **Contact management** - Organize contacts, lists, and segments
- **Email analytics** - Open rates, click tracking, bounce handling
- **Deliverability monitoring** - Domain reputation and blacklist checking

### 💾 Storage & File Management
- **Object storage** - Upload, download, and manage files
- **Image processing** - Resize, optimize, add watermarks
- **CDN integration** - Fast global content delivery
- **Backup and versioning** - Automatic backups and file versioning

### ⚡ Workflows & Automation
- **Visual workflow builder** - Create complex business logic workflows
- **Multi-trigger support** - Webhooks, schedules, database events
- **Parallel processing** - Execute multiple tasks simultaneously
- **Error handling** - Retry logic, rollbacks, and failure notifications
- **A/B testing** - Split test different workflow versions

### 🔐 Authentication & Security
- **JWT authentication** - Secure token-based authentication
- **API key management** - Create and manage API keys with permissions
- **Multi-factor authentication** - TOTP and backup codes
- **Organization management** - Multi-tenant architecture support
- **Project OAuth** - Multi-tenant OAuth for end-user authentication
- **Social login** - Google, Facebook, GitHub, Apple, and custom providers

### ⚡ Real-time Features (Socket.io Powered)
- **Production-ready Socket.io client** - Robust real-time connections
- **Auto-reconnection** - Exponential backoff with configurable retry limits
- **Database change subscriptions** - Live updates from database changes
- **Channel messaging** - Pub/sub messaging system
- **Presence tracking** - Collaborative features with user presence
- **Workflow event monitoring** - Real-time workflow execution updates
- **Live analytics** - Real-time metrics and system monitoring
- **Comprehensive error handling** - Graceful error recovery and reporting

## Core Modules

### Database Operations

```javascript
// Create tables with schema
await client.schema.createTable({
  name: 'products',
  columns: [
    { name: 'id', type: 'uuid', primaryKey: true },
    { name: 'name', type: 'varchar', required: true },
    { name: 'price', type: 'decimal', precision: 10, scale: 2 },
    { name: 'category_id', type: 'uuid', foreignKey: { table: 'categories', column: 'id' } },
    { name: 'tags', type: 'jsonb' },
    { name: 'created_at', type: 'timestamp', defaultValue: 'now()' },
  ],
  indexes: [
    { name: 'idx_products_category', columns: ['category_id'] },
    { name: 'idx_products_price', columns: ['price'] },
  ],
  triggers: [
    { name: 'auto_slug', type: 'auto_url', config: { source: 'name', target: 'slug' } },
  ],
});

// Fluent query builder
const expensiveProducts = await client.table('products')
  .select('id', 'name', 'price')
  .join('categories', 'products.category_id = categories.id')
  .where('price', '>', 100)
  .orderBy('price', 'desc')
  .limit(10)
  .execute();

// Complex aggregations
const categoryStats = await client.table('products')
  .select('categories.name as category', 'count(*) as product_count', 'avg(price) as avg_price')
  .join('categories', 'products.category_id = categories.id')
  .groupBy('categories.name')
  .having('count(*)', '>', 5)
  .execute();

// Full-text search
const searchResults = await client.table('products')
  .search('wireless bluetooth', {
    fields: ['name', 'description'],
    highlight: true,
    limit: 20,
  });
```

### AI Integration

```javascript
// Generate blog content
const blogPost = await client.ai.generateBlogPost(
  'The Future of Remote Work',
  {
    tone: 'professional',
    length: 'long',
    keywords: ['remote work', 'productivity', 'collaboration'],
    seo_optimized: true,
  }
);

// Analyze content sentiment
const analysis = await client.ai.analyzeContent(
  'This product is absolutely amazing!',
  'sentiment'
);

// Generate images
const image = await client.ai.generateImage(
  'A modern office space with natural lighting',
  {
    style: 'photographic',
    size: '1024x1024',
    quality: 'hd',
  }
);

// Create voice audio
const audio = await client.ai.generateAudio(
  'Welcome to our store!',
  {
    voice: 'nova',
    response_format: 'mp3',
  }
);

// Generate embeddings for semantic search
const embeddings = await client.ai.generateEmbeddings([
  'Product documentation',
  'User manual',
  'API reference',
]);
```

### Workflow Automation

```javascript
// Create a complex workflow
const workflow = await client.workflow.createWorkflow({
  name: 'order-processing',
  definition: {
    nodes: [
      {
        name: 'validate_order',
        type: 'validation',
        params: { schema: { total: 'required|numeric|min:0' } },
      },
      {
        name: 'process_payment',
        type: 'api',
        params: {
          url: 'https://api.stripe.com/v1/charges',
          method: 'POST',
          headers: { 'Authorization': 'Bearer {{env.STRIPE_KEY}}' },
        },
      },
      {
        name: 'send_notifications',
        type: 'parallel',
        params: {
          tasks: [
            {
              name: 'email_customer',
              type: 'email',
              params: { template: 'order_confirmation' },
            },
            {
              name: 'notify_warehouse',
              type: 'webhook',
              params: { url: 'https://warehouse.com/webhook' },
            },
          ],
        },
      },
    ],
  },
  triggers: [
    {
      type: 'database',
      config: { table: 'orders', event: 'INSERT' },
    },
  ],
});

// Execute workflow manually
const execution = await client.workflow.executeWorkflow(
  workflow.id,
  { order_id: 'order-123', total: 99.99 }
);
```

### Real-time Subscriptions (Socket.io)

```javascript
// Connect to real-time server with options
await client.realtime.connect({
  autoReconnect: true,
  maxReconnectAttempts: 10,
  reconnectDelay: 2000,
  timeout: 15000,
  debug: true, // Enable debug logging
});

// Subscribe to database changes with filtering
await client.realtime.subscribeToTable(
  'orders',
  (event) => {
    console.log(`Order ${event.type}:`, event.record);
    if (event.type === 'INSERT' && event.record.total > 1000) {
      console.log('High-value order alert!');
    }
  },
  { 
    events: ['INSERT', 'UPDATE'],
    filter: { status: ['pending', 'processing'] },
    realtime: true
  }
);

// Channel messaging with pub/sub
await client.realtime.subscribeToChannel(
  'notifications',
  (message) => {
    console.log('Notification:', message);
  }
);

await client.realtime.publishToChannel('notifications', {
  type: 'alert',
  message: 'System maintenance in 5 minutes',
  timestamp: new Date().toISOString(),
});

// Presence tracking for collaboration
await client.realtime.joinPresence(
  'document-123',
  { 
    id: 'user-456', 
    name: 'John Doe',
    metadata: { cursor: { x: 100, y: 200 } }
  },
  (presence) => {
    console.log('Users joined:', presence.joined);
    console.log('Users left:', presence.left);
    console.log('Users updated:', presence.updated);
  }
);

// Update your presence
await client.realtime.updatePresence('document-123', {
  metadata: { cursor: { x: 200, y: 300 }, tool: 'pen' }
});

// Workflow event monitoring
await client.realtime.subscribeToWorkflow(
  'user-onboarding',
  (event) => {
    console.log(`Workflow ${event.type}:`, event.execution_id);
  }
);

// Real-time analytics
await client.realtime.subscribeToAnalytics(
  'system',
  'global',
  (metrics) => {
    console.log('System metrics:', metrics.metrics);
  },
  { interval: 30, metrics: ['cpu', 'memory', 'requests'] }
);

// Connection state monitoring
client.realtime.onConnectionStateChange((connected) => {
  console.log(connected ? 'Connected' : 'Disconnected');
});

// Error handling
client.realtime.onError((error) => {
  console.error('Realtime error:', error);
});
```

### Email & Communications

```javascript
// Create email template
const template = await client.email.createTemplate({
  name: 'welcome-email',
  subject: 'Welcome to {{company_name}}!',
  html: `
    <h1>Welcome {{user_name}}!</h1>
    <p>Thanks for joining {{company_name}}.</p>
    <a href="{{activation_link}}">Activate your account</a>
  `,
  variables: [
    { name: 'company_name', type: 'string', required: true },
    { name: 'user_name', type: 'string', required: true },
    { name: 'activation_link', type: 'string', required: true },
  ],
});

// Send templated email
await client.email.sendTemplateEmail(template.id, {
  to: [{ email: 'user@example.com', name: 'John Doe' }],
  variables: {
    company_name: 'My Company',
    user_name: 'John',
    activation_link: 'https://myapp.com/activate/123',
  },
});

// Send bulk campaign
const campaign = await client.email.createCampaign({
  name: 'Product Launch',
  subject: 'Introducing Our New Product!',
  templateId: template.id,
  lists: ['customers', 'prospects'],
  sendAt: new Date(Date.now() + 60 * 60 * 1000), // Send in 1 hour
});
```

### File Storage

```javascript
// Upload file
const file = await client.storage.uploadFile(
  'user-uploads',
  fileBuffer,
  'profile-picture.jpg',
  {
    contentType: 'image/jpeg',
    metadata: { userId: 'user-123' },
    acl: 'public-read',
  }
);

// Get signed URL
const signedUrl = await client.storage.getFileUrl(
  'user-uploads',
  'profile-picture.jpg',
  { expiresIn: 3600 } // 1 hour
);

// Image processing
const resized = await client.storage.resizeImage(
  'user-uploads',
  'profile-picture.jpg',
  200,
  200,
  {
    quality: 80,
    format: 'webp',
    fit: 'cover',
  }
);

// List files
const files = await client.storage.listFiles('user-uploads', {
  prefix: 'user-123/',
  limit: 100,
});
```

## Authentication

```javascript
// Create client with API key
const client = AppAtOnceClient.createWithApiKey('your-api-key');

// Or authenticate with email/password
const client = await AppAtOnceClient.createWithCredentials(
  'user@example.com',
  'password'
);

// Sign up new user
const session = await client.auth.signUp({
  email: 'newuser@example.com',
  password: 'securepassword',
  name: 'New User',
});

// Sign in existing user
const session = await client.auth.signIn({
  email: 'user@example.com',
  password: 'password',
});

// Get current user
const user = await client.auth.getCurrentUser();

// Manage API keys
const apiKey = await client.auth.createApiKey('My App', [
  'read:users',
  'write:products',
]);
```

## Project OAuth (Multi-Tenant Authentication)

Enable OAuth authentication for your project's end-users. This allows your application users to sign in with their social accounts.

### Configure OAuth Providers

```javascript
// Configure Google OAuth for your project
await client.projectOAuth.configureProjectOAuthProvider(
  'your-project-id',
  'google',
  {
    provider: 'google',
    clientId: 'your-google-client-id',
    clientSecret: 'your-google-client-secret',
    redirectUri: 'https://yourapp.com/auth/google/callback',
    scope: ['email', 'profile']
  }
);

// Test the configuration
const testResult = await client.projectOAuth.testProjectOAuthProvider(
  'your-project-id',
  'google'
);
```

### Implement End-User Login

```javascript
// Initiate OAuth flow for your users
const { url, state } = await client.projectOAuth.initiateProjectOAuth(
  'your-project-id',
  'google'
);

// Redirect user to OAuth provider
window.location.href = url;

// Handle callback
const session = await client.projectOAuth.handleProjectOAuthCallback(
  'your-project-id',
  'google',
  { code, state }
);
```

See [Project OAuth Documentation](docs/PROJECT-OAUTH.md) for complete implementation guide.

## Advanced Features

### Transactions

```javascript
await client.transaction(async (tx) => {
  const user = await tx.table('users').insert({
    email: 'user@example.com',
    name: 'John Doe',
  });

  await tx.table('user_profiles').insert({
    user_id: user.id,
    bio: 'Software developer',
  });

  // If any operation fails, all changes are rolled back
});
```

### Batch Operations

```javascript
const results = await client.batch([
  {
    type: 'insert',
    table: 'users',
    data: { email: 'user1@example.com', name: 'User 1' },
  },
  {
    type: 'insert',
    table: 'users',
    data: { email: 'user2@example.com', name: 'User 2' },
  },
  {
    type: 'select',
    table: 'users',
    where: { active: true },
  },
]);
```

### Schema Migrations

```javascript
// Create migration
const migration = await client.schema.createMigration({
  name: 'add_user_preferences',
  up_script: `
    ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';
    CREATE INDEX idx_users_preferences ON users USING GIN (preferences);
  `,
  down_script: `
    DROP INDEX idx_users_preferences;
    ALTER TABLE users DROP COLUMN preferences;
  `,
});

// Run migration
await client.schema.runMigration(migration.id);
```

## Environment Variables

```bash
# Required
APPATONCE_API_KEY=your-api-key-here
APPATONCE_BASE_URL=https://your-server.com

# Optional
APPATONCE_TIMEOUT=10000
APPATONCE_DEBUG=true
```

## Error Handling

```javascript
try {
  const user = await client.table('users').insert({
    email: 'invalid-email',
  });
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    console.log('Validation failed:', error.details);
  } else if (error.code === 'DUPLICATE_KEY') {
    console.log('Email already exists');
  } else {
    console.log('Unexpected error:', error.message);
  }
}
```

## TypeScript Support

The SDK is written in TypeScript and provides full type safety:

```typescript
import { AppAtOnceClient } from '@appatonce/node-sdk';

interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

const client = AppAtOnceClient.createWithApiKey('your-api-key');

// Type-safe queries
const users = await client.table<User>('users')
  .select('id', 'email', 'name')
  .where('active', true)
  .execute();

// users.data is typed as User[]
```

## Examples

For more comprehensive examples and tutorials, visit https://appatonce.com/docs

Check out the `/examples` directory for complete working examples:

- [Basic Usage](./examples/basic-usage.js) - CRUD operations and queries
- [AI Integration](./examples/ai-integration.js) - Text generation, image creation, analysis
- [Workflow Automation](./examples/workflow-example.js) - Complex business logic workflows
- [Real-time Features](./examples/realtime-example.js) - Basic WebSocket subscriptions
- [Socket.io Realtime](./examples/realtime-socketio-example.js) - Production-ready Socket.io implementation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Documentation

For the latest and most comprehensive documentation, visit:
👉 **https://appatonce.com/docs**

This includes:
- Complete API reference
- Advanced tutorials
- Best practices
- Migration guides
- Video tutorials

## Support

- 📧 Email: support@appatonce.com
- 💬 Discord: https://discord.gg/appatonce
- 📖 Documentation: https://appatonce.com/docs
- 🐛 Issues: https://github.com/appatonce/node-sdk/issues

## Feature Status

### ✅ Implemented Features

- [x] **Core Database Operations**
  - [x] Full CRUD operations with type-safe query builder
  - [x] Complex queries with joins, aggregations, and window functions
  - [x] Transaction support with savepoints
  - [x] Batch operations for bulk inserts/updates
  - [x] Raw SQL execution
  - [x] Connection pooling

- [x] **Authentication & Authorization**
  - [x] Email/password authentication
  - [x] Social authentication (OAuth providers)
  - [x] Multi-factor authentication (MFA)
  - [x] API key management
  - [x] Session management
  - [x] Password reset flow
  - [x] Email verification
  - [x] Organization/team management

- [x] **Real-time Features**
  - [x] WebSocket connections with auto-reconnect
  - [x] Database change subscriptions
  - [x] Channel-based pub/sub messaging
  - [x] Presence tracking for collaborative features
  - [x] Workflow event monitoring
  - [x] Real-time analytics

- [x] **File Storage**
  - [x] Object storage
  - [x] Image processing (resize, format conversion)
  - [x] Signed URLs for secure access
  - [x] Direct client uploads
  - [x] File metadata management
  - [x] Batch operations

- [x] **Email Services**
  - [x] Template-based emails with variables
  - [x] Bulk email campaigns
  - [x] Contact list management
  - [x] Email analytics (open/click tracking)
  - [x] Unsubscribe management
  - [x] Domain reputation monitoring

- [x] **AI Integration**
  - [x] Text generation (GPT-4, Claude)
  - [x] Embeddings generation
  - [x] Image generation (DALL-E)
  - [x] Audio generation (TTS)
  - [x] Audio transcription
  - [x] Content moderation
  - [x] Sentiment analysis

- [x] **Push Notifications**
  - [x] Multi-platform support (iOS, Android, Web)
  - [x] Device registration and management
  - [x] Topic-based messaging
  - [x] Campaign management
  - [x] Push templates
  - [x] Analytics and metrics

- [x] **Workflow Automation**
  - [x] Workflow creation and management
  - [x] Multiple trigger types (database, webhook, schedule)
  - [x] Conditional logic and branching
  - [x] Parallel task execution
  - [x] Error handling and retries
  - [x] Workflow templates
  - [x] Version control
  - [x] Execution monitoring

- [x] **Schema Management**
  - [x] Code-first table definitions
  - [x] Index management
  - [x] Constraints and validations
  - [x] Migration system

### 🚧 In Progress / Partially Implemented

- [ ] **Logic Server** (Partial - Module exists but not fully functional)
  - [x] Logic definition structure
  - [x] Basic execution methods
  - [ ] Server-side execution engine
  - [ ] Version control and rollback
  - [ ] A/B testing functionality
  - [ ] Real-time monitoring

- [ ] **Analytics** (Planned)
  - [ ] Event tracking
  - [ ] Custom metrics
  - [ ] Real-time dashboards
  - [ ] Data aggregation pipelines

- [ ] **Search** (Planned)
  - [ ] Full-text search
  - [ ] Vector/semantic search
  - [ ] Search analytics
  - [ ] Custom analyzers

### 📋 Planned Features

- [ ] **Smart Triggers**
  - [ ] Auto-detect field patterns (e.g., *_image → auto process)
  - [ ] Automatic embeddings for *_content fields
  - [ ] Smart notifications based on data changes
  - [ ] Custom trigger rules

- [ ] **Advanced Workflows**
  - [ ] Visual workflow designer integration
  - [ ] Complex orchestration with n8n
  - [ ] Workflow marketplace
  - [ ] Custom workflow steps

- [ ] **Data Pipeline**
  - [ ] ETL/ELT operations
  - [ ] Data transformation
  - [ ] Scheduled data sync
  - [ ] External data sources

- [ ] **GraphQL Support**
  - [ ] Auto-generated GraphQL API
  - [ ] Subscriptions
  - [ ] Custom resolvers
  - [ ] Schema stitching

- [ ] **Edge Functions**
  - [ ] Deploy functions to edge locations
  - [ ] Custom runtime support
  - [ ] Auto-scaling
  - [ ] Cold start optimization

- [ ] **Monitoring & Observability**
  - [ ] Performance metrics
  - [ ] Error tracking
  - [ ] Custom alerts
  - [ ] Log aggregation

- [ ] **Compliance Tools**
  - [ ] GDPR compliance helpers
  - [ ] Data retention policies
  - [ ] Audit logging
  - [ ] PII detection and masking

- [ ] **Advanced Security**
  - [ ] Row-level security policies
  - [ ] Field-level encryption
  - [ ] Anomaly detection
  - [ ] Rate limiting per operation

- [ ] **Developer Tools**
  - [ ] CLI for code generation
  - [ ] Local development server
  - [ ] Migration tools
  - [ ] Testing utilities

- [ ] **Platform SDKs**
  - [ ] Flutter SDK (Planned)
  - [ ] Swift SDK (Planned)
  - [ ] Python SDK (Planned)
  - [ ] Ruby SDK (Planned)

## Examples

For comprehensive examples and use cases, check out our [Examples Guide](./EXAMPLES.md) which includes:

- Building a blog platform with comments
- E-commerce system with inventory tracking
- Real-time chat application
- Image gallery with AI tagging
- Multi-tenant SaaS application
- IoT data processing
- Workflow automation patterns
- And many more...

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.