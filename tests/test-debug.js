const { AppAtOnceClient } = require('../dist');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function debugTest() {
  const client = AppAtOnceClient.createWithApiKey(APP_API_KEY, BASE_URL);
  
  // Enable debug mode
  client.httpClient = new client.httpClient.constructor({
    apiKey: APP_API_KEY,
    baseUrl: BASE_URL,
    debug: true
  });
  
  try {
    // Try a simple table creation
    const result = await client.schema.createTable({
      name: 'test_simple',
      columns: [
        { name: 'id', type: 'integer', primaryKey: true },
        { name: 'name', type: 'text' }
      ]
    });
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
    console.error('Full error object:', JSON.stringify(error, null, 2));
  }
}

debugTest();