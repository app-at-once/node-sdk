#!/usr/bin/env node

// Simple Socket.io client for command line
const io = require('socket.io-client');

// Configuration
// Note: In production, this would connect to https://api.appatonce.com
const serverUrl = process.argv[2] || 'http://localhost:8091';
const apiKey = process.argv[3] || process.env.APPATONCE_API_KEY;

if (!apiKey) {
  console.error('Usage: node simple-socket-client.js [SERVER_URL] [API_KEY]');
  console.error('Or set APPATONCE_API_KEY environment variable');
  process.exit(1);
}

console.log(`Connecting to ${serverUrl}...`);

// Create socket connection
const socket = io(serverUrl, {
  path: '/socket.io/',
  query: { apiKey },
  transports: ['websocket', 'polling']
});

// Connection handlers
socket.on('connect', () => {
  console.log('✅ Connected!');
  console.log('Socket ID:', socket.id);
  
  // Example: Join a room for migration progress
  const migrationId = `migration-${Date.now()}`;
  socket.emit('join_room', { room: `migration:${migrationId}` });
  console.log(`Joined room: migration:${migrationId}`);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected:', reason);
});

socket.on('error', (error) => {
  console.error('Error:', error);
});

// Listen for migration progress
socket.on('migration_progress', (data) => {
  console.log('📊 Migration Progress:', JSON.stringify(data, null, 2));
});

// Listen to all events
socket.onAny((event, ...args) => {
  console.log(`📡 Event: ${event}`, args);
});

// Handle CTRL+C
process.on('SIGINT', () => {
  console.log('\nDisconnecting...');
  socket.disconnect();
  process.exit(0);
});

console.log('Listening for events... Press CTRL+C to exit');