/**
 * Example showcasing new features in AppAtOnce SDK v2.0
 */

const { AppAtOnceClient } = require('@appatonce/node-sdk');

// Initialize the client
const client = AppAtOnceClient.createWithApiKey('your-api-key');

async function demonstrateNewFeatures() {
  try {
    // 1. Payment Processing Example
    console.log('\n=== Payment Processing ===');
    
    // Create a payment method
    const paymentMethod = await client.payment.createPaymentMethod({
      type: 'card',
      details: {
        number: '4242424242424242',
        exp_month: 12,
        exp_year: 2025,
        cvc: '123'
      }
    });
    
    // Process a payment
    const transaction = await client.payment.createTransaction({
      amount: 9999, // $99.99
      currency: 'USD',
      payment_method_id: paymentMethod.id,
      description: 'SDK Test Payment'
    });
    
    console.log('Payment processed:', transaction.id);

    // 2. Image Processing Example
    console.log('\n=== Image Processing ===');
    
    // Process an image from URL
    const processedImage = await client.imageProcessing.processImage(
      'https://example.com/image.jpg',
      {
        resize: { width: 800, height: 600, fit: 'cover' },
        format: 'webp',
        quality: 85,
        watermark: { text: 'AppAtOnce SDK', position: 'bottom-right' }
      }
    );
    
    console.log('Processed image URL:', processedImage.url);

    // 3. PDF Generation Example
    console.log('\n=== PDF Generation ===');
    
    // Generate PDF from HTML
    const pdf = await client.pdf.generateFromHTML(
      '<html><body><h1>Hello from AppAtOnce SDK!</h1></body></html>',
      {
        format: 'A4',
        orientation: 'portrait',
        margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' }
      }
    );
    
    console.log('Generated PDF:', pdf.url);

    // 4. OCR Example
    console.log('\n=== OCR Text Extraction ===');
    
    // Extract text from an image
    const ocrResult = await client.ocr.extractFromImage(
      'https://example.com/document.jpg',
      {
        languages: ['en'],
        mode: 'accurate',
        detectTables: true
      }
    );
    
    console.log('Extracted text:', ocrResult.text.substring(0, 100) + '...');

    // 5. Document Conversion Example
    console.log('\n=== Document Conversion ===');
    
    // Convert a Word document to PDF
    const convertedDoc = await client.documentConversion.convertOffice(
      'https://example.com/document.docx',
      'pdf',
      {
        quality: 'high',
        preserveFormatting: true
      }
    );
    
    console.log('Converted document:', convertedDoc.url);

    // 6. New Workflow System Example
    console.log('\n=== New Workflow System ===');
    
    const workflow = await client.workflow.createWorkflow({
      name: 'Process Order',
      description: 'Complete order processing workflow',
      steps: [
        {
          id: 'validate',
          name: 'Validate Order',
          type: 'database',
          config: { operation: 'validate', table: 'orders' },
          nextStepId: 'payment'
        },
        {
          id: 'payment',
          name: 'Process Payment',
          type: 'payment',
          config: { amount: '{{order.total}}', currency: 'USD' },
          nextStepId: 'notify',
          errorStepId: 'handleError'
        },
        {
          id: 'notify',
          name: 'Send Confirmation',
          type: 'email',
          config: { 
            to: '{{order.email}}',
            template: 'order-confirmation'
          }
        },
        {
          id: 'handleError',
          name: 'Handle Payment Error',
          type: 'email',
          config: {
            to: 'support@company.com',
            subject: 'Payment Failed',
            body: 'Payment failed for order {{order.id}}'
          }
        }
      ],
      trigger: {
        type: 'webhook',
        config: { method: 'POST' }
      },
      status: 'active'
    });
    
    console.log('Workflow created:', workflow.id);

    // 7. New Logic Flow Example
    console.log('\n=== New Logic Flow System ===');
    
    const logicFlow = await client.logic.createLogicFlow({
      name: 'Data Processing Pipeline',
      description: 'Process and transform data with conditions',
      nodes: [
        {
          id: 'start',
          name: 'Start',
          type: 'function',
          config: { function: 'validateInput' },
          outputs: ['checkType']
        },
        {
          id: 'checkType',
          name: 'Check Data Type',
          type: 'condition',
          config: {},
          condition: {
            type: 'switch',
            expression: 'data.type',
            cases: [
              { condition: 'image', output: 'processImage' },
              { condition: 'document', output: 'processDocument' }
            ],
            defaultOutput: 'handleUnknown'
          }
        },
        {
          id: 'processImage',
          name: 'Process Image',
          type: 'image-processing',
          config: { resize: { width: 1024 }, format: 'webp' },
          outputs: ['saveResult']
        },
        {
          id: 'processDocument',
          name: 'Process Document',
          type: 'document-conversion',
          config: { targetFormat: 'pdf' },
          outputs: ['saveResult']
        },
        {
          id: 'saveResult',
          name: 'Save Result',
          type: 'database',
          config: { operation: 'insert', table: 'results' }
        },
        {
          id: 'handleUnknown',
          name: 'Handle Unknown Type',
          type: 'function',
          config: { function: 'logError' }
        }
      ],
      variables: {
        maxSize: 10485760, // 10MB
        allowedTypes: ['image', 'document']
      }
    });
    
    console.log('Logic flow created:', logicFlow.id);

    // 8. New Trigger System Example
    console.log('\n=== New Trigger System ===');
    
    // Create a cron trigger for daily reports
    const cronTrigger = await client.triggers.createCronTrigger({
      name: 'Daily Report',
      cronExpression: '0 9 * * *', // 9 AM daily
      timezone: 'America/New_York',
      target: {
        type: 'workflow',
        id: workflow.id
      }
    });
    
    console.log('Cron trigger created:', cronTrigger.id);

    // Create an event trigger
    const eventTrigger = await client.triggers.subscribeToEvent({
      source: 'database',
      eventType: 'record.created',
      filters: { table: 'orders' },
      target: {
        type: 'logic',
        id: logicFlow.id
      }
    });
    
    console.log('Event trigger created:', eventTrigger.id);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the demonstration
demonstrateNewFeatures();