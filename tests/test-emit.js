#!/usr/bin/env node

const io = require('socket.io-client');

const API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';
const TEST_TABLE = 'emit_test_table';

console.log('=== Socket.io Event Emission Test ===\n');

const socket = io(BASE_URL, {
  path: '/socket.io/',
  query: { apiKey: API_KEY },
  transports: ['websocket', 'polling'],
  withCredentials: true,
});

socket.on('connect', () => {
  console.log('✓ Socket connected');
});

socket.on('connected', (data) => {
  console.log('✓ Authenticated:', data);
  
  // Subscribe to test table
  console.log(`\nSubscribing to table: ${TEST_TABLE}`);
  socket.emit('subscribe_table', {
    table: TEST_TABLE,
    events: ['INSERT', 'UPDATE', 'DELETE']
  });
});

socket.on('subscription_confirmed', (data) => {
  console.log('✓ Subscription confirmed:', data);
  
  // Now emit a test event
  console.log('\nEmitting test event...');
  socket.emit('test:emit_event', { table: TEST_TABLE });
});

socket.on('database_change', (data) => {
  console.log('\n✅ SUCCESS! Received database_change event:', JSON.stringify(data, null, 2));
  socket.disconnect();
  process.exit(0);
});

socket.on('subscription_error', (error) => {
  console.log('❌ Subscription error:', error);
});

socket.on('error', (error) => {
  console.log('❌ Error:', error);
});

setTimeout(() => {
  console.log('\n❌ Test timed out - no events received');
  socket.disconnect();
  process.exit(1);
}, 5000);