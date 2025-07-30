const AppAtOnceClient = require('../dist').AppAtOnceClient;
const fs = require('fs');
const path = require('path');

// Test configuration
const API_KEY = process.env.TEST_API_KEY || 'test-api-key';
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:8080';

// Create client
const client = new AppAtOnceClient({
  apiKey: API_KEY,
  baseUrl: BASE_URL,
  debug: true
});

// Test data
const testBucketName = 'test-sdk-bucket-' + Date.now();
const testFileName = 'test-file.txt';
const testFileContent = Buffer.from('This is a test file content from Node SDK');
const testImagePath = path.join(__dirname, 'test-image.png');

async function runStorageTests() {
  console.log('🚀 Starting Storage Module Tests\n');

  try {
    // Test 1: Create bucket
    console.log('📦 Test 1: Creating storage bucket...');
    const bucket = await client.storage.createBucket(testBucketName, {
      acl: 'private',
      versioning: true,
      encryption: true
    });
    console.log('✅ Bucket created:', bucket);
    console.log('');

    // Test 2: List buckets
    console.log('📦 Test 2: Listing storage buckets...');
    const buckets = await client.storage.listBuckets();
    console.log('✅ Buckets found:', buckets.length);
    console.log('');

    // Test 3: Upload file from buffer
    console.log('📦 Test 3: Uploading file from buffer...');
    const uploadedFile = await client.storage.uploadFile(
      testBucketName,
      testFileContent,
      testFileName,
      {
        contentType: 'text/plain',
        metadata: { source: 'node-sdk-test' },
        tags: { environment: 'test', sdk: 'node' }
      }
    );
    console.log('✅ File uploaded:', uploadedFile);
    console.log('');

    // Test 4: Upload base64 file
    console.log('📦 Test 4: Uploading base64 file...');
    const base64Content = testFileContent.toString('base64');
    const base64File = await client.storage.uploadBase64(
      testBucketName,
      base64Content,
      'test-base64.txt',
      {
        contentType: 'text/plain'
      }
    );
    console.log('✅ Base64 file uploaded:', base64File);
    console.log('');

    // Test 5: List files
    console.log('📦 Test 5: Listing files in bucket...');
    const files = await client.storage.listFiles(testBucketName, {
      limit: 10,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
    console.log('✅ Files found:', files.total);
    console.log('Files:', files.files.map(f => f.name));
    console.log('');

    // Test 6: Get file info
    console.log('📦 Test 6: Getting file information...');
    const fileInfo = await client.storage.getFileInfo(testBucketName, testFileName);
    console.log('✅ File info:', fileInfo);
    console.log('');

    // Test 7: Download file
    console.log('📦 Test 7: Downloading file...');
    const downloadedContent = await client.storage.downloadFile(testBucketName, testFileName);
    console.log('✅ File downloaded, content matches:', 
      downloadedContent.toString() === testFileContent.toString()
    );
    console.log('');

    // Test 8: Get file URL
    console.log('📦 Test 8: Getting file URL...');
    const fileUrl = await client.storage.getFileUrl(testBucketName, testFileName, {
      expiresIn: 3600, // 1 hour
      download: true
    });
    console.log('✅ File URL generated:', fileUrl);
    console.log('');

    // Test 9: Update file metadata
    console.log('📦 Test 9: Updating file metadata...');
    const updatedFile = await client.storage.updateFileMetadata(
      testBucketName,
      testFileName,
      { 
        description: 'Updated metadata',
        lastModified: new Date().toISOString()
      }
    );
    console.log('✅ File metadata updated:', updatedFile);
    console.log('');

    // Test 10: Update file tags
    console.log('📦 Test 10: Updating file tags...');
    const taggedFile = await client.storage.updateFileTags(
      testBucketName,
      testFileName,
      { 
        version: '1.0',
        status: 'active'
      }
    );
    console.log('✅ File tags updated:', taggedFile);
    console.log('');

    // Test 11: Copy file
    console.log('📦 Test 11: Copying file...');
    const copiedFile = await client.storage.copyFile(
      testBucketName,
      testFileName,
      testBucketName,
      'copied-' + testFileName
    );
    console.log('✅ File copied:', copiedFile);
    console.log('');

    // Test 12: Move file
    console.log('📦 Test 12: Moving file...');
    const movedFile = await client.storage.moveFile(
      testBucketName,
      'copied-' + testFileName,
      testBucketName,
      'moved-' + testFileName
    );
    console.log('✅ File moved:', movedFile);
    console.log('');

    // Test 13: Upload from URL
    console.log('📦 Test 13: Uploading file from URL...');
    const urlFile = await client.storage.uploadFromUrl(
      testBucketName,
      'https://via.placeholder.com/150',
      'placeholder-image.png',
      {
        contentType: 'image/png'
      }
    );
    console.log('✅ File uploaded from URL:', urlFile);
    console.log('');

    // Test 14: Image processing - resize
    console.log('📦 Test 14: Resizing image...');
    const resizedImage = await client.storage.resizeImage(
      testBucketName,
      'placeholder-image.png',
      100,
      100,
      {
        quality: 80,
        format: 'jpeg',
        fit: 'cover'
      }
    );
    console.log('✅ Image resized:', resizedImage);
    console.log('');

    // Test 15: Optimize image
    console.log('📦 Test 15: Optimizing image...');
    const optimizedImage = await client.storage.optimizeImage(
      testBucketName,
      'placeholder-image.png',
      {
        quality: 85,
        progressive: true
      }
    );
    console.log('✅ Image optimized:', optimizedImage);
    console.log('');

    // Test 16: Create backup
    console.log('📦 Test 16: Creating bucket backup...');
    const backup = await client.storage.createBackup(testBucketName, {
      name: 'Test Backup',
      description: 'Backup created during SDK test',
      retention_days: 7
    });
    console.log('✅ Backup created:', backup);
    console.log('');

    // Test 17: List backups
    console.log('📦 Test 17: Listing backups...');
    const backups = await client.storage.listBackups(testBucketName);
    console.log('✅ Backups found:', backups.length);
    console.log('');

    // Test 18: Get storage usage
    console.log('📦 Test 18: Getting storage usage...');
    const usage = await client.storage.getStorageUsage();
    console.log('✅ Storage usage:', usage);
    console.log('');

    // Test 19: Get storage stats
    console.log('📦 Test 19: Getting storage statistics...');
    const stats = await client.storage.getStorageStats(testBucketName);
    console.log('✅ Storage stats:', stats);
    console.log('');

    // Test 20: Batch delete files
    console.log('📦 Test 20: Batch deleting files...');
    const batchDelete = await client.storage.deleteFiles(testBucketName, [
      testFileName,
      'test-base64.txt',
      'moved-' + testFileName
    ]);
    console.log('✅ Batch delete result:', batchDelete);
    console.log('');

    // Test 21: Update bucket settings
    console.log('📦 Test 21: Updating bucket settings...');
    await client.storage.updateBucket(testBucketName, {
      acl: 'public-read',
      lifecycle: {
        expiration_days: 30,
        transition_days: 7,
        transition_storage_class: 'GLACIER'
      }
    });
    console.log('✅ Bucket settings updated');
    console.log('');

    // Test 22: Get bucket info
    console.log('📦 Test 22: Getting bucket information...');
    const bucketInfo = await client.storage.getBucketInfo(testBucketName);
    console.log('✅ Bucket info:', bucketInfo);
    console.log('');

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    
    // Delete remaining files
    const remainingFiles = await client.storage.listFiles(testBucketName);
    for (const file of remainingFiles.files) {
      await client.storage.deleteFile(testBucketName, file.name);
    }
    
    // Delete backup
    if (backups.length > 0) {
      await client.storage.deleteBackup(testBucketName, backup.id);
    }
    
    // Delete bucket
    await client.storage.deleteBucket(testBucketName, true);
    console.log('✅ Cleanup completed');
    console.log('');

    console.log('✅ All storage tests completed successfully!');

  } catch (error) {
    console.error('❌ Storage test failed:', error);
    console.error('Error details:', error.response?.data || error.message);
    
    // Cleanup on error
    try {
      await client.storage.deleteBucket(testBucketName, true);
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError.message);
    }
  }
}

// Run tests
runStorageTests().catch(console.error);