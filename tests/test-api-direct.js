#!/usr/bin/env node

const axios = require('axios');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';
const tableName = `api_test_${Date.now()}`;

async function testApiDirect() {
  console.log('=== Direct API Test ===\n');
  
  try {
    // Create table
    console.log('Creating table...');
    const createRes = await axios.post(
      `${BASE_URL}/api/v1/schema/tables`,
      {
        name: tableName,
        columns: [
          { name: 'title', type: 'varchar', required: true, searchable: true },
          { name: 'tags', type: 'jsonb' }
        ],
        enableSearch: { elasticsearch: { fields: ['title'] } }
      },
      {
        headers: {
          'x-api-key': APP_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✓ Table created');
    
    // Try insert
    console.log('\nInserting data...');
    try {
      const insertRes = await axios.post(
        `${BASE_URL}/api/v1/data/${tableName}`,
        {
          title: 'Test Title',
          tags: ['tag1', 'tag2']
        },
        {
          headers: {
            'x-api-key': APP_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✓ Insert successful:', insertRes.data);
    } catch (insertError) {
      console.error('❌ Insert failed');
      console.error('Status:', insertError.response?.status);
      console.error('Error:', insertError.response?.data);
    }
    
    // Cleanup
    console.log('\nCleaning up...');
    await axios.delete(
      `${BASE_URL}/api/v1/schema/tables/${tableName}`,
      {
        headers: {
          'x-api-key': APP_API_KEY
        }
      }
    );
    console.log('✓ Table dropped');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testApiDirect().catch(console.error);