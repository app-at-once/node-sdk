const axios = require('axios');
const { AppAtOnceClient } = require('../dist');

// Test configuration based on environment
const TEST_CONFIG = {
  // Use environment variables or defaults
  baseUrl: process.env.CI 
    ? 'https://api.appatonce.com' 
    : (process.env.APPATONCE_TEST_BASE_URL || 'http://localhost:8091'),
  
  // Test user configuration
  testUser: {
    email: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`,
    password: `Test${Date.now()}!`, // Dynamic password for security
    name: 'SDK Test User',
    organizationName: 'SDK Test Org'
  }
};

class TestUtils {
  constructor() {
    this.config = TEST_CONFIG;
    this.adminApiKey = null;
    this.testUserApiKey = null;
    this.testUserId = null;
    this.testOrgId = null;
    this.testProjectId = null;
    this.createdTables = [];
    this.client = null;
  }

  // Initialize test environment
  async setup() {
    try {
      console.log(`Setting up tests against: ${this.config.baseUrl}`);
      
      // Create test user
      await this.createTestUser();
      
      // Create client with test user's API key
      this.client = AppAtOnceClient.createWithApiKey(
        this.testUserApiKey,
        this.config.baseUrl
      );
      
      return this.client;
    } catch (error) {
      console.error('Test setup failed:', error);
      throw error;
    }
  }

  // Create test user with organization and project
  async createTestUser() {
    try {
      // Skip if no API key is provided (use mocks instead)
      if (!process.env.APPATONCE_TEST_API_KEY || process.env.APPATONCE_TEST_API_KEY === 'test-api-key') {
        console.log('No real API key provided, using mock data');
        this.testUserApiKey = 'mock-api-key';
        this.testUserId = 'mock-user-id';
        this.testOrgId = 'mock-org-id';
        this.testProjectId = 'mock-project-id';
        return;
      }
      // 1. Register user
      const registerResponse = await axios.post(
        `${this.config.baseUrl}/api/v1/auth/register`,
        {
          email: this.config.testUser.email,
          password: this.config.testUser.password,
          name: this.config.testUser.name
        }
      );
      
      // Handle different response structures
      const responseData = registerResponse.data;
      this.testUserId = responseData.user?.id || responseData.id || responseData.userId;
      const authToken = responseData.access_token || responseData.accessToken || responseData.token;
      
      // 2. Create organization
      const orgResponse = await axios.post(
        `${this.config.baseUrl}/api/v1/organizations`,
        { name: this.config.testUser.organizationName },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      this.testOrgId = orgResponse.data.id;
      
      // 3. Create project
      const projectResponse = await axios.post(
        `${this.config.baseUrl}/api/v1/projects`,
        {
          name: 'SDK Test Project',
          organizationId: this.testOrgId
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      this.testProjectId = projectResponse.data.id;
      
      // 4. Get API key for the project
      const apiKeyResponse = await axios.get(
        `${this.config.baseUrl}/api/v1/projects/${this.testProjectId}/api-keys`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      if (apiKeyResponse.data && apiKeyResponse.data.length > 0) {
        this.testUserApiKey = apiKeyResponse.data[0].key;
      } else {
        // Create API key if none exists
        const createKeyResponse = await axios.post(
          `${this.config.baseUrl}/api/v1/projects/${this.testProjectId}/api-keys`,
          { name: 'SDK Test Key' },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        this.testUserApiKey = createKeyResponse.data.key;
      }
      
      console.log('Test user created successfully');
    } catch (error) {
      console.error('Failed to create test user:', error.response?.data || error.message);
      // If we can't create a test user, fall back to mock mode
      console.log('Falling back to mock mode');
      this.testUserApiKey = 'mock-api-key';
      this.testUserId = 'mock-user-id';
      this.testOrgId = 'mock-org-id';
      this.testProjectId = 'mock-project-id';
    }
  }

  // Track created tables for cleanup
  trackTable(tableName) {
    this.createdTables.push(tableName);
  }

  // Clean up all test data
  async cleanup() {
    console.log('Cleaning up test data...');
    
    try {
      // 1. Drop all created tables
      for (const tableName of this.createdTables) {
        try {
          await this.client.schema.dropTable(tableName);
          console.log(`Dropped table: ${tableName}`);
        } catch (error) {
          // Table might already be dropped
        }
      }
      
      // 2. Delete test user (this should cascade delete org and project)
      if (this.testUserId && this.config.testUser.email && this.config.testUser.password) {
        try {
          // Login as test user
          const loginResponse = await axios.post(
            `${this.config.baseUrl}/api/v1/auth/login`,
            {
              email: this.config.testUser.email,
              password: this.config.testUser.password
            }
          );
          
          const authToken = loginResponse.data.access_token;
          
          // Delete user account
          await axios.delete(
            `${this.config.baseUrl}/api/v1/users/${this.testUserId}`,
            { headers: { Authorization: `Bearer ${authToken}` } }
          );
          
          console.log('Test user deleted successfully');
        } catch (error) {
          console.error('Failed to delete test user:', error.response?.data || error.message);
        }
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  // Generate unique test identifiers
  generateTestId() {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Wait for condition
  async waitFor(condition, timeout = 5000, interval = 100) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error('Timeout waiting for condition');
  }
}

module.exports = TestUtils;