# How to Test the AI Example

## Quick Test Steps

1. **Navigate to examples directory:**
   ```bash
   cd /Users/islamnymul/DEVELOP/appatonce/node-sdk/examples
   ```

2. **Create your .env file:**
   ```bash
   cp .env.example .env
   ```

3. **Edit .env and add your API key:**
   ```bash
   # Open .env in your editor and replace 'your_api_key_here' with:
   APPATONCE_API_KEY=ey12JhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiJjbWRxZDRvbGwwMDAwczU1YzU4MzEwa3JoIiwicm9sZSI6ImFub24iLCJwZXJtaXNzaW9ucyI6WyJhdXRoLmxvZ2luIiwiYXV0aC5zaWdudXAiLCJhdXRoLnJlZnJlc2giLCJyZWFsdGltZS5zdWJzY3JpYmUiLCJzdG9yYWdlLnJlYWQiLCJkYXRhLnJlYWQiXX0.Q6WYdHELmeqy5FfF_cc8FEaXE1AYwnYw_KJqxPiWOHM
   ```

4. **Make sure the server is running:**
   ```bash
   # In the server directory
   cd /Users/islamnymul/DEVELOP/appatonce/server
   npm run start:dev
   ```

5. **Run the example:**
   ```bash
   # Back in the examples directory
   cd /Users/islamnymul/DEVELOP/appatonce/node-sdk/examples
   node ai-example.js
   ```

## What You Should See

The example will demonstrate:
1. ✨ Text Generation - A haiku about coding
2. ✨ Translation to Spanish - "Hello, how are you today?" translated
3. ✨ Text Summary - Brief summary of an AI text
4. ✨ Enhanced Writing - Grammar and tone improvements
5. ✨ Generated Code - JavaScript factorial function
6. ✨ Code Analysis - Analysis of a simple function
7. ✨ Content Ideas - 3 technology content ideas
8. ✨ Email Reply - Professional meeting acceptance
9. ✨ Sentiment Analysis - Positive sentiment detection
10. ✨ Chat Response - Benefits of TypeScript

## If Something Goes Wrong

### Error: "API key not set"
- Make sure you created the .env file
- Check that the API key is correctly copied

### Error: "Network error" or "ECONNREFUSED"
- Make sure the server is running on port 8091

### Error: "Unauthorized"
- The API key might be invalid
- Try using a fresh API key from your project

## Testing Different Features

You can modify `ai-example.js` to test specific features:

```javascript
// Test just translation
const result = await client.ai.translateText('Good morning', 'French');
console.log(result.translation);

// Test code generation with options
const code = await client.ai.generateCode(
  'REST API endpoint for user management',
  'Python',
  { framework: 'FastAPI' }
);
console.log(code.code);
```

## Files in This Directory

- `ai-example.js` - The main example file
- `.env.example` - Template for environment configuration
- `.env` - Your actual configuration (created by you, not in git)
- `README.md` - User-friendly documentation
- `.gitignore` - Ensures .env is not committed