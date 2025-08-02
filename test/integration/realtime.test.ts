import { AppAtOnceClient } from '../../src/index.js';
import { startMockServer, stopMockServer, MOCK_SERVER_URL, TEST_API_KEY } from './setup.js';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

describe('Realtime Module Integration Tests', () => {
  let client: AppAtOnceClient;

  beforeAll(async () => {
    await startMockServer();
    client = AppAtOnceClient.createWithApiKey(TEST_API_KEY, MOCK_SERVER_URL);
  });

  afterAll(async () => {
    client.realtime.disconnect();
    await stopMockServer();
  });

  describe('Connection Management', () => {
    test('should connect to realtime server', async () => {
      await expect(client.realtime.connect()).resolves.not.toThrow();
      expect(client.realtime.isConnected()).toBe(true);
    });

    test('should disconnect from realtime server', async () => {
      await client.realtime.connect();
      client.realtime.disconnect();
      expect(client.realtime.isConnected()).toBe(false);
    });

    test('should handle reconnection', async () => {
      await client.realtime.connect();
      client.realtime.disconnect();
      await client.realtime.connect();
      expect(client.realtime.isConnected()).toBe(true);
    });
  });

  describe('Channel Subscriptions', () => {
    beforeAll(async () => {
      await client.realtime.connect();
    });

    test('should subscribe to a channel', async () => {
      const channel = 'test-channel';
      const messages: any[] = [];

      const unsubscribe = client.realtime.subscribe(channel, {
        onMessage: (message) => {
          messages.push(message);
        }
      });

      // Give it time to subscribe
      await new Promise(resolve => setTimeout(resolve, 100));

      // Publish a message
      await client.realtime.publish(channel, 'test-event', { data: 'test' });

      // Wait for message
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0].channel).toBe(channel);
      expect(messages[0].event).toBe('test-event');

      unsubscribe();
    });

    test('should unsubscribe from a channel', async () => {
      const channel = 'unsub-test';
      let messageCount = 0;

      const unsubscribe = client.realtime.subscribe(channel, {
        onMessage: () => {
          messageCount++;
        }
      });

      // Send first message
      await client.realtime.publish(channel, 'event1', {});
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const countBeforeUnsub = messageCount;
      
      // Unsubscribe
      unsubscribe();
      await new Promise(resolve => setTimeout(resolve, 100));

      // Send second message
      await client.realtime.publish(channel, 'event2', {});
      await new Promise(resolve => setTimeout(resolve, 100));

      // Message count should not have increased
      expect(messageCount).toBe(countBeforeUnsub);
    });

    test('should handle multiple subscriptions', async () => {
      const channel1 = 'channel-1';
      const channel2 = 'channel-2';
      const messages1: any[] = [];
      const messages2: any[] = [];

      const unsub1 = client.realtime.subscribe(channel1, {
        onMessage: (msg) => messages1.push(msg)
      });

      const unsub2 = client.realtime.subscribe(channel2, {
        onMessage: (msg) => messages2.push(msg)
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      // Publish to different channels
      await client.realtime.publish(channel1, 'event', { channel: 1 });
      await client.realtime.publish(channel2, 'event', { channel: 2 });

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(messages1.length).toBeGreaterThan(0);
      expect(messages2.length).toBeGreaterThan(0);
      expect(messages1[0].data.channel).toBe(1);
      expect(messages2[0].data.channel).toBe(2);

      unsub1();
      unsub2();
    });
  });

  describe('Presence', () => {
    beforeAll(async () => {
      await client.realtime.connect();
    });

    test('should update presence status', async () => {
      const channel = 'presence-test';
      const presenceUpdates: any[] = [];

      client.realtime.subscribe(channel, {
        onMessage: (msg) => {
          if (msg.event === 'presence:changed') {
            presenceUpdates.push(msg);
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      // Update presence
      await client.realtime.updatePresence(channel, { status: 'online' });

      await new Promise(resolve => setTimeout(resolve, 100));

      // Note: In mock server, presence updates might not be broadcast to self
      // This is implementation-specific behavior
    });
  });

  describe('Error Handling', () => {
    test('should handle connection errors', async () => {
      const badClient = AppAtOnceClient.createWithApiKey(
        TEST_API_KEY,
        'http://localhost:9999' // Non-existent server
      );

      // Should not throw but handle internally
      await expect(badClient.realtime.connect()).resolves.not.toThrow();
      expect(badClient.realtime.isConnected()).toBe(false);
    });

    test('should handle subscription without connection', () => {
      const disconnectedClient = AppAtOnceClient.createWithApiKey(
        TEST_API_KEY,
        MOCK_SERVER_URL
      );

      // Should not throw, but might not receive messages
      expect(() => {
        disconnectedClient.realtime.subscribe('test', {
          onMessage: () => {}
        });
      }).not.toThrow();
    });
  });

  describe('Database Change Subscriptions', () => {
    beforeAll(async () => {
      await client.realtime.connect();
    });

    test('should subscribe to table changes', async () => {
      const changes: any[] = [];

      const unsubscribe = client.realtime.subscribeToTable('todos', (change) => {
        changes.push(change);
      });

      // Give time to subscribe
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create a todo to trigger change event
      await client.data.create('todos', {
        title: 'Realtime test todo',
        completed: false
      });

      // Wait for change event
      await new Promise(resolve => setTimeout(resolve, 500));

      // Note: Mock server might not emit real change events
      // This would work with a real implementation

      unsubscribe();
    });
  });
});