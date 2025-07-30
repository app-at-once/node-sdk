#!/usr/bin/env node

const io = require('socket.io-client');

const API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

console.log('=== Socket.io Debug Test ===\n');

console.log('1. Connecting to Socket.io server...');
const socket = io(BASE_URL, {
  path: '/socket.io/',
  query: {
    apiKey: API_KEY,
  },
  transports: ['websocket', 'polling'],
  withCredentials: true,
});

socket.on('connect', () => {
  console.log('✓ Connected! Socket ID:', socket.id);
  console.log('✓ Connected status:', socket.connected);
  
  // Try subscribing after a short delay
  setTimeout(() => {
    console.log('\n2. Subscribing to table...');
    socket.emit('subscribe_table', {
      table: 'test_table',
      events: ['INSERT', 'UPDATE', 'DELETE']
    });
  }, 100);
});

socket.on('connected', (data) => {
  console.log('✓ Received connected event:', data);
});

socket.on('subscription_confirmed', (data) => {
  console.log('✓ Subscription confirmed:', data);
  
  // Close after success
  setTimeout(() => {
    console.log('\n3. Disconnecting...');
    socket.disconnect();
    process.exit(0);
  }, 1000);
});

socket.on('subscription_error', (data) => {
  console.log('❌ Subscription error:', data);
});

socket.on('error', (error) => {
  console.log('❌ Socket error:', error);
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('✓ Disconnected:', reason);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('\n❌ Test timed out');
  socket.disconnect();
  process.exit(1);
}, 10000);