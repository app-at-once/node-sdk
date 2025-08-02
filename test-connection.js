#!/usr/bin/env node

const { AppAtOnceClient } = require('./dist/index.js');

// Test with local development
async function testConnection() {
  console.log('🚀 Testing AppAtOnce SDK connection...\n');
  
  // Use the environment variables or test values
  const apiKey = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
  const baseUrl = process.env.APPATONCE_TEST_BASE_URL || 'http://localhost:8091';
  
  console.log('Configuration:');
  console.log('- API Key:', apiKey ? 'Set' : 'Not set');
  console.log('- Base URL:', baseUrl);
  console.log('\n');

  try {
    // Create client with explicit base URL
    const client = AppAtOnceClient.createWithApiKey(apiKey, baseUrl);
    
    // Test schema endpoint
    console.log('Testing schema.listTables()...');
    const tables = await client.schema.listTables();
    console.log('✅ Connection successful!');
    console.log('Current tables:', tables);
    
    // Test ping endpoint
    console.log('\nTesting client.ping()...');
    try {
      const pingResponse = await client.ping();
      console.log('✅ Ping successful!');
      console.log('Server response:', pingResponse);
    } catch (error) {
      console.log('⚠️  Ping endpoint not available:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      response: error.response?.data || error.response
    });
  }
}

testConnection();