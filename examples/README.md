# AppAtOnce SDK Examples

This directory contains examples demonstrating how to use the AppAtOnce SDK.

## Getting Started

### 1. Install Dependencies

First, make sure the SDK is built:

```bash
# From the node-sdk root directory
npm run build
```

Then install dependencies:

```bash
npm install dotenv
```

### 2. Configure Environment

Copy the example environment file and add your API key:

```bash
cp .env.example .env
```

Edit `.env` and add your actual API key:
```
APPATONCE_API_KEY=your_actual_api_key_here
```

### 3. Run Examples

#### AI Features Example
Demonstrates all AI capabilities including text generation, translation, code assistance, and more:

```bash
node ai-example.js
```

## Available Examples

### `ai-example.js`
Complete example demonstrating ALL 21 text-based AI features:

**Basic Text Features:**
- Text generation
- Chat conversations

**Content Creation:**
- Blog post generation
- Social media captions
- Content optimization
- Script generation
- Hashtag generation
- Content analysis
- Content idea generation

**Language Processing:**
- Translation
- Text summarization
- Writing enhancement
- Content moderation

**Code Assistance:**
- Code generation
- Code analysis

**Advanced Features:**
- Problem solving and reasoning
- Email reply generation
- Email subject optimization
- Entity extraction
- Sentiment analysis
- Keyword extraction

## Getting Your API Key

1. Sign up at [https://appatonce.com](https://appatonce.com)
2. Create a new project
3. Copy your API key from the project settings

## Troubleshooting

### "API key not set" Error
Make sure you've created a `.env` file with your API key.

### Connection Errors
- Make sure the AppAtOnce server is running
- The SDK uses the default URL configured in the package

### Authentication Errors
Ensure your API key is valid and has not expired.

## Need Help?

- Documentation: [https://docs.appatonce.com](https://docs.appatonce.com)
- Support: support@appatonce.com