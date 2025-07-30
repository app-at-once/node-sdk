#!/usr/bin/env node

const axios = require('axios');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function testSimpleInsert() {
  console.log('=== Simple Insert Test ===\n');
  
  try {
    // Test 1: Create table WITHOUT search
    console.log('1. Creating table WITHOUT search...');
    const table1 = `no_search_${Date.now()}`;
    await axios.post(
      `${BASE_URL}/api/v1/schema/tables`,
      {
        name: table1,
        columns: [
          { name: 'title', type: 'varchar', required: true }
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
    
    // Insert in non-search table
    console.log('Inserting in non-search table...');
    try {
      await axios.post(
        `${BASE_URL}/api/v1/data/${table1}`,
        { title: 'Test' },
        {
          headers: {
            'x-api-key': APP_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✓ Insert successful');
    } catch (e) {
      console.error('❌ Insert failed:', e.response?.data);
    }
    
    // Cleanup
    await axios.delete(`${BASE_URL}/api/v1/schema/tables/${table1}`, {
      headers: { 'x-api-key': APP_API_KEY }
    });
    
    // Test 2: Create table WITH search but no searchable columns
    console.log('\n2. Creating table WITH enableSearch but no searchable columns...');
    const table2 = `search_no_cols_${Date.now()}`;
    await axios.post(
      `${BASE_URL}/api/v1/schema/tables`,
      {
        name: table2,
        columns: [
          { name: 'title', type: 'varchar', required: true }
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
    
    // Insert
    console.log('Inserting...');
    try {
      await axios.post(
        `${BASE_URL}/api/v1/data/${table2}`,
        { title: 'Test' },
        {
          headers: {
            'x-api-key': APP_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✓ Insert successful');
    } catch (e) {
      console.error('❌ Insert failed:', e.response?.data);
    }
    
    // Cleanup
    await axios.delete(`${BASE_URL}/api/v1/schema/tables/${table2}`, {
      headers: { 'x-api-key': APP_API_KEY }
    });
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testSimpleInsert().catch(console.error);