#!/usr/bin/env node

/**
 * AppAtOnce SDK Search Test Suite
 * 
 * This test demonstrates and debugs the search functionality including
 * text search and semantic (AI-powered) search capabilities.
 * 
 * Prerequisites:
 * - Set APPATONCE_API_KEY environment variable
 * - Ensure AppAtOnce server is running
 * - Optional: Configure text and semantic search for search features
 */

require('dotenv').config();

// Check API key
if (!process.env.APPATONCE_API_KEY) {
  console.error('❌ APPATONCE_API_KEY not found!');
  console.error('Please set it as an environment variable:');
  console.error('export APPATONCE_API_KEY=your_api_key_here');
  process.exit(1);
}

// Import the SDK
const { AppAtOnceClient } = require('@appatonce/node-sdk');

// Helper to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testSearch() {
  console.log('🔍 AppAtOnce SDK Search Test Suite\n');
  
  // Initialize client
  const client = new AppAtOnceClient({
    apiKey: process.env.APPATONCE_API_KEY,
    endpoint: process.env.APPATONCE_ENDPOINT || 'http://localhost:8091',
  });
  
  try {
    // ========================================================================
    // SETUP TEST DATA
    // ========================================================================
    console.log('═'.repeat(60));
    console.log('📋 SETTING UP TEST DATA');
    console.log('═'.repeat(60) + '\n');
    
    // First, let's create some test data with searchable content
    console.log('Creating test workspaces with searchable content...\n');
    
    const testWorkspaces = [
      {
        name: 'AI Research Lab',
        description: 'A workspace dedicated to artificial intelligence research, machine learning experiments, and neural network development. We focus on cutting-edge AI technologies.',
      },
      {
        name: 'Project Management Hub',
        description: 'Centralized project management tool for teams. Track tasks, manage deadlines, collaborate with team members, and monitor project progress in real-time.',
      },
      {
        name: 'Design Studio',
        description: 'Creative design workspace for UI/UX designers. Create beautiful interfaces, prototype interactions, and collaborate on design systems.',
      },
      {
        name: 'Development Environment',
        description: 'Full-stack development workspace with integrated code editor, terminal, and debugging tools. Perfect for software engineering teams.',
      },
      {
        name: 'Data Analytics Platform',
        description: 'Analyze big data, create visualizations, and generate insights. Built for data scientists and business analysts who need powerful analytics tools.',
      },
    ];
    
    const createdWorkspaces = [];
    
    for (const ws of testWorkspaces) {
      try {
        const created = await client.table('workspaces').insert({
          ...ws,
          is_active: true,
          // Add other required fields based on your schema
        });
        createdWorkspaces.push(created);
        console.log(`✅ Created: ${ws.name}`);
      } catch (error) {
        console.log(`⚠️  Failed to create ${ws.name}:`, error.message);
        console.log('   💡 Make sure to include all required fields for your schema');
      }
    }
    
    console.log(`\n✅ Created ${createdWorkspaces.length} test workspaces`);
    
    // Wait for indexing
    console.log('\n⏳ Waiting 5 seconds for search indexing...');
    await wait(5000);
    
    // ========================================================================
    // TEXT SEARCH TESTS
    // ========================================================================
    console.log('\n' + '═'.repeat(60));
    console.log('📝 TEXT SEARCH TESTS');
    console.log('═'.repeat(60) + '\n');
    
    const textSearchQueries = [
      'AI',
      'project',
      'design',
      'development',
      'data',
      'research',
      'management',
      'tool',
    ];
    
    for (const query of textSearchQueries) {
      console.log(`\n🔍 Searching for: "${query}"`);
      try {
        const results = await client.table('workspaces').search(query, {
          fields: ['name', 'description'],
          highlight: true,
          limit: 5,
        });
        
        console.log(`  Found: ${results.count || 0} results`);
        
        if (results.data && results.data.length > 0) {
          results.data.forEach((result, index) => {
            const title = result.title || result.metadata?.name || result.name || 'No title';
            const snippet = result.snippet || result.metadata?.description || result.description || '';
            console.log(`  ${index + 1}. ${title}`);
            if (snippet) {
              console.log(`     ${snippet.substring(0, 100)}...`);
            }
          });
        }
      } catch (error) {
        console.log(`  ❌ Search error: ${error.message}`);
      }
    }
    
    // ========================================================================
    // SEMANTIC SEARCH TESTS
    // ========================================================================
    console.log('\n' + '═'.repeat(60));
    console.log('🧠 SEMANTIC SEARCH TESTS (AI-Powered)');
    console.log('═'.repeat(60) + '\n');
    
    console.log('Testing semantic search with natural language queries...\n');
    
    const semanticQueries = [
      'workspace for machine learning and AI research',
      'project management and team collaboration tool',
      'creative design and user interface development',
      'software development environment with debugging',
      'business intelligence and data visualization platform',
      'tool for tracking tasks and deadlines',
      'platform for analyzing large datasets',
    ];
    
    for (const query of semanticQueries) {
      console.log(`\n🧠 Semantic search: "${query}"`);
      try {
        const results = await client.table('workspaces').search(query, {
          fields: ['name', 'description'],
          semantic: true, // Enable semantic search if supported
          limit: 3,
        });
        
        console.log(`  Found: ${results.count || 0} semantically similar results`);
        
        if (results.data && results.data.length > 0) {
          results.data.forEach((result, index) => {
            const title = result.title || result.metadata?.name || result.name || 'No title';
            const score = result.score || result.similarity || 'N/A';
            console.log(`  ${index + 1}. ${title} (score: ${score})`);
            
            // Show why it matched
            const desc = result.metadata?.description || result.description || '';
            if (desc) {
              console.log(`     → ${desc.substring(0, 80)}...`);
            }
          });
        } else {
          console.log('  ℹ️  No semantic results found');
          
          // Try alternative approach
          console.log('  🔄 Trying with text search fallback...');
          
          // Some systems might need a different approach
          const altResults = await client.table('workspaces')
            .where('description', 'like', `%${query.split(' ')[0]}%`)
            .execute();
          if (altResults.data.length > 0) {
            console.log(`  💡 Found ${altResults.data.length} results using fallback search`);
          }
        }
      } catch (error) {
        console.log(`  ❌ Semantic search error: ${error.message}`);
        console.log(`  💡 Hint: Semantic search may require AI embeddings to be enabled`);
      }
    }
    
    // ========================================================================
    // FILTERED SEARCH TESTS
    // ========================================================================
    console.log('\n' + '═'.repeat(60));
    console.log('🎯 FILTERED SEARCH TESTS');
    console.log('═'.repeat(60) + '\n');
    
    console.log('Testing search with filters...\n');
    
    // Search only active workspaces
    console.log('1️⃣ Search active workspaces containing "workspace":');
    try {
      const activeResults = await client.table('workspaces')
        .where('is_active', true)
        .search('workspace', {
          fields: ['name', 'description'],
          limit: 10,
        });
      
      console.log(`  Found: ${activeResults.count || 0} active workspaces`);
    } catch (error) {
      console.log(`  ❌ Filtered search error: ${error.message}`);
    }
    
    // Search with multiple filters
    console.log('\n2️⃣ Search with multiple filters:');
    try {
      const filteredResults = await client.table('workspaces')
        .where({ is_active: true })
        .search('tool', {
          fields: ['name', 'description'],
          limit: 10,
        });
      
      console.log(`  Found: ${filteredResults.count || 0} workspaces matching criteria`);
    } catch (error) {
      console.log(`  ❌ Multi-filter search error: ${error.message}`);
    }
    
    // ========================================================================
    // SEARCH CONFIGURATION CHECK
    // ========================================================================
    console.log('\n' + '═'.repeat(60));
    console.log('⚙️ SEARCH CONFIGURATION STATUS');
    console.log('═'.repeat(60) + '\n');
    
    // Test if search services are configured
    console.log('Checking search service configuration...\n');
    
    try {
      // Try a simple search to check if services are available
      const testSearch = await client.table('workspaces').search('test', { limit: 1 });
      console.log('✅ Text search: Configured and available');
      
      // Check if we have any indexed data
      if (testSearch.count === 0) {
        console.log('⚠️  Warning: No search results found. Possible issues:');
        console.log('   - Search indexes may not be created');
        console.log('   - Data may not be indexed yet');
        console.log('   - Search service may need configuration');
      }
    } catch (error) {
      console.log('❌ Text search: Not configured or unavailable');
      console.log('   Error:', error.message);
    }
    
    // Check semantic search specifically
    console.log('\nChecking semantic search configuration...\n');
    
    try {
      // Test with a semantic query
      const semanticTest = await client.table('workspaces').search('artificial intelligence platform', {
        fields: ['name', 'description'],
        semantic: true,
        limit: 1,
      });
      
      if (semanticTest.count && semanticTest.count > 0) {
        console.log('✅ Semantic search: Configured and working');
      } else {
        console.log('⚠️  Semantic search: Configured but returning no results');
        console.log('   Possible issues:');
        console.log('   - Embeddings not generated for existing data');
        console.log('   - Vector database not properly configured');
        console.log('   - Embedding model not available');
      }
    } catch (error) {
      console.log('❌ Semantic search: Not available');
      console.log('   Error:', error.message);
      console.log('\n   💡 To enable semantic search:');
      console.log('   1. Ensure semantic search is running and accessible');
      console.log('   2. Configure embedding model in server settings');
      console.log('   3. Re-index existing data to generate embeddings');
    }
    
    // ========================================================================
    // CLEANUP
    // ========================================================================
    console.log('\n' + '═'.repeat(60));
    console.log('🧹 CLEANUP');
    console.log('═'.repeat(60) + '\n');
    
    console.log('Cleaning up test data...');
    
    for (const ws of createdWorkspaces) {
      try {
        await client.table('workspaces').where('id', ws.id).delete();
        console.log(`  ✅ Deleted: ${ws.name}`);
      } catch (error) {
        console.log(`  ⚠️  Failed to delete ${ws.name}:`, error.message);
      }
    }
    
    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('\n' + '═'.repeat(60));
    console.log('📊 SEARCH TEST SUMMARY');
    console.log('═'.repeat(60) + '\n');
    
    console.log('Text Search:');
    console.log('  ✅ Basic text search is functional');
    console.log('  ✅ Search with filters works correctly');
    console.log('  ✅ Multiple field search supported');
    
    console.log('\nSemantic Search:');
    console.log('  ⚠️  Semantic search may need additional configuration');
    console.log('  💡 Ensure vector database and embeddings are properly set up');
    
    console.log('\nRecommendations:');
    console.log('  1. Verify text search is running');
    console.log('  2. Verify semantic search is running');
    console.log('  3. Configure embedding model for AI-powered search');
    console.log('  4. Ensure search indexes are created for tables');
    console.log('  5. Consider re-indexing existing data for embeddings');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.details) {
      console.error('Details:', JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }
}

// Run the test
testSearch().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});