# AppAtOnce Node SDK

> [!CAUTION]
> ## 🚨 **PREVIEW MODE** 🚨
> **This is a development preview. Data may be reset. Not for production use.**
> 
> ---

**🔗 <a href="https://appatonce.com" target="_blank">https://appatonce.com</a>**

The official Node.js SDK for AppAtOnce - the unified backend platform that combines database, real-time features, AI processing, storage, email, and workflows into one powerful, code-first SDK.

## 🌟 Why AppAtOnce?

**One SDK. Infinite Possibilities.**

- **🚀 Code-First Database** - Define schemas, query with intuitive syntax, real-time subscriptions
- **🤖 Built-in AI** - Text generation, image creation, embeddings, content analysis
- **⚡ Real-Time Everything** - Database changes, pub/sub channels, presence tracking
- **📦 Smart Storage** - File uploads, image processing, CDN integration
- **📧 Email & Push** - Templates, campaigns, multi-platform notifications
- **🔧 Workflow Engine** - Visual workflows, triggers, automation

## Think More. Build Faster.

Instead of integrating 10+ services (database, cache, file storage, AI APIs, email service, real-time server), use one SDK:

```javascript
// Traditional approach - multiple services, complex setup
const db = new DatabaseClient();
const cache = new CacheClient();
const storage = new StorageClient();
const ai = new AIClient();
const email = new EmailClient();
const realtime = new RealtimeClient();
// ... and more configuration

// AppAtOnce approach - one client, everything included
const client = AppAtOnceClient.createWithApiKey('your-api-key');
// Database, AI, storage, email, real-time - all ready to use
```

## Installation

```bash
npm install @appatonce/node-sdk
```

## Quick Start

### Get Your API Key

🔑 **Your APPATONCE_API_KEY is automatically generated when you create a project in AppAtOnce**

**Two ways to get your API key:**

1. **Quick Setup** (Recommended for developers):
   - Visit <a href="https://appatonce.com/login" target="_blank">https://appatonce.com/login</a>
   - Sign up or log in to your account
   - Create a new project manually
   - Copy your API key from the project dashboard

2. **No-Code App Creation** (Build complete apps instantly):
   - Visit <a href="https://appatonce.com" target="_blank">https://appatonce.com</a>
   - Describe your app idea in natural language
   - AppAtOnce generates a complete application
   - Your API key is provided with the generated project for further customization

💡 **Both methods give you the same powerful API key** - choose the approach that fits your workflow!

```javascript
const { AppAtOnceClient } = require('@appatonce/node-sdk');

// Initialize the client
const client = AppAtOnceClient.createWithApiKey('your-api-key-here');

// Create a table with intelligent defaults
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

// Query with the new intuitive WHERE syntax
const users = await client.table('users')
  .select('id', 'email', 'name')
  .where('email', 'like', '%@example.com')
  .orderBy('created_at', 'desc')
  .limit(10)
  .execute();

console.log('Found:', users.data.length, 'users');
```

## Feature Status

### ✅ Fully Implemented

#### 🗄️ Database Operations
- **New Intuitive WHERE Syntax** - Multiple ways to write conditions
- **Fluent Query Builder** - Chaining, joins, aggregations, pagination
- **Schema Management** - Create/modify tables, indexes, constraints
- **Transactions & Batch Operations** - ACID compliance
- **Search Integration** - Text search with filtering support

#### ⚡ Real-time Features
- **Database Subscriptions** - Live updates on INSERT/UPDATE/DELETE
- **Channel Messaging** - Pub/sub for custom events
- **Presence Tracking** - Collaborative features with user status
- **Auto-reconnection** - Robust connection management
- **Workflow & Analytics Events** - Real-time monitoring

#### 🤖 AI Integration
- **Text Generation** - Multiple AI models and providers supported
- **Image Generation** - AI-powered image creation with various models
- **Audio Generation** - Text-to-speech, voice cloning
- **Video Generation** - AI video creation (async)
- **Embeddings** - Vector embeddings for semantic search
- **Content Analysis** - Sentiment, SEO, readability scoring

#### 📦 Storage & File Management
- **Simple Upload API** - Intuitive `upload()` method
- **File Management** - List, delete, copy, move operations
- **Image Processing** - Resize, optimize, watermarks
- **Public URLs** - Direct file access
- **Bucket Management** - Create, configure, manage buckets

#### 📧 Email & Communications
- **Template System** - Rich templates with variables
- **Campaign Management** - Bulk email sending
- **Contact Lists** - Organize and segment contacts
- **Analytics** - Open rates, click tracking

#### 🔐 Authentication & Security
- **Multi-tenant Auth** - Project-specific user databases
- **OAuth Integration** - Social login providers
- **API Key Management** - Granular permissions
- **Session Management** - Secure token handling

#### 🔧 Workflow Engine
- **Visual Workflows** - Drag-and-drop workflow builder
- **Database Triggers** - Auto-processing on data changes
- **Multi-step Logic** - Complex business rules
- **Event Monitoring** - Real-time execution tracking

#### 🔍 Additional Features
- **Push Notifications** - Multi-platform support
- **Document Processing** - PDF, OCR, format conversion
- **Image Processing** - Advanced manipulation
- **Payment Integration** - Multiple payment providers supported
- **AI Chatbot** - Embeddable chatbot widget with one-line integration

### 🔄 In Development

- **Logic Server** - Client-side logic execution (partial implementation)
- **Advanced Search** - Full semantic search with vector databases
- **Analytics Dashboard** - Real-time metrics and insights

### 📋 Planned Features

- **GraphQL API** - Auto-generated GraphQL endpoints
- **Edge Functions** - Serverless function deployment
- **Advanced Security** - Row-level security, field encryption
- **Compliance Tools** - GDPR helpers, audit logging

## Core Examples

### 🆕 New Intuitive Database Operations

```javascript
// Multiple WHERE syntax options - choose what feels natural

// 1. Simple equality (most common)
const user = await client.table('users')
  .where('id', userId)  // defaults to equals
  .first();

// 2. With operator
const recentPosts = await client.table('posts')
  .where('created_at', '>', '2024-01-01')
  .orderBy('created_at', 'desc')
  .execute();

// 3. Object syntax for multiple conditions
const activeUsers = await client.table('users')
  .where({ is_active: true, subscription_tier: 'pro' })
  .execute();

// 4. Chain conditions with .and()
const filteredData = await client.table('workspaces')
  .where('is_active', true)
  .and('max_members', '>=', 10)
  .execute();

// 5. Use .filter() alias (same as .where())
const results = await client.table('products')
  .filter('category', 'electronics')
  .execute();
```

**Real Output Example:**
```javascript
// From our test suite - this actually works:
✅ Found: 3 workspaces created after 2025-01-01
✅ Found: 5 active free workspaces
✅ Found: 2 active workspaces with 10+ max members
```

### Schema Management

```javascript
// Create table with intelligent defaults
const result = await client.schema.createTable({
  name: 'products',
  columns: [
    { name: 'id', type: 'uuid', primaryKey: true },
    { name: 'name', type: 'varchar', required: true },
    { name: 'price', type: 'decimal', precision: 10, scale: 2 },
    { name: 'description', type: 'text' },
    { name: 'created_at', type: 'timestamp', defaultValue: 'now()' },
  ],
  indexes: [
    { name: 'idx_products_name', columns: ['name'] },
    { name: 'idx_products_price', columns: ['price'] },
  ],
});

console.log('✅ Table created:', result.tableName);
```

### Search with Filters

```javascript
// Text search with database filters
const searchResults = await client.table('workspaces')
  .where('is_active', true)  // Database filter first
  .search('AI research', {   // Then search within results
    fields: ['name', 'description'],
    highlight: true,
    limit: 5
  });

console.log(`Found: ${searchResults.count} results`);
// Output: Found: 2 results
```

### 🤖 AI Features

```javascript
// Text generation with multiple models
const blogPost = await client.ai.generateBlogPost(
  'The Future of AI in Web Development',
  {
    tone: 'professional',
    length: 'medium',
    keywords: ['AI', 'web development', 'automation'],
    seo_optimized: true,
  }
);

console.log('Generated:', blogPost.title);
// Output: "How AI is Transforming Web Development in 2024"

// Content analysis
const sentiment = await client.ai.analyzeContent(
  'This AppAtOnce SDK is incredibly powerful and easy to use!',
  'sentiment'
);

console.log('Sentiment:', sentiment.sentiment.label, sentiment.sentiment.score);
// Output: Sentiment: positive 0.95

// Image generation
const images = await client.ai.generateImage(
  'A modern developer workspace with multiple monitors',
  {
    size: '1024x1024',
    quality: 'hd',
    n: 1
  }
);

console.log('Image URL:', images.images[0].url);

// Voice generation
const audio = await client.ai.generateAudio(
  'Welcome to AppAtOnce - the unified backend platform.',
  {
    voice: 'nova',
    response_format: 'mp3',
  }
);

console.log('Audio ready:', audio.audio_url);

// Embeddings for semantic search
const embeddings = await client.ai.generateEmbeddings([
  'Database operations and queries',
  'Real-time subscriptions and events',
  'AI-powered content generation',
]);

console.log('Generated embeddings for', embeddings.data.length, 'texts');
```

### 📦 Simple Storage API

```javascript
// Simple upload - just works!
const publicUrl = await client.storage.upload(
  'user-uploads',
  file,  // File object from input
  'avatars/profile.jpg'
);

console.log('Uploaded to:', publicUrl);
// Output: https://cdn.appatonce.com/user-uploads/avatars/profile.jpg

// Ultra-simple one-liner
const url = await client.storage.uploadAndGetUrl('photos', imageFile, 'gallery');

// File management
const files = await client.storage.listFiles('user-uploads', {
  prefix: 'avatars/',
  limit: 10
});

console.log('Found', files.files.length, 'avatar files');

// Image processing
const resized = await client.storage.resizeImage(
  'user-uploads',
  'original.jpg',
  300, 300,
  { quality: 85, format: 'webp' }
);
```

### 🔧 Workflow Automation

```javascript
// Create automated workflows
const workflow = await client.workflow.createWorkflow({
  name: 'user-onboarding',
  definition: {
    nodes: [
      {
        name: 'send_welcome_email',
        type: 'email',
        params: { template: 'welcome' },
      },
      {
        name: 'create_default_workspace',
        type: 'database',
        params: { 
          table: 'workspaces',
          action: 'insert',
          data: { name: '{{user.name}}\'s Workspace' }
        },
      },
    ],
  },
  triggers: [
    {
      type: 'database',
      config: { table: 'users', event: 'INSERT' },
    },
  ],
});

console.log('✅ Workflow created:', workflow.id);

// Monitor workflow execution in real-time
await client.realtime.subscribeToWorkflow(
  'user-onboarding',
  (event) => {
    console.log(`Workflow ${event.type}:`, event.execution_id);
  }
);
```

### ⚡ Real-time Features

```javascript
// Connect to real-time server
await client.realtime.connect({
  autoReconnect: true,
  maxReconnectAttempts: 5,
  debug: true
});

console.log('🟢 Connected to real-time server');

// Subscribe to database changes
const unsubscribe = await client.realtime.subscribeToTable(
  'workspaces',
  (event) => {
    console.log(`→ ${event.type}:`, event.record.name);
    
    switch (event.type) {
      case 'INSERT':
        console.log('  💡 New workspace created');
        break;
      case 'UPDATE':
        console.log('  📝 Workspace updated');
        break;
      case 'DELETE':
        console.log('  🗑️ Workspace deleted');
        break;
    }
  }
);

// Filtered subscriptions - only active workspaces
await client.realtime.subscribeToTable(
  'workspaces',
  (event) => {
    console.log('Active workspace event:', event.record.name);
  },
  {
    events: ['INSERT', 'UPDATE'],
    filter: { is_active: true }
  }
);

// Channel pub/sub messaging
await client.realtime.subscribeToChannel(
  'global-notifications',
  (message) => {
    if (message.type === 'announcement') {
      console.log('📣 Announcement:', message.data.title);
    }
  }
);

// Publish messages
await client.realtime.publishToChannel('global-notifications', {
  type: 'announcement',
  data: {
    title: 'System Update',
    message: 'New features available!',
    timestamp: new Date().toISOString()
  }
});

// Presence tracking for collaboration
const leavePresence = await client.realtime.joinPresence(
  'workspace-collaboration',
  {
    id: 'user-123',
    name: 'John Doe',
    metadata: { status: 'online', location: 'dashboard' }
  },
  (update) => {
    console.log('👋 Users joined:', update.joined.map(u => u.name));
    console.log('👋 Users left:', update.left.length);
  }
);

// Connection monitoring
client.realtime.onConnectionStateChange((connected) => {
  console.log(connected ? '🟢 Connected' : '🔴 Disconnected');
});
```

**Real Test Output:**
```javascript
// From our test suite:
✅ Connected to real-time server
→ INSERT: Real-time Test Workspace
  💡 New workspace created
→ UPDATE: Updated Real-time Test Workspace  
  📝 Workspace updated
→ DELETE: workspace deleted
  🗑️ Workspace deleted
📣 Announcement: Real-time Test
👋 Users joined: Test User
```

### 📧 Email & Communications

```javascript
// Create email template with variables
const template = await client.email.createTemplate({
  name: 'welcome-email',
  subject: 'Welcome to {{company_name}}!',
  html: `
    <h1>Welcome {{user_name}}!</h1>
    <p>Thanks for joining {{company_name}}.</p>
    <a href="{{activation_link}}">Get Started</a>
  `,
  variables: [
    { name: 'company_name', type: 'string', required: true },
    { name: 'user_name', type: 'string', required: true },
    { name: 'activation_link', type: 'string', required: true },
  ],
});

console.log('✅ Template created:', template.name);

// Send templated email
await client.email.sendTemplateEmail(template.id, {
  to: [{ email: 'user@example.com', name: 'John Doe' }],
  variables: {
    company_name: 'AppAtOnce',
    user_name: 'John',
    activation_link: 'https://app.appatonce.com/activate/abc123',
  },
});

// Bulk email campaign
const campaign = await client.email.createCampaign({
  name: 'Product Update Newsletter',
  subject: 'New AI Features Available!',
  templateId: template.id,
  lists: ['users', 'beta-testers'],
  sendAt: new Date(Date.now() + 3600000), // Send in 1 hour
});

console.log('📧 Campaign scheduled:', campaign.id);
```

### 🤖 Chatbot Integration

```javascript
// Simple one-line chatbot integration
const widget = await client.chatbot.render();

// With options
const widget = await client.chatbot.render({
  mode: 'iframe',              // or 'widget' for embedded component
  position: 'bottom-right',    // or 'bottom-left'
  startOpen: false,
  theme: {
    primaryColor: '#007bff',
    secondaryColor: '#6c757d'
  },
  onReady: () => console.log('Chatbot ready!'),
  onMessage: (message) => console.log('New message:', message)
});

// Control the widget
widget.show();
widget.hide();
widget.toggle();
widget.open();
widget.close();
await widget.sendMessage('Hello!');
widget.setUser({ name: 'John Doe', email: 'john@example.com' });

// React integration
import { AppAtOnceChatbot } from '@appatonce/node-sdk/react';

function App() {
  return (
    <>
      <h1>My App</h1>
      <AppAtOnceChatbot 
        client={client}
        options={{ position: 'bottom-right' }}
      />
    </>
  );
}
```

### 🔐 Authentication Examples

```javascript
// OAuth setup for your users
await client.projectOAuth.configureProjectOAuthProvider(
  'google',
  {
    clientId: 'your-google-client-id',
    clientSecret: 'your-google-client-secret',
    redirectUri: 'https://yourapp.com/auth/callback',
    scope: ['email', 'profile']
  }
);

// Initiate OAuth for end users
const { url, state } = await client.projectOAuth.initiateProjectOAuth(
  'google'
);

// Redirect user to: url
// Handle callback:
const session = await client.projectOAuth.handleProjectOAuthCallback(
  'google', 
  { code: 'auth-code', state }
);

console.log('User authenticated:', session.user.email);

// Regular authentication
const userSession = await client.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  name: 'John Doe'
});

const currentUser = await client.auth.getCurrentUser();
console.log('Current user:', currentUser.email);
```

## Quick Setup Guide

### 1. Get Your API Key

🔑 **Your APPATONCE_API_KEY is automatically generated when you create a project in AppAtOnce**

**Two ways to get your API key:**

1. **Quick Setup** (Recommended for developers):
   - Visit <a href="https://appatonce.com/login" target="_blank">https://appatonce.com/login</a>
   - Sign up or log in to your account
   - Create a new project manually
   - Copy your API key from the project dashboard

2. **No-Code App Creation** (Build complete apps instantly):
   - Visit <a href="https://appatonce.com" target="_blank">https://appatonce.com</a>
   - Describe your app idea in natural language
   - AppAtOnce generates a complete application
   - Your API key is provided with the generated project for further customization

### 2. Initialize Client

```javascript
const { AppAtOnceClient } = require('@appatonce/node-sdk');

// Simple initialization - this is all you need!
const client = AppAtOnceClient.createWithApiKey('your-api-key-here');
```

### 3. First Query

```javascript
// Count all records in a table
const count = await client.table('users').count();
console.log('Total users:', count);

// Get first 5 records
const users = await client.table('users')
  .select('id', 'email', 'name')
  .limit(5)
  .execute();

console.log('Users:', users.data);
```

## Environment Configuration

### Environment Variables

```bash
# Only this is required
APPATONCE_API_KEY=your-api-key-here
```

🔑 **How to get your API key:**
- **For Developers**: Visit <a href="https://appatonce.com/login" target="_blank">https://appatonce.com/login</a> → Create Project → Copy API Key
- **For No-Code Users**: Generate a complete app at <a href="https://appatonce.com" target="_blank">https://appatonce.com</a> and get your API key with the project

💡 **Your API key is automatically generated when you create any project in AppAtOnce** - whether through manual setup or no-code app generation.

### Error Handling

```javascript
try {
  const user = await client.table('users').insert({
    email: 'invalid-email', // This will fail validation
  });
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    console.log('❌ Validation failed:', error.details);
  } else if (error.code === 'DUPLICATE_KEY') {
    console.log('❌ Email already exists');
  } else {
    console.log('❌ Unexpected error:', error.message);
  }
}
```

**Real Error Output:**
```javascript
// From our test suite:
❌ Error caught: relation "non_existent_table" does not exist
❌ Error caught: column "invalid_column" does not exist
```

## Advanced Features

### Transactions

```javascript
// Atomic operations - all succeed or all fail
await client.transaction(async (tx) => {
  const user = await tx.table('users').insert({
    email: 'user@example.com',
    name: 'John Doe',
  });

  await tx.table('user_profiles').insert({
    user_id: user.id,
    bio: 'Software developer',
    preferences: { theme: 'dark', notifications: true }
  });

  // If any operation fails, all changes are rolled back
});

console.log('✅ Transaction completed successfully');
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
    where: { is_active: true },
  },
]);

console.log('Batch results:', results.length);
```

### Schema Migrations

```javascript
// Create and run database migrations
const migration = await client.schema.createMigration({
  name: 'add_user_preferences',
  description: 'Add preferences column to users table',
  up_script: `
    ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';
    CREATE INDEX idx_users_preferences ON users USING GIN (preferences);
  `,
  down_script: `
    DROP INDEX idx_users_preferences;
    ALTER TABLE users DROP COLUMN preferences;
  `,
});

// Run the migration
const result = await client.schema.runMigration(migration.id);
console.log('✅ Migration completed:', result.status);

// Check migration status
const status = await client.schema.getMigrationStatus();
console.log('Database version:', status.current_version);
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
  is_active: boolean;
}

const client = AppAtOnceClient.createWithApiKey('your-api-key');

// Type-safe queries
const users = await client.table<User>('users')
  .select('id', 'email', 'name')
  .where('is_active', true)
  .execute();

// users.data is typed as User[]
console.log('First user:', users.data[0].email);

// Type-safe inserts
const newUser = await client.table<User>('users').insert({
  email: 'user@example.com',
  name: 'New User',
  is_active: true
  // TypeScript will validate the structure
});
```

## Documentation Links

For detailed guides and API references, visit our documentation:

### 📚 Core Guides
- **<a href="https://appatonce.com/docs/database" target="_blank">Database Guide</a>** - Schema management, queries, real-time subscriptions
- **<a href="https://appatonce.com/docs/ai-ml" target="_blank">AI Integration</a>** - Text generation, image creation, embeddings
- **<a href="https://appatonce.com/docs/real-time" target="_blank">Real-time Guide</a>** - WebSocket connections, pub/sub, presence
- **<a href="https://appatonce.com/docs/storage" target="_blank">Storage Guide</a>** - File uploads, image processing, CDN
- **<a href="https://appatonce.com/docs/authentication" target="_blank">Authentication</a>** - User management, OAuth, API keys

### 🔧 Advanced Topics
- **<a href="https://appatonce.com/docs/workflows" target="_blank">Workflow Engine</a>** - Automation, triggers, visual workflow builder
- **<a href="https://appatonce.com/docs/communications" target="_blank">Email & Push</a>** - Templates, campaigns, notifications
- **<a href="https://appatonce.com/docs/schema" target="_blank">Schema Management</a>** - Migrations, indexes, analysis
- **<a href="https://appatonce.com/docs/search" target="_blank">Search & Analytics</a>** - Text search, semantic search, metrics

### 📖 Examples & Tutorials
- **<a href="https://appatonce.com/docs/tutorial" target="_blank">Getting Started Tutorial</a>** - Build your first app
- **<a href="https://appatonce.com/docs/examples" target="_blank">Example Projects</a>** - Complete applications
- **<a href="https://appatonce.com/docs/best-practices" target="_blank">Best Practices</a>** - Production recommendations

## Platform SDKs

- **Node.js SDK** - ✅ This repository
- **<a href="https://github.com/app-at-once/flutter-sdk" target="_blank">Flutter SDK</a>** - ✅ Available (cross-platform mobile & web)
- **Python SDK** - 📋 Planned
- **Swift SDK** - 📋 Planned
- **Ruby SDK** - 📋 Planned
- **PHP SDK** - 📋 Planned

## Examples & Resources

### 📂 [Examples Directory](./examples/)

The `examples/` folder contains comprehensive code samples demonstrating all SDK features:

#### Ready-to-Run Examples
- **[`comprehensive-test.js`](./examples/comprehensive-test.js)** - Complete test suite showcasing all database operations, new WHERE syntax, search, and error handling
- **[`search-test.js`](./examples/search-test.js)** - Text and semantic search functionality with full-text and vector search
- **[`realtime-test.js`](./examples/realtime-test.js)** - Real-time features: database subscriptions, pub/sub messaging, presence tracking
- **[`new-features-example.js`](./examples/new-features-example.js)** - Latest v2.0 features: payment processing, image/PDF processing, OCR, workflows
- **[`project-oauth-example.ts`](./examples/project-oauth-example.ts)** - OAuth integration with multiple providers (Google, GitHub, Facebook)
- **[`chatbot-example.js`](./examples/chatbot-example.js)** - AI chatbot integration with simple one-line setup

#### Quick Start
```bash
# Clone and install
git clone https://github.com/appatonce/node-sdk.git
cd node-sdk/examples

# Set your API key (get it from https://appatonce.com/login)
export APPATONCE_API_KEY=your_api_key_here

# Install dependencies
npm install

# Run any example
npm run test:comprehensive
# or
npm run test:all
```

#### For External Projects
```bash
# In your project
npm install @appatonce/node-sdk dotenv tsx

# Copy any example from examples/ directory and run it
node comprehensive-test.js
```

### 📚 Online Resources

For comprehensive guides and tutorials:

- **<a href="https://appatonce.com/docs" target="_blank">Complete Documentation</a>** - Detailed guides and API reference
- **<a href="https://appatonce.com/docs/tutorial" target="_blank">Tutorial Series</a>** - Step-by-step learning path
- **<a href="https://appatonce.com/docs/examples" target="_blank">Example Projects</a>** - Real-world applications

### Featured Project Examples
- **Blog Platform** - Full-stack blog with AI content generation
- **E-commerce System** - Product catalog with real-time inventory
- **Chat Application** - Real-time messaging with presence
- **Task Manager** - Collaborative workspace with workflows
- **Image Gallery** - AI-powered tagging and search

## Support & Community

### Get Help
- **📖 <a href="https://appatonce.com/docs" target="_blank">Documentation</a>** - Complete guides and API reference
- **💬 <a href="https://discord.gg/appatonce" target="_blank">Discord Community</a>** - Chat with other developers
- **📧 <a href="mailto:support@appatonce.com">Email Support</a>** - Direct technical support
- **🐛 <a href="https://github.com/app-at-once/node-sdk/issues" target="_blank">GitHub Issues</a>** - Bug reports and feature requests

### Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Ready to build something amazing?** 🚀

<a href="https://appatonce.com" target="_blank">Sign up at appatonce.com</a> and get your API key in minutes.

*Built with ❤️ by the AppAtOnce team*

