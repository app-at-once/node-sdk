#!/usr/bin/env node

const { io } = require('socket.io-client');
const chalk = require('chalk');

// Get command line arguments
const args = process.argv.slice(2);
const apiKey = args[0] || process.env.APPATONCE_API_KEY;
// Note: In production, this would connect to https://api.appatonce.com
const serverUrl = args[1] || 'http://localhost:8091';
const migrationId = args[2] || `migration-${Date.now()}`;

if (!apiKey) {
  console.error(chalk.red('❌ API key required!'));
  console.log('Usage: node socket-client.js <API_KEY> [SERVER_URL] [MIGRATION_ID]');
  process.exit(1);
}

console.log(chalk.blue('🚀 Connecting to Socket.io server...'));
console.log(chalk.gray(`Server: ${serverUrl}`));
console.log(chalk.gray(`API Key: ${apiKey.substring(0, 10)}...`));
console.log(chalk.gray(`Migration ID: ${migrationId}`));

const socket = io(serverUrl, {
  path: '/socket.io/',
  query: {
    apiKey: apiKey
  },
  transports: ['websocket', 'polling'],
  timeout: 10000,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

// Connection events
socket.on('connect', () => {
  console.log(chalk.green('✅ Connected to server'));
  console.log(chalk.gray(`Socket ID: ${socket.id}`));
  
  // Join migration room
  console.log(chalk.yellow(`🔗 Joining migration room: migration:${migrationId}`));
  socket.emit('join_room', { room: `migration:${migrationId}` });
});

socket.on('connected', (data) => {
  console.log(chalk.green('✅ Authenticated with server'), data);
});

socket.on('error', (error) => {
  console.error(chalk.red('❌ Socket error:'), error);
});

socket.on('connect_error', (error) => {
  console.error(chalk.red('❌ Connection error:'), error.message);
  if (error.type === 'TransportError') {
    console.log(chalk.yellow('💡 Check if the server is running on', serverUrl));
  }
});

socket.on('disconnect', (reason) => {
  console.log(chalk.yellow('⚠️  Disconnected:'), reason);
});

// Migration progress events
socket.on('migration_progress', (data) => {
  console.log(chalk.cyan('📊 Migration Progress:'), JSON.stringify(data, null, 2));
  
  if (data.type === 'info') {
    console.log(chalk.blue(`ℹ️  ${data.message}`));
  } else if (data.type === 'progress' && data.total) {
    const percentage = Math.round((data.current / data.total) * 100);
    const barLength = 30;
    const filled = Math.round((barLength * data.current) / data.total);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    
    console.log(chalk.cyan(`📊 [${bar}] ${percentage}% (${data.current}/${data.total})`));
    if (data.table) {
      console.log(chalk.gray(`   Processing: ${data.table}`));
    }
  } else if (data.type === 'complete') {
    console.log(chalk.green(`✅ ${data.message || 'Migration completed'}`));
  } else if (data.type === 'error') {
    console.log(chalk.red(`❌ ${data.message}`));
  }
});

// Listen to all events for debugging
socket.onAny((eventName, ...args) => {
  console.log(chalk.magenta(`📡 Event: ${eventName}`), args);
});

// Keep the process running
process.on('SIGINT', () => {
  console.log(chalk.blue('\n👋 Closing connection...'));
  socket.emit('leave_room', { room: `migration:${migrationId}` });
  socket.disconnect();
  process.exit(0);
});

console.log(chalk.gray('\nListening for migration progress events...'));
console.log(chalk.gray('Press Ctrl+C to exit\n'));