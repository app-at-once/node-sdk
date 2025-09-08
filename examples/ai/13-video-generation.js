const AppAtOnce = require('@appatonce/node-sdk');

// Initialize the client
const client = new AppAtOnce({
  apiKey: process.env.APPATONCE_API_KEY || 'YOUR_API_KEY',
});

async function demonstrateVideoGeneration() {
  console.log('🎬 AppAtOnce Unified Video Service Examples\n');

  try {
    // 1. Basic Video Generation (Silent)
    console.log('1. Generating a basic silent video...');
    const basicVideo = await client.ai.generateVideo(
      'A time-lapse of a flower blooming in a sunny garden',
      {
        duration: 6, // 6 seconds
        aspectRatio: '16:9',
        resolution: '1080p',
        style: 'realistic',
      }
    );
    console.log('Video generation job created:', basicVideo);

    // 2. Video with AI Narration
    console.log('\n2. Generating video with AI narration...');
    const narratedVideo = await client.ai.generateVideo(
      'A tour of a modern smart home showcasing automated features',
      {
        duration: 10,
        aspectRatio: '16:9',
        resolution: '1080p',
        voiceEnabled: true,
        voiceText: 'Welcome to the future of living. This smart home features automated lighting, climate control, and security systems that adapt to your lifestyle.',
        voice: 'nova', // Female voice
        voiceSpeed: 1.0,
        voiceProvider: 'openai',
      }
    );
    console.log('Narrated video job created:', narratedVideo.jobId);

    // 3. Check video generation status
    console.log('\n3. Monitoring video generation progress...');
    let videoStatus;
    let attempts = 0;
    const maxAttempts = 60; // Videos take longer to generate

    while (attempts < maxAttempts) {
      videoStatus = await client.ai.getVideoJobStatus(narratedVideo.jobId);
      console.log(`Status: ${videoStatus.status} (${videoStatus.progress}%)`);

      if (videoStatus.status === 'completed' || videoStatus.status === 'failed') {
        break;
      }

      // Wait 5 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    if (videoStatus.status === 'completed') {
      console.log('✅ Video generated successfully!');
      console.log('Video URL:', videoStatus.results.videoUrl);
      if (videoStatus.results.audioUrl) {
        console.log('Audio URL:', videoStatus.results.audioUrl);
      }
      console.log('Duration:', videoStatus.results.duration, 'seconds');
      console.log('Cost:', videoStatus.results.cost);
      console.log('Processing time:', videoStatus.results.processingTime, 'ms');
    } else {
      console.log('❌ Video generation failed:', videoStatus.error);
    }

    // 4. Vertical video for social media
    console.log('\n4. Generating vertical video for social media...');
    const socialVideo = await client.ai.generateVideo(
      'A quick recipe tutorial for making chocolate chip cookies',
      {
        duration: 6,
        aspectRatio: '9:16', // Vertical for TikTok/Instagram
        resolution: '720p',
        style: 'animated',
        voiceEnabled: true,
        voice: 'alloy',
        voiceSpeed: 1.2, // Slightly faster for social media
      }
    );
    console.log('Social media video job created:', socialVideo.jobId);

    // 5. Get available video pipelines
    console.log('\n5. Fetching available video pipelines...');
    const pipelines = await client.ai.getVideoPipelines();
    console.log('Available pipelines:');
    pipelines.forEach(pipeline => {
      console.log(`- ${pipeline.name} (${pipeline.id})`);
      console.log(`  Features: ${pipeline.features.join(', ')}`);
    });

    // 6. Artistic video with custom voice
    console.log('\n6. Generating artistic video with ElevenLabs voice...');
    const artisticVideo = await client.ai.generateVideo(
      'An abstract visualization of music flowing through space',
      {
        duration: 10,
        aspectRatio: '1:1', // Square format
        style: 'artistic',
        voiceEnabled: true,
        voiceText: 'Experience the symphony of colors as sound waves dance through the cosmic void.',
        voiceProvider: 'elevenlabs',
        // Note: You'll need to specify a valid ElevenLabs voice ID
        voice: 'your-elevenlabs-voice-id',
      }
    );
    console.log('Artistic video job created:', artisticVideo.jobId);

    // 7. Video with specific technical parameters
    console.log('\n7. Generating video with technical specifications...');
    const technicalVideo = await client.ai.generateVideo(
      'A detailed explanation of how blockchain technology works',
      {
        duration: 10,
        resolution: '1080p',
        fps: 30,
        seed: 54321, // For reproducible results
        model: 'hailuo-v1', // Specific model if available
        provider: 'runware', // Primary provider
      }
    );
    console.log('Technical video job created:', technicalVideo.jobId);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Helper function to display video generation tips
function displayVideoTips() {
  console.log('\n💡 Video Generation Tips:');
  console.log('- Keep prompts clear and descriptive for better results');
  console.log('- 6-second videos generate faster than 10-second ones');
  console.log('- Add narration to make videos more engaging');
  console.log('- Choose aspect ratio based on platform (16:9 for YouTube, 9:16 for TikTok)');
  console.log('- OpenAI voices are consistent and clear');
  console.log('- ElevenLabs offers more natural-sounding voices');
  console.log('- Use seeds for reproducible video generation');
  console.log('- Videos typically take 2-5 minutes to generate');
}

// Run the demonstration
(async () => {
  await demonstrateVideoGeneration();
  displayVideoTips();
})();