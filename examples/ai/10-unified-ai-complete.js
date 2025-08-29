const AppAtOnce = require('@appatonce/node-sdk');

// Initialize the client
const client = new AppAtOnce({
  apiKey: process.env.APPATONCE_API_KEY || 'YOUR_API_KEY',
});

/**
 * Complete example demonstrating all unified AI services working together
 * This creates a multimedia content package with images, video, and audio
 */
async function createMultimediaContent() {
  console.log('🚀 AppAtOnce Unified AI Services - Complete Example\n');
  console.log('Creating a multimedia marketing package for a fictional product...\n');

  const productName = 'EcoBottle Pro';
  const productDescription = 'A smart water bottle that tracks hydration and reduces plastic waste';

  try {
    // Step 1: Generate product images
    console.log('📸 Step 1: Generating product images...');
    
    // Main product image
    const mainImageJob = await client.ai.generateImage(
      `A sleek, modern smart water bottle called ${productName} with LED indicators and eco-friendly design, professional product photography on white background`,
      {
        width: 1024,
        height: 1024,
        model: 'SDXL',
        negativePrompt: 'low quality, blurry, distorted',
        steps: 40,
      }
    );
    console.log('Main image job created:', mainImageJob.jobId);

    // Lifestyle image
    const lifestyleImageJob = await client.ai.generateImage(
      `Person using ${productName} smart water bottle during outdoor hiking, beautiful nature background, healthy lifestyle`,
      {
        width: 1792,
        height: 1024,
        model: 'SDXL',
        style: 'photorealistic',
      }
    );
    console.log('Lifestyle image job created:', lifestyleImageJob.jobId);

    // Step 2: Generate marketing video
    console.log('\n🎬 Step 2: Creating marketing video...');
    
    const videoScript = `Introducing ${productName} - the future of hydration. 
    This smart water bottle tracks your daily water intake, reminds you to stay hydrated, 
    and helps save the planet by reducing plastic waste. 
    With its sleek design and smart features, staying healthy has never been easier.`;

    const marketingVideoJob = await client.ai.generateVideo(
      `Product showcase video for ${productName}, showing the smart water bottle features, LED display, mobile app integration, and eco-friendly benefits`,
      {
        duration: 10,
        aspectRatio: '16:9',
        resolution: '1080p',
        style: 'realistic',
        voiceEnabled: true,
        voiceText: videoScript,
        voice: 'nova',
        voiceSpeed: 1.0,
        voiceProvider: 'openai',
      }
    );
    console.log('Marketing video job created:', marketingVideoJob.jobId);

    // Social media video (vertical)
    const socialVideoJob = await client.ai.generateVideo(
      `Quick demo of ${productName} smart water bottle features for social media`,
      {
        duration: 6,
        aspectRatio: '9:16',
        resolution: '720p',
        voiceEnabled: true,
        voiceText: `${productName} - Stay hydrated, save the planet! Track your water intake with our smart bottle.`,
        voice: 'shimmer',
        voiceSpeed: 1.2,
      }
    );
    console.log('Social media video job created:', socialVideoJob.jobId);

    // Step 3: Generate audio content
    console.log('\n🎵 Step 3: Creating audio content...');

    // Radio ad
    const radioAdJob = await client.ai.generateAudio(
      `Are you staying hydrated? Introducing ${productName}, the smart water bottle that cares about your health and the environment. With real-time hydration tracking, personalized reminders, and eco-friendly design, ${productName} is your perfect companion for a healthier lifestyle. Visit ecobottlepro.com to learn more.`,
      {
        voice: 'echo',
        provider: 'openai',
        speed: 1.05,
      }
    );
    console.log('Radio ad job created:', radioAdJob.jobId);

    // Podcast sponsorship
    const podcastSponsorJob = await client.ai.generateAudio(
      `This episode is brought to you by ${productName}. If you're looking to improve your hydration habits while reducing your environmental impact, ${productName} is the smart water bottle you've been waiting for. Use code PODCAST20 for 20% off your first order.`,
      {
        voice: 'onyx',
        provider: 'openai',
        speed: 1.0,
      }
    );
    console.log('Podcast sponsor message job created:', podcastSponsorJob.jobId);

    // Step 4: Create content in the content management system
    console.log('\n📝 Step 4: Storing content in CMS...');

    // Wait a bit for some jobs to complete
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check main image status
    const mainImageStatus = await client.ai.getImageJobStatus(mainImageJob.jobId);
    
    if (mainImageStatus.status === 'completed') {
      // Create content entry for the product
      const productContent = await client.content.create({
        resourceId: 'demo-project',
        resourceType: 'project',
        contentType: 'product',
        title: productName,
        content: {
          description: productDescription,
          mainImage: mainImageStatus.results.url,
          features: [
            'Smart hydration tracking',
            'Mobile app integration',
            'LED reminders',
            'Eco-friendly materials',
            'BPA-free construction',
          ],
          price: 79.99,
        },
        metadata: {
          aiGenerated: true,
          generatedJobs: {
            mainImage: mainImageJob.jobId,
            lifestyleImage: lifestyleImageJob.jobId,
            marketingVideo: marketingVideoJob.jobId,
            socialVideo: socialVideoJob.jobId,
            radioAd: radioAdJob.jobId,
            podcastSponsor: podcastSponsorJob.jobId,
          },
        },
        status: 'draft',
      });
      console.log('Product content created:', productContent.id);
    }

    // Step 5: Monitor all jobs
    console.log('\n📊 Step 5: Monitoring all job progress...');
    
    const allJobs = [
      { type: 'Image', id: mainImageJob.jobId, name: 'Main product image' },
      { type: 'Image', id: lifestyleImageJob.jobId, name: 'Lifestyle image' },
      { type: 'Video', id: marketingVideoJob.jobId, name: 'Marketing video' },
      { type: 'Video', id: socialVideoJob.jobId, name: 'Social media video' },
      { type: 'Audio', id: radioAdJob.jobId, name: 'Radio ad' },
      { type: 'Audio', id: podcastSponsorJob.jobId, name: 'Podcast sponsorship' },
    ];

    // Check status of all jobs
    for (const job of allJobs) {
      let status;
      
      switch (job.type) {
        case 'Image':
          status = await client.ai.getImageJobStatus(job.id);
          break;
        case 'Video':
          status = await client.ai.getVideoJobStatus(job.id);
          break;
        case 'Audio':
          status = await client.ai.getAudioJobStatus(job.id);
          break;
      }
      
      console.log(`${job.name}: ${status.status}`);
      
      if (status.status === 'completed' && status.results) {
        if (status.results.url || status.results.videoUrl) {
          console.log(`  URL: ${status.results.url || status.results.videoUrl}`);
        }
        if (status.results.cost) {
          console.log(`  Cost: $${status.results.cost}`);
        }
      }
    }

    // Summary
    console.log('\n✅ Multimedia content package created successfully!');
    console.log('\nGenerated assets:');
    console.log('- 2 product images (main + lifestyle)');
    console.log('- 2 videos (marketing + social media)');
    console.log('- 2 audio files (radio ad + podcast sponsor)');
    console.log('- 1 content entry in CMS');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Helper function to demonstrate batch operations
async function demonstrateBatchOperations() {
  console.log('\n\n🔄 Batch Operations Example\n');

  try {
    // Generate multiple product variations
    const productVariations = [
      'EcoBottle Pro in Arctic Blue color with matte finish',
      'EcoBottle Pro in Forest Green color with glossy finish',
      'EcoBottle Pro in Sunset Orange color with textured grip',
      'EcoBottle Pro in Midnight Black color with premium materials',
    ];

    const batchJob = await client.ai.generateBatchImages(productVariations, {
      width: 800,
      height: 800,
      model: 'SDXL',
      steps: 30,
    });

    console.log('Batch image generation started:', batchJob.jobId);
    console.log('Generating', batchJob.totalImages, 'product variations...');

  } catch (error) {
    console.error('Batch operation error:', error.message);
  }
}

// Main execution
(async () => {
  console.log('Starting unified AI services demonstration...\n');
  
  // Run the main multimedia content creation
  await createMultimediaContent();
  
  // Demonstrate batch operations
  await demonstrateBatchOperations();
  
  console.log('\n🎉 Demo completed! Check your AppAtOnce dashboard for all generated content.');
})();