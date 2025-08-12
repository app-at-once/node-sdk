#!/usr/bin/env node

const { AppAtOnceClient } = require('../dist');
require('dotenv').config();

const apiKey = process.env.APPATONCE_API_KEY;
if (!apiKey) {
  console.error('❌ APPATONCE_API_KEY environment variable required');
  process.exit(1);
}

async function testMigrationProgress() {
  console.log('🚀 Testing migration progress with Socket.io...\n');
  
  const client = new AppAtOnceClient(apiKey);
  
  // Simple test schema
  const testSchema = {
    test_migration_table: {
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
        { name: 'name', type: 'string', nullable: false },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' }
      ]
    }
  };
  
  try {
    console.log('📡 Connecting to realtime server...');
    if (client.realtime) {
      await client.realtime.connect({ debug: true });
      console.log('✅ Connected to realtime server\n');
    }
    
    console.log('🔄 Starting migration with progress tracking...\n');
    
    const result = await client.schema.migrate(testSchema, {
      dryRun: true,
      onProgress: (progress) => {
        console.log('📊 Progress Event:', progress);
        
        if (progress.type === 'info') {
          console.log(`ℹ️  ${progress.message}`);
        } else if (progress.type === 'progress' && progress.total) {
          const percentage = Math.round((progress.current / progress.total) * 100);
          console.log(`📊 Progress: ${percentage}% (${progress.current}/${progress.total}) - ${progress.table || ''}`);
        } else if (progress.type === 'complete') {
          console.log(`✅ ${progress.message || 'Completed'}`);
        } else if (progress.type === 'error') {
          console.log(`❌ ${progress.message}`);
        }
      }
    });
    
    console.log('\n✅ Migration completed:', result.success ? 'Success' : 'Failed');
    
    if (result.plan) {
      console.log('\n📋 Migration Plan:');
      console.log('Tables to create:', result.plan.tables.create);
      console.log('Tables to modify:', result.plan.tables.modify);
      console.log('Tables to drop:', result.plan.tables.drop);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    if (client.realtime && client.realtime.isConnected()) {
      client.realtime.disconnect();
    }
    process.exit(0);
  }
}

testMigrationProgress();