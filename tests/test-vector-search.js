#!/usr/bin/env node

const { AppAtOnceClient } = require('../dist');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function testVectorSearch() {
  console.log('=== Vector Search Test ===\n');
  
  const client = AppAtOnceClient.createWithApiKey(APP_API_KEY, BASE_URL);
  const tableName = `vector_test_${Date.now()}`;
  
  try {
    // 1. Create table with embeddable fields
    console.log('1. Creating table with embeddable fields...');
    await client.schema.createTable({
      name: tableName,
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true },
        { name: 'title', type: 'varchar', required: true, searchable: true },
        { name: 'content', type: 'text', searchable: true, embeddable: true },
        { name: 'description', type: 'text', embeddable: true }
      ]
    });
    console.log('✓ Table created');
    
    // 2. Insert test documents
    console.log('\n2. Inserting test documents...');
    const documents = [
      {
        title: 'Introduction to Machine Learning',
        content: 'Machine learning is a subset of artificial intelligence that enables computers to learn from data without being explicitly programmed.',
        description: 'A comprehensive guide to understanding the basics of machine learning and its applications.'
      },
      {
        title: 'Deep Learning Fundamentals',
        content: 'Deep learning uses neural networks with multiple layers to progressively extract higher-level features from raw input.',
        description: 'Learn about neural networks, backpropagation, and modern deep learning architectures.'
      },
      {
        title: 'Natural Language Processing',
        content: 'NLP combines computational linguistics with machine learning to enable computers to understand and process human language.',
        description: 'Explore text processing, sentiment analysis, and language generation techniques.'
      },
      {
        title: 'Computer Vision Applications',
        content: 'Computer vision enables machines to interpret and understand visual information from the world, similar to human vision.',
        description: 'Image recognition, object detection, and visual understanding for AI systems.'
      }
    ];
    
    for (const doc of documents) {
      const result = await client.table(tableName).insert(doc);
      console.log(`✓ Inserted: ${doc.title} (${result.id})`);
    }
    
    // Wait a bit for indexing
    console.log('\n3. Waiting for indexing...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 4. Test semantic search
    console.log('\n4. Testing semantic search...');
    const searchQueries = [
      { query: 'AI and neural networks', description: 'Should find deep learning and ML content' },
      { query: 'understanding human language', description: 'Should find NLP content' },
      { query: 'image processing and recognition', description: 'Should find computer vision content' }
    ];
    
    for (const search of searchQueries) {
      console.log(`\nSearching for: "${search.query}"`);
      console.log(`Expected: ${search.description}`);
      
      try {
        const results = await client.table(tableName).search({
          semantic: search.query,
          limit: 3
        });
        
        console.log(`Found ${results.count || results.data?.length || 0} results:`);
        if (results.data && results.data.length > 0) {
          results.data.forEach((result, i) => {
            console.log(`  ${i + 1}. ${result.title}`);
          });
        }
      } catch (error) {
        console.error('Search error:', error.message);
      }
    }
    
    // 5. Test hybrid search (text + semantic)
    console.log('\n\n5. Testing hybrid search...');
    try {
      const hybridResults = await client.table(tableName).search({
        text: 'learning',
        semantic: 'artificial intelligence applications',
        boost: { text: 1.0, semantic: 1.5 },
        limit: 5
      });
      
      console.log(`Hybrid search found ${hybridResults.count || hybridResults.data?.length || 0} results`);
      if (hybridResults.data) {
        hybridResults.data.forEach((result, i) => {
          console.log(`  ${i + 1}. ${result.title}`);
        });
      }
    } catch (error) {
      console.error('Hybrid search error:', error.message);
    }
    
    // 6. Cleanup
    console.log('\n6. Cleaning up...');
    await client.schema.dropTable(tableName);
    console.log('✓ Table dropped');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Details:', error);
    
    // Cleanup on error
    try {
      await client.schema.dropTable(tableName);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
  }
}

// Run test
testVectorSearch().catch(console.error);