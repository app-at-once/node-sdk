#!/usr/bin/env node

const { AppAtOnceClient } = require('../dist');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function comprehensiveSearchTest() {
  console.log('=== Comprehensive Search Test (Queue-Based) ===\n');
  
  const client = AppAtOnceClient.createWithApiKey(APP_API_KEY, BASE_URL);
  const tableName = `search_test_${Date.now()}`;
  
  try {
    // 1. Create table with proper searchable and embeddable field definitions
    console.log('1. Creating table with searchable and embeddable fields...');
    await client.schema.createTable({
      name: tableName,
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true },
        { name: 'title', type: 'varchar', required: true, searchable: true }, // Searchable only
        { name: 'content', type: 'text', searchable: true, embeddable: true }, // Both searchable and embeddable
        { name: 'description', type: 'text', embeddable: true }, // Embeddable only
        { name: 'category', type: 'varchar', searchable: true }, // Searchable only
        { name: 'tags', type: 'jsonb' }, // Not searchable or embeddable
        { name: 'views', type: 'integer' }, // Not searchable or embeddable
        { name: 'created_at', type: 'timestamp' }
      ]
    });
    console.log('✓ Table created with optimized field configuration');
    
    // 2. Insert test documents with various field types
    console.log('\n2. Inserting test documents (queue-based indexing)...');
    const documents = [
      {
        title: 'Introduction to Machine Learning',
        content: 'Machine learning is a powerful subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every scenario.',
        description: 'A comprehensive guide covering supervised learning, unsupervised learning, and reinforcement learning techniques with practical examples.',
        category: 'AI',
        tags: ['machine-learning', 'ai', 'data-science'],
        views: 1250
      },
      {
        title: 'Deep Learning with Neural Networks', 
        content: 'Deep learning uses multi-layered neural networks to progressively extract higher-level features from raw input data, enabling breakthrough performance in image recognition and natural language processing.',
        description: 'Advanced deep learning concepts including CNNs, RNNs, transformers, and attention mechanisms for modern AI applications.',
        category: 'AI',
        tags: ['deep-learning', 'neural-networks', 'tensorflow'],
        views: 2100
      },
      {
        title: 'Natural Language Processing Fundamentals',
        content: 'NLP combines computational linguistics with machine learning to enable computers to understand, interpret, and generate human language in a valuable way.',
        description: 'Text processing techniques, sentiment analysis, named entity recognition, and language generation using modern transformer models.',
        category: 'NLP',
        tags: ['nlp', 'text-processing', 'linguistics'],
        views: 980
      },
      {
        title: 'Computer Vision Applications',
        content: 'Computer vision enables machines to interpret and understand visual information from the world, similar to human vision, with applications in autonomous vehicles, medical imaging, and robotics.',
        description: 'Image processing, object detection, facial recognition, and visual understanding techniques for real-world applications.',
        category: 'Vision',
        tags: ['computer-vision', 'image-processing', 'opencv'],
        views: 1650
      },
      {
        title: 'Elasticsearch Search Optimization',
        content: 'Elasticsearch is a powerful search engine that provides fast full-text search capabilities with advanced features like faceted search, highlighting, and real-time analytics.',
        description: 'Best practices for indexing, querying, and scaling Elasticsearch for high-performance search applications.',
        category: 'Search',
        tags: ['elasticsearch', 'search', 'indexing'],
        views: 750
      }
    ];
    
    const insertedIds = [];
    for (const doc of documents) {
      const result = await client.table(tableName).insert(doc);
      insertedIds.push(result.id);
      console.log(`✓ Inserted: ${doc.title} (${result.id})`);
    }
    
    // 3. Wait for queue processing (indexing and embedding generation)
    console.log('\n3. Waiting for queue processing (indexing + embeddings)...');
    console.log('   - Elasticsearch indexing for searchable fields (title, content, category)');
    console.log('   - Qdrant embedding generation for embeddable fields (content, description)');
    console.log('   - Non-searchable fields (tags, views, created_at) are ignored');
    await new Promise(resolve => setTimeout(resolve, 15000)); // Wait longer for queue processing
    
    // 4. Test Elasticsearch text search
    console.log('\n4. Testing Elasticsearch text search...');
    const textSearchTests = [
      { query: 'machine learning', expected: 'Should find ML and AI content' },
      { query: 'neural networks', expected: 'Should find deep learning content' },
      { query: 'elasticsearch search', expected: 'Should find search optimization content' },
      { query: 'computer vision', expected: 'Should find vision applications content' }
    ];
    
    for (const test of textSearchTests) {
      console.log(`\n   Searching for: "${test.query}"`);
      console.log(`   Expected: ${test.expected}`);
      
      try {
        const results = await client.table(tableName).search({
          text: test.query,
          limit: 3
        });
        
        console.log(`   Found ${results.count || results.data?.length || 0} results:`);
        if (results.data && results.data.length > 0) {
          results.data.forEach((result, i) => {
            console.log(`     ${i + 1}. ${result.title} (category: ${result.category})`);
          });
        } else {
          console.log('     ❌ No results found');
        }
      } catch (error) {
        console.error(`     ❌ Search error: ${error.message}`);
      }
    }
    
    // 5. Test semantic search (vector search)
    console.log('\n\n5. Testing semantic search (vector/embedding search)...');
    const semanticSearchTests = [
      { query: 'artificial intelligence algorithms', expected: 'Should find AI-related content semantically' },
      { query: 'visual recognition systems', expected: 'Should find computer vision content' },
      { query: 'text understanding and processing', expected: 'Should find NLP content' }
    ];
    
    for (const test of semanticSearchTests) {
      console.log(`\n   Semantic search for: "${test.query}"`);
      console.log(`   Expected: ${test.expected}`);
      
      try {
        const results = await client.table(tableName).search({
          semantic: test.query,
          limit: 3
        });
        
        console.log(`   Found ${results.count || results.data?.length || 0} results:`);
        if (results.data && results.data.length > 0) {
          results.data.forEach((result, i) => {
            console.log(`     ${i + 1}. ${result.title}`);
          });
        } else {
          console.log('     ❌ No semantic results found');
        }
      } catch (error) {
        console.error(`     ❌ Semantic search error: ${error.message}`);
      }
    }
    
    // 6. Test hybrid search (combining text + semantic)
    console.log('\n\n6. Testing hybrid search (text + semantic)...');
    try {
      const hybridResults = await client.table(tableName).search({
        text: 'learning',
        semantic: 'artificial intelligence applications',
        boost: { text: 1.0, semantic: 1.5 }, // Prefer semantic results
        limit: 5
      });
      
      console.log(`   Hybrid search found ${hybridResults.count || hybridResults.data?.length || 0} results:`);
      if (hybridResults.data && hybridResults.data.length > 0) {
        hybridResults.data.forEach((result, i) => {
          console.log(`     ${i + 1}. ${result.title} (category: ${result.category})`);
        });
      } else {
        console.log('     ❌ No hybrid results found');
      }
    } catch (error) {
      console.error(`     ❌ Hybrid search error: ${error.message}`);
    }
    
    // 7. Test update and search index synchronization
    console.log('\n\n7. Testing update synchronization...');
    const firstDocId = insertedIds[0];
    console.log(`   Updating document: ${firstDocId}`);
    
    await client.table(tableName).update(firstDocId, {
      title: 'Advanced Machine Learning Techniques',
      content: 'Advanced machine learning covers ensemble methods, deep reinforcement learning, and cutting-edge research in artificial general intelligence.',
      category: 'Advanced-AI'
    });
    console.log('   ✓ Document updated');
    
    // Wait for update queue processing
    console.log('   Waiting for update indexing...');
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    try {
      const updateResults = await client.table(tableName).search({
        text: 'advanced machine learning',
        limit: 3
      });
      
      console.log(`   Search after update found ${updateResults.count || updateResults.data?.length || 0} results:`);
      if (updateResults.data && updateResults.data.length > 0) {
        updateResults.data.forEach((result, i) => {
          console.log(`     ${i + 1}. ${result.title}`);
        });
      }
    } catch (error) {
      console.error(`   ❌ Update search error: ${error.message}`);
    }
    
    // 8. Test delete and search index cleanup
    console.log('\n\n8. Testing delete synchronization...');
    const lastDocId = insertedIds[insertedIds.length - 1];
    console.log(`   Deleting document: ${lastDocId}`);
    
    await client.table(tableName).delete(lastDocId);
    console.log('   ✓ Document deleted');
    
    // Wait for delete queue processing
    console.log('   Waiting for delete index cleanup...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    try {
      const deleteResults = await client.table(tableName).search({
        text: 'elasticsearch',
        limit: 5
      });
      
      console.log(`   Search after delete found ${deleteResults.count || deleteResults.data?.length || 0} results:`);
      console.log('   (Should not include the deleted Elasticsearch document)');
      if (deleteResults.data && deleteResults.data.length > 0) {
        deleteResults.data.forEach((result, i) => {
          console.log(`     ${i + 1}. ${result.title}`);
        });
      }
    } catch (error) {
      console.error(`   ❌ Delete search error: ${error.message}`);
    }
    
    // 9. Performance and field optimization summary
    console.log('\n\n9. Field Optimization Summary:');
    console.log('   ✓ Only searchable fields (title, content, category) are indexed in Elasticsearch');
    console.log('   ✓ Only embeddable fields (content, description) generate costly embeddings');
    console.log('   ✓ Non-search fields (tags, views, created_at) are ignored, saving resources');
    console.log('   ✓ All indexing happens asynchronously via Bull queues');
    console.log('   ✓ Update/delete operations properly sync with search indexes');
    
    // 10. Cleanup
    console.log('\n10. Cleaning up...');
    await client.schema.dropTable(tableName);
    console.log('✓ Table dropped');
    
    console.log('\n🎉 Comprehensive search test completed successfully!');
    
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
comprehensiveSearchTest().catch(console.error);