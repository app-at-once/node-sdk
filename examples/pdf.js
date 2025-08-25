#!/usr/bin/env node

/**
 * PDF Module Example
 * 
 * This example demonstrates all PDF features:
 * - Generate PDF from HTML
 * - Generate PDF from URL
 * - Merge multiple PDFs
 * - Split PDFs
 * - Add watermarks
 * - Extract text from PDF
 * - Convert images to PDF
 * 
 * Prerequisites:
 * - Set APPATONCE_API_KEY environment variable
 */

require('dotenv').config();

const { AppAtOnceClient } = require('@appatonce/node-sdk');

async function pdfExample() {
  console.log('📄 AppAtOnce PDF Module Example\n');
  
  try {
    // Initialize client
    const client = new AppAtOnceClient(process.env.APPATONCE_API_KEY);
    
    console.log('═'.repeat(60));
    console.log('PDF GENERATION');
    console.log('═'.repeat(60));
    
    // 1. Generate PDF from HTML
    console.log('1️⃣ Generating PDF from HTML...');
    const htmlPdf = await client.pdf.generateFromHtml({
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; }
            .header { background: #f0f0f0; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>AppAtOnce PDF Example</h1>
          </div>
          <p>This PDF was generated using the AppAtOnce SDK.</p>
          <ul>
            <li>Feature 1: HTML to PDF conversion</li>
            <li>Feature 2: Custom styling support</li>
            <li>Feature 3: Headers and footers</li>
          </ul>
        </body>
        </html>
      `,
      options: {
        format: 'A4',
        margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
        displayHeaderFooter: true,
        headerTemplate: '<div style="font-size: 10px; text-align: center;">AppAtOnce SDK</div>',
        footerTemplate: '<div style="font-size: 10px; text-align: center;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
      }
    });
    console.log('✅ PDF generated:', htmlPdf.url);
    console.log('   Size:', htmlPdf.size, 'bytes');
    
    // 2. Generate PDF from URL
    console.log('\n2️⃣ Generating PDF from URL...');
    const urlPdf = await client.pdf.generateFromUrl({
      url: 'https://example.com',
      options: {
        format: 'A4',
        landscape: false,
        printBackground: true,
        waitUntil: 'networkidle0'
      }
    });
    console.log('✅ PDF generated from URL:', urlPdf.url);
    
    // 3. Generate PDF from Markdown
    console.log('\n3️⃣ Generating PDF from Markdown...');
    const markdownPdf = await client.pdf.generateFromMarkdown({
      markdown: `
# AppAtOnce SDK Documentation

## Introduction
This is a **sample** PDF generated from Markdown.

### Features
- Easy to use
- Supports *formatting*
- Code blocks supported

\`\`\`javascript
const client = new AppAtOnceClient(apiKey);
const pdf = await client.pdf.generate(options);
\`\`\`

### Table Example
| Feature | Status |
|---------|--------|
| HTML to PDF | ✅ |
| URL to PDF | ✅ |
| Markdown to PDF | ✅ |
      `,
      options: {
        format: 'A4',
        cssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css'
      }
    });
    console.log('✅ PDF generated from Markdown:', markdownPdf.url);
    
    // 4. Merge PDFs
    console.log('\n═'.repeat(60));
    console.log('PDF MANIPULATION');
    console.log('═'.repeat(60));
    
    console.log('4️⃣ Merging multiple PDFs...');
    const mergedPdf = await client.pdf.merge({
      pdfs: [
        htmlPdf.url,
        urlPdf.url,
        markdownPdf.url
      ],
      options: {
        filename: 'merged-document.pdf'
      }
    });
    console.log('✅ PDFs merged:', mergedPdf.url);
    console.log('   Page count:', mergedPdf.pageCount);
    
    // 5. Split PDF
    console.log('\n5️⃣ Splitting PDF...');
    const splitPdfs = await client.pdf.split({
      pdf: mergedPdf.url,
      ranges: ['1-2', '3'] // Split into two PDFs: pages 1-2 and page 3
    });
    console.log('✅ PDF split into', splitPdfs.length, 'files');
    splitPdfs.forEach((pdf, index) => {
      console.log(`   Part ${index + 1}:`, pdf.url);
    });
    
    // 6. Add watermark
    console.log('\n6️⃣ Adding watermark to PDF...');
    const watermarkedPdf = await client.pdf.addWatermark({
      pdf: htmlPdf.url,
      watermark: {
        text: 'CONFIDENTIAL',
        fontSize: 60,
        color: '#FF0000',
        opacity: 0.3,
        rotation: -45
      }
    });
    console.log('✅ Watermark added:', watermarkedPdf.url);
    
    // 7. Extract text from PDF
    console.log('\n═'.repeat(60));
    console.log('PDF EXTRACTION');
    console.log('═'.repeat(60));
    
    console.log('7️⃣ Extracting text from PDF...');
    const extractedText = await client.pdf.extractText({
      pdf: htmlPdf.url,
      pages: [1] // Extract from first page only
    });
    console.log('✅ Text extracted:');
    console.log(extractedText.text.substring(0, 200) + '...');
    
    // 8. Extract metadata
    console.log('\n8️⃣ Extracting PDF metadata...');
    const metadata = await client.pdf.getMetadata(htmlPdf.url);
    console.log('✅ PDF metadata:');
    console.log('   Title:', metadata.title || 'N/A');
    console.log('   Author:', metadata.author || 'N/A');
    console.log('   Pages:', metadata.pageCount);
    console.log('   Created:', metadata.createdAt);
    
    // 9. Convert images to PDF
    console.log('\n9️⃣ Converting images to PDF...');
    const imagePdf = await client.pdf.fromImages({
      images: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg'
      ],
      options: {
        format: 'A4',
        fit: 'contain',
        margin: 20
      }
    });
    console.log('✅ Images converted to PDF:', imagePdf.url);
    
    // 10. Compress PDF
    console.log('\n🔟 Compressing PDF...');
    const compressedPdf = await client.pdf.compress({
      pdf: mergedPdf.url,
      quality: 'medium' // 'low', 'medium', 'high'
    });
    console.log('✅ PDF compressed:');
    console.log('   Original size:', mergedPdf.size, 'bytes');
    console.log('   Compressed size:', compressedPdf.size, 'bytes');
    console.log('   Reduction:', Math.round((1 - compressedPdf.size / mergedPdf.size) * 100) + '%');
    
    console.log('\n✅ PDF example completed!');
    
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

pdfExample();