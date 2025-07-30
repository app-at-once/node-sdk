#!/usr/bin/env node

const { AppAtOnceClient } = require('../dist');

// Test configurations
const PROJECT_API_KEY = 'appatonce_MC44NzQzNTk4MjUzNTg2MzY0';
const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

// Test results
const results = {
  project: { passed: 0, failed: 0, errors: [] },
  app: { passed: 0, failed: 0, errors: [] }
};

// Helper function to run a test
async function runTest(name, testFn, context) {
  try {
    console.log(`  Running: ${name}`);
    await testFn();
    results[context].passed++;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    results[context].failed++;
    results[context].errors.push({ test: name, error: error.message });
    console.error(`  ✗ ${name}: ${error.message}`);
  }
}

// Test suite for Schema operations
async function testSchemaOperations(client, apiKey, context) {
  console.log(`\n=== Schema Operations (${context}) ===`);
  
  const tableName = `test_${context}_${Date.now()}`;
  
  await runTest('Create table', async () => {
    const schema = await client.schema.createTable({
      name: tableName,
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true },
        { name: 'title', type: 'varchar', required: true },
        { name: 'content', type: 'text' },
        { name: 'published', type: 'boolean', defaultValue: false },
        { name: 'created_at', type: 'timestamp', defaultValue: 'now()' }
      ]
    });
    if (!schema) throw new Error('Table creation failed');
  }, context);
  
  await runTest('List tables', async () => {
    const tables = await client.schema.listTables();
    if (!Array.isArray(tables)) throw new Error('Expected array of tables');
    const found = tables.some(t => t.name === tableName);
    if (!found) throw new Error(`Table ${tableName} not found in list`);
  }, context);
  
  await runTest('Get table schema', async () => {
    const schema = await client.schema.getTable(tableName);
    if (!schema) throw new Error('Failed to get table schema');
    if (schema.name !== tableName) throw new Error('Table name mismatch');
  }, context);
  
  // Clean up
  await runTest('Drop table', async () => {
    const dropped = await client.schema.dropTable(tableName);
    if (!dropped) throw new Error('Failed to drop table');
  }, context);
}

// Test suite for CRUD operations
async function testCRUDOperations(client, apiKey, context) {
  console.log(`\n=== CRUD Operations (${context}) ===`);
  
  const tableName = `crud_test_${context}_${Date.now()}`;
  
  // Setup
  await client.schema.createTable({
    name: tableName,
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true },
      { name: 'name', type: 'varchar', required: true },
      { name: 'email', type: 'varchar', unique: true },
      { name: 'age', type: 'integer' }
    ]
  });
  
  let recordId;
  
  await runTest('Insert single record', async () => {
    const result = await client.table(tableName).insert({
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    });
    if (!result || !result.id) throw new Error('Insert failed');
    recordId = result.id;
  }, context);
  
  await runTest('Select record by ID', async () => {
    const result = await client.table(tableName)
      .select('*')
      .eq('id', recordId)
      .first();
    if (!result) throw new Error('Record not found');
    if (result.name !== 'John Doe') throw new Error('Data mismatch');
  }, context);
  
  await runTest('Update record', async () => {
    const result = await client.table(tableName)
      .eq('id', recordId)
      .update({ age: 31 });
    if (!result || result[0].age !== 31) throw new Error('Update failed');
  }, context);
  
  await runTest('Delete record', async () => {
    const result = await client.table(tableName)
      .eq('id', recordId)
      .delete();
    if (!result) throw new Error('Delete failed');
  }, context);
  
  // Cleanup
  await client.schema.dropTable(tableName);
}

// Test suite for Query building
async function testQueryBuilding(client, apiKey, context) {
  console.log(`\n=== Query Building (${context}) ===`);
  
  const tableName = `query_test_${context}_${Date.now()}`;
  
  // Setup
  await client.schema.createTable({
    name: tableName,
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true },
      { name: 'name', type: 'varchar' },
      { name: 'score', type: 'integer' },
      { name: 'active', type: 'boolean' }
    ]
  });
  
  // Insert test data
  await client.table(tableName).insert([
    { name: 'Alice', score: 90, active: true },
    { name: 'Bob', score: 75, active: true },
    { name: 'Charlie', score: 85, active: false },
    { name: 'David', score: 95, active: true }
  ]);
  
  await runTest('Where clause', async () => {
    const result = await client.table(tableName)
      .select('*')
      .where('score', '>', 80)
      .execute();
    if (result.data.length !== 3) throw new Error('Expected 3 records');
  }, context);
  
  await runTest('OrderBy', async () => {
    const result = await client.table(tableName)
      .select('*')
      .orderBy('score', 'desc')
      .execute();
    if (result.data[0].score !== 95) throw new Error('Ordering failed');
  }, context);
  
  await runTest('Limit', async () => {
    const result = await client.table(tableName)
      .select('*')
      .limit(2)
      .execute();
    if (result.data.length !== 2) throw new Error('Limit failed');
  }, context);
  
  await runTest('Multiple filters', async () => {
    const result = await client.table(tableName)
      .select('*')
      .where('score', '>', 80)
      .eq('active', true)
      .execute();
    if (result.data.length !== 2) throw new Error('Multiple filters failed');
  }, context);
  
  // Cleanup
  await client.schema.dropTable(tableName);
}

// Main test runner
async function runAllTests() {
  console.log('=== AppAtOnce SDK Test Runner ===\n');
  
  // Test with Project API Key
  // console.log('\n📁 Testing with PROJECT API Key');
  // const projectClient = AppAtOnceClient.createWithApiKey(PROJECT_API_KEY, BASE_URL);
  
  // await runTest('Server ping (project)', async () => {
  //   const result = await projectClient.ping();
  //   if (!result) throw new Error('Server ping failed');
  // }, 'project');
  
  // await testSchemaOperations(projectClient, PROJECT_API_KEY, 'project');
  // await testCRUDOperations(projectClient, PROJECT_API_KEY, 'project');
  // await testQueryBuilding(projectClient, PROJECT_API_KEY, 'project');
  
  // Test with App API Key
  console.log('\n\n📱 Testing with APP API Key');
  const appClient = AppAtOnceClient.createWithApiKey(APP_API_KEY, BASE_URL);
  
  // Skip ping test as endpoint doesn't exist
  // await runTest('Server ping (app)', async () => {
  //   const result = await appClient.ping();
  //   if (!result) throw new Error('Server ping failed');
  // }, 'app');
  
  await testSchemaOperations(appClient, APP_API_KEY, 'app');
  await testCRUDOperations(appClient, APP_API_KEY, 'app');
  await testQueryBuilding(appClient, APP_API_KEY, 'app');
  
  // Print summary
  console.log('\n\n=== Test Summary ===');
  console.log(`\nProject API Key Tests:`);
  console.log(`  Passed: ${results.project.passed}`);
  console.log(`  Failed: ${results.project.failed}`);
  if (results.project.failed > 0) {
    console.log('  Errors:');
    results.project.errors.forEach(e => 
      console.log(`    - ${e.test}: ${e.error}`)
    );
  }
  
  console.log(`\nApp API Key Tests:`);
  console.log(`  Passed: ${results.app.passed}`);
  console.log(`  Failed: ${results.app.failed}`);
  if (results.app.failed > 0) {
    console.log('  Errors:');
    results.app.errors.forEach(e => 
      console.log(`    - ${e.test}: ${e.error}`)
    );
  }
  
  const totalPassed = results.project.passed + results.app.passed;
  const totalFailed = results.project.failed + results.app.failed;
  
  console.log(`\nTotal: ${totalPassed} passed, ${totalFailed} failed`);
  
  return totalFailed === 0 ? 0 : 1;
}

// Run tests
runAllTests()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });