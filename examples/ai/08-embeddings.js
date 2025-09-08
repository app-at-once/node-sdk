#!/usr/bin/env node

/**
 * Embeddings Feature
 * 
 * Demonstrates:
 * - Generating embeddings for single text
 * - Generating embeddings for multiple texts
 * - Using embeddings for similarity comparison
 * 
 * Run: node ai/08-embeddings.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { AppAtOnceClient } = require('../../dist');

const API_KEY = process.env.APPATONCE_API_KEY;
if (!API_KEY) {
  console.error('❌ Please set APPATONCE_API_KEY in your .env file');
  process.exit(1);
}

const client = new AppAtOnceClient(API_KEY);

function printResult(title, result) {
  console.log(`\n✨ ${title}`);
  console.log('─'.repeat(50));
  if (typeof result === 'object') {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(result);
  }
}

// Helper function to calculate cosine similarity
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function main() {
  console.log('🔢 EMBEDDINGS FEATURE\n');

  try {
    // 1. Single Text Embedding
    console.log('1. Generating embedding for single text...');
    const singleEmbedding = await client.ai.generateEmbeddings(
      'Machine learning is a subset of artificial intelligence'
    );
    const embedding = singleEmbedding.embeddings?.[0] || singleEmbedding.data?.embeddings?.[0];
    printResult('Single Embedding', {
      text: 'Machine learning is a subset of artificial intelligence',
      embeddingLength: embedding?.length || 'N/A',
      sample: embedding?.slice(0, 5) || 'N/A'
    });

    // 2. Multiple Text Embeddings (one at a time)
    console.log('\n2. Generating embeddings for multiple texts (one at a time)...');
    const texts = [
      'Artificial intelligence is transforming technology',
      'AI and machine learning are related fields',
      'The weather is nice today',
      'Cooking is an enjoyable hobby'
    ];
    
    console.log('Note: The API processes one text at a time.');
    const embeddings = [];
    for (const text of texts) {
      const response = await client.ai.generateEmbeddings(text);
      const emb = response.embeddings?.[0] || response.data?.embeddings?.[0];
      embeddings.push(emb);
      console.log(`✓ Generated embedding for: "${text.substring(0, 50)}..."`);
    }
    
    printResult('Multiple Embeddings Summary', {
      textsProcessed: texts.length,
      embeddingDimensions: embeddings[0]?.length || 'N/A',
      allSuccessful: embeddings.every(e => e && e.length > 0)
    });

    // 3. Embedding with Custom Dimensions (if supported)
    console.log('\n3. Generating embedding with custom dimensions...');
    try {
      const customEmbedding = await client.ai.generateEmbeddings(
        'Natural language processing with custom dimensions',
        { dimensions: 512 }
      );
      printResult('Custom Dimension Embedding', {
        text: 'Natural language processing with custom dimensions',
        requestedDimensions: 512,
        actualDimensions: customEmbedding.data?.embedding?.length || customEmbedding.data?.length || 'N/A'
      });
    } catch (error) {
      console.log('Custom dimensions may not be supported by the current model');
    }

    // 4. Similarity Comparison (if we got embeddings back)
    console.log('\n4. Comparing text similarity using embeddings...');
    const similarTexts = [
      'Machine learning is a type of AI',
      'Artificial intelligence includes machine learning',
      'Cats are wonderful pets'
    ];

    console.log('Generating embeddings for similarity comparison...');
    const embeddingsForComparison = [];
    
    for (const text of similarTexts) {
      const response = await client.ai.generateEmbeddings(text);
      const emb = response.embeddings?.[0] || response.data?.embeddings?.[0];
      embeddingsForComparison.push({
        text,
        embedding: emb || []
      });
    }

    if (embeddingsForComparison[0].embedding.length > 0) {
      console.log('\nSimilarity scores:');
      for (let i = 0; i < embeddingsForComparison.length; i++) {
        for (let j = i + 1; j < embeddingsForComparison.length; j++) {
          const similarity = cosineSimilarity(embeddingsForComparison[i].embedding, embeddingsForComparison[j].embedding);
          console.log(`"${embeddingsForComparison[i].text}" vs "${embeddingsForComparison[j].text}": ${similarity.toFixed(4)}`);
        }
      }
    } else {
      console.log('Could not calculate similarity - embeddings format may be different');
    }

    // 5. Practical Use Case - Semantic Search
    console.log('\n5. Semantic search example...');
    const documents = [
      'Python is a popular programming language for data science',
      'JavaScript is widely used for web development',
      'Machine learning models can predict future outcomes',
      'Cooking pasta requires boiling water first'
    ];
    
    const query = 'programming languages for web applications';
    
    console.log(`Query: "${query}"`);
    console.log('Documents:');
    documents.forEach((doc, i) => console.log(`  ${i + 1}. ${doc}`));
    
    // In a real application, you would:
    // 1. Generate embeddings for all documents
    // 2. Generate embedding for the query
    // 3. Calculate similarity between query and each document
    // 4. Return documents sorted by similarity

    console.log('\n✅ Embeddings examples completed!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
  }
}

main();