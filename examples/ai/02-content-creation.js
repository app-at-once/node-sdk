#!/usr/bin/env node

/**
 * Content Creation Features
 * 
 * Demonstrates:
 * - Blog post generation
 * - Social media captions
 * - Content optimization
 * - Script generation
 * - Hashtag generation
 * - Content analysis
 * - Content idea generation
 * 
 * Run: node ai/02-content-creation.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { AppAtOnceClient } = require('../../dist');

const API_KEY = process.env.APPATONCE_API_KEY;
if (!API_KEY) {
  console.error('❌ Please set APPATONCE_API_KEY in your .env file');
  process.exit(1);
}

const client = new AppAtOnceClient(API_KEY);

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
  console.log('🎨 CONTENT CREATION FEATURES\n');

  try {
    // 1. Blog Post Generation
    console.log('1. Generating blog post...');
    const blogPost = await client.ai.generateBlogPost(
      'The Future of Remote Work',
      {
        keywords: ['productivity', 'technology', 'work-life balance'],
        tone: 'professional',
        length: 'medium',
        seo_optimized: true
      }
    );
    printResult('Blog Post (preview)', (blogPost.blogPost || blogPost).substring(0, 500) + '...');

    // 2. Social Media Caption
    console.log('\n2. Generating LinkedIn caption...');
    const caption = await client.ai.generateCaption(
      'New product launch - AI-powered productivity tool',
      'linkedin',
      {
        tone: 'professional',
        include_hashtags: true
      }
    );
    printResult('LinkedIn Caption', caption.caption);

    // 3. Content Optimization
    console.log('\n3. Optimizing content...');
    const optimized = await client.ai.optimizeContent(
      'Check out our new app for tech enthusiasts!',
      'instagram',
      'caption',
      {
        targetAudience: 'tech enthusiasts',
        tone: 'exciting'
      }
    );
    printResult('Optimized Content', optimized.optimized);

    // 4. Script Generation
    console.log('\n4. Generating video script...');
    const script = await client.ai.generateScript(
      'video',
      'How to use AppAtOnce AI',
      {
        duration: 2, // 2 minutes
        audience: 'developers',
        style: 'tutorial'
      }
    );
    printResult('Video Script (preview)', script.script.substring(0, 500) + '...');

    // 5. Hashtag Generation
    console.log('\n5. Generating hashtags...');
    const hashtags = await client.ai.generateHashtags(
      'AI technology transforming business productivity',
      'linkedin',
      {
        count: 10,
        popularity: 'mixed'
      }
    );
    printResult('Generated Hashtags', Array.isArray(hashtags.hashtags) ? '#' + hashtags.hashtags.join(' #') : hashtags.hashtags);

    // 6. Content Analysis
    console.log('\n6. Analyzing content...');
    const contentAnalysis = await client.ai.analyzeContent(
      'Our new AI tool helps developers code faster and smarter!',
      'all'
    );
    printResult('Content Analysis', contentAnalysis);

    // 7. Content Ideas
    console.log('\n7. Generating content ideas...');
    const ideas = await client.ai.generateIdeas('artificial intelligence', 'blog', {
      count: 3,
      trending: true,
      audience: 'developers'
    });
    printResult('Content Ideas', ideas.ideas);

    console.log('\n✅ Content creation examples completed!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
  }
}

main();