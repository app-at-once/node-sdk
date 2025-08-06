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

#### Image & Media Generation

```javascript
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

#### Ready-to-Run Examples
- **[`comprehensive-test.js`](./examples/comprehensive-test.js)** - Complete test suite showcasing all database operations, new WHERE syntax, search, and error handling
- **[`search-test.js`](./examples/search-test.js)** - Text and semantic search functionality with full-text and vector search
- **[`realtime-test.js`](./examples/realtime-test.js)** - Real-time features: database subscriptions, pub/sub messaging, presence tracking
- **[`new-features-example.js`](./examples/new-features-example.js)** - Latest v2.0 features: payment processing, image/PDF processing, OCR, workflows
- **[`project-oauth-example.ts`](./examples/project-oauth-example.ts)** - OAuth integration with multiple providers (Google, GitHub, Facebook)
- **[`chatbot-example.js`](./examples/chatbot-example.js)** - Chatbot API documentation and usage guide
- **[`chatbot-browser-example.html`](./examples/chatbot-browser-example.html)** - Working browser chatbot example with live demo

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

