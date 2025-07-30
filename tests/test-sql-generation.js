#!/usr/bin/env node

const axios = require('axios');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function testSQLGeneration() {
  console.log('=== Testing SQL Generation ===\n');
  
  const headers = {
    'x-api-key': APP_API_KEY,
    'Content-Type': 'application/json'
  };
  
  const tableName = 'simple_test';
  
  try {
    // Test 1: No filter (this works)
    console.log('1. No filter:');
    try {
      const res1 = await axios.get(`${BASE_URL}/api/v1/data/${tableName}`, { headers });
      console.log('   ✓ Success:', res1.data.length, 'records');
    } catch (e) {
      console.log('   ✗ Failed:', e.response?.data);
    }
    
    // Test 2: Object format where (this works)
    console.log('\n2. Object format where:');
    try {
      const res2 = await axios.get(`${BASE_URL}/api/v1/data/${tableName}`, {
        headers,
        params: { where: { name: 'Test1' } }
      });
      console.log('   ✓ Success:', res2.data.length, 'records');
    } catch (e) {
      console.log('   ✗ Failed:', e.response?.data);
    }
    
    // Test 3: Array format where (this fails)
    console.log('\n3. Array format where:');
    try {
      const res3 = await axios.get(`${BASE_URL}/api/v1/data/${tableName}`, {
        headers,
        params: { 
          where: JSON.stringify([{ field: 'name', operator: 'eq', value: 'Test1' }])
        }
      });
      console.log('   ✓ Success:', res3.data.length, 'records');
    } catch (e) {
      console.log('   ✗ Failed:', e.response?.data);
    }
    
    // Test 4: Try without JSON.stringify
    console.log('\n4. Array without stringify:');
    try {
      const res4 = await axios.get(`${BASE_URL}/api/v1/data/${tableName}`, {
        headers,
        params: { 
          where: [{ field: 'name', operator: 'eq', value: 'Test1' }]
        }
      });
      console.log('   ✓ Success:', res4.data.length, 'records');
    } catch (e) {
      console.log('   ✗ Failed:', e.response?.data);
    }
    
    // Test 5: Different operator
    console.log('\n5. Different operator (ne):');
    try {
      const res5 = await axios.get(`${BASE_URL}/api/v1/data/${tableName}`, {
        headers,
        params: { 
          where: JSON.stringify([{ field: 'name', operator: 'ne', value: 'Test1' }])
        }
      });
      console.log('   ✓ Success:', res5.data.length, 'records');
    } catch (e) {
      console.log('   ✗ Failed:', e.response?.data);
    }
    
    // Test 6: Integer field
    console.log('\n6. Query with ID field:');
    try {
      // First get a record to get its ID
      const allRecords = await axios.get(`${BASE_URL}/api/v1/data/${tableName}`, { headers });
      if (allRecords.data.length > 0) {
        const id = allRecords.data[0].id;
        const res6 = await axios.get(`${BASE_URL}/api/v1/data/${tableName}`, {
          headers,
          params: { 
            where: JSON.stringify([{ field: 'id', operator: 'eq', value: id }])
          }
        });
        console.log('   ✓ Success:', res6.data.length, 'records');
      }
    } catch (e) {
      console.log('   ✗ Failed:', e.response?.data);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testSQLGeneration();