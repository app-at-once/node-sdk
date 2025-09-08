#!/usr/bin/env node

/**
 * OCR (Optical Character Recognition) Example
 * 
 * This example demonstrates all OCR features:
 * - Extract text from images
 * - Extract text from PDFs
 * - Multi-language support
 * - Table detection and extraction
 * - Handwriting recognition
 * - Receipt/invoice parsing
 * - ID card extraction
 * 
 * Prerequisites:
 * - Set APPATONCE_API_KEY environment variable
 */

require('dotenv').config();

const { AppAtOnceClient } = require('@appatonce/node-sdk');

async function ocrExample() {
  console.log('🔍 AppAtOnce OCR Module Example\n');
  
  try {
    // Initialize client
    const client = new AppAtOnceClient(process.env.APPATONCE_API_KEY);
    
    console.log('═'.repeat(60));
    console.log('BASIC TEXT EXTRACTION');
    console.log('═'.repeat(60));
    
    // 1. Extract text from image
    console.log('1️⃣ Extracting text from image...');
    const imageOcr = await client.ocr.extractFromImage({
      image: 'https://example.com/document.jpg',
      options: {
        languages: ['en'], // Support for multiple languages
        enhanceImage: true, // Pre-process image for better results
        detectOrientation: true
      }
    });
    console.log('✅ Text extracted from image:');
    console.log('   Text:', imageOcr.text.substring(0, 200) + '...');
    console.log('   Confidence:', imageOcr.confidence + '%');
    console.log('   Language:', imageOcr.detectedLanguage);
    
    // 2. Extract text from PDF
    console.log('\n2️⃣ Extracting text from PDF...');
    const pdfOcr = await client.ocr.extractFromPdf({
      pdf: 'https://example.com/scanned-document.pdf',
      options: {
        pages: [1, 2, 3], // Specific pages
        languages: ['en', 'es'], // Multi-language
        mode: 'accurate' // 'fast' or 'accurate'
      }
    });
    console.log('✅ Text extracted from PDF:');
    console.log('   Pages processed:', pdfOcr.pages.length);
    console.log('   Total text length:', pdfOcr.fullText.length, 'characters');
    
    // 3. Extract from URL with auto-detection
    console.log('\n3️⃣ Extracting from URL (auto-detect type)...');
    const urlOcr = await client.ocr.extractFromUrl({
      url: 'https://example.com/document', // Can be image or PDF
      options: {
        autoDetectType: true
      }
    });
    console.log('✅ Extracted from URL');
    console.log('   Type detected:', urlOcr.sourceType);
    
    // 4. Table extraction
    console.log('\n═'.repeat(60));
    console.log('STRUCTURED DATA EXTRACTION');
    console.log('═'.repeat(60));
    
    console.log('4️⃣ Extracting tables from document...');
    const tableOcr = await client.ocr.extractTables({
      image: 'https://example.com/table-document.jpg',
      options: {
        detectBorders: true,
        mergeColumns: true
      }
    });
    console.log('✅ Tables extracted:', tableOcr.tables.length);
    if (tableOcr.tables.length > 0) {
      console.log('   First table:');
      console.log('   Rows:', tableOcr.tables[0].rows);
      console.log('   Columns:', tableOcr.tables[0].columns);
      console.log('   Sample data:', tableOcr.tables[0].data[0]);
    }
    
    // 5. Receipt/Invoice parsing
    console.log('\n5️⃣ Parsing receipt/invoice...');
    const receiptOcr = await client.ocr.parseReceipt({
      image: 'https://example.com/receipt.jpg',
      options: {
        extractLineItems: true,
        currency: 'USD'
      }
    });
    console.log('✅ Receipt parsed:');
    console.log('   Merchant:', receiptOcr.merchant);
    console.log('   Date:', receiptOcr.date);
    console.log('   Total:', receiptOcr.total);
    console.log('   Items:', receiptOcr.lineItems?.length || 0);
    if (receiptOcr.lineItems?.length > 0) {
      console.log('   First item:', receiptOcr.lineItems[0].name, '-', receiptOcr.lineItems[0].price);
    }
    
    // 6. ID card extraction
    console.log('\n6️⃣ Extracting ID card information...');
    const idCardOcr = await client.ocr.parseIdCard({
      frontImage: 'https://example.com/id-front.jpg',
      backImage: 'https://example.com/id-back.jpg',
      options: {
        type: 'drivers_license', // or 'passport', 'id_card'
        country: 'US'
      }
    });
    console.log('✅ ID card extracted:');
    console.log('   Name:', idCardOcr.fullName);
    console.log('   ID Number:', idCardOcr.documentNumber);
    console.log('   Date of Birth:', idCardOcr.dateOfBirth);
    console.log('   Expiry:', idCardOcr.expiryDate);
    
    // 7. Handwriting recognition
    console.log('\n7️⃣ Recognizing handwritten text...');
    const handwritingOcr = await client.ocr.extractHandwriting({
      image: 'https://example.com/handwritten-note.jpg',
      options: {
        language: 'en',
        preserveFormatting: true
      }
    });
    console.log('✅ Handwriting recognized:');
    console.log('   Text:', handwritingOcr.text.substring(0, 100) + '...');
    console.log('   Confidence:', handwritingOcr.confidence + '%');
    
    // 8. Business card parsing
    console.log('\n═'.repeat(60));
    console.log('SPECIALIZED EXTRACTION');
    console.log('═'.repeat(60));
    
    console.log('8️⃣ Parsing business card...');
    const businessCardOcr = await client.ocr.parseBusinessCard({
      image: 'https://example.com/business-card.jpg'
    });
    console.log('✅ Business card parsed:');
    console.log('   Name:', businessCardOcr.name);
    console.log('   Title:', businessCardOcr.title);
    console.log('   Company:', businessCardOcr.company);
    console.log('   Email:', businessCardOcr.email);
    console.log('   Phone:', businessCardOcr.phone);
    
    // 9. Form field extraction
    console.log('\n9️⃣ Extracting form fields...');
    const formOcr = await client.ocr.extractFormFields({
      image: 'https://example.com/filled-form.jpg',
      options: {
        detectCheckboxes: true,
        detectSignatures: true
      }
    });
    console.log('✅ Form fields extracted:', formOcr.fields.length);
    formOcr.fields.forEach(field => {
      console.log(`   ${field.label}: ${field.value} (${field.type})`);
    });
    
    // 10. Batch processing
    console.log('\n🔟 Batch OCR processing...');
    const batchOcr = await client.ocr.processBatch({
      sources: [
        { type: 'image', url: 'https://example.com/doc1.jpg' },
        { type: 'image', url: 'https://example.com/doc2.jpg' },
        { type: 'pdf', url: 'https://example.com/doc3.pdf' }
      ],
      options: {
        languages: ['en'],
        parallel: true
      }
    });
    console.log('✅ Batch processed:', batchOcr.results.length, 'documents');
    console.log('   Successful:', batchOcr.successful);
    console.log('   Failed:', batchOcr.failed);
    
    console.log('\n✅ OCR example completed!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
  }
}

// Check if API key is set
if (!process.env.APPATONCE_API_KEY) {
  console.error('❌ APPATONCE_API_KEY not found!');
  console.error('Please set it as an environment variable:');
  console.error('export APPATONCE_API_KEY=your_api_key_here');
  process.exit(1);
}

ocrExample();