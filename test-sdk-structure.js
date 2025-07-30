const { AppAtOnceClient } = require('./dist/index.js');

async function inspectSDKStructure() {
  console.log('Inspecting SDK structure...');
  
  const client = new AppAtOnceClient({
    baseUrl: 'http://localhost:8091',
    apiKey: 'process.env.APPATONCE_TEST_API_KEY || 'test-api-key''
  });

  console.log('\nClient properties:');
  console.log('Available modules:', Object.keys(client).filter(key => typeof client[key] === 'object' && client[key] !== null));
  
  console.log('\nMethods available on client:');
  console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(client)).filter(method => method !== 'constructor'));
  
  console.log('\nTesting client.table() method:');
  try {
    const tableBuilder = client.table('async_test_table');
    console.log('Table builder methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(tableBuilder)).filter(method => method !== 'constructor'));
  } catch (error) {
    console.error('Error with table() method:', error.message);
  }
  
  console.log('\nTesting client.insert() convenience method:');
  try {
    const result = await client.insert('async_test_table', {
      id: 1,
      name: 'Test Record'
    });
    console.log('✅ Insert result:', result);
  } catch (error) {
    console.error('❌ Insert error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

inspectSDKStructure();