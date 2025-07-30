#!/usr/bin/env node

const axios = require('axios');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function testDebugInsert() {
  console.log('=== Debug Insert Test ===\n');
  
  const tableName = `debug_insert_${Date.now()}`;
  
  try {
    // Create table without search first
    console.log('1. Creating table WITHOUT search...');
    await axios.post(
      `${BASE_URL}/api/v1/schema/tables`,
      {
        name: tableName,
        columns: [
          { name: 'title', type: 'varchar', required: true },
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
    
    // Test insert with array
    console.log('\n2. Testing insert with array...');
    const testData = {
      title: 'Test with array',
      tags: ['tag1', 'tag2']
    };
    
    console.log('Sending data:', JSON.stringify(testData));
    
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
        console.log('✓ Insert successful');
        console.log('Response:', response.data);
      } else {
        console.error('❌ Insert failed');
        console.error('Status:', response.status);
        console.error('Response:', JSON.stringify(response.data, null, 2));
      }
    } catch (e) {
      console.error('❌ Error:', e.message);
    }
    
    // Cleanup
    console.log('\nCleaning up...');
    await axios.delete(`${BASE_URL}/api/v1/schema/tables/${tableName}`, {
      headers: { 'x-api-key': APP_API_KEY }
    });
    console.log('✓ Table dropped');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testDebugInsert().catch(console.error);