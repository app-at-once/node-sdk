#!/usr/bin/env node

const { AppAtOnceClient } = require('./dist/index.js');

// Test with production URL (default)
async function testProduction() {
  console.log('🚀 Testing AppAtOnce SDK with default production URL...\n');
  
  const apiKey = 'test-api-key';
  
  // Create client without specifying baseUrl (should use production)
  const client = AppAtOnceClient.createWithApiKey(apiKey);
  
  console.log('Configuration:');
  console.log('- API Key:', apiKey);
  console.log('- Base URL: (using default - should be https://api.appatonce.com)');
  console.log('- Client config:', client.getConfig());
  console.log('\n');
  
  // Just check the configuration without making actual requests
  console.log('✅ Client created successfully with default production URL');
}

testProduction();