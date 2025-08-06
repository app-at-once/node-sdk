#!/usr/bin/env node

/**
 * AppAtOnce AI Features - Complete Example
 * 
 * This example demonstrates ALL text-based AI features including:
 * - Text generation and chat
 * - Content creation (blog posts, captions, scripts)
 * - Translation and summarization
 * - Writing enhancement and moderation
 * - Code generation and analysis
 * - Email intelligence
 * - Natural language processing
 * - Problem solving and reasoning
 * 
 * Setup:
 * 1. Copy .env.example to .env
 * 2. Add your API key to .env
 * 3. Run: node ai-example.js
 */

require('dotenv').config();
const { AppAtOnceClient } = require('../dist');

// Configuration from environment
const API_KEY = process.env.APPATONCE_API_KEY;

if (!API_KEY) {
  console.error('❌ Please set APPATONCE_API_KEY in your .env file');
  console.error('   Copy .env.example to .env and add your API key');
  process.exit(1);
}

// Initialize client
const client = new AppAtOnceClient(API_KEY);

// Helper to print results
function printResult(title, result) {
  console.log(`\n✨ ${title}`);
  console.log('─'.repeat(50));
  if (typeof result === 'object') {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(result);
  }
}

async function main() {
  console.log('🚀 AppAtOnce AI Features - Complete Example\n');
  console.log('This demonstrates ALL text-based AI capabilities.\n');

  try {
    // ========== BASIC TEXT FEATURES ==========
    console.log('\n📝 BASIC TEXT FEATURES');
    console.log('═'.repeat(50));

    // 1. Text Generation
    const generated = await client.ai.generateText('Write a motivational quote about learning');
    printResult('Text Generation', generated.result);

    // 2. Chat Conversation (Build Your Own Chat)
    // Note: For a ready-made chat UI, use our embedded chatbot widget
    const chatResponse = await client.ai.chat([
      { role: 'system', content: 'You are a helpful coding assistant.' },
      { role: 'user', content: 'What is the difference between let and const in JavaScript?' }
    ]);
    printResult('Chat Response', chatResponse.result);

    // Example: Multi-turn conversation
    const conversation = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'What is Node.js?' },
      { role: 'assistant', content: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine...' },
      { role: 'user', content: 'What are its main use cases?' }
    ];
    const followUp = await client.ai.chat(conversation);
    printResult('Multi-turn Chat', followUp.result);

    // ========== CONTENT CREATION ==========
    console.log('\n\n🎨 CONTENT CREATION');
    console.log('═'.repeat(50));

    // 3. Blog Post Generation
    const blogPost = await client.ai.generateBlogPost(
      'The Future of Remote Work',
      {
        keywords: ['productivity', 'technology', 'work-life balance'],
        tone: 'professional',
        length: 'medium',
        seo_optimized: true
      }
    );
    printResult('Blog Post (preview)', (blogPost.blogPost || blogPost.content || blogPost).substring(0, 300) + '...');

    // 4. Social Media Caption
    const caption = await client.ai.generateCaption(
      'New product launch - AI-powered productivity tool',
      'linkedin',
      {
        tone: 'professional',
        include_hashtags: true
      }
    );
    printResult('LinkedIn Caption', caption.caption);

    // 5. Content Optimization  
    const optimized = await client.ai.optimizeContent(
      'Check out our new app for tech enthusiasts! Join thousands of developers already using our platform.',
      'instagram',
      'caption',
      {
        targetAudience: 'tech enthusiasts',
        tone: 'exciting'
      }
    );
    printResult('Optimized Content', optimized.optimized || optimized);

    // 6. Script Generation
    const script = await client.ai.generateScript(
      'video',
      'How to use AppAtOnce AI',
      {
        duration: 2, // 2 minutes
        audience: 'developers',
        style: 'tutorial'
      }
    );
    printResult('Video Script (preview)', script.script.substring(0, 300) + '...');

    // 7. Hashtag Generation
    const hashtags = await client.ai.generateHashtags(
      'AI technology transforming business productivity',
      'linkedin',
      {
        count: 10,
        popularity: 'mixed'
      }
    );
    printResult('Generated Hashtags', Array.isArray(hashtags.hashtags) ? '#' + hashtags.hashtags.join(' #') : hashtags.hashtags || hashtags);

    // 8. Content Analysis
    const contentAnalysis = await client.ai.analyzeContent(
      'Our new AI tool helps developers code faster and smarter!',
      'all'
    );
    printResult('Content Analysis', contentAnalysis);

    // 9. Content Ideas
    const ideas = await client.ai.generateIdeas('artificial intelligence', 'blog', {
      count: 3,
      trending: true
    });
    printResult('Content Ideas', ideas.ideas);

    // ========== LANGUAGE PROCESSING ==========
    console.log('\n\n🌐 LANGUAGE PROCESSING');
    console.log('═'.repeat(50));

    // 10. Translation
    const translation = await client.ai.translateText(
      'Artificial intelligence is changing the world',
      'Spanish'
    );
    printResult('Spanish Translation', translation.translation);

    // 11. Text Summarization
    const longText = `
      Artificial intelligence is rapidly transforming various industries. 
      From healthcare to finance, AI applications are improving efficiency 
      and decision-making. Machine learning algorithms can analyze vast 
      amounts of data to identify patterns humans might miss. This leads
      to better predictions, personalized experiences, and automated processes
      that save time and resources.
    `;
    const summary = await client.ai.summarizeText(longText, {
      style: 'bullet',
      maxLength: 100
    });
    printResult('Bullet Point Summary', summary.summary);

    // 12. Writing Enhancement
    const roughDraft = 'this is very importnt announcement about our new prodct launch';
    const enhanced = await client.ai.enhanceWriting(roughDraft, {
      tone: 'professional',
      style: 'formal',
      purpose: 'announcement',
      fixGrammar: true
    });
    printResult('Enhanced Writing', enhanced);

    // 13. Content Moderation
    const moderation = await client.ai.moderateContent(
      'This is a friendly message about our community guidelines.'
    );
    printResult('Content Moderation', moderation);

    // ========== CODE ASSISTANCE ==========
    console.log('\n\n💻 CODE ASSISTANCE');
    console.log('═'.repeat(50));

    // 14. Code Generation
    const code = await client.ai.generateCode(
      'REST API endpoint for user authentication',
      'Python',
      { framework: 'FastAPI' }
    );
    printResult('Generated Code', code.code);

    // 15. Code Analysis
    const codeToAnalyze = `
      def fibonacci(n):
          if n <= 1:
              return n
          return fibonacci(n-1) + fibonacci(n-2)
    `;
    const analysis = await client.ai.analyzeCode(codeToAnalyze, 'Python');
    printResult('Code Analysis', analysis);

    // ========== REASONING & PROBLEM SOLVING ==========
    console.log('\n\n🧠 REASONING & PROBLEM SOLVING');
    console.log('═'.repeat(50));

    // 16. Problem Solving
    const solution = await client.ai.solveReasoning(
      'If a store offers 25% off on a $80 item, and then an additional 10% off the discounted price, what is the final price?',
      { stepByStep: true }
    );
    printResult('Problem Solution', solution);

    // ========== EMAIL INTELLIGENCE ==========
    console.log('\n\n📧 EMAIL INTELLIGENCE');
    console.log('═'.repeat(50));

    // 17. Email Reply Generation
    const originalEmail = `
      Hi team,
      I wanted to check on the status of the Q4 project. Are we still on track
      for the December 15th deadline? Please let me know if you need any resources.
      Best regards,
      John
    `;
    const reply = await client.ai.generateEmailReply(
      originalEmail,
      'Confirming project is on track with minor delay',
      'professional'
    );
    printResult('Email Reply', reply.reply);

    // 18. Email Subject Optimization
    const subjects = await client.ai.optimizeEmailSubject(
      'Meeting about the new project proposal',
      'business'
    );
    printResult('Optimized Email Subjects', subjects.subjects);

    // ========== NATURAL LANGUAGE PROCESSING ==========
    console.log('\n\n🔍 NATURAL LANGUAGE PROCESSING');
    console.log('═'.repeat(50));

    // 19. Entity Extraction
    const textWithEntities = 'Apple CEO Tim Cook announced the new iPhone 15 in Cupertino on September 12, 2024.';
    const entities = await client.ai.extractEntities(textWithEntities);
    printResult('Extracted Entities', entities);

    // 20. Sentiment Analysis
    const sentimentText = 'I absolutely love this product! It exceeded all my expectations.';
    const sentiment = await client.ai.analyzeSentiment(sentimentText);
    printResult('Sentiment Analysis', sentiment);

    // 21. Keyword Extraction
    const keywordText = `
      Machine learning is a subset of artificial intelligence that enables 
      systems to learn and improve from experience without being explicitly 
      programmed. Deep learning models use neural networks to process data.
    `;
    const keywords = await client.ai.extractKeywords(keywordText, 5);
    printResult('Extracted Keywords', keywords.keywords);

    console.log('\n\n✅ All AI features demonstrated successfully!');
    console.log('\n💡 Tips:');
    console.log('- Modify these examples to fit your use case');
    console.log('- Check the API documentation for more options');
    console.log('- Response times may vary based on complexity');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
    if (error.code === 'ECONNREFUSED') {
      console.error('\n🔌 Connection refused. The server might not be running.');
      console.error('Make sure the server is running on http://localhost:8091');
    }
    console.error('\n💡 Troubleshooting:');
    console.error('- Ensure your API key is valid');
    console.error('- Check that the server is running on port 8091');
    console.error('- API endpoint:', error.config?.url || 'Unknown');
  }
}

// Run the example
main();