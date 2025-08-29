# AI Examples

This directory contains separate examples for each AI feature category. Each file demonstrates specific AI capabilities without timeouts.

## Prerequisites

1. Make sure you have built the SDK:
```bash
cd ../.. && npm run build
```

2. Create a `.env` file in the examples directory:
```bash
cd .. && cp .env.example .env
```

3. Add your API key to the `.env` file

## Running Examples

Each example can be run independently:

### Text-Based AI Features (01-08)

#### 1. Text Generation
Basic text generation and chat conversations.
```bash
node ai/01-text-generation.js
```

#### 2. Content Creation
Blog posts, captions, scripts, hashtags, and content optimization.
```bash
node ai/02-content-creation.js
```

#### 3. Language Processing
Translation, summarization, writing enhancement, and moderation.
```bash
node ai/03-language-processing.js
```

#### 4. Code Assistance
Code generation and analysis for multiple languages.
```bash
node ai/04-code-assistance.js
```

#### 5. Reasoning & Problem Solving
Mathematical problems, logic puzzles, and step-by-step solutions.
```bash
node ai/05-reasoning-solving.js
```

#### 6. Email Intelligence
Email reply generation and subject line optimization.
```bash
node ai/06-email-intelligence.js
```

#### 7. Natural Language Processing
Entity extraction, sentiment analysis, and keyword extraction.
```bash
node ai/07-nlp-features.js
```

#### 8. Embeddings
Generate text embeddings for similarity comparison and semantic search.
```bash
node ai/08-embeddings.js
```

### Unified AI Features (10-13)

#### 10. Unified AI Complete Example
Comprehensive example showing all AI capabilities in one file.
```bash
node ai/10-unified-ai-complete.js
```

#### 11. Image Generation
AI-powered image generation from text prompts.
```bash
node ai/11-image-generation.js
```

#### 12. Audio Generation
AI-powered audio generation and text-to-speech.
```bash
node ai/12-audio-generation.js
```

#### 13. Video Generation
AI-powered video generation from text prompts.
```bash
node ai/13-video-generation.js
```

## Quick Test All

To run all examples sequentially:
```bash
node ai/run-all.js
```

## Features by Category

### Text-Based AI Features

| Category | Features | Example File |
|----------|----------|--------------|
| **Text Generation** | Text generation, Chat (single/multi-turn) | 01-text-generation.js |
| **Content Creation** | Blog posts, Captions, Scripts, Hashtags, Analysis, Ideas, Optimization | 02-content-creation.js |
| **Language Processing** | Translation, Summarization, Enhancement, Moderation | 03-language-processing.js |
| **Code Assistance** | Code generation, Code analysis | 04-code-assistance.js |
| **Reasoning** | Problem solving, Step-by-step explanations | 05-reasoning-solving.js |
| **Email** | Reply generation, Subject optimization | 06-email-intelligence.js |
| **NLP** | Entity extraction, Sentiment analysis, Keywords | 07-nlp-features.js |
| **Embeddings** | Text embeddings, Similarity comparison | 08-embeddings.js |

### Multimedia AI Features

| Category | Features | Example File |
|----------|----------|--------------|
| **Unified Example** | All AI features in one comprehensive example | 10-unified-ai-complete.js |
| **Image Generation** | Text-to-image, Style transfer, Image editing | 11-image-generation.js |
| **Audio Generation** | Text-to-speech, Voice synthesis, Audio effects | 12-audio-generation.js |
| **Video Generation** | Text-to-video, Video editing, Animation | 13-video-generation.js |

## Tips

- Each example is self-contained and can be modified independently
- Examples include error handling and detailed output
- Response times may vary based on the complexity of the operation
- Some features may have token limits or rate limits

## Troubleshooting

If you encounter errors:

1. **API Key Issues**: Ensure your API key is correctly set in `.env`
2. **Connection Errors**: Verify the server is running on port 8091
3. **Timeout Issues**: These examples are designed to avoid timeouts by focusing on specific features
4. **Response Format Issues**: The examples handle various response formats from the server

## Adding New Examples

To add a new AI feature example:

1. Create a new file following the naming pattern: `XX-feature-name.js`
2. Use the same structure as existing examples
3. Include proper error handling
4. Update this README with the new example