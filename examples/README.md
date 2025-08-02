# AppAtOnce SDK Examples

This directory contains comprehensive examples demonstrating the features of the AppAtOnce Node.js SDK v2.0.

## Prerequisites

Before running any examples, make sure you have:

1. **AppAtOnce API Key**: Your API key is automatically generated when you create a project in AppAtOnce:
   
   **Two ways to get your API key:**
   - **For Developers**: Visit [appatonce.com/login](https://appatonce.com/login) → Create Project → Copy API Key
   - **For No-Code Users**: Generate a complete app at [appatonce.com](https://appatonce.com) and get your API key with the project
   
   Set your API key as an environment variable:
   ```bash
   export APPATONCE_API_KEY=your_api_key_here
   ```

2. **Node.js**: Version 14 or higher

3. **Dependencies**: Install the required dependencies:
   ```bash
   # Install all dependencies including the SDK
   npm install
   
   # Or install manually:
   npm install @appatonce/node-sdk dotenv tsx
   ```

## Test Suites

### 1. Comprehensive Test (`comprehensive-test.js`)

A complete test suite demonstrating all SDK features including:

- Basic CRUD operations (Create, Read, Update, Delete)
- New intuitive `.where()` syntax
- Classic query methods
- Ordering and pagination
- Boolean value handling
- Error handling
- Search functionality

**Run the test:**
```bash
# Using npm scripts (recommended)
npm run test:comprehensive

# Or directly
node comprehensive-test.js
```

### 2. Search Test (`search-test.js`)

Focused test suite for search functionality including:

- Text search with highlighting
- Semantic (AI-powered) search
- Filtered search queries
- Search configuration status
- Creating and indexing test data

**Run the test:**
```bash
# Using npm scripts (recommended)
npm run test:search

# Or directly
node search-test.js
```

**Note**: For full search functionality, ensure text search and semantic search are configured on your AppAtOnce server.

### 3. Real-time Test (`realtime-test.js`)

Comprehensive real-time features test including:

- WebSocket connection management
- Database change subscriptions (INSERT/UPDATE/DELETE)
- Filtered subscriptions
- Channel-based pub/sub messaging
- Presence tracking for collaboration
- Workflow event monitoring
- Real-time analytics
- Auto-reconnection and error handling

**Run the test:**
```bash
# Using npm scripts (recommended)
npm run test:realtime

# Or directly
node realtime-test.js
```

**Note**: This test runs for 30 seconds to observe real-time events. Try making changes to workspaces in another client to see real-time updates!

## Environment Variables

All examples support the following environment variables:

- `APPATONCE_API_KEY` (required): Your AppAtOnce API key
- `APPATONCE_ENDPOINT` (optional): Server endpoint (default: http://localhost:8091)

## Using dotenv

The examples support loading environment variables from a `.env` file:

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your API key
# APPATONCE_API_KEY=your_api_key_here
```

Or create a `.env` file manually in the examples directory:

```env
APPATONCE_API_KEY=your_api_key_here
APPATONCE_ENDPOINT=http://localhost:8091
```

## Adapting for Your Schema

These examples use a generic "workspaces" table. To adapt for your schema:

1. Replace `'workspaces'` with your table name
2. Update the insert operations to include all required fields for your schema
3. Modify the query fields to match your table columns

## Common Issues

1. **"APPATONCE_API_KEY not found!"**
   - Set your API key as an environment variable or in a `.env` file

2. **"Cannot connect to server"**
   - Ensure your AppAtOnce server is running
   - Check the endpoint URL

3. **"Table not found"**
   - Make sure the table exists in your AppAtOnce instance
   - Check table name spelling

4. **Search not working**
   - Verify search services are configured
   - Check that search indexes are created for your tables

## Additional Examples

### 4. New Features Example (`new-features-example.js`)

Showcase of new features in AppAtOnce SDK v2.0 including:

- Payment processing with multiple providers
- Advanced image processing and transformation
- PDF generation from HTML
- OCR text extraction from images
- Document conversion between formats
- Enhanced workflow system with conditional logic
- New logic flow system with visual nodes
- Advanced trigger system (cron, events)

**Run the example:**
```bash
# Using npm scripts (recommended)
npm run test:new-features

# Or directly
node new-features-example.js
```

### 5. Project OAuth Example (`project-oauth-example.ts`)

TypeScript example demonstrating OAuth integration for your projects:

- Configure multiple OAuth providers (Google, GitHub, Facebook)
- Handle OAuth flows for end users
- Manage user sessions and authentication
- Express.js integration examples

**Run the example:**
```bash
# Using npm scripts (recommended)
npm run test:oauth

# Or directly with tsx
npx tsx project-oauth-example.ts
```

## Running Examples

### Quick Start with npm scripts
```bash
# Install dependencies
npm install

# Run all tests
npm run test:all

# Or run individual tests
npm run test:comprehensive  # Basic CRUD operations
npm run test:search        # Search functionality
npm run test:realtime      # Real-time features
npm run test:new-features  # v2.0 features
npm run test:oauth         # OAuth integration

# See all available scripts
npm run examples
```

### For Development (within this repository)
```bash
# From the examples directory
npm run test:comprehensive
npm run test:search
npm run test:realtime
npm run test:new-features
npm run test:oauth
```

### For External Projects (using the published package)
```bash
# Install the SDK and dependencies
npm install @appatonce/node-sdk dotenv tsx

# Copy any example file and run it
node comprehensive-test.js
```

**Note**: If you're working within this repository, the examples use a local reference to the SDK (`file:../`). For external projects, install the published package with `npm install @appatonce/node-sdk`.

## Contributing

Feel free to contribute additional examples or improvements to existing ones!