# AppAtOnce Node.js SDK

Official Node.js SDK for [AppAtOnce](https://appatonce.com) - The Minimalistic AI-Powered Backend Platform.

[![npm version](https://badge.fury.io/js/%40appatonce%2Fsdk.svg)](https://www.npmjs.com/package/@appatonce/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
# Install from GitHub (recommended)
npm install github:app-at-once/node-sdk

# Or if published to npm in the future
npm install @appatonce/sdk
```

## Quick Start

```javascript
import { AppAtOnceClient } from '@appatonce/sdk';

// Initialize the client
const client = AppAtOnceClient.createWithApiKey('your-api-key');

// Create a record
const user = await client.data.create('users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// Query data
const users = await client.data.query('users')
  .where('age', '>', 18)
  .orderBy('created_at', 'desc')
  .limit(10)
  .execute();
```

## Features

- 🚀 **Simple API** - Intuitive methods for all backend operations
- 🔐 **Authentication** - Built-in auth with JWT tokens
- 📊 **Database Operations** - Full CRUD with advanced querying
- 📁 **File Storage** - Upload and manage files effortlessly
- 🔍 **Full-Text Search** - Powerful search capabilities
- 🤖 **AI Integration** - Built-in AI features for modern apps
- ⚡ **Real-time Updates** - WebSocket support for live data
- 📧 **Email Service** - Send transactional emails
- 🔄 **Offline Support** - Work offline and sync when connected

## Documentation

For comprehensive documentation, visit [docs.appatonce.com](https://docs.appatonce.com).

### Core Modules

- [Authentication](https://docs.appatonce.com/sdk/auth)
- [Data Operations](https://docs.appatonce.com/sdk/data)
- [File Storage](https://docs.appatonce.com/sdk/storage)
- [Search](https://docs.appatonce.com/sdk/search)
- [AI Features](https://docs.appatonce.com/sdk/ai)
- [Real-time](https://docs.appatonce.com/sdk/realtime)
- [Email](https://docs.appatonce.com/sdk/email)

## Basic Examples

### Authentication

```javascript
// Sign up
const { user, session } = await client.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  name: 'Jane Doe'
});

// Sign in
const session = await client.auth.signIn({
  email: 'user@example.com',
  password: 'secure-password'
});

// Get current user
const currentUser = await client.auth.getCurrentUser();

// Sign out
await client.auth.signOut();
```

### Data Operations

```javascript
// Create
const post = await client.data.create('posts', {
  title: 'Hello World',
  content: 'This is my first post'
});

// Read
const post = await client.data.get('posts', postId);

// Update
const updated = await client.data.update('posts', postId, {
  title: 'Updated Title'
});

// Delete
await client.data.delete('posts', postId);

// Query with filters
const posts = await client.data.query('posts')
  .where('status', '=', 'published')
  .where('views', '>', 100)
  .orderBy('created_at', 'desc')
  .limit(20)
  .execute();
```

### File Storage

```javascript
// Upload file
const file = await client.storage.upload({
  file: fileBlob,
  path: 'uploads/image.jpg'
});

// Get file URL
const url = client.storage.getUrl('uploads/image.jpg');

// Delete file
await client.storage.delete('uploads/image.jpg');
```

### Search

```javascript
// Search across tables
const results = await client.search.query('john doe', {
  tables: ['users', 'posts', 'comments'],
  limit: 50
});
```

### AI Features

```javascript
// Generate text
const response = await client.ai.generateText({
  prompt: 'Write a product description for a smart watch',
  maxTokens: 200
});

// Analyze sentiment
const sentiment = await client.ai.analyzeSentiment(
  'I love this product! It works great.'
);
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import { AppAtOnceClient, User, DataQuery } from '@appatonce/sdk';

const client = AppAtOnceClient.createWithApiKey('your-api-key');

// Typed responses
const user: User = await client.auth.getCurrentUser();

// Typed queries
const query: DataQuery<Post> = client.data.query<Post>('posts');
```

## Error Handling

```javascript
try {
  const data = await client.data.get('users', userId);
} catch (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('User not found');
  } else if (error.code === 'UNAUTHORIZED') {
    console.log('Not authorized');
  } else {
    console.error('Error:', error.message);
  }
}
```

## Requirements

- Node.js 18.0 or later
- npm, yarn, or pnpm

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Support

- 📚 [Documentation](https://docs.appatonce.com)
- 💬 [Discord Community](https://discord.gg/appatonce)
- 🐛 [Issue Tracker](https://github.com/app-at-once/node-sdk/issues)
- 📧 [Email Support](mailto:support@appatonce.com)

## License

This SDK is distributed under the [MIT License](LICENSE).

## Links

- [AppAtOnce Platform](https://appatonce.com)
- [API Reference](https://docs.appatonce.com/api)
- [Changelog](CHANGELOG.md)
- [npm Package](https://www.npmjs.com/package/@appatonce/sdk)