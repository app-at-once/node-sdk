import { AppAtOnceClient, QueryBuilder } from '../../src/index.js';
import { startMockServer, stopMockServer, MOCK_SERVER_URL, TEST_API_KEY } from './setup.js';
import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';

describe('Data Module Integration Tests', () => {
  let client: AppAtOnceClient;

  beforeAll(async () => {
    await startMockServer();
    client = AppAtOnceClient.createWithApiKey(TEST_API_KEY, MOCK_SERVER_URL);
  });

  afterAll(async () => {
    await stopMockServer();
  });

  describe('CRUD Operations', () => {
    const testData = {
      title: 'Test Todo',
      description: 'This is a test todo item',
      completed: false
    };

    let createdId: string;

    test('should create a new record', async () => {
      const result = await client.data.create('todos', testData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe(testData.title);
      expect(result.description).toBe(testData.description);
      expect(result.completed).toBe(testData.completed);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();

      createdId = result.id;
    });

    test('should get a record by id', async () => {
      const result = await client.data.get('todos', createdId);

      expect(result).toBeDefined();
      expect(result.id).toBe(createdId);
      expect(result.title).toBe(testData.title);
    });

    test('should update a record', async () => {
      const updateData = {
        completed: true,
        description: 'Updated description'
      };

      const result = await client.data.update('todos', createdId, updateData);

      expect(result).toBeDefined();
      expect(result.id).toBe(createdId);
      expect(result.completed).toBe(true);
      expect(result.description).toBe('Updated description');
      expect(result.title).toBe(testData.title); // Should preserve existing fields
    });

    test('should delete a record', async () => {
      await expect(
        client.data.delete('todos', createdId)
      ).resolves.not.toThrow();

      // Verify it's deleted
      await expect(
        client.data.get('todos', createdId)
      ).rejects.toThrow();
    });
  });

  describe('Query Operations', () => {
    beforeEach(async () => {
      // Create test data
      await client.data.create('todos', {
        title: 'Todo 1',
        priority: 'high',
        completed: false,
        order: 1
      });
      await client.data.create('todos', {
        title: 'Todo 2',
        priority: 'medium',
        completed: true,
        order: 2
      });
      await client.data.create('todos', {
        title: 'Todo 3',
        priority: 'high',
        completed: false,
        order: 3
      });
    });

    test('should query with filters', async () => {
      const query = new QueryBuilder()
        .where('priority', 'high')
        .where('completed', false);

      const results = await client.data.query('todos', { query });

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      results.forEach(item => {
        expect(item.priority).toBe('high');
        expect(item.completed).toBe(false);
      });
    });

    test('should query with ordering', async () => {
      const query = new QueryBuilder()
        .orderBy('order', 'desc')
        .limit(2);

      const results = await client.data.query('todos', { query });

      expect(results).toBeDefined();
      expect(results.length).toBeLessThanOrEqual(2);
      if (results.length > 1) {
        expect(results[0].order).toBeGreaterThan(results[1].order);
      }
    });

    test('should query with pagination', async () => {
      const query1 = new QueryBuilder()
        .orderBy('order', 'asc')
        .limit(2)
        .offset(0);

      const results1 = await client.data.query('todos', { query: query1 });

      const query2 = new QueryBuilder()
        .orderBy('order', 'asc')
        .limit(2)
        .offset(2);

      const results2 = await client.data.query('todos', { query: query2 });

      expect(results1.length).toBeGreaterThan(0);
      expect(results2.length).toBeGreaterThan(0);
      
      // Ensure different results
      if (results1.length > 0 && results2.length > 0) {
        expect(results1[0].id).not.toBe(results2[0].id);
      }
    });

    test('should query with complex conditions', async () => {
      const query = new QueryBuilder()
        .where('priority', 'in', ['high', 'medium'])
        .where('completed', false)
        .orderBy('createdAt', 'desc');

      const results = await client.data.query('todos', { query });

      expect(results).toBeDefined();
      results.forEach(item => {
        expect(['high', 'medium']).toContain(item.priority);
        expect(item.completed).toBe(false);
      });
    });
  });

  describe('Batch Operations', () => {
    test('should create multiple records', async () => {
      const items = [
        { title: 'Batch 1', completed: false },
        { title: 'Batch 2', completed: true },
        { title: 'Batch 3', completed: false }
      ];

      const results = await client.data.createMany('todos', items);

      expect(results).toBeDefined();
      expect(results.length).toBe(3);
      expect(results[0].title).toBe('Batch 1');
      expect(results[1].title).toBe('Batch 2');
      expect(results[2].title).toBe('Batch 3');
    });

    test('should update multiple records', async () => {
      // First create some records
      const created = await client.data.createMany('todos', [
        { title: 'Update 1', completed: false },
        { title: 'Update 2', completed: false }
      ]);

      const updates = created.map(item => ({
        id: item.id,
        data: { completed: true }
      }));

      const results = await client.data.updateMany('todos', updates);

      expect(results).toBeDefined();
      expect(results.length).toBe(2);
      results.forEach(item => {
        expect(item.completed).toBe(true);
      });
    });

    test('should delete multiple records', async () => {
      // First create some records
      const created = await client.data.createMany('todos', [
        { title: 'Delete 1' },
        { title: 'Delete 2' }
      ]);

      const ids = created.map(item => item.id);

      await expect(
        client.data.deleteMany('todos', ids)
      ).resolves.not.toThrow();

      // Verify they're deleted
      for (const id of ids) {
        await expect(
          client.data.get('todos', id)
        ).rejects.toThrow();
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle non-existent record', async () => {
      await expect(
        client.data.get('todos', 'non-existent-id')
      ).rejects.toThrow();
    });

    test('should handle invalid table name', async () => {
      await expect(
        client.data.query('invalid_table')
      ).resolves.toEqual([]);
    });

    test('should handle network errors gracefully', async () => {
      const badClient = AppAtOnceClient.createWithApiKey(
        TEST_API_KEY,
        'http://localhost:9999' // Non-existent server
      );

      await expect(
        badClient.data.query('todos')
      ).rejects.toThrow();
    });
  });
});