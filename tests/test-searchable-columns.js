#!/usr/bin/env node

const axios = require('axios');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function testSearchableColumns() {
  console.log('=== Searchable Columns Test ===\n');
  
  const tableName = `searchable_${Date.now()}`;
  
  try {
    // Create table with searchable columns
    console.log('Creating table with searchable columns...');
    await axios.post(
      `${BASE_URL}/api/v1/schema/tables`,
      {
        name: tableName,
        columns: [
          { name: 'title', type: 'varchar', required: true, searchable: true }
        ],
        enableSearch: true
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
      const response = await axios.post(
        `${BASE_URL}/api/v1/data/${tableName}`,
        { title: 'Test Title' },
        {
          headers: {
            'x-api-key': APP_API_KEY,
            'Content-Type': 'application/json'
          },
          validateStatus: () => true // Don't throw on any status
        }
      );
      
      if (response.status === 200 || response.status === 201) {
        console.log('✓ Insert successful:', response.data);
      } else {
        console.error('❌ Insert failed');
        console.error('Status:', response.status);
        console.error('Response:', JSON.stringify(response.data, null, 2));
      }
    } catch (e) {
      console.error('❌ Insert error:', e.message);
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

testSearchableColumns().catch(console.error);