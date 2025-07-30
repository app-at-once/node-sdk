#!/usr/bin/env node

const axios = require('axios');
const qs = require('querystring');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

// Debug what axios sends when we pass arrays
async function debugAxios() {
  console.log('=== Debug Axios Array Serialization ===\n');
  
  const headers = {
    'x-api-key': APP_API_KEY,
    'Content-Type': 'application/json'
  };
  
  const whereArray = [
    { field: 'status', operator: 'eq', value: 'active' }
  ];
  
  const orderByArray = [
    { field: 'score', direction: 'desc' }
  ];
  
  // Test 1: How axios serializes arrays by default
  console.log('1. Default axios serialization:');
  const params1 = {
    where: whereArray,
    orderBy: orderByArray,
    select: 'name,age'
  };
  console.log('   Input:', JSON.stringify(params1, null, 2));
  
  // Create request to see what URL is generated
  const config = {
    method: 'get',
    url: `${BASE_URL}/api/v1/data/simple_test`,
    headers,
    params: params1
  };
  
  // Use axios request config transformer to see the URL
  const request = axios.create().getUri(config);
  console.log('   Generated URL:', request);
  
  // Test 2: Using qs library
  console.log('\n2. Using qs.stringify:');
  const params2 = qs.stringify({
    where: whereArray,
    orderBy: orderByArray,
    select: 'name,age'
  }, { arrayFormat: 'brackets' });
  console.log('   Query string:', params2);
  
  // Test 3: Actually make a request and see what the server receives
  console.log('\n3. Making actual request...');
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/data/simple_test`, {
      headers,
      params: params1,
      paramsSerializer: function(params) {
        const serialized = qs.stringify(params, { arrayFormat: 'indices' });
        console.log('   Serialized params:', serialized);
        return serialized;
      }
    });
    console.log('   Success! Records:', response.data.length);
    if (response.data.length > 0) {
      console.log('   First record keys:', Object.keys(response.data[0]));
    }
  } catch (error) {
    console.log('   Error:', error.response?.data || error.message);
  }
}

debugAxios();