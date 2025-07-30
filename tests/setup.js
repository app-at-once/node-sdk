// Jest setup file for AppAtOnce SDK tests

// Set test timeout
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  // Generate unique test identifiers
  generateTestId: () => `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  
  // Wait for a condition to be true
  waitFor: async (condition, timeout = 5000, interval = 100) => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error('Timeout waiting for condition');
  },
  
  // Clean up test data
  cleanupTestData: async (client, tablePrefix) => {
    try {
      const tables = await client.schema.listTables();
      const testTables = tables.filter(t => t.name.startsWith(tablePrefix));
      for (const table of testTables) {
        await client.schema.dropTable(table.name);
      }
    } catch (error) {
      console.warn('Cleanup warning:', error.message);
    }
  }
};

// Environment validation and mock setup
beforeAll(() => {
  const requiredEnvVars = ['APPATONCE_TEST_API_KEY'];
  const missingVars = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0 || process.env.APPATONCE_TEST_API_KEY === 'test-api-key') {
    console.warn(`
      ⚠️  Missing environment variables: ${missingVars.join(', ')}
      
      To run tests against a real AppAtOnce instance, set:
      - APPATONCE_TEST_API_KEY: Your test API key
      - APPATONCE_TEST_BASE_URL: API base URL (optional, defaults to http://localhost:8080)
      
      Tests will run with mock data if not provided.
    `);
    
    // Enable axios mocking
    jest.mock('axios');
  }
});

// Global error handler
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection in tests:', error);
});