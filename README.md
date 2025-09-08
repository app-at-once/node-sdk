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
- **📊 Advanced Analytics** - Real-time metrics, time-series data, ClickHouse integration, business intelligence
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

## 🌐 Browser vs Node.js Usage

This SDK works in both environments but provides different features:

### Node.js Environment (Servers, APIs, CLIs)
- ✅ Full SDK features: Database, AI, Storage, Email, Realtime, etc.
- ✅ Secure server-side operations
- ❌ No UI components (chatbot)

### Browser Environment (React, Vue, Vanilla JS)
- ✅ Chatbot widget only
- ❌ No direct database access (security)
- ❌ No server operations

```javascript
// Node.js - Full SDK
import { AppAtOnceClient } from '@appatonce/node-sdk';
const client = AppAtOnceClient.createWithApiKey('your-api-key');

// Browser - Chatbot only
import { loadChatbot } from '@appatonce/node-sdk/browser';
const widget = loadChatbot('your-api-key');
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

#### 📊 Advanced Analytics
- **Real-time Metrics** - COUNT, SUM, AVG, MIN, MAX, DISTINCT operations
- **Time-series Analysis** - Hourly, daily, weekly, monthly aggregations
- **Business Intelligence** - Customer segmentation, conversion funnels, retention analysis
- **Live Dashboard Updates** - WebSocket-powered real-time analytics
- **ClickHouse Integration** - High-performance analytics database
- **Dynamic Filtering** - Complex conditions and custom date ranges

#### 🚀 Edge Functions (Cloudflare Workers)
- **JavaScript/TypeScript Deployment** - Deploy serverless functions to the edge
- **Multi-Language Support** - Python, PHP, Dart, Java, Go, Rust via WebAssembly
- **Version Control** - Automatic versioning with rollback capabilities
- **Real-time Logs** - Function execution logs and metrics
- **Custom Routes** - URL routing and custom domains
- **Cron Jobs** - Scheduled tasks and background jobs
- **Template System** - Pre-built templates for common patterns

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
- **AI Chatbot** - Embeddable chatbot widget for browser applications

#### 🚀 Edge Functions (Cloudflare Workers)
- **JavaScript/TypeScript Functions** - Deploy serverless functions to the edge
- **Multi-Language Support** - Python, PHP, Dart, Java, Go, Rust via WebAssembly
- **Version Control** - Automatic versioning with rollback capabilities
- **Real-time Logs** - Function execution logs and metrics
- **Custom Routes** - URL routing and custom domains
- **Environment Variables** - Secure configuration management
- **Template System** - Pre-built templates for common use cases

### 🔄 In Development

- **Logic Server** - Client-side logic execution (partial implementation)
- **Advanced Search** - Full semantic search with vector databases
- **Analytics Dashboard** - Real-time metrics and insights

### 📋 Planned Features

- **GraphQL API** - Auto-generated GraphQL endpoints
- **Advanced Security** - Row-level security, field encryption
- **Compliance Tools** - GDPR helpers, audit logging

## 🔐 Authentication & User Management

### Automatic Context from API Key

Your API key automatically determines the authentication context - whether it's project-level or app-level. No manual configuration needed!

```javascript
const client = AppAtOnceClient.createWithApiKey('your-api-key');

// List all users in your project (tenant users)
const result = await client.auth.listUsers({
  limit: 20,
  offset: 0,
  orderBy: 'created_at',
  ascending: false
});

console.log(`Found ${result.total} users`);
result.users.forEach(user => {
  console.log(`${user.email} - ${user.name}`);
});

// Search users by email or name (perfect for team invitations)
const searchResults = await client.auth.searchUsers('john', 10);

// Get user by ID
const user = await client.auth.getUserById(userId);

// Get current authenticated user
const currentUser = await client.auth.getCurrentUser();
```

### Authentication Modes

AppAtOnce supports two authentication approaches:

#### 1. SSO Mode (Single Sign-On)
- Unified authentication across your application
- OAuth handled through the platform
- No OAuth credentials needed in your app
- Configure in your project's authentication settings

#### 2. Custom OAuth Mode
- Direct integration with OAuth providers
- You provide your own OAuth credentials
- Full control over the authentication flow
- Ideal for white-label solutions

### User Authentication Flow

```javascript
// Sign up new user
const session = await client.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  name: 'John Doe'
});

// Sign in existing user
const session = await client.auth.signIn({
  email: 'user@example.com',
  password: 'secure-password'
});

// Get current authenticated user
const currentUser = await client.auth.getCurrentUser();

// Sign out
await client.auth.signOut();

// Refresh session
const newSession = await client.auth.refreshSession();

// Password reset
await client.auth.resetPassword('user@example.com');

// Email verification (Coming Soon)
// await client.auth.sendEmailVerification();

// Magic Link (Coming Soon)
// await client.auth.sendMagicLink('user@example.com');

// MFA/2FA (Coming Soon)
// const mfa = await client.auth.enableMFA();
```

### Team Management Example

```javascript
// Create a team for your users
const team = await client.teams.create({
  name: 'Marketing Team',
  description: 'Our marketing team collaboration space',
  settings: {
    allowPublicJoin: false,
    maxMembers: 50
  }
});

// Invite users to the team
const invitation = await client.teams.invite(team.id, {
  email: 'colleague@company.com',
  role: 'member', // 'admin' or 'member'
  message: 'Welcome to our marketing team!'
});

// Accept invitation (user receives email with token)
const joinedTeam = await client.teams.acceptInvite(invitation.token);

// List team members
const members = await client.teams.listMembers(team.id);
members.forEach(member => {
  console.log(`${member.email} - ${member.role}`);
});

// Update member role (owners only)
await client.teams.updateMemberRole(team.id, memberId, 'admin');

// Remove member from team
await client.teams.removeMember(team.id, memberId);

// List user's teams
const userTeams = await client.teams.list();
userTeams.forEach(team => {
  console.log(`${team.name} - You are: ${team.role}`);
});
```

### OAuth / Social Authentication

```javascript
// When SSO is enabled (configured in project settings):
// OAuth is handled automatically by the platform

// When using Custom OAuth mode:
// Import the OAuth provider enum
import { OAuthProvider } from '@appatonce/node-sdk';

// Initiate OAuth flow
const oauthUrl = await client.auth.initiateOAuth(OAuthProvider.GOOGLE, {
  redirectUrl: 'https://yourapp.com/auth/callback'
});

// Handle OAuth callback
const session = await client.auth.handleOAuthCallback(
  OAuthProvider.GOOGLE,
  authCode,
  state
);

// Get connected OAuth providers
const providers = await client.auth.getConnectedProviders();

// Link/unlink providers
await client.auth.linkOAuthProvider(OAuthProvider.GITHUB, code, state);
await client.auth.unlinkOAuthProvider(OAuthProvider.GITHUB);
```

### Tenant User Management

```javascript
// List users in your tenant (API key determines context)
const { users, total } = await client.auth.listUsers({
  limit: 50,
  offset: 0,
  orderBy: 'created_at',
  ascending: false
});

// Search users
const results = await client.auth.searchUsers('john', 10);

// Get user by ID
const user = await client.auth.getUserById(userId);
```

**📚 Full Authentication Examples:** See [examples/auth-complete.ts](examples/auth-complete.ts) for comprehensive examples including all authentication features, SSO configuration, OAuth setup, and tenant user management.

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

// 6. Find by ID (optimized for single record lookup)
const user = await client.findById('users', 'user-123');
// or using the table builder
const product = await client.table('products').findById('prod-456');
```

**Real Output Example:**
```javascript
// From our test suite - this actually works:
✅ Found: 3 workspaces created after 2025-01-01
✅ Found: 5 active free workspaces
✅ Found: 2 active workspaces with 10+ max members
```

### 📊 Real-time Analytics

```javascript
// Basic analytics operations
const orders = client.table('orders');

// Count total orders
const totalOrders = await orders.analytics.count();

// Sum revenue with filters
const monthlyRevenue = await orders.analytics.sum('total_amount', {
  created_at: { gte: '2024-01-01' }
});

// Average order value
const avgOrderValue = await orders.analytics.avg('total_amount');

// Time-series analysis - daily sales for last 30 days
const dailySales = await orders.analytics.timeSeries({
  metric: 'sum',
  column: 'total_amount',
  interval: 'day',
  timeRange: '30d'
});

// Customer segmentation
const topCustomers = await orders.analytics.groupBy({
  metric: 'sum',
  column: 'total_amount', 
  groupBy: ['customer_id'],
  limit: 10
});

// Real-time analytics monitoring
const unsubscribe = orders.analytics.realtime(
  { metric: 'count', timeRange: '1h' },
  (result) => {
    console.log(`Live orders: ${result.data[0]?.value || 0}`);
  }
);

// Advanced business metrics
const conversionFunnel = await Promise.all([
  client.table('visitors').analytics.countDistinct('visitor_id'),
  client.table('signups').analytics.count(),
  client.table('purchases').analytics.count()
]);
```

**Analytics Output Example:**
```javascript
📊 Analytics Results:
✅ Total orders: 15,247
✅ Monthly revenue: $284,591.50
✅ Average order value: $67.43
✅ Top customer spent: $2,847.30
📈 Daily sales trend shows 12% growth
🔴 Live orders (last hour): 23
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

### 🚀 Database Migrations CLI

AppAtOnce SDK includes a built-in CLI for database migrations - no extra dependencies needed!

```bash
# Install the SDK
npm install @appatonce/node-sdk

## 📊 Schema Migration System

AppAtOnce provides a powerful, schema migration system that allows you to define your database schema in code and automatically sync it with your database.

> [!CAUTION]
> **Migration Safety**
> - By default, migrations run in **safe mode** - they will NOT drop columns or tables
> - Use `--dev` flag for development to enable column drops and type changes
> - Always use `--dry-run` first to preview changes
> - The `force` command will DROP ALL TABLES - use with extreme caution!

### Quick Start

```bash
# Install dependencies
npm install @appatonce/node-sdk

# Set your API key
export APPATONCE_API_KEY=your_api_key

# Run migrations
npx appatonce migrate schema.js

# Or add to package.json scripts
"scripts": {
  "migrate": "appatonce migrate src/schema.js",
  "migrate:dev": "appatonce migrate src/schema.js --dev",
  "migrate:dry": "appatonce migrate src/schema.js --dry-run"
}
```

### Migration Modes

#### 1. **Production Mode (Default)**
Safe mode that prevents data loss.

```bash
npx appatonce migrate schema.js
```

✅ **Can do:**
- Create new tables
- Add new columns to existing tables
- Create indexes
- Add foreign key relationships

❌ **Cannot do:**
- Drop columns
- Drop tables
- Change column types
- Modify existing constraints

#### 2. **Development Mode**
Allows schema modifications that may cause data loss.

```bash
npx appatonce migrate schema.js --dev
```

✅ **Additionally can:**
- Drop columns that are removed from schema
- Drop tables that are removed from schema
- Change column types (with automatic conversion)
- Modify column constraints

> [!WARNING]
> Development mode can cause data loss! Always backup your data first.

#### 3. **Sync Mode**
Only creates new tables, never modifies existing ones.

```bash
npx appatonce migrate sync schema.js
```

✅ **Only does:**
- Create new tables that don't exist

❌ **Never does:**
- Modify existing tables
- Drop anything
- Change column definitions

#### 4. **Force Mode**
Drops and recreates all tables from scratch.

```bash
npx appatonce migrate force schema.js --yes
```

> [!DANGER]
> **DESTRUCTIVE OPERATION**
> This will DROP ALL TABLES and recreate them. All data will be lost!
> Only use for initial setup or development resets.

### Schema Definition

Create a `schema.js` or `schema.ts` file:

```javascript
// schema.js
export const schema = {
  users: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'email', type: 'string', unique: true, nullable: false },
      { name: 'name', type: 'string', nullable: true },
      { name: 'role', type: 'string', default: "'user'" },
      { name: 'is_active', type: 'boolean', default: true },
      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['email'], unique: true },
      { columns: ['created_at'] }
    ]
  },

  posts: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'user_id', type: 'uuid', nullable: false, references: { table: 'users', onDelete: 'CASCADE' } },
      { name: 'title', type: 'string', nullable: false },
      { name: 'content', type: 'text' },
      { name: 'status', type: 'string', default: "'draft'" },
      { name: 'published_at', type: 'timestamptz', nullable: true },
      { name: 'created_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['user_id'] },
      { columns: ['status', 'published_at'] }
    ]
  },

  tags: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'name', type: 'string', unique: true, nullable: false },
      { name: 'slug', type: 'string', unique: true, nullable: false }
    ]
  },

  post_tags: {
    columns: [
      { name: 'post_id', type: 'uuid', references: { table: 'posts', onDelete: 'CASCADE' } },
      { name: 'tag_id', type: 'uuid', references: { table: 'tags', onDelete: 'CASCADE' } }
    ],
    indexes: [
      { columns: ['post_id', 'tag_id'], unique: true }
    ]
  }
};
```

### Column Types

| Type | PostgreSQL Type | Description |
|------|----------------|-------------|
| `string` | VARCHAR(255) | Variable-length string |
| `text` | TEXT | Unlimited text |
| `integer` | INTEGER | 32-bit integer |
| `bigint` | BIGINT | 64-bit integer |
| `float` | REAL | Single precision |
| `double` | DOUBLE PRECISION | Double precision |
| `decimal` | DECIMAL(10,2) | Fixed precision |
| `boolean` | BOOLEAN | true/false |
| `date` | DATE | Date only |
| `time` | TIME | Time only |
| `timestamp` | TIMESTAMP | Date and time |
| `timestamptz` | TIMESTAMPTZ | Date, time with timezone |
| `uuid` | UUID | Universally unique identifier |
| `json` | JSON | JSON data |
| `jsonb` | JSONB | Binary JSON (recommended) |

### Column Options

```javascript
{
  name: 'column_name',           // Required: column name
  type: 'string',                // Required: data type
  primaryKey: true,              // Optional: is primary key
  unique: true,                  // Optional: must be unique
  nullable: false,               // Optional: can be null (default: true)
  default: "'value'",            // Optional: default value
  references: {                  // Optional: foreign key
    table: 'other_table',        // Referenced table
    column: 'id',                // Referenced column (default: 'id')
    onDelete: 'CASCADE',         // CASCADE, SET NULL, RESTRICT, NO ACTION
    onUpdate: 'CASCADE'          // CASCADE, SET NULL, RESTRICT, NO ACTION
  }
}
```

### Migration Commands Reference

```bash
# Preview changes (dry run)
npx appatonce migrate schema.js --dry-run
npx appatonce migrate schema.js --dev --dry-run

# Apply migrations
npx appatonce migrate schema.js              # Safe mode (production)
npx appatonce migrate schema.js --dev        # Development mode

# Sync mode (create-only)
npx appatonce migrate sync schema.js

# Force recreate (dangerous!)
npx appatonce migrate force schema.js --yes

# Additional options
--verbose                                    # Show detailed output
--help                                       # Show help
```

### Package.json Scripts

Add these scripts for convenience:

```json
{
  "scripts": {
    "migrate": "appatonce migrate src/schema.js",
    "migrate:dev": "appatonce migrate src/schema.js --dev",
    "migrate:dry": "appatonce migrate src/schema.js --dry-run",
    "migrate:dev:dry": "appatonce migrate src/schema.js --dev --dry-run",
    "migrate:sync": "appatonce migrate sync src/schema.js",
    "migrate:force": "appatonce migrate force src/schema.js --yes"
  }
}
```

### Migration Workflow

#### Development Workflow

1. **Make schema changes** in your `schema.js` file
2. **Preview changes** with dry run:
   ```bash
   npm run migrate:dev:dry
   ```
3. **Apply changes** in development:
   ```bash
   npm run migrate:dev
   ```

#### Production Workflow

1. **Test migrations** in development/staging first
2. **Preview production changes**:
   ```bash
   npm run migrate:dry
   ```
3. **Apply safe changes** to production:
   ```bash
   npm run migrate
   ```

### Common Patterns

#### Adding a New Table

```javascript
// Add to schema.js
products: {
  columns: [
    { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
    { name: 'name', type: 'string', nullable: false },
    { name: 'price', type: 'decimal', nullable: false },
    { name: 'created_at', type: 'timestamptz', default: 'now()' }
  ]
}
```

#### Adding a Column

```javascript
// Add to existing table definition
{ name: 'description', type: 'text', nullable: true }
```

#### Changing Column Type (Dev Mode Only)

```javascript
// Change from:
{ name: 'status', type: 'boolean', default: false }

// To:
{ name: 'status', type: 'string', default: "'pending'" }
```

#### Adding Foreign Key Relationship

```javascript
{ 
  name: 'user_id', 
  type: 'uuid', 
  nullable: false,
  references: { 
    table: 'users', 
    onDelete: 'CASCADE' 
  }
}
```

### Best Practices

1. **Always use dry run first** to preview changes
2. **Test migrations in development** before production
3. **Version control your schema** - commit schema.js to git
4. **Use timestamps** - add created_at/updated_at to tables
5. **Plan column type changes** - they require dev mode
6. **Backup before destructive operations** - especially with --dev or force
7. **Use meaningful defaults** - helps with migrations
8. **Document schema changes** - comment your schema file

### Troubleshooting

#### "Column type change not detected"
- Make sure server is running latest version
- Use `--dev` flag for type changes
- Check server logs for comparison details

#### "Migration takes too long"
- Large schemas are processed table by table
- Progress bar shows current status
- Use `--dry-run` first to check scope

#### "Permission denied"
- Check your API key has schema modification permissions
- Ensure database user has DDL privileges

### Programmatic Usage

You can also run migrations programmatically:

```javascript
import { AppAtOnceClient } from '@appatonce/node-sdk';
import { schema } from './schema.js';

const client = new AppAtOnceClient(process.env.APPATONCE_API_KEY);

// Run migration
const result = await client.schema.migrate(schema, {
  dryRun: false,
  dev: process.env.NODE_ENV === 'development',
  onProgress: (progress) => {
    console.log(`${progress.type}: ${progress.message}`);
  }
});

if (result.success) {
  console.log('Migration completed successfully!');
} else {
  console.error('Migration failed:', result.errors);
}
```

**Features:**
- 📊 Real-time progress tracking with progress bars
- 🔄 Smart migration detection - only applies needed changes
- 🛡️ Safe mode to create new tables without affecting existing ones
- 📝 Dry run mode to preview changes before applying
- ⚡ WebSocket-based real-time progress updates
- 🎯 No additional dependencies - chalk and commander included

**Environment Setup:**

```bash
# Set your API key
export APPATONCE_API_KEY=your_api_key

# Or use a .env file
echo "APPATONCE_API_KEY=your_api_key" > .env
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

AppAtOnce provides a comprehensive AI suite powered by advanced language models. All AI features are optimized for quality, speed, and reliability.

**Available Text-Based AI Features:**
- ✅ Text Generation & Chat
- ✅ Translation (multiple languages)
- ✅ Text Summarization (paragraph, bullet, brief)
- ✅ Writing Enhancement (grammar, tone, style)
- ✅ Content Moderation (safety checks)
- ✅ Code Generation & Analysis
- ✅ Problem Solving & Reasoning
- ✅ Email Intelligence (replies, subjects)
- ✅ Natural Language Processing (entities, sentiment, keywords)
- ✅ Content Creation (blog posts, captions, scripts, hashtags)
- ✅ Content Analysis & Optimization
- ✅ Content Idea Generation

#### Text Generation & Chat

> **💡 Note**: This chat API is for building your own custom chat functionality. For a ready-to-use chat interface, see our [Embedded Chatbot Widget](#-chatbot-integration-browser-only) that provides a complete UI solution.

```javascript
// Basic text generation
const result = await client.ai.generateText(
  'Write a short greeting for a software development team',
  { temperature: 0.7, max_tokens: 100 }
);
console.log(result.result);

// Build custom chat experiences with full control
const chatResponse = await client.ai.chat([
  { role: 'system', content: 'You are a helpful coding assistant specialized in JavaScript.' },
  { role: 'user', content: 'How do I handle errors in async functions?' }
]);
console.log(chatResponse.result);

// Multi-turn conversations with context
const conversation = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'What is React?' },
  { role: 'assistant', content: 'React is a JavaScript library for building user interfaces...' },
  { role: 'user', content: 'Can you show me a simple example?' }
];
const response = await client.ai.chat(conversation);
console.log(response.result); // Will provide a React example based on context

// Advanced chat with options
const advancedChat = await client.ai.chat(
  [
    { role: 'system', content: 'You are an expert in cloud architecture.' },
    { role: 'user', content: 'Design a scalable microservices architecture' }
  ],
  {
    temperature: 0.7,
    max_tokens: 1000
  }
);
```

**Blog Post Generation** (moved to Content Creation section)

```javascript
// See Content Creation section for blog post generation
```

#### Translation Services

```javascript
// Translate text to any language
const translation = await client.ai.translateText(
  'Hello, how are you today?',
  'Spanish'
);
console.log(translation.translation); // "Hola, ¿cómo estás hoy?"

// Auto-detect source language
const autoTranslation = await client.ai.translateText(
  'Bonjour le monde',
  'English'
);
console.log(autoTranslation.translation); // "Hello world"
```

#### Text Summarization

```javascript
// Summarize long texts with different styles
const summary = await client.ai.summarizeText(longArticle, {
  maxLength: 200,
  style: 'paragraph' // or 'bullet', 'brief'
});
console.log(summary.summary);

// Bullet point summary
const bulletSummary = await client.ai.summarizeText(longText, {
  style: 'bullet',
  focus: 'key takeaways'
});
console.log(bulletSummary.summary);
```

#### Writing Enhancement

```javascript
// Enhance writing quality and fix grammar
const enhanced = await client.ai.enhanceWriting(
  'the quick brown fox jump over the lazzy dog',
  {
    tone: 'professional',
    fixGrammar: true
  }
);
console.log('Enhanced:', enhanced.enhanced);
console.log('Grammar issues:', enhanced.grammarIssues);
console.log('Suggestions:', enhanced.suggestions);
```

#### Content Moderation

```javascript
// Check content for safety and appropriateness
const moderation = await client.ai.moderateContent(
  'This is a wonderful day to learn programming!'
);
console.log('Safe:', moderation.safe); // true
console.log('Issues:', moderation.issues); // []
console.log('Severity:', moderation.severity); // 'safe'
```

#### Code Generation & Analysis

```javascript
// Generate code from descriptions
const code = await client.ai.generateCode(
  'Create a function that calculates the factorial of a number',
  'JavaScript',
  { includeComments: true }
);
console.log(code.code);

// Analyze existing code
const analysis = await client.ai.analyzeCode(
  `function bubbleSort(arr) {
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }
    return arr;
  }`,
  'JavaScript'
);
console.log('Explanation:', analysis.explanation);
console.log('Issues:', analysis.issues);
console.log('Improvements:', analysis.improvements);
console.log('Complexity:', analysis.complexity);
```

#### Reasoning & Problem Solving

```javascript
// Solve complex problems with step-by-step reasoning
const solution = await client.ai.solveReasoning(
  'If a train travels 120 miles in 2 hours, and then 180 miles in 3 hours, what is its average speed?',
  {
    stepByStep: true,
    explainReasoning: true
  }
);
console.log('Solution:', solution.solution);
console.log('Steps:', solution.steps);
console.log('Reasoning:', solution.reasoning);
console.log('Confidence:', solution.confidence + '%');
```

#### Email Intelligence

```javascript
// Generate smart email replies
const emailReply = await client.ai.generateEmailReply(
  originalEmailContent,
  'You are the project manager',
  'professional' // tone
);
console.log('Reply:', emailReply.reply);

// Optimize email subject lines
const subjects = await client.ai.optimizeEmailSubject(
  emailContent,
  'urgent project update'
);
console.log('Optimized subjects:', subjects.subjects);
```

#### Natural Language Processing

```javascript
// Extract entities from text
const entities = await client.ai.extractEntities(
  'Apple Inc. announced that Tim Cook will visit Paris on January 15th, 2024.'
);
console.log('People:', entities.people); // ['Tim Cook']
console.log('Organizations:', entities.organizations); // ['Apple Inc.']
console.log('Locations:', entities.locations); // ['Paris']
console.log('Dates:', entities.dates); // ['January 15th, 2024']

// Analyze sentiment
const sentiment = await client.ai.analyzeSentiment(
  'I absolutely love this new feature! It has made my work so much easier.'
);
console.log('Sentiment:', sentiment.sentiment); // 'positive'
console.log('Score:', sentiment.score); // 85
console.log('Emotions:', sentiment.emotions); // ['joy', 'satisfaction']

// Extract keywords
const keywords = await client.ai.extractKeywords(
  'Machine learning is transforming healthcare by enabling early disease detection.',
  5
);
console.log('Keywords:', keywords.keywords);
// ['machine learning', 'healthcare', 'disease detection', ...]
```

#### Content Creation

```javascript
// Generate SEO-optimized blog posts
const blogPost = await client.ai.generateBlogPost(
  'The Future of AI in Web Development',
  ['AI', 'web development', 'automation', 'machine learning'],
  'professional'
);
console.log('Blog post:', blogPost.result);

// Generate social media captions
const caption = await client.ai.generateCaption(
  'Launching our new AI-powered analytics dashboard',
  'linkedin',
  ['AI', 'analytics', 'innovation'],
  'professional'
);
console.log('Caption:', caption.caption);

// Optimize content for specific platforms
const optimized = await client.ai.optimizeContent(
  'Check out our amazing new features!',
  'instagram',
  'caption',
  {
    targetAudience: 'developers',
    tone: 'exciting'
  }
);
console.log('Optimized:', optimized.optimized);

// Generate video/audio scripts
const script = await client.ai.generateScript(
  'video',
  'Introduction to AppAtOnce SDK',
  { 
    duration: 3, // duration in minutes
    audience: 'developers',
    style: 'tutorial'
  }
);
console.log('Script:', script.script);

// Generate relevant hashtags
const hashtags = await client.ai.generateHashtags(
  'New release of our developer tools with AI integration',
  'twitter',
  { count: 10, popularity: 'mixed' }
);
console.log('Hashtags:', hashtags.hashtags);

// Analyze content for improvements
const contentAnalysis = await client.ai.analyzeContent(
  'Our platform helps developers build faster',
  'all' // or 'sentiment' | 'readability' | 'seo' | 'engagement'
);
console.log('Analysis:', contentAnalysis);

// Generate content ideas
const ideas = await client.ai.generateIdeas(
  'web development',
  'blog',
  {
    count: 5,
    trending: true,
    audience: 'developers'
  }
);
console.log('Content ideas:', ideas.ideas);
```

#### 🎨 Unified Image Generation (NEW - Queue-Based)

**Advanced AI-powered image generation with multiple models and async processing:**

```javascript
// Generate image with queue-based processing
const imageJob = await client.ai.generateImage(
  'A futuristic cityscape at sunset with flying cars',
  {
    width: 1024,
    height: 1024,
    model: 'SDXL', // 'SD3', 'SDXL', 'SD1.5', 'Playground2.5', 'FLUX.1'
    negativePrompt: 'low quality, blurry',
    steps: 30,
    cfg: 7.5,
    seed: 12345, // For reproducible results
  }
);

// Check job status
const status = await client.ai.getImageJobStatus(imageJob.jobId);
if (status.status === 'completed') {
  console.log('Image URL:', status.results.url);
  console.log('Cost:', status.results.cost);
}

// Batch image generation
const batchJob = await client.ai.generateBatchImages(
  ['Prompt 1', 'Prompt 2', 'Prompt 3'],
  { width: 512, height: 512, model: 'SDXL' }
);

// Image upscaling (2x, 4x, 8x)
const upscaleResult = await client.ai.upscaleImage(
  'https://example.com/image.jpg',
  4 // 4x upscaling
);

// Background removal
const bgRemoved = await client.ai.removeBackground(
  'https://example.com/product.jpg',
  'project-id',
  'project'
);
```

#### 🎬 Unified Video Generation (NEW - With AI Narration)

**Create AI videos with optional narration and custom voices:**

```javascript
// Generate video with narration
const videoJob = await client.ai.generateVideo(
  'A tour of a modern smart home',
  {
    duration: 10, // 6 or 10 seconds
    aspectRatio: '16:9', // '16:9', '9:16', '1:1'
    resolution: '1080p',
    voiceEnabled: true,
    voiceText: 'Welcome to the future of smart living...',
    voice: 'nova', // OpenAI voices
    voiceSpeed: 1.0,
    voiceProvider: 'openai', // or 'elevenlabs'
  }
);

// Check video generation status
const videoStatus = await client.ai.getVideoJobStatus(videoJob.jobId);
if (videoStatus.status === 'completed') {
  console.log('Video URL:', videoStatus.results.videoUrl);
  console.log('Audio URL:', videoStatus.results.audioUrl);
}

// Get available video pipelines
const pipelines = await client.ai.getVideoPipelines();
```

#### 🎵 Unified Audio Generation (NEW - Multiple Providers)

**Text-to-speech with OpenAI and ElevenLabs support:**

```javascript
// Generate audio with OpenAI
const audioJob = await client.ai.generateAudio(
  'Welcome to AppAtOnce!',
  {
    voice: 'nova', // 'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'
    provider: 'openai',
    model: 'tts-1-hd', // High quality
    speed: 1.0, // 0.25 to 4.0
  }
);

// Check audio job status
const audioStatus = await client.ai.getAudioJobStatus(audioJob.jobId);
if (audioStatus.status === 'completed') {
  console.log('Audio URL:', audioStatus.results.url);
}

// Get available voices
const voices = await client.ai.getAudioVoices('openai');
console.log('Available voices:', voices.voices);

// Voice cloning (if configured)
const voiceClone = await client.ai.createVoiceClone(
  'Custom Voice',
  [audioBuffer1, audioBuffer2], // Audio samples
  ['sample1.mp3', 'sample2.mp3'],
  { description: 'Professional narrator voice' }
);
```

#### Embeddings for Semantic Search

```javascript
// Generate embeddings for semantic search
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

### 🚀 Edge Functions (Cloudflare Workers)

Deploy serverless functions globally with near-zero cold starts and automatic scaling.

```javascript
// Create a simple edge function
const edgeFunction = await client.edgeFunctions.create({
  name: 'api-handler',
  description: 'API endpoint handler',
  runtime: 'javascript',
  code: `
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle different routes
    if (url.pathname === '/api/hello') {
      return new Response(JSON.stringify({
        message: 'Hello from the edge!',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Not Found', { status: 404 });
  }
}`,
  routes: ['/api/*'],
  isActive: true
});

// Test locally before deployment
const testResult = await client.edgeFunctions.execute(edgeFunction.id, {
  method: 'GET',
  path: '/api/hello'
});
console.log('Test response:', testResult.body);

// Deploy to Cloudflare Workers
const deployment = await client.edgeFunctions.deploy(
  edgeFunction.id,
  'production',
  'Initial deployment'
);
console.log('Deployed to:', deployment.url);
```

#### Multi-Language Support

```javascript
// Python edge function (uses Pyodide)
const pythonFunction = await client.edgeFunctions.createPythonFunction({
  name: 'python-api',
  description: 'Python-based API handler',
  pythonCode: `
import json

def handle_request(request):
    """Handle incoming HTTP request."""
    url = request['url']
    method = request['method']
    
    if '/api/process' in url:
        data = {
            'message': 'Processed by Python',
            'method': method,
            'timestamp': str(__import__('datetime').datetime.now())
        }
        return {
            'body': json.dumps(data),
            'status': 200,
            'headers': {'Content-Type': 'application/json'}
        }
    
    return {'body': 'Not Found', 'status': 404}

# Execute handler
result = handle_request(request)
`,
  routes: ['/python/*'],
  isActive: true
});
```

#### Cron Jobs and Scheduled Tasks

```javascript
// Create a scheduled edge function
const cronJob = await client.edgeFunctions.create({
  name: 'daily-cleanup',
  runtime: 'javascript',
  code: `
export default {
  async scheduled(event, env, ctx) {
    // This runs on a schedule
    console.log('Running scheduled cleanup at', new Date().toISOString());
    
    // Perform cleanup tasks
    // await cleanupOldRecords();
    // await sendDailyReport();
    
    console.log('Cleanup completed');
  }
}`,
  triggers: [{
    type: 'cron',
    config: { schedule: '0 2 * * *' } // Run at 2 AM daily
  }]
});
```

#### Version Control and Rollback

```javascript
// Get version history
const versions = await client.edgeFunctions.getVersions(edgeFunction.id);
console.log('Current version:', versions[0].version);

// Rollback to previous version
if (versions.length > 1) {
  await client.edgeFunctions.rollback(
    edgeFunction.id,
    versions[1].deploymentId
  );
  console.log('Rolled back to version:', versions[1].version);
}

// Get real-time logs
const logs = await client.edgeFunctions.getLogs(edgeFunction.id, {
  level: 'info',
  limit: 100
});

// Get metrics
const metrics = await client.edgeFunctions.getMetrics(edgeFunction.id, '24h');
console.log('Requests:', metrics.requests);
console.log('Avg Duration:', metrics.avgDuration, 'ms');
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

### 🤖 Chatbot Integration (Browser Only)

The chatbot is a browser-only feature for security and architectural reasons.

```javascript
// In browser environments (React, Vue, vanilla JS)
import { loadChatbot } from '@appatonce/node-sdk/browser';

// Simple one-line integration
const widget = loadChatbot('your-api-key');

// With options
const widget = loadChatbot('your-api-key', {
  position: 'bottom-right',    // or 'bottom-left'
  theme: {
    primaryColor: '#007bff',
    secondaryColor: '#6c757d'
  },
  // baseUrl is configured internally in the SDK
  startOpen: false,            // optional
});

// Control the widget
widget.show();
widget.hide();
widget.toggle();
widget.destroy();

// React Component Example
import { useEffect } from 'react';
import { loadChatbot } from '@appatonce/node-sdk/browser';

function App() {
  useEffect(() => {
    const widget = loadChatbot(process.env.REACT_APP_APPATONCE_API_KEY);
    
    // Cleanup on unmount
    return () => widget.destroy();
  }, []);

  return <div>Your app content</div>;
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

#### Core SDK Examples
- **[`basic-usage.js`](./examples/basic-usage.js)** - Basic SDK initialization and simple operations
- **[`complete-sdk-example.js`](./examples/complete-sdk-example.js)** - Comprehensive example showcasing all major SDK features
- **[`query-builder.js`](./examples/query-builder.js)** - Advanced query building capabilities for database operations
- **[`advanced-features.js`](./examples/advanced-features.js)** - Latest v2.0 features: payment processing, image/PDF processing, OCR, workflows

#### Authentication & Authorization Examples
- **[`auth-complete.ts`](./examples/auth-complete.ts)** - Complete authentication guide: signup, signin, password reset, email verification, MFA/2FA, OAuth (Google, GitHub, Facebook, etc.), session management, tenant user management

#### Communication Services Examples
- **[`email.js`](./examples/email.js)** - Email service: transactional emails, templates, campaigns, analytics
- **[`push-notifications.js`](./examples/push-notifications.js)** - Push notifications: device registration, topics, campaigns

#### Document Processing Examples
- **[`pdf.js`](./examples/pdf.js)** - PDF generation, manipulation, watermarks, text extraction
- **[`ocr.js`](./examples/ocr.js)** - OCR: text extraction, table detection, receipt parsing, ID cards

#### Edge Functions Examples
- **[`edge-functions/01-basic-edge-function.js`](./examples/edge-functions/01-basic-edge-function.js)** - Basic edge function creation and deployment
- **[`edge-functions/02-api-proxy.js`](./examples/edge-functions/02-api-proxy.js)** - API proxy with CORS handling and authentication

#### Other Examples
- **[`search-test.js`](./examples/search-test.js)** - Text and semantic search functionality
- **[`analytics-getting-started.js`](./examples/analytics-getting-started.js)** - ⭐ **Analytics quick start** - Real-time analytics, time-series, business metrics
- **[`analytics-examples.js`](./examples/analytics-examples.js)** - Comprehensive analytics examples with ClickHouse integration
- **[`realtime-test.js`](./examples/realtime-test.js)** - Real-time features: database subscriptions, pub/sub, presence
- **[`content-management.ts`](./examples/content-management.ts)** - Content management operations
- **[`chatbot-example.js`](./examples/chatbot-example.js)** - Chatbot API documentation and usage
- **[`chatbot-browser-example.html`](./examples/chatbot-browser-example.html)** - Browser chatbot example

#### AI Service Examples (in `ai/` subfolder)
- **Text-Based AI (01-08)** - Text generation, content creation, language processing, code assistance, etc.
- **Unified AI (10-13)** - Complete AI example, image generation, audio generation, video generation

See [AI Examples README](./examples/ai/README.md) for detailed AI feature documentation

### WebRTC Video Calling

Build real-time video applications with our integrated WebRTC module.

```javascript
// Create a video session
const session = await client.webrtc.createSession({
  title: 'Team Meeting',
  type: 'instant',
  maxParticipants: 10,
  settings: {
    enableRecording: true,
    enableTranscription: true,
    enableChat: true,
    enableScreenShare: true
  }
});

// Join the session
const joinResponse = await client.webrtc.joinSession(session.id, {
  name: 'John Doe',
  role: 'participant'
});

// Start the video call (WebRTC infrastructure handled internally)
await client.webrtc.startVideoCall(session.id);

// The server handles all WebRTC connections internally
// No need to manage tokens or WebSocket URLs

// Manage participants
const participants = await client.webrtc.getParticipants(session.id);

// Start recording
const recording = await client.webrtc.startRecording(session.id);

// Generate transcripts
const transcripts = await client.webrtc.generateTranscript(session.id, {
  language: 'en',
  includeSpeakerLabels: true
});

// Get analytics
const analytics = await client.webrtc.getAnalytics(session.id);
```


### React Integration

```javascript
import React, { useState, useEffect } from 'react';

function VideoCall({ sessionId }) {
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeSession() {
      try {
        // Join the session - WebRTC handled internally by server
        const joinResponse = await client.webrtc.joinSession(sessionId, {
          name: 'Current User',
          role: 'participant'
        });
        
        // Start the video call
        await client.webrtc.startVideoCall(sessionId);
        
        setIsConnected(true);
        setIsLoading(false);
        
        // Load participants
        const participantList = await client.webrtc.getParticipants(sessionId);
        setParticipants(participantList);
      } catch (error) {
        console.error('Failed to join session:', error);
        setIsLoading(false);
      }
    }

    if (sessionId) {
      initializeSession();
    }
    
    return () => {
      // Cleanup on unmount
      if (isConnected) {
        client.webrtc.endVideoCall(sessionId);
        client.webrtc.leaveSession(sessionId);
      }
    };
  }, [sessionId]);

  const toggleAudio = async () => {
    await client.webrtc.toggleMedia(sessionId, 'audio', true);
  };

  const toggleVideo = async () => {
    await client.webrtc.toggleMedia(sessionId, 'video', true);
  };

  if (isLoading) {
    return <div>Loading video session...</div>;
  }

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <div className="video-grid">
        {/* Your video UI components here */}
        <div className="participants">
          {participants.map(p => (
            <div key={p.id} className="participant">
              {p.name}
            </div>
          ))}
        </div>
      </div>
      <div className="controls">
        <button onClick={toggleAudio}>Toggle Audio</button>
        <button onClick={toggleVideo}>Toggle Video</button>
      </div>
    </div>
  );
}

export default VideoCall;
```

### Vanilla JavaScript Integration

```javascript
class VideoCallManager {
  constructor() {
    this.sessionId = null;
    this.isConnected = false;
    this.participants = [];
  }

  async joinSession(sessionId, userName) {
    try {
      this.sessionId = sessionId;
      
      // Join session - WebRTC handled internally by server
      const joinResponse = await client.webrtc.joinSession(sessionId, {
        name: userName,
        role: 'participant'
      });
      
      console.log('Joined session:', joinResponse.participantId);
      
      // Start the video call
      await client.webrtc.startVideoCall(sessionId);
      
      this.isConnected = true;
      console.log('Connected to video session');
      
      // Load participants
      await this.updateParticipants();
      
      // Set up polling for participant updates
      this.startParticipantPolling();
      
      return joinResponse;
    } catch (error) {
      console.error('Failed to join video session:', error);
      throw error;
    }
  }

  async updateParticipants() {
    if (!this.sessionId) return;
    
    this.participants = await client.webrtc.getParticipants(this.sessionId);
    this.updateParticipantUI();
  }

  updateParticipantUI() {
    const container = document.getElementById('participants');
    container.innerHTML = '';
    
    this.participants.forEach(participant => {
      const div = document.createElement('div');
      div.className = 'participant';
      div.textContent = participant.name;
      container.appendChild(div);
    });
  }

  startParticipantPolling() {
    this.pollingInterval = setInterval(() => {
      this.updateParticipants();
    }, 5000); // Poll every 5 seconds
  }

  stopParticipantPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  async leaveSession() {
    if (!this.sessionId || !this.isConnected) return;
    
    this.stopParticipantPolling();
    
    await client.webrtc.endVideoCall(this.sessionId);
    await client.webrtc.leaveSession(this.sessionId);
    
    this.isConnected = false;
    this.sessionId = null;
  }

  async toggleCamera() {
    if (!this.sessionId) return;
    await client.webrtc.toggleMedia(this.sessionId, 'video', true);
  }

  async toggleMicrophone() {
    if (!this.sessionId) return;
    await client.webrtc.toggleMedia(this.sessionId, 'audio', true);
  }

  async shareScreen() {
    if (!this.sessionId) return;
    await client.webrtc.shareScreen(this.sessionId, true);
  }

  async stopScreenShare() {
    if (!this.sessionId) return;
    await client.webrtc.shareScreen(this.sessionId, false);
  }
}

// Usage
const videoCall = new VideoCallManager();

// Join a session
document.getElementById('join-btn').addEventListener('click', async () => {
  const sessionId = document.getElementById('session-id').value;
  const userName = document.getElementById('user-name').value;
  
  try {
    await videoCall.joinSession(sessionId, userName);
  } catch (error) {
    console.error('Error joining session:', error);
  }
});

// Leave session on page unload
window.addEventListener('beforeunload', () => {
  videoCall.leaveSession();
});
```

### Vue Integration

```vue
<template>
  <div class="video-call-container">
    <div v-if="!connected" class="loading">
      Loading video session...
    </div>
    <div v-else class="video-room">
      <div class="video-grid" id="video-grid">
        <!-- Video elements will be added here -->
      </div>
      <div class="controls">
        <button @click="toggleAudio" :class="{ muted: !audioEnabled }">
          {{ audioEnabled ? '🎤' : '🔇' }}
        </button>
        <button @click="toggleVideo" :class="{ off: !videoEnabled }">
          {{ videoEnabled ? '📹' : '📷' }}
        </button>
        <button @click="shareScreen">
          {{ isScreenSharing ? '⏹️' : '🖥️' }}
        </button>
        <button @click="endCall" class="end-call">📞</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  name: 'VideoCall',
  props: {
    sessionId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const connected = ref(false);
    const audioEnabled = ref(true);
    const videoEnabled = ref(true);
    const isScreenSharing = ref(false);

    const initializeSession = async () => {
      try {
        // Join the session
        const response = await client.webrtc.joinSession(props.sessionId, {
          name: 'Current User',
          role: 'participant',
        });
        
        // Start the video call
        await client.webrtc.startVideoCall(props.sessionId);
        connected.value = true;
      } catch (error) {
        console.error('Failed to join session:', error);
      }
    };

    const toggleAudio = async () => {
      audioEnabled.value = !audioEnabled.value;
      await client.webrtc.toggleMedia(props.sessionId, 'audio', audioEnabled.value);
    };

    const toggleVideo = async () => {
      videoEnabled.value = !videoEnabled.value;
      await client.webrtc.toggleMedia(props.sessionId, 'video', videoEnabled.value);
    };

    const shareScreen = async () => {
      isScreenSharing.value = !isScreenSharing.value;
      await client.webrtc.shareScreen(props.sessionId, isScreenSharing.value);
    };

    const endCall = async () => {
      await client.webrtc.endVideoCall(props.sessionId);
      await client.webrtc.leaveSession(props.sessionId);
      connected.value = false;
    };

    onMounted(() => {
      if (props.sessionId) {
        initializeSession();
      }
    });

    onUnmounted(() => {
      if (connected.value) {
        endCall();
      }
    });

    return {
      connected,
      audioEnabled,
      videoEnabled,
      isScreenSharing,
      toggleAudio,
      toggleVideo,
      shareScreen,
      endCall,
    };
  },
};
</script>

<style scoped>
.video-call-container {
  height: 100vh;
  width: 100vw;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 18px;
}

.video-room {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.video-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 10px;
  padding: 10px;
  background: #000;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  background: #222;
}

.controls button {
  padding: 10px 20px;
  font-size: 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background: #444;
  color: white;
}

.controls button:hover {
  background: #555;
}

.controls button.muted,
.controls button.off {
  background: #900;
}

.controls button.end-call {
  background: #d00;
}
</style>
```

### Advanced Configuration

```javascript
// Advanced video session configuration
const sessionConfig = {
  title: 'Team Meeting',
  maxParticipants: 50,
  settings: {
    enableRecording: true,
    enableTranscription: true,
    enableChat: true,
    enableScreenShare: true,
    enableAI: true,
    videoQuality: 'high', // 'low', 'medium', 'high'
    audioQuality: 'high',
    layout: 'gallery', // 'gallery', 'speaker', 'presentation'
  },
};

// Create session with configuration
const session = await client.webrtc.createSession(sessionConfig);

// Join with specific role
const joinConfig = {
  name: 'John Doe',
  role: 'participant', // 'host', 'moderator', 'participant'
};

const joinResponse = await client.webrtc.joinSession(session.id, joinConfig);
console.log('Joined as participant:', joinResponse.participantId);
console.log('Connection ID:', joinResponse.connectionId);

// Start the video call (WebRTC handled internally)
await client.webrtc.startVideoCall(session.id);

// Toggle media controls
await client.webrtc.toggleMedia(session.id, 'audio', true);
await client.webrtc.toggleMedia(session.id, 'video', true);

// Share screen
await client.webrtc.shareScreen(session.id, true);
```

### Error Handling and Reconnection

```javascript
class RobustVideoCall {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.isConnected = false;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for connection state changes
    client.webrtc.on('connectionStateChanged', (state) => {
      console.log('Connection state:', state);
      
      switch (state) {
        case 'connecting':
          this.showConnectingUI();
          break;
        case 'connected':
          this.isConnected = true;
          this.hideConnectingUI();
          this.reconnectAttempts = 0;
          break;
        case 'reconnecting':
          this.showReconnectingUI();
          break;
        case 'disconnected':
          this.isConnected = false;
          this.handleDisconnection();
          break;
        case 'failed':
          this.showConnectionFailedUI();
          break;
      }
    });

    // Listen for participant events
    client.webrtc.on('participantJoined', (participant) => {
      console.log(`${participant.name} joined`);
      this.addParticipantToUI(participant);
    });

    client.webrtc.on('participantLeft', (participantId) => {
      console.log(`Participant ${participantId} left`);
      this.removeParticipantFromUI(participantId);
    });

    // Listen for media state changes
    client.webrtc.on('mediaStateChanged', (type, enabled, participantId) => {
      this.updateParticipantMedia(participantId, type, enabled);
    });
  }

  async connect() {
    try {
      // Join session
      const response = await client.webrtc.joinSession(this.sessionId, {
        name: 'User Name',
        role: 'participant',
      });
      
      // Start video call
      await client.webrtc.startVideoCall(this.sessionId);
      this.isConnected = true;
    } catch (error) {
      console.error('Connection failed:', error);
      this.handleConnectionError(error);
    }
  }

  async handleDisconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.reconnect();
      }, 2000 * this.reconnectAttempts); // Exponential backoff
    } else {
      this.showReconnectionFailedUI();
    }
  }

  async reconnect() {
    try {
      // Rejoin session
      await this.connect();
    } catch (error) {
      console.error('Reconnection failed:', error);
      this.handleDisconnection();
    }
  }

  handleConnectionError(error) {
    if (error.message.includes('permissions')) {
      this.showPermissionsError();
    } else if (error.message.includes('network')) {
      this.showNetworkError();
    } else {
      this.showGenericError(error.message);
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await client.webrtc.endVideoCall(this.sessionId);
      await client.webrtc.leaveSession(this.sessionId);
      this.isConnected = false;
    }
  }

  // UI update methods
  showConnectingUI() {
    document.getElementById('connecting-indicator').style.display = 'block';
  }

  hideConnectingUI() {
    document.getElementById('connecting-indicator').style.display = 'none';
  }

  showReconnectingUI() {
    document.getElementById('reconnecting-indicator').style.display = 'block';
  }

  showConnectionFailedUI() {
    document.getElementById('connection-failed').style.display = 'block';
  }

  showReconnectionFailedUI() {
    document.getElementById('reconnection-failed').style.display = 'block';
  }

  addParticipantToUI(participant) {
    // Add participant video element to DOM
  }

  removeParticipantFromUI(participantId) {
    // Remove participant video element from DOM
  }

  updateParticipantMedia(participantId, type, enabled) {
    // Update participant's audio/video state in UI
  }
}

// Usage
const videoCall = new RobustVideoCall('session-123');
await videoCall.connect();
```

### Important Notes

1. **Browser Permissions**: Ensure your application requests camera and microphone permissions before joining a session.

2. **HTTPS Required**: WebRTC requires HTTPS for production deployments.

3. **Token Expiration**: Tokens from AppAtOnce have an expiration time. Handle token refresh for long-running sessions.

4. **Network Handling**: Implement proper network error handling and reconnection logic.

5. **Mobile Considerations**: For mobile web, consider using lower video resolutions and frame rates to preserve battery and bandwidth.

#### Key Features
- **Multi-tenant Support** - Isolated video sessions per project/app
- **WebRTC Infrastructure** - Enterprise-grade video calling capabilities
- **Recording & Transcription** - Automatic recording with AI transcription
- **Real-time Messaging** - In-session chat and data channels
- **Analytics** - Detailed session metrics and quality tracking
- **Flexible Permissions** - Role-based participant controls
- **Multiple Session Types** - Instant, scheduled, webinar, broadcast

#### Example Usage
See [`webrtc-video-calling.js`](./examples/webrtc-video-calling.js) for a complete implementation example

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
- **Video Conferencing** - WebRTC-based video calling with built-in infrastructure

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

