#!/usr/bin/env node

const axios = require('axios');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function testDirectAPI() {
  console.log('=== Testing Direct API ===\n');
  
  const tableName = `direct_test_${Date.now()}`;
  const headers = {
    'x-api-key': APP_API_KEY,
    'Content-Type': 'application/json'
  };
  
  try {
    // 1. Create table
    console.log('1. Creating table...');
    await axios.post(`${BASE_URL}/api/v1/schema/tables`, {
      name: tableName,
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true },
        { name: 'name', type: 'varchar', required: true }
      ]
    }, { headers });
    console.log('✓ Table created');
    
    // 2. Insert data
    console.log('\n2. Inserting data...');
    await axios.post(`${BASE_URL}/api/v1/data/${tableName}`, {
      name: 'Test'
    }, { headers });
    console.log('✓ Data inserted');
    
    // 3. Test query without filters
    console.log('\n3. Query without filters...');
    const response1 = await axios.get(`${BASE_URL}/api/v1/data/${tableName}`, { headers });
    console.log(`✓ Found ${response1.data.length} records`);
    
    // 4. Test query with where as JSON string
    console.log('\n4. Query with where as JSON string...');
    try {
      const params = {
        where: JSON.stringify([{ field: 'name', operator: 'eq', value: 'Test' }])
      };
      const response2 = await axios.get(`${BASE_URL}/api/v1/data/${tableName}`, { 
        headers,
        params 
      });
      console.log(`✓ Found ${response2.data.length} records with filter`);
    } catch (error) {
      console.log('✗ Failed:', error.response?.status, error.response?.data);
    }
    
    // 5. Test query with where as object
    console.log('\n5. Query with where as object...');
    try {
      const params = {
        where: { name: 'Test' }
      };
      const response3 = await axios.get(`${BASE_URL}/api/v1/data/${tableName}`, { 
        headers,
        params 
      });
      console.log(`✓ Found ${response3.data.length} records with object filter`);
    } catch (error) {
      console.log('✗ Failed:', error.response?.status, error.response?.data);
    }
    
    // 6. Test query with where as URL encoded
    console.log('\n6. Query with URL encoded where...');
    try {
      const whereFilter = [{ field: 'name', operator: 'eq', value: 'Test' }];
      const url = `${BASE_URL}/api/v1/data/${tableName}?where=${encodeURIComponent(JSON.stringify(whereFilter))}`;
      const response4 = await axios.get(url, { headers });
      console.log(`✓ Found ${response4.data.length} records with URL encoded filter`);
    } catch (error) {
      console.log('✗ Failed:', error.response?.status, error.response?.data);
    }
    
    // Cleanup
    console.log('\n7. Cleaning up...');
    await axios.delete(`${BASE_URL}/api/v1/schema/tables/${tableName}`, { headers });
    console.log('✓ Cleanup complete');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testDirectAPI();