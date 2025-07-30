const axios = require('axios');
const AppAtOnce = require('../dist').default;

const BASE_URL = 'http://localhost:8080';
const API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';

async function testBatchOperations() {
  console.log('=== Testing Batch Operations ===\n');
  
  const client = new AppAtOnce({
    apiKey: API_KEY,
    baseUrl: BASE_URL
  });
  
  const tableName = `test_batch_${Date.now()}`;
  
  try {
    // Create test table
    await axios.post(`${BASE_URL}/api/v1/schema/tables`, {
      name: tableName,
      columns: [
        { name: 'id', type: 'serial', primaryKey: true },
        { name: 'name', type: 'text', notNull: true },
        { name: 'status', type: 'text', notNull: true },
        { name: 'value', type: 'integer', notNull: true }
      ]
    }, {
      headers: { 'x-api-key': API_KEY }
    });
    
    console.log(`✓ Created test table: ${tableName}\n`);
    
    // Test 1: Batch Insert (insertMany)
    console.log('1. Testing Batch Insert (insertMany):');
    const batchData = [
      { name: 'Item1', status: 'active', value: 10 },
      { name: 'Item2', status: 'active', value: 20 },
      { name: 'Item3', status: 'inactive', value: 30 },
      { name: 'Item4', status: 'active', value: 40 },
      { name: 'Item5', status: 'pending', value: 50 }
    ];
    
    try {
      console.log('   Attempting to insert 5 records...');
      const insertResult = await client.table(tableName).insertMany(batchData);
      console.log('   ✓ Batch insert successful');
      console.log('   Inserted records:', insertResult.length);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('   ✗ Bulk insert endpoint not implemented (404)');
        console.log('   Endpoint: POST /api/v1/data/:table/bulk');
        
        // Insert records one by one for other tests
        console.log('   Inserting records individually...');
        for (const record of batchData) {
          await client.table(tableName).insert(record);
        }
        console.log('   ✓ Individual inserts completed');
      } else {
        console.log('   ✗ Batch insert error:', error.response?.data || error.message);
      }
    }
    
    // Test 2: Batch Update
    console.log('\n2. Testing Batch Update:');
    try {
      // Update all active items
      console.log('   Attempting to update all active items...');
      const updateResult = await client.table(tableName)
        .where('status', 'eq', 'active')
        .update({ value: 100 });
      console.log('   ✓ Batch update successful');
      console.log('   Updated records:', updateResult.length);
      
      // Verify update
      const verifyResult = await client.table(tableName)
        .where('status', 'eq', 'active')
        .execute();
      console.log('   Verification - All active items have value:', 
        verifyResult.data.every(item => item.value === 100) ? 100 : 'mixed');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('   ✗ Batch update endpoint not implemented (404)');
        console.log('   Endpoint: PATCH /api/v1/data/:table (with where conditions)');
      } else if (error.response?.status === 500) {
        console.log('   ✗ Batch update error:', error.response?.data?.message || 'Server error');
        console.log('   Note: Server may not support batch updates yet');
      } else {
        console.log('   ✗ Batch update error:', error.response?.data || error.message);
      }
    }
    
    // Test 3: Batch Delete
    console.log('\n3. Testing Batch Delete:');
    try {
      // Delete all inactive items
      console.log('   Attempting to delete all inactive items...');
      const deleteResult = await client.table(tableName)
        .where('status', 'eq', 'inactive')
        .delete();
      console.log('   ✓ Batch delete successful');
      console.log('   Deleted records:', deleteResult.count);
      
      // Verify deletion
      const remainingCount = await client.table(tableName).count();
      console.log('   Remaining records:', remainingCount);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('   ✗ Batch delete endpoint not implemented (404)');
        console.log('   Endpoint: DELETE /api/v1/data/:table (with where conditions)');
      } else if (error.response?.status === 500) {
        console.log('   ✗ Batch delete error:', error.response?.data?.message || 'Server error');
        console.log('   Note: Server may not support batch deletes yet');
      } else {
        console.log('   ✗ Batch delete error:', error.response?.data || error.message);
      }
    }
    
    // Test 4: Upsert
    console.log('\n4. Testing Upsert:');
    try {
      // Try to upsert (insert or update)
      console.log('   Attempting to upsert a record...');
      const upsertData = { id: 1, name: 'Updated Item1', status: 'updated', value: 999 };
      const upsertResult = await client.table(tableName)
        .upsert(upsertData, ['id']);
      console.log('   ✓ Upsert successful');
      console.log('   Result:', upsertResult);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('   ✗ Upsert endpoint not implemented (404)');
        console.log('   Endpoint: POST /api/v1/data/:table/upsert');
      } else {
        console.log('   ✗ Upsert error:', error.response?.data || error.message);
      }
    }
    
    // Test 5: Transaction-like operations
    console.log('\n5. Testing Transaction-like Operations:');
    console.log('   Note: SDK does not appear to have explicit transaction support');
    console.log('   Transactions would need to be implemented at the server level');
    
    // Summary
    console.log('\n=== Batch Operations Summary ===');
    console.log('The following batch operations need server implementation:');
    console.log('1. POST /api/v1/data/:table/bulk - Bulk insert');
    console.log('2. PATCH /api/v1/data/:table - Batch update with WHERE');
    console.log('3. DELETE /api/v1/data/:table - Batch delete with WHERE');
    console.log('4. POST /api/v1/data/:table/upsert - Upsert operation');
    console.log('5. Transaction support - Not in SDK interface');
    
    // Clean up
    await axios.delete(`${BASE_URL}/api/v1/schema/tables/${tableName}`, {
      headers: { 'x-api-key': API_KEY }
    });
    console.log(`\n✓ Deleted test table: ${tableName}`);
    
  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
  }
}

testBatchOperations();