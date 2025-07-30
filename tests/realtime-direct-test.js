#!/usr/bin/env node

const io = require('socket.io-client');

const API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

console.log('=== Direct Real-time Test ===\n');

const socket = io(BASE_URL, {
  path: '/socket.io/',
  query: { apiKey: API_KEY },
  transports: ['websocket', 'polling'],
  withCredentials: true,
});

let connected = false;

socket.on('connect', () => {
  console.log('✓ Socket connected');
});

socket.on('connected', (data) => {
  console.log('✓ Authenticated:', data);
  connected = true;
  
  // Subscribe to a test table
  socket.emit('subscribe_table', {
    table: 'direct_test_table',
    events: ['INSERT', 'UPDATE', 'DELETE']
  });
});

socket.on('subscription_confirmed', (data) => {
  console.log('✓ Subscription confirmed:', data);
  
  // Simulate a direct event emission
  console.log('\nWaiting for database_change events...');
});

socket.on('database_change', (data) => {
  console.log('✅ Received database_change event:', data);
  socket.disconnect();
  process.exit(0);
});

socket.on('subscription_error', (error) => {
  console.log('❌ Subscription error:', error);
});

socket.on('error', (error) => {
  console.log('❌ Error:', error);
});

// After 5 seconds, give up
setTimeout(() => {
  console.log('\n❌ No events received after 5 seconds');
  socket.disconnect();
  process.exit(1);
}, 5000);