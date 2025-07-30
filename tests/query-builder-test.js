#!/usr/bin/env node

const { AppAtOnceClient } = require('../dist');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function testQueryBuilder() {
  console.log('=== Testing Query Builder ===\n');
  
  const client = AppAtOnceClient.createWithApiKey(APP_API_KEY, BASE_URL);
  const tableName = `query_test_${Date.now()}`;
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  try {
    // 1. Create table
    console.log(`1. Creating table: ${tableName}`);
    await client.schema.createTable({
      name: tableName,
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true },
        { name: 'name', type: 'varchar', required: true },
        { name: 'age', type: 'integer' },
        { name: 'status', type: 'varchar' },
        { name: 'score', type: 'integer' },
        { name: 'created_at', type: 'timestamp' }
      ]
    });
    console.log('✓ Table created');
    
    // 2. Insert test data
    console.log('\n2. Inserting test data...');
    const testData = [
      { name: 'Alice', age: 25, status: 'active', score: 85, created_at: new Date() },
      { name: 'Bob', age: 30, status: 'active', score: 92, created_at: new Date() },
      { name: 'Charlie', age: 35, status: 'inactive', score: 78, created_at: new Date() },
      { name: 'David', age: 28, status: 'active', score: 88, created_at: new Date() },
      { name: 'Eve', age: 32, status: 'inactive', score: 95, created_at: new Date() }
    ];
    
    for (let i = 0; i < testData.length; i++) {
      try {
        await client.table(tableName).insert(testData[i]);
        console.log(`  ✓ Inserted record ${i + 1}/${testData.length}`);
      } catch (error) {
        console.error(`  ✗ Failed to insert record ${i + 1}:`, error.message);
        throw error;
      }
    }
    console.log('✓ All test data inserted');
    
    // 3. Test simple select
    console.log('\n3. Testing simple select...');
    try {
      const result = await client.table(tableName).select().execute();
      const allRecords = result.data;
      if (allRecords.length === 5) {
        console.log('✓ Simple select: PASSED');
        results.passed++;
      } else {
        console.log(`✗ Simple select: FAILED (expected 5, got ${allRecords.length})`);
        results.failed++;
      }
      results.tests.push({ name: 'Simple select', passed: allRecords.length === 5 });
    } catch (error) {
      console.log('✗ Simple select: ERROR', error.message);
      results.failed++;
      results.tests.push({ name: 'Simple select', passed: false, error: error.message });
    }
    
    // 4. Test where clause
    console.log('\n4. Testing where clause...');
    try {
      const result = await client.table(tableName)
        .where('status', 'eq', 'active')
        .execute();
      const activeRecords = result.data;
      if (activeRecords.length === 3) {
        console.log('✓ Where clause: PASSED');
        results.passed++;
      } else {
        console.log(`✗ Where clause: FAILED (expected 3, got ${activeRecords.length})`);
        results.failed++;
      }
      results.tests.push({ name: 'Where clause', passed: activeRecords.length === 3 });
    } catch (error) {
      console.log('✗ Where clause: ERROR', error.message);
      results.failed++;
      results.tests.push({ name: 'Where clause', passed: false, error: error.message });
    }
    
    // 5. Test multiple where conditions
    console.log('\n5. Testing multiple where conditions...');
    try {
      const result = await client.table(tableName)
        .where('status', 'eq', 'active')
        .where('age', 'gte', 30)
        .execute();
      const filtered = result.data;
      if (filtered.length === 1 && filtered[0].name === 'Bob') {
        console.log('✓ Multiple where: PASSED');
        results.passed++;
      } else {
        console.log(`✗ Multiple where: FAILED`);
        results.failed++;
      }
      results.tests.push({ name: 'Multiple where', passed: filtered.length === 1 });
    } catch (error) {
      console.log('✗ Multiple where: ERROR', error.message);
      results.failed++;
      results.tests.push({ name: 'Multiple where', passed: false, error: error.message });
    }
    
    // 6. Test order by
    console.log('\n6. Testing order by...');
    try {
      const result = await client.table(tableName)
        .orderBy('score', 'desc')
        .execute();
      const ordered = result.data;
      const scores = ordered.map(r => r.score);
      const expectedScores = [95, 92, 88, 85, 78];
      const isOrdered = JSON.stringify(scores) === JSON.stringify(expectedScores);
      if (isOrdered) {
        console.log('✓ Order by: PASSED');
        results.passed++;
      } else {
        console.log('✗ Order by: FAILED', { expected: expectedScores, got: scores });
        results.failed++;
      }
      results.tests.push({ name: 'Order by', passed: isOrdered });
    } catch (error) {
      console.log('✗ Order by: ERROR', error.message);
      results.failed++;
      results.tests.push({ name: 'Order by', passed: false, error: error.message });
    }
    
    // 7. Test limit
    console.log('\n7. Testing limit...');
    try {
      const result = await client.table(tableName)
        .limit(2)
        .execute();
      const limited = result.data;
      if (limited.length === 2) {
        console.log('✓ Limit: PASSED');
        results.passed++;
      } else {
        console.log(`✗ Limit: FAILED (expected 2, got ${limited.length})`);
        results.failed++;
      }
      results.tests.push({ name: 'Limit', passed: limited.length === 2 });
    } catch (error) {
      console.log('✗ Limit: ERROR', error.message);
      results.failed++;
      results.tests.push({ name: 'Limit', passed: false, error: error.message });
    }
    
    // 8. Test select specific columns
    console.log('\n8. Testing select specific columns...');
    try {
      const result = await client.table(tableName)
        .select('name', 'age')
        .execute();
      const columns = result.data;
      const hasCorrectColumns = columns.every(r => 
        Object.keys(r).includes('name') && 
        Object.keys(r).includes('age') &&
        !Object.keys(r).includes('status')
      );
      if (hasCorrectColumns && columns.length === 5) {
        console.log('✓ Select columns: PASSED');
        results.passed++;
      } else {
        console.log('✗ Select columns: FAILED');
        results.failed++;
      }
      results.tests.push({ name: 'Select columns', passed: hasCorrectColumns });
    } catch (error) {
      console.log('✗ Select columns: ERROR', error.message);
      results.failed++;
      results.tests.push({ name: 'Select columns', passed: false, error: error.message });
    }
    
    // 9. Test first/single
    console.log('\n9. Testing first/single...');
    try {
      const first = await client.table(tableName)
        .where('name', 'eq', 'Alice')
        .first();
      if (first && first.name === 'Alice') {
        console.log('✓ First/single: PASSED');
        results.passed++;
      } else {
        console.log('✗ First/single: FAILED');
        results.failed++;
      }
      results.tests.push({ name: 'First/single', passed: first?.name === 'Alice' });
    } catch (error) {
      console.log('✗ First/single: ERROR', error.message);
      results.failed++;
      results.tests.push({ name: 'First/single', passed: false, error: error.message });
    }
    
    // 10. Test complex query
    console.log('\n10. Testing complex query...');
    try {
      const result = await client.table(tableName)
        .where('status', 'eq', 'active')
        .where('score', 'gte', 85)
        .orderBy('age', 'asc')
        .limit(2)
        .select('name', 'age', 'score')
        .execute();
      const complex = result.data;
      
      const isCorrect = complex.length === 2 &&
        complex[0].name === 'Alice' &&
        complex[1].name === 'David';
        
      if (isCorrect) {
        console.log('✓ Complex query: PASSED');
        results.passed++;
      } else {
        console.log('✗ Complex query: FAILED', complex);
        results.failed++;
      }
      results.tests.push({ name: 'Complex query', passed: isCorrect });
    } catch (error) {
      console.log('✗ Complex query: ERROR', error.message);
      results.failed++;
      results.tests.push({ name: 'Complex query', passed: false, error: error.message });
    }
    
    // Summary
    console.log('\n=== Summary ===');
    console.log(`Total tests: ${results.tests.length}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Success rate: ${Math.round(results.passed / results.tests.length * 100)}%`);
    
    if (results.failed > 0) {
      console.log('\nFailed tests:');
      results.tests.filter(t => !t.passed).forEach(t => {
        console.log(`- ${t.name}${t.error ? ': ' + t.error : ''}`);
      });
    }
    
    // Cleanup
    console.log('\nCleaning up...');
    await client.schema.dropTable(tableName);
    console.log('✓ Cleanup complete');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    console.error('Details:', error);
  }
}

testQueryBuilder();