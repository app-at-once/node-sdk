const AppAtOnce = require('@appatonce/node-sdk');

// Initialize the client
const client = new AppAtOnce({
  apiKey: process.env.APPATONCE_API_KEY || 'YOUR_API_KEY',
});

async function demonstrateAudioGeneration() {
  console.log('🎵 AppAtOnce Unified Audio Service Examples\n');

  try {
    // 1. Basic Text-to-Speech with OpenAI
    console.log('1. Generating basic text-to-speech...');
    const basicTTS = await client.ai.generateAudio(
      'Welcome to AppAtOnce! We make AI integration simple and powerful.',
      {
        voice: 'alloy',
        provider: 'openai',
        speed: 1.0,
      }
    );
    console.log('TTS job created:', basicTTS);

    // 2. Check audio generation status
    console.log('\n2. Checking audio generation status...');
    let audioStatus;
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      audioStatus = await client.ai.getAudioJobStatus(basicTTS.jobId);
      console.log(`Status: ${audioStatus.status}`);

      if (audioStatus.status === 'completed' || audioStatus.status === 'failed') {
        break;
      }

      // Wait 1 second before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    if (audioStatus.status === 'completed') {
      console.log('✅ Audio generated successfully!');
      console.log('Audio URL:', audioStatus.results.url);
      console.log('Content ID:', audioStatus.results.contentId);
      console.log('Voice used:', audioStatus.results.metadata.voice);
    } else {
      console.log('❌ Audio generation failed:', audioStatus.error);
    }

    // 3. Generate audio with different OpenAI voices
    console.log('\n3. Testing different OpenAI voices...');
    const voices = ['nova', 'echo', 'fable', 'onyx', 'shimmer'];
    
    for (const voice of voices) {
      const voiceJob = await client.ai.generateAudio(
        `This is a sample of the ${voice} voice from OpenAI.`,
        {
          voice: voice,
          provider: 'openai',
          model: 'tts-1-hd', // High quality model
        }
      );
      console.log(`- ${voice} voice job created:`, voiceJob.jobId);
    }

    // 4. Generate audio with speed variations
    console.log('\n4. Generating audio with different speeds...');
    const speedVariations = [
      { speed: 0.5, description: 'Half speed (very slow)' },
      { speed: 0.75, description: 'Slower' },
      { speed: 1.0, description: 'Normal speed' },
      { speed: 1.25, description: 'Faster' },
      { speed: 2.0, description: 'Double speed' },
    ];

    for (const variant of speedVariations) {
      const speedJob = await client.ai.generateAudio(
        'The quick brown fox jumps over the lazy dog.',
        {
          voice: 'nova',
          provider: 'openai',
          speed: variant.speed,
        }
      );
      console.log(`- ${variant.description} job:`, speedJob.jobId);
    }

    // 5. Get available voices
    console.log('\n5. Fetching available voices...');
    
    // OpenAI voices
    const openAIVoices = await client.ai.getAudioVoices('openai');
    console.log('\nOpenAI Voices:');
    openAIVoices.voices.forEach(voice => {
      console.log(`- ${voice.name} (${voice.id}) - ${voice.gender || 'neutral'}`);
    });

    // ElevenLabs voices (if configured)
    try {
      const elevenLabsVoices = await client.ai.getAudioVoices('elevenlabs');
      console.log('\nElevenLabs Voices:');
      elevenLabsVoices.voices.forEach(voice => {
        console.log(`- ${voice.name} (${voice.id})`);
        if (voice.labels) {
          console.log(`  Labels: ${JSON.stringify(voice.labels)}`);
        }
      });
    } catch (e) {
      console.log('\nElevenLabs not configured or available');
    }

    // 6. Generate audio for different use cases
    console.log('\n6. Generating audio for various use cases...');

    // Audiobook narration
    const audiobookJob = await client.ai.generateAudio(
      `Chapter One. It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions.`,
      {
        voice: 'fable', // Good for narration
        provider: 'openai',
        speed: 0.9, // Slightly slower for audiobooks
      }
    );
    console.log('Audiobook narration job:', audiobookJob.jobId);

    // Podcast intro
    const podcastJob = await client.ai.generateAudio(
      `Welcome to Tech Talks Daily, the podcast where we explore the latest innovations in technology. I'm your host, and today we're diving deep into the world of artificial intelligence.`,
      {
        voice: 'echo', // Male voice good for podcasts
        provider: 'openai',
        speed: 1.1, // Slightly faster for energy
      }
    );
    console.log('Podcast intro job:', podcastJob.jobId);

    // Educational content
    const educationJob = await client.ai.generateAudio(
      `Today's lesson covers the water cycle. Water evaporates from oceans, lakes, and rivers. It rises into the atmosphere where it cools and condenses into clouds. Eventually, it falls back to Earth as precipitation.`,
      {
        voice: 'nova', // Clear female voice for education
        provider: 'openai',
        speed: 0.95, // Slightly slower for clarity
      }
    );
    console.log('Educational content job:', educationJob.jobId);

    // Voice assistant response
    const assistantJob = await client.ai.generateAudio(
      `I've scheduled your meeting for tomorrow at 2 PM. Would you like me to send a calendar invitation to all participants?`,
      {
        voice: 'shimmer', // Friendly assistant voice
        provider: 'openai',
        speed: 1.05,
      }
    );
    console.log('Voice assistant job:', assistantJob.jobId);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Helper function to display audio generation tips
function displayAudioTips() {
  console.log('\n💡 Audio Generation Tips:');
  console.log('- OpenAI offers 6 distinct voices with different characteristics');
  console.log('- Use "nova" or "shimmer" for friendly, approachable content');
  console.log('- Use "echo" or "onyx" for professional, authoritative content');
  console.log('- Use "alloy" for neutral, versatile applications');
  console.log('- Use "fable" for storytelling and narration');
  console.log('- Adjust speed between 0.25 and 4.0 (1.0 is normal)');
  console.log('- tts-1 model is faster, tts-1-hd offers higher quality');
  console.log('- ElevenLabs provides more natural voices but requires additional setup');
  console.log('- Audio files are automatically stored in your content library');
}

// Run the demonstration
(async () => {
  await demonstrateAudioGeneration();
  displayAudioTips();
})();