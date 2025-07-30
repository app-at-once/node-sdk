#!/usr/bin/env node

const axios = require('axios');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function testJsonbInsert() {
  console.log('=== JSONB Insert Test ===\n');
  
  const tableName = `jsonb_test_${Date.now()}`;
  
  try {
    // Create simple table with JSONB
    console.log('Creating table with JSONB column...');
    await axios.post(
      `${BASE_URL}/api/v1/schema/tables`,
      {
        name: tableName,
        columns: [
          { name: 'title', type: 'varchar' },
          { name: 'tags', type: 'jsonb' }
        ]
      },
      {
        headers: {
          'x-api-key': APP_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✓ Table created');
    
    // Test different JSONB values
    const testCases = [
      { title: 'Array test', tags: ['tag1', 'tag2'] },
      { title: 'Object test', tags: { key: 'value' } },
      { title: 'String test', tags: 'just a string' },
      { title: 'Number test', tags: 123 },
      { title: 'Null test', tags: null }
    ];
    
    for (const testData of testCases) {
      console.log(`\nTesting: ${testData.title}`);
      console.log('Data:', JSON.stringify(testData));
      
      try {
        const response = await axios.post(
          `${BASE_URL}/api/v1/data/${tableName}`,
          testData,
          {
            headers: {
              'x-api-key': APP_API_KEY,
              'Content-Type': 'application/json'
            },
            validateStatus: () => true
          }
        );
        
        if (response.status === 200 || response.status === 201) {
          console.log('✓ Success');
        } else {
          console.error('❌ Failed');
          console.error('Status:', response.status);
          console.error('Response:', JSON.stringify(response.data, null, 2));
        }
      } catch (e) {
        console.error('❌ Error:', e.message);
      }
    }
    
    // Cleanup
    console.log('\nCleaning up...');
    await axios.delete(`${BASE_URL}/api/v1/schema/tables/${tableName}`, {
      headers: { 'x-api-key': APP_API_KEY }
    });
    console.log('✓ Table dropped');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testJsonbInsert().catch(console.error);