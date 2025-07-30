const { AppAtOnceClient } = require('../dist');

const client = AppAtOnceClient.createWithApiKey(
  'your-api-key-here',
  'http://localhost:3000'
);

async function aiIntegrationExample() {
  try {
    // Text generation
    const textResponse = await client.ai.generateText(
      'Write a product description for a smart water bottle',
      {
        model: 'llama3.2',
        max_tokens: 200,
        temperature: 0.7,
      }
    );
    console.log('Generated text:', textResponse.content);

    // Chat completion
    const chatResponse = await client.ai.chat([
      { role: 'system', content: 'You are a helpful assistant that writes marketing copy.' },
      { role: 'user', content: 'Create a catchy slogan for a sustainable fashion brand' },
    ]);
    console.log('Chat response:', chatResponse.content);

    // Generate embeddings
    const embeddings = await client.ai.generateEmbeddings([
      'Sustainable fashion for the modern world',
      'Eco-friendly clothing that makes a statement',
      'Style that doesn\'t cost the earth',
    ]);
    console.log('Embeddings generated:', embeddings.data.length);

    // Content generation
    const blogPost = await client.ai.generateBlogPost(
      'The Future of Sustainable Fashion',
      {
        tone: 'professional',
        length: 'medium',
        keywords: ['sustainability', 'fashion', 'environment'],
        seo_optimized: true,
      }
    );
    console.log('Blog post:', {
      title: blogPost.title,
      wordCount: blogPost.content.split(' ').length,
      tags: blogPost.tags,
    });

    // Image generation
    const imageResponse = await client.ai.generateImage(
      'A minimalist sustainable fashion store with natural lighting',
      {
        style: 'photographic',
        size: '1024x1024',
        quality: 'hd',
      }
    );
    console.log('Generated image:', imageResponse.images[0].url);

    // Content analysis
    const analysis = await client.ai.analyzeContent(
      blogPost.content,
      'all'
    );
    console.log('Content analysis:', {
      sentiment: analysis.sentiment?.label,
      readabilityScore: analysis.readability?.score,
      seoScore: analysis.seo?.score,
    });

    // Generate hashtags
    const hashtags = await client.ai.generateHashtags(
      'Sustainable fashion collection launching next month',
      'instagram',
      {
        count: 10,
        popularity: 'trending',
      }
    );
    console.log('Generated hashtags:', hashtags.hashtags);

    // Content optimization
    const optimized = await client.ai.optimizeContent(
      'Check out our new clothes. They are good for the environment.',
      'engagement',
      {
        target_audience: 'millennials interested in sustainability',
        tone: 'enthusiastic',
      }
    );
    console.log('Optimized content:', optimized.optimized_content);
    console.log('Improvements:', optimized.improvements);

    // Voice generation
    const audioResponse = await client.ai.generateAudio(
      'Welcome to our sustainable fashion collection',
      {
        voice: 'nova',
        model: 'tts-1',
        response_format: 'mp3',
      }
    );
    console.log('Generated audio:', audioResponse.audio_url);

    // Get AI service status
    const serviceStatus = await client.ai.getServiceStatus();
    console.log('AI services status:', serviceStatus.status);
    console.log('Available models:', serviceStatus.services.ollama.models);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
aiIntegrationExample();