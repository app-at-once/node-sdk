const { AppAtOnceClient } = require('./dist/index.js');

async function testCreateProjectAndTable() {
  console.log('Testing project creation and async table creation...');
  
  // First create client without API key to create a project
  const clientWithoutKey = new AppAtOnceClient({
    baseUrl: 'http://localhost:8091'
  });

  try {
    // 1. Create a project first
    console.log('\n1. Creating a new project...');
    const projectResponse = await clientWithoutKey.projects.create({
      name: 'Async Test Project',
      description: 'Project for testing async table creation',
      database: {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'your-password-here',
        database: process.env.DB_NAME || 'test_async_db'
      }
    });
    
    console.log('✅ Project created:', JSON.stringify(projectResponse, null, 2));
    
    if (!projectResponse.apiKey) {
      console.log('❌ No API key in project response');
      return;
    }
    
    // 2. Now use the project API key to create a table
    console.log('\n2. Creating client with project API key...');
    const client = new AppAtOnceClient({
      baseUrl: 'http://localhost:8091',
      apiKey: projectResponse.apiKey
    });
    
    console.log('\n3. Creating table with async processing...');
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
      console.log('\n4. Checking job status...');
      
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
      
      console.log('\n5. Final job status:', JSON.stringify(status, null, 2));
      
      if (status.status === 'completed') {
        console.log('✅ Table creation completed successfully!');
        if (status.result) {
          console.log('📋 Result:', JSON.stringify(status.result, null, 2));
        }
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

testCreateProjectAndTable();