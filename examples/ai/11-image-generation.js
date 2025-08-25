const AppAtOnce = require('@appatonce/node-sdk');

// Initialize the client
const client = new AppAtOnce({
  apiKey: process.env.APPATONCE_API_KEY || 'YOUR_API_KEY',
});

async function demonstrateImageGeneration() {
  console.log('🎨 AppAtOnce Unified Image Service Examples\n');

  try {
    // 1. Basic Image Generation
    console.log('1. Generating a basic image...');
    const imageJob = await client.ai.generateImage(
      'A futuristic cityscape at sunset with flying cars and neon lights',
      {
        width: 1024,
        height: 1024,
        model: 'SDXL',
        steps: 30,
      }
    );
    console.log('Image generation job created:', imageJob);

    // 2. Wait for completion and check status
    console.log('\n2. Checking job status...');
    let jobStatus;
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      jobStatus = await client.ai.getImageJobStatus(imageJob.jobId);
      console.log(`Status: ${jobStatus.status} (${jobStatus.progress}%)`);

      if (jobStatus.status === 'completed' || jobStatus.status === 'failed') {
        break;
      }

      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }

    if (jobStatus.status === 'completed') {
      console.log('✅ Image generated successfully!');
      console.log('Image URL:', jobStatus.results.url);
      console.log('Cost:', jobStatus.results.cost);
      console.log('Processing time:', jobStatus.results.processingTime, 'ms');
    } else {
      console.log('❌ Image generation failed:', jobStatus.error);
    }

    // 3. Generate image with negative prompt
    console.log('\n3. Generating image with negative prompt...');
    const artJob = await client.ai.generateImage(
      'A serene mountain landscape with a crystal clear lake',
      {
        negativePrompt: 'people, buildings, cars, pollution',
        width: 1792,
        height: 1024,
        model: 'SD3',
        steps: 50,
        cfg: 7.5,
      }
    );
    console.log('Art generation job created:', artJob.jobId);

    // 4. Batch image generation
    console.log('\n4. Generating multiple images in batch...');
    const prompts = [
      'A cute robot assistant helping with cooking',
      'A magical forest with glowing mushrooms',
      'An underwater city with bioluminescent architecture',
    ];

    const batchJob = await client.ai.generateBatchImages(prompts, {
      width: 512,
      height: 512,
      model: 'SDXL',
      steps: 25,
    });
    console.log('Batch job created:', batchJob.jobId);
    console.log('Total images to generate:', batchJob.totalImages);

    // 5. Image upscaling
    console.log('\n5. Upscaling an image...');
    const upscaleResult = await client.ai.upscaleImage(
      'https://example.com/low-res-image.jpg',
      4, // 4x upscaling
      {
        method: 'real-esrgan',
      }
    );
    console.log('Upscale result:', upscaleResult);

    // 6. Background removal
    console.log('\n6. Removing background from an image...');
    const bgRemovalResult = await client.ai.removeBackground(
      'https://example.com/product-image.jpg',
      'project-123',
      'project'
    );
    console.log('Background removal result:', bgRemovalResult);

    // 7. Advanced generation with specific style
    console.log('\n7. Generating image with specific artistic style...');
    const styleJob = await client.ai.generateImage(
      'A portrait of a cyberpunk warrior',
      {
        model: 'FLUX.1',
        width: 768,
        height: 1024,
        steps: 40,
        cfg: 8,
        seed: 12345, // Use seed for reproducible results
        scheduler: 'DPMSolverMultistepScheduler',
      }
    );
    console.log('Style generation job created:', styleJob.jobId);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Helper function to display image generation tips
function displayTips() {
  console.log('\n💡 Image Generation Tips:');
  console.log('- Use descriptive prompts for better results');
  console.log('- Negative prompts help exclude unwanted elements');
  console.log('- Higher steps (30-50) generally produce better quality');
  console.log('- CFG scale (5-15) controls prompt adherence');
  console.log('- Use seeds for reproducible results');
  console.log('- SDXL model is best for general purposes');
  console.log('- SD3 offers improved quality for specific use cases');
  console.log('- FLUX.1 is great for artistic and creative outputs');
}

// Run the demonstration
(async () => {
  await demonstrateImageGeneration();
  displayTips();
})();