#!/usr/bin/env node

const axios = require('axios');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function testRawWhere() {
  console.log('=== Test Raw Where Clause ===\n');
  
  const headers = {
    'x-api-key': APP_API_KEY,
    'Content-Type': 'application/json'
  };
  
  const tableName = 'debug_where_test';
  
  try {
    // Create and populate table first
    console.log('1. Creating table...');
    await axios.post(`${BASE_URL}/api/v1/schema/tables`, {
      name: tableName,
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true },
        { name: 'name', type: 'varchar', required: true },
        { name: 'status', type: 'varchar' }
      ]
    }, { headers });
    
    await axios.post(`${BASE_URL}/api/v1/data/${tableName}`, { name: 'Alice', status: 'active' }, { headers });
    await axios.post(`${BASE_URL}/api/v1/data/${tableName}`, { name: 'Bob', status: 'inactive' }, { headers });
    console.log('✓ Table created and populated');
    
    // Test 1: No filter
    console.log('\n2. No filter:');
    const res1 = await axios.get(`${BASE_URL}/api/v1/data/${tableName}`, { headers });
    console.log(`   Found ${res1.data.length} records`);
    
    // Test 2: Direct array in params
    console.log('\n3. Direct array in params:');
    const res2 = await axios.get(`${BASE_URL}/api/v1/data/${tableName}`, { 
      headers,
      params: {
        where: [{ field: 'status', operator: 'eq', value: 'active' }]
      }
    });
    console.log(`   Found ${res2.data.length} records (expected 1)`);
    res2.data.forEach(r => console.log(`   - ${r.name}: ${r.status}`));
    
    // Let's see what axios actually sends
    console.log('\n4. Debug axios request:');
    const config = {
      method: 'get',
      url: `${BASE_URL}/api/v1/data/${tableName}`,
      headers,
      params: {
        where: [{ field: 'status', operator: 'eq', value: 'active' }]
      }
    };
    
    // Create axios instance with request interceptor
    const instance = axios.create();
    instance.interceptors.request.use(request => {
      console.log('   Request URL:', request.url);
      console.log('   Request params:', request.params);
      return request;
    });
    
    const res3 = await instance(config);
    console.log(`   Found ${res3.data.length} records`);
    
    // Cleanup
    await axios.delete(`${BASE_URL}/api/v1/schema/tables/${tableName}`, { headers });
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testRawWhere();