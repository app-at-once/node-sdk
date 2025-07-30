#!/usr/bin/env node

const axios = require('axios');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function traceWhereIssue() {
  console.log('=== Tracing Where Clause Issue ===\n');
  
  const headers = {
    'x-api-key': APP_API_KEY,
    'Content-Type': 'application/json'
  };
  
  const tableName = 'trace_test';
  
  try {
    // Setup test table
    console.log('1. Creating test table...');
    await axios.post(`${BASE_URL}/api/v1/schema/tables`, {
      name: tableName,
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true },
        { name: 'name', type: 'varchar', required: true },
        { name: 'status', type: 'varchar' }
      ]
    }, { headers });
    
    // Insert test data
    await axios.post(`${BASE_URL}/api/v1/data/${tableName}`, { name: 'Alice', status: 'active' }, { headers });
    await axios.post(`${BASE_URL}/api/v1/data/${tableName}`, { name: 'Bob', status: 'inactive' }, { headers });
    console.log('✓ Table created with 2 records\n');
    
    // Test 1: Simple object where (this works)
    console.log('2. Testing object where (works):');
    const res1 = await axios.get(`${BASE_URL}/api/v1/data/${tableName}`, {
      headers,
      params: { where: { status: 'active' } }
    });
    console.log(`   Found ${res1.data.length} records`);
    res1.data.forEach(r => console.log(`   - ${r.name}: ${r.status}`));
    
    // Test 2: Array where - what axios sends
    console.log('\n3. Testing array where (what SDK uses):');
    const whereArray = [{ field: 'status', operator: 'eq', value: 'active' }];
    
    // Show what axios serializes
    const axiosConfig = {
      method: 'get',
      url: `${BASE_URL}/api/v1/data/${tableName}`,
      headers,
      params: { where: whereArray }
    };
    
    const axiosInstance = axios.create();
    const requestUrl = axiosInstance.getUri(axiosConfig);
    console.log('   Generated URL:', requestUrl);
    
    // Make the request
    const res2 = await axios(axiosConfig);
    console.log(`   Found ${res2.data.length} records (expected 1)`);
    res2.data.forEach(r => console.log(`   - ${r.name}: ${r.status}`));
    
    // Cleanup
    await axios.delete(`${BASE_URL}/api/v1/schema/tables/${tableName}`, { headers });
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

traceWhereIssue();