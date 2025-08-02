const { AppAtOnceClient } = require('./dist/index.js');

async function testAsyncTableCreation() {
  console.log('Testing async table creation...');
  
  const client = new AppAtOnceClient({
    baseUrl: 'http://localhost:8091',
    apiKey: 'process.env.APPATONCE_TEST_API_KEY || 'test-api-key''
  });

  try {
    // Test table creation
    console.log('\n1. Creating table with async processing...');
    const createResponse = await client.schema.createTable({
      name: 'async_test_table',
      columns: [
        { name: 'id', type: 'integer', primaryKey: true },
        { name: 'name', type: 'string', nullable: false },
        { name: 'created_at', type: 'timestamp', default: 'NOW()' }
      ]
    });
    
    console.log('✅ Table creation response:', JSON.stringify(createResponse, null, 2));
    
    if (createResponse.jobId) {
      console.log('\n2. Checking job status...');
      
      // Check status immediately
      let status = await client.schema.getTableCreationStatus(createResponse.jobId);
      console.log('📊 Initial status:', JSON.stringify(status, null, 2));
      
      // Poll for completion
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds timeout
      
      while (status.status === 'active' || status.status === 'waiting' || status.status === 'delayed') {
        if (attempts >= maxAttempts) {
          console.log('⚠️  Job taking too long, stopping polling');
          break;
        }
        
        console.log(`⏳ Job still processing (${status.status}), waiting 1 second...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        status = await client.schema.getTableCreationStatus(createResponse.jobId);
        attempts++;
      }
      
      console.log('\n3. Final job status:', JSON.stringify(status, null, 2));
      
      if (status.status === 'completed') {
        console.log('✅ Table creation completed successfully!');
        console.log('📋 Result:', JSON.stringify(status.result, null, 2));
      } else if (status.status === 'failed') {
        console.log('❌ Table creation failed:', status.error);
      }
    } else {
      console.log('⚠️  No jobId returned, might be synchronous response');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('📄 Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAsyncTableCreation();