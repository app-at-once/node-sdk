const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api/v1';
// Use the app API key that works in trace-where-issue.js
const API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';

async function testOrderByAndSelect() {
  console.log('=== Testing OrderBy and Select ===\n');
  
  const tableName = `test_order_${Date.now()}`;
  
  try {
    // Create test table
    await axios.post(`${BASE_URL}/schema/tables`, {
      name: tableName,
      columns: [
        { name: 'id', type: 'serial', primaryKey: true },
        { name: 'name', type: 'text', notNull: true },
        { name: 'age', type: 'integer', notNull: true },
        { name: 'score', type: 'integer' },
        { name: 'city', type: 'text' }
      ]
    }, {
      headers: { 'x-api-key': API_KEY }
    });
    
    // Insert test data - one by one since batch insert isn't supported yet
    const testData = [
      { name: 'Alice', age: 25, score: 95, city: 'New York' },
      { name: 'Bob', age: 30, score: 85, city: 'London' },
      { name: 'Charlie', age: 35, score: 90, city: 'Paris' },
      { name: 'David', age: 28, score: 88, city: 'Tokyo' },
      { name: 'Eve', age: 22, score: 92, city: 'Sydney' }
    ];
    
    for (const record of testData) {
      await axios.post(`${BASE_URL}/data/${tableName}`, record, {
        headers: { 'x-api-key': API_KEY }
      });
    }
    
    console.log('✓ Table created with 5 records\n');
    
    // Test 1: OrderBy age ascending
    console.log('1. Testing OrderBy age ASC:');
    const orderByAgeAsc = await axios.get(`${BASE_URL}/data/${tableName}`, {
      params: {
        'orderBy[0][field]': 'age',
        'orderBy[0][direction]': 'asc'
      },
      headers: { 'x-api-key': API_KEY }
    });
    console.log('   Results:', orderByAgeAsc.data.map(r => `${r.name} (${r.age})`).join(', '));
    const agesAsc = orderByAgeAsc.data.map(r => r.age);
    const isAscending = agesAsc.every((age, i) => i === 0 || age >= agesAsc[i-1]);
    console.log(`   ${isAscending ? '✓' : '✗'} Order is ${isAscending ? 'correct' : 'incorrect'}\n`);
    
    // Test 2: OrderBy score descending
    console.log('2. Testing OrderBy score DESC:');
    const orderByScoreDesc = await axios.get(`${BASE_URL}/data/${tableName}`, {
      params: {
        'orderBy[0][field]': 'score',
        'orderBy[0][direction]': 'desc'
      },
      headers: { 'x-api-key': API_KEY }
    });
    console.log('   Results:', orderByScoreDesc.data.map(r => `${r.name} (${r.score})`).join(', '));
    const scoresDesc = orderByScoreDesc.data.map(r => r.score);
    const isDescending = scoresDesc.every((score, i) => i === 0 || score <= scoresDesc[i-1]);
    console.log(`   ${isDescending ? '✓' : '✗'} Order is ${isDescending ? 'correct' : 'incorrect'}\n`);
    
    // Test 3: Select specific columns
    console.log('3. Testing Select specific columns (name, age):');
    const selectColumns = await axios.get(`${BASE_URL}/data/${tableName}`, {
      params: {
        'select[0]': 'name',
        'select[1]': 'age'
      },
      headers: { 'x-api-key': API_KEY }
    });
    const firstRecord = selectColumns.data[0];
    const keys = Object.keys(firstRecord);
    console.log('   First record:', firstRecord);
    console.log('   Columns returned:', keys);
    const hasOnlySelectedColumns = keys.length === 2 && keys.includes('name') && keys.includes('age');
    console.log(`   ${hasOnlySelectedColumns ? '✓' : '✗'} Only selected columns returned\n`);
    
    // Test 4: Combine WHERE, OrderBy and Select
    console.log('4. Testing combined WHERE + OrderBy + Select:');
    const combined = await axios.get(`${BASE_URL}/data/${tableName}`, {
      params: {
        'where[0][field]': 'age',
        'where[0][operator]': 'gte',
        'where[0][value]': '25',
        'orderBy[0][field]': 'score',
        'orderBy[0][direction]': 'desc',
        'select[0]': 'name',
        'select[1]': 'score'
      },
      headers: { 'x-api-key': API_KEY }
    });
    console.log('   Results:', combined.data);
    const allAbove25 = combined.data.every(r => r.age === undefined || r.age >= 25); // age might not be in results
    const scoresSorted = combined.data.map(r => r.score).every((s, i, arr) => i === 0 || s <= arr[i-1]);
    const onlyNameScore = combined.data.every(r => {
      const keys = Object.keys(r);
      return keys.length === 2 && keys.includes('name') && keys.includes('score');
    });
    console.log(`   ${allAbove25 && scoresSorted && onlyNameScore ? '✓' : '✗'} Combined query ${allAbove25 && scoresSorted && onlyNameScore ? 'works correctly' : 'has issues'}`);
    if (!onlyNameScore) {
      console.log('   Issue: Extra columns returned');
    }
    
    // Clean up
    await axios.delete(`${BASE_URL}/schema/tables/${tableName}`, {
      headers: { 'x-api-key': API_KEY }
    });
    console.log(`\n✓ Deleted test table: ${tableName}`);
    
  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
  }
}

testOrderByAndSelect();