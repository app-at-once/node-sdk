import { AppAtOnceClient } from '../../src/index.js';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface ApiSpec {
  paths: Record<string, Record<string, any>>;
  components: {
    schemas: Record<string, any>;
  };
}

interface TestCase {
  method: string;
  path: string;
  operation: any;
  expectedStatus: number[];
}

describe('Node.js SDK Contract Tests', () => {
  let client: AppAtOnceClient;
  let apiSpec: ApiSpec;
  let testCases: TestCase[];

  beforeAll(async () => {
    // Load API specification
    const specPath = path.join(__dirname, '../../../api-spec.yaml');
    const specContent = fs.readFileSync(specPath, 'utf8');
    apiSpec = yaml.parse(specContent);

    // Initialize client with mock server
    client = AppAtOnceClient.createWithApiKey(
      'test-api-key',
      'http://localhost:4000'
    );

    // Generate test cases from API spec
    testCases = generateTestCases(apiSpec);
  });

  afterAll(() => {
    // Cleanup
  });

  describe('API Contract Validation', () => {
    test('should have all required SDK methods for API endpoints', () => {
      const requiredMethods = [
        'auth.signIn',
        'auth.signUp', 
        'auth.getCurrentUser',
        'data.create',
        'data.get',
        'data.update',
        'data.delete',
        'data.query',
        'storage.upload',
        'storage.list',
        'email.send',
        'search.search',
        'ai.chat.completions'
      ];

      requiredMethods.forEach(methodPath => {
        const [module, ...method] = methodPath.split('.');
        let target = client[module as keyof typeof client];
        
        for (const m of method) {
          expect(target).toHaveProperty(m);
          target = target[m as keyof typeof target];
        }
        
        expect(typeof target).toBe('function');
      });
    });

    test('should validate request/response schemas for auth endpoints', async () => {
      // Test sign in
      const signInResponse = await client.auth.signIn({
        email: process.env.TEST_USER_EMAIL || `test_${Date.now()}@example.com`,
        password: process.env.TEST_USER_PASSWORD || `TestPass${Date.now()}!`
      });

      validateSchema(signInResponse, apiSpec.components.schemas.Session);

      // Test sign up
      const signUpResponse = await client.auth.signUp({
        email: process.env.NEW_USER_EMAIL || `newuser_${Date.now()}@example.com`,
        password: process.env.NEW_USER_PASSWORD || `TestPass${Date.now()}!`,
        data: { name: 'New User' }
      });

      validateSchema(signUpResponse, apiSpec.components.schemas.Session);
    });

    test('should validate request/response schemas for data operations', async () => {
      // Create
      const createResponse = await client.data.create('test_table', {
        name: 'Test Item',
        value: 42
      });

      expect(createResponse).toHaveProperty('id');
      expect(createResponse).toHaveProperty('createdAt');
      expect(createResponse).toHaveProperty('updatedAt');
      expect(createResponse.name).toBe('Test Item');
      expect(createResponse.value).toBe(42);

      // Read
      const getResponse = await client.data.get('test_table', createResponse.id);
      expect(getResponse.id).toBe(createResponse.id);
      expect(getResponse.name).toBe('Test Item');

      // Update
      const updateResponse = await client.data.update('test_table', createResponse.id, {
        name: 'Updated Item'
      });
      expect(updateResponse.id).toBe(createResponse.id);
      expect(updateResponse.name).toBe('Updated Item');

      // Query
      const queryResponse = await client.data.query('test_table');
      validateSchema(queryResponse, {
        type: 'array',
        items: { type: 'object' }
      });

      // Delete
      await expect(
        client.data.delete('test_table', createResponse.id)
      ).resolves.not.toThrow();
    });

    test('should validate storage operations', async () => {
      const uploadResponse = await client.storage.upload({
        key: 'test-file.txt',
        data: Buffer.from('test content'),
        contentType: 'text/plain'
      });

      validateSchema(uploadResponse, apiSpec.components.schemas.StorageFile);

      const listResponse = await client.storage.list();
      expect(listResponse).toHaveProperty('files');
      expect(Array.isArray(listResponse.files)).toBe(true);
    });

    test('should validate email operations', async () => {
      const emailResponse = await client.email.send({
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'This is a test email'
      });

      expect(emailResponse).toHaveProperty('id');
      expect(emailResponse).toHaveProperty('status');
    });

    test('should validate search operations', async () => {
      const searchResponse = await client.search.search({
        query: 'test',
        tables: ['test_table'],
        limit: 10
      });

      expect(searchResponse).toHaveProperty('results');
      expect(Array.isArray(searchResponse.results)).toBe(true);
      expect(searchResponse).toHaveProperty('total');
    });

    test('should validate AI operations', async () => {
      const chatResponse = await client.ai.chat.completions({
        messages: [
          { role: 'user', content: 'Hello, how are you?' }
        ],
        model: 'gpt-3.5-turbo'
      });

      validateSchema(chatResponse, apiSpec.components.schemas.ChatCompletion);
    });

    test('should handle error responses correctly', async () => {
      // Test 404 error
      await expect(
        client.data.get('nonexistent_table', 'nonexistent_id')
      ).rejects.toMatchObject({
        statusCode: 404
      });

      // Test 401 error
      const unauthorizedClient = AppAtOnceClient.createWithApiKey(
        'invalid-key',
        'http://localhost:4000'
      );

      await expect(
        unauthorizedClient.auth.getCurrentUser()
      ).rejects.toMatchObject({
        statusCode: 401
      });
    });
  });

  describe('Response Time Performance', () => {
    test('should respond within acceptable time limits', async () => {
      const operations = [
        { name: 'data.query', fn: () => client.data.query('todos') },
        { name: 'data.create', fn: () => client.data.create('todos', { title: 'Perf Test' }) },
        { name: 'storage.list', fn: () => client.storage.list({ limit: 10 }) },
        { name: 'search.search', fn: () => client.search.search({ query: 'test', limit: 5 }) }
      ];

      for (const op of operations) {
        const startTime = Date.now();
        await op.fn();
        const duration = Date.now() - startTime;
        
        expect(duration).toBeLessThan(5000); // 5 second timeout
        console.log(`${op.name}: ${duration}ms`);
      }
    });
  });
});

function generateTestCases(spec: ApiSpec): TestCase[] {
  const testCases: TestCase[] = [];
  
  for (const [pathKey, pathItem] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (typeof operation === 'object' && operation.responses) {
        const expectedStatus = Object.keys(operation.responses)
          .map(status => parseInt(status))
          .filter(status => !isNaN(status));
        
        testCases.push({
          method: method.toUpperCase(),
          path: pathKey,
          operation,
          expectedStatus
        });
      }
    }
  }
  
  return testCases;
}

function validateSchema(data: any, schema: any): void {
  if (!schema) return;

  switch (schema.type) {
    case 'object':
      expect(typeof data).toBe('object');
      expect(data).not.toBeNull();
      
      if (schema.required) {
        for (const requiredField of schema.required) {
          expect(data).toHaveProperty(requiredField);
        }
      }
      
      if (schema.properties) {
        for (const [propName, propSchema] of Object.entries(schema.properties)) {
          if (data.hasOwnProperty(propName)) {
            validateSchema(data[propName], propSchema);
          }
        }
      }
      break;
      
    case 'array':
      expect(Array.isArray(data)).toBe(true);
      if (schema.items && data.length > 0) {
        validateSchema(data[0], schema.items);
      }
      break;
      
    case 'string':
      expect(typeof data).toBe('string');
      if (schema.format === 'email') {
        expect(data).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      }
      if (schema.format === 'date-time') {
        expect(new Date(data).toISOString()).toBe(data);
      }
      break;
      
    case 'integer':
      expect(Number.isInteger(data)).toBe(true);
      break;
      
    case 'number':
      expect(typeof data).toBe('number');
      break;
      
    case 'boolean':
      expect(typeof data).toBe('boolean');
      break;
  }
}