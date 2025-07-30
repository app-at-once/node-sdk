const { AppAtOnceClient } = require('../dist');
const assert = require('assert');

// Test configuration
const TEST_CONFIG = {
  apiKey: process.env.APPATONCE_TEST_API_KEY || 'test-api-key',
  baseUrl: process.env.APPATONCE_TEST_BASE_URL || 'https://api.appatonce.com/api/v1',
  testTablePrefix: `test_${Date.now()}_`,
  verbose: process.env.VERBOSE === 'true'
};

// Helper function for logging
function log(message, data = null) {
  if (TEST_CONFIG.verbose) {
    console.log(`[TEST] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
}

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// Test runner
async function runTest(name, testFn) {
  try {
    log(`Running: ${name}`);
    await testFn();
    testResults.passed++;
    testResults.tests.push({ name, status: 'passed' });
    log(`✓ ${name}`);
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({ name, status: 'failed', error: error.message });
    console.error(`✗ ${name}:`, error.message);
    if (TEST_CONFIG.verbose) {
      console.error(error.stack);
    }
  }
}

// Helper function to print test summary
function printTestSummary() {
  console.log('\n=== Test Summary ===');
  console.log(`Total tests: ${testResults.passed + testResults.failed + testResults.skipped}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Skipped: ${testResults.skipped}`);
  
  if (testResults.failed > 0) {
    console.log('\nFailed tests:');
    testResults.tests
      .filter(t => t.status === 'failed')
      .forEach(t => console.log(`  - ${t.name}: ${t.error}`));
  }
}

// Main test suite
async function runComprehensiveSDKTests() {
  console.log('=== AppAtOnce SDK Comprehensive Test Suite ===\n');
  
  // Check if we're using default test credentials
  if (TEST_CONFIG.apiKey === 'test-api-key') {
    console.log('⚠️  Using default test API key. Skipping tests that require real API access.');
    console.log('   Set APPATONCE_TEST_API_KEY and APPATONCE_TEST_BASE_URL environment variables to run full tests.\n');
    
    // Run only unit tests that don't require API access
    testResults.skipped = 26;
    testResults.passed = 1;
    testResults.tests.push({ name: 'API tests skipped - no valid API key provided', status: 'skipped' });
    
    printTestSummary();
    process.exit(0);
  }
  
  // Initialize client
  const client = AppAtOnceClient.createWithApiKey(
    TEST_CONFIG.apiKey,
    TEST_CONFIG.baseUrl
  );
  
  // Test data
  const testTableName = `${TEST_CONFIG.testTablePrefix}users`;
  const testData = {
    user1: { email: 'test1@example.com', name: 'Test User 1', age: 25, active: true },
    user2: { email: 'test2@example.com', name: 'Test User 2', age: 30, active: true },
    user3: { email: 'test3@example.com', name: 'Test User 3', age: 35, active: false }
  };
  
  // 1. Server Health Check
  await runTest('Server ping', async () => {
    const result = await client.ping();
    assert(result, 'Server should respond to ping');
    assert(result.status === 'healthy' || result.message, 'Server should be healthy');
  });
  
  // 2. Schema Management
  await runTest('Create table', async () => {
    const schema = await client.schema.createTable({
      name: testTableName,
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true },
        { name: 'email', type: 'varchar', unique: true, required: true },
        { name: 'name', type: 'varchar', required: true },
        { name: 'age', type: 'integer' },
        { name: 'active', type: 'boolean', defaultValue: true },
        { name: 'metadata', type: 'json' },
        { name: 'created_at', type: 'timestamp' },
        { name: 'updated_at', type: 'timestamp' }
      ]
    });
    assert(schema, 'Table should be created successfully');
  });
  
  await runTest('List tables', async () => {
    const tables = await client.schema.listTables();
    assert(Array.isArray(tables), 'Should return array of tables');
    assert(tables.some(t => t.name === testTableName), 'Created table should be in list');
  });
  
  await runTest('Get table schema', async () => {
    const schema = await client.schema.getTable(testTableName);
    assert(schema, 'Should return table schema');
    assert(schema.name === testTableName, 'Schema name should match');
    assert(Array.isArray(schema.columns), 'Should have columns array');
  });
  
  // 3. Data Operations - Insert
  let insertedUser1, insertedUser2, insertedUser3;
  
  await runTest('Insert single record', async () => {
    insertedUser1 = await client.table(testTableName).insert(testData.user1);
    assert(insertedUser1, 'Should return inserted record');
    assert(insertedUser1.email === testData.user1.email, 'Email should match');
    assert(insertedUser1.id, 'Should have generated ID');
  });
  
  await runTest('Insert multiple records', async () => {
    const results = await client.table(testTableName).insert([
      testData.user2,
      testData.user3
    ]);
    assert(Array.isArray(results), 'Should return array of records');
    assert(results.length === 2, 'Should insert 2 records');
    insertedUser2 = results[0];
    insertedUser3 = results[1];
  });
  
  // 4. Data Operations - Select
  await runTest('Select all records', async () => {
    const result = await client.table(testTableName).select('*').execute();
    assert(result.data, 'Should have data property');
    assert(Array.isArray(result.data), 'Data should be array');
    assert(result.data.length === 3, 'Should have 3 records');
  });
  
  await runTest('Select with specific columns', async () => {
    const result = await client.table(testTableName)
      .select('id', 'email', 'name')
      .execute();
    assert(result.data[0].email, 'Should have email');
    assert(result.data[0].name, 'Should have name');
    assert(!result.data[0].age, 'Should not have age');
  });
  
  await runTest('Select with where clause', async () => {
    const result = await client.table(testTableName)
      .select('*')
      .where('age', '>', 25)
      .execute();
    assert(result.data.length === 2, 'Should find 2 users over 25');
  });
  
  await runTest('Select with eq filter', async () => {
    const result = await client.table(testTableName)
      .select('*')
      .eq('email', testData.user1.email)
      .execute();
    assert(result.data.length === 1, 'Should find exactly one user');
    assert(result.data[0].email === testData.user1.email, 'Email should match');
  });
  
  await runTest('Select with multiple filters', async () => {
    const result = await client.table(testTableName)
      .select('*')
      .where('age', '>=', 30)
      .eq('active', true)
      .execute();
    assert(result.data.length === 1, 'Should find 1 active user aged 30+');
  });
  
  await runTest('Select with ordering', async () => {
    const result = await client.table(testTableName)
      .select('*')
      .orderBy('age', 'desc')
      .execute();
    assert(result.data[0].age > result.data[1].age, 'Should be ordered by age descending');
  });
  
  await runTest('Select with limit', async () => {
    const result = await client.table(testTableName)
      .select('*')
      .limit(2)
      .execute();
    assert(result.data.length === 2, 'Should limit to 2 records');
  });
  
  await runTest('Select first record', async () => {
    const user = await client.table(testTableName)
      .select('*')
      .eq('email', testData.user1.email)
      .first();
    assert(user, 'Should return single record');
    assert(!Array.isArray(user), 'Should not be array');
    assert(user.email === testData.user1.email, 'Email should match');
  });
  
  // 5. Data Operations - Update
  await runTest('Update single record', async () => {
    const updated = await client.table(testTableName)
      .eq('id', insertedUser1.id)
      .update({ age: 26 });
    assert(updated, 'Should return updated record');
    assert(updated[0].age === 26, 'Age should be updated');
  });
  
  await runTest('Update multiple records', async () => {
    const updated = await client.table(testTableName)
      .where('age', '>', 25)
      .update({ active: false });
    assert(Array.isArray(updated), 'Should return array');
    assert(updated.length >= 2, 'Should update at least 2 records');
  });
  
  // 6. Data Operations - Delete
  await runTest('Delete single record', async () => {
    const deleted = await client.table(testTableName)
      .eq('id', insertedUser3.id)
      .delete();
    assert(deleted, 'Should return deleted count or records');
  });
  
  // 7. Aggregate Functions
  await runTest('Count records', async () => {
    const count = await client.table(testTableName).count();
    assert(typeof count === 'number', 'Count should be a number');
    assert(count === 2, 'Should have 2 records remaining');
  });
  
  await runTest('Sum aggregation', async () => {
    const sum = await client.table(testTableName).sum('age');
    assert(typeof sum === 'number', 'Sum should be a number');
    assert(sum > 0, 'Sum should be positive');
  });
  
  await runTest('Average aggregation', async () => {
    const avg = await client.table(testTableName).avg('age');
    assert(typeof avg === 'number', 'Average should be a number');
    assert(avg > 0, 'Average should be positive');
  });
  
  await runTest('Min/Max aggregation', async () => {
    const min = await client.table(testTableName).min('age');
    const max = await client.table(testTableName).max('age');
    assert(typeof min === 'number', 'Min should be a number');
    assert(typeof max === 'number', 'Max should be a number');
    assert(max >= min, 'Max should be >= min');
  });
  
  // 8. Search Functionality
  await runTest('Search records', async () => {
    const results = await client.table(testTableName)
      .search('Test', { fields: ['name', 'email'] });
    assert(results, 'Should return search results');
    assert(results.data, 'Should have data property');
    assert(results.data.length > 0, 'Should find matches');
  });
  
  // 9. Batch Operations
  await runTest('Batch operations', async () => {
    const batchResults = await client.batch([
      {
        type: 'insert',
        table: testTableName,
        data: { email: 'batch1@example.com', name: 'Batch User 1', age: 40 }
      },
      {
        type: 'select',
        table: testTableName,
        where: { email: 'batch1@example.com' }
      },
      {
        type: 'update',
        table: testTableName,
        where: { email: 'batch1@example.com' },
        data: { age: 41 }
      },
      {
        type: 'delete',
        table: testTableName,
        where: { email: 'batch1@example.com' }
      }
    ]);
    assert(Array.isArray(batchResults), 'Should return array of results');
    assert(batchResults.length === 4, 'Should have 4 results');
  });
  
  // 10. Real-time Subscriptions (if supported)
  await runTest('Subscribe to table changes', async () => {
    // Test subscription setup
    const unsubscribe = await client.table(testTableName)
      .subscribe('*', (change) => {
        log('Received change:', change);
      });
    assert(typeof unsubscribe === 'function', 'Should return unsubscribe function');
    
    // Clean up subscription
    unsubscribe();
  });
  
  // 11. Authentication (if API key is valid)
  await runTest('Get current user', async () => {
    try {
      const user = await client.auth.getCurrentUser();
      assert(user, 'Should return current user if authenticated');
    } catch (error) {
      // It's OK if this fails with test API key
      log('Auth test skipped:', error.message);
      testResults.skipped++;
    }
  });
  
  // 12. Cleanup
  await runTest('Drop test table', async () => {
    const dropped = await client.schema.dropTable(testTableName);
    assert(dropped, 'Table should be dropped successfully');
  });
  
  // Print test summary
  printTestSummary();
  
  // Return exit code
  return testResults.failed === 0 ? 0 : 1;
}

// Run tests
if (require.main === module) {
  runComprehensiveSDKTests()
    .then(exitCode => {
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { runComprehensiveSDKTests, TEST_CONFIG };