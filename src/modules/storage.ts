import { HttpClient } from '../core/http-client';
import { StorageFile, StorageUploadOptions, StorageDownloadOptions } from '../types';

export class StorageModule {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  // File upload methods
  async uploadFile(
    bucketName: string,
    file: Buffer,
    fileName: string,
    options?: StorageUploadOptions
  ): Promise<StorageFile> {
    const response = await this.httpClient.uploadFile(
      `/storage/buckets/${bucketName}/upload`,
      file,
      fileName,
      {
        contentType: options?.contentType,
        metadata: options?.metadata,
        cacheControl: options?.cacheControl,
        acl: options?.acl,
        tags: options?.tags,
      }
    );
    return response.data;
  }

  // 🔥 SIMPLE API - Intuitive upload method
  // Upload File object directly and return public URL
  async upload(
    bucketName: string, 
    file: File, 
    path?: string,
    options?: {
      metadata?: Record<string, any>;
      contentType?: string;
      returnPublicUrl?: boolean;
    }
  ): Promise<string> {
    console.log('upload called with:', { bucketName, fileName: file?.name, fileType: file?.type, fileSize: file?.size, path });
    
    // Check if file is actually a File object
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file object provided to upload');
    }
    
    const fileName = path || `${Date.now()}-${file.name}`;
    const uploadOptions = {
      contentType: options?.contentType || file.type,
      metadata: options?.metadata,
    };

    // Upload the file using browser-friendly method
    const response = await this.httpClient.uploadFileFromBrowser(
      `/storage/upload`,
      file,
      {
        ...uploadOptions,
        bucket: bucketName,
        public: bucketName === 'appatonce-public', // Make public if using public bucket
        filename: fileName // Add filename to the request
      }
    );

    const uploadedFile = response.data;

    // Return public URL directly if requested (default behavior)
    if (options?.returnPublicUrl !== false) {
      // If the response already includes a URL, return it
      if (uploadedFile.url) {
        return uploadedFile.url;
      }
      // Otherwise try to get the public URL
      if (uploadedFile.key || uploadedFile.filename || uploadedFile.name) {
        const fileName = uploadedFile.key || uploadedFile.filename || uploadedFile.name;
        try {
          const urlResult = await this.getPublicUrl(bucketName, fileName);
          return urlResult.url;
        } catch (error) {
          // If public URL fails, return the filename
          return fileName;
        }
      }
    }

    return uploadedFile.key || uploadedFile.filename || uploadedFile.name;
  }

  // 🔥 ULTRA SIMPLE API - One line upload
  // Just upload and get URL back - simplest possible API
  async uploadAndGetUrl(bucketName: string, file: File, folder?: string): Promise<string> {
    console.log('uploadAndGetUrl called with:', { bucketName, fileName: file.name, fileType: file.type, fileSize: file.size, folder });
    const path = folder ? `${folder}/${Date.now()}-${file.name}` : `${Date.now()}-${file.name}`;
    return this.upload(bucketName, file, path);
  }

  async uploadBase64(
    bucketName: string,
    base64Data: string,
    fileName: string,
    options?: StorageUploadOptions
  ): Promise<StorageFile> {
    const response = await this.httpClient.post(`/storage/buckets/${bucketName}/upload-base64`, {
      data: base64Data,
      fileName,
      contentType: options?.contentType,
      metadata: options?.metadata,
      cacheControl: options?.cacheControl,
      acl: options?.acl,
      tags: options?.tags,
    });
    return response.data;
  }

  async uploadFromUrl(
    bucketName: string,
    url: string,
    fileName: string,
    options?: StorageUploadOptions
  ): Promise<StorageFile> {
    const response = await this.httpClient.post(`/storage/buckets/${bucketName}/upload-url`, {
      url,
      fileName,
      contentType: options?.contentType,
      metadata: options?.metadata,
      cacheControl: options?.cacheControl,
      acl: options?.acl,
      tags: options?.tags,
    });
    return response.data;
  }

  // File download methods
  async downloadFile(
    bucketName: string,
    fileName: string,
    options?: StorageDownloadOptions
  ): Promise<Buffer> {
    const response = await this.httpClient.get(`/storage/buckets/${bucketName}/download/${fileName}`, {
      responseType: 'arraybuffer',
      params: {
        quality: options?.quality,
        width: options?.width,
        height: options?.height,
        format: options?.format,
      },
    });
    return Buffer.from(response.data);
  }

  async getFileUrl(
    bucketName: string,
    fileName: string,
    options?: {
      expiresIn?: number;
      download?: boolean;
      transform?: {
        width?: number;
        height?: number;
        quality?: number;
        format?: string;
      };
    }
  ): Promise<{ url: string; expires_at?: string }> {
    const response = await this.httpClient.post(`/storage/buckets/${bucketName}/url`, {
      fileName,
      expiresIn: options?.expiresIn,
      download: options?.download,
      transform: options?.transform,
    });
    return response.data;
  }

  async getPublicUrl(bucketName: string, fileName: string): Promise<{ url: string }> {
    const response = await this.httpClient.get(`/storage/buckets/${bucketName}/public-url/${fileName}`);
    return response.data;
  }

  // File management
  async listFiles(
    bucketName: string,
    options?: {
      prefix?: string;
      limit?: number;
      offset?: number;
      search?: string;
      sortBy?: 'name' | 'size' | 'created_at' | 'modified_at';
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<{
    files: StorageFile[];
    total: number;
    hasMore: boolean;
  }> {
    const response = await this.httpClient.get(`/storage/buckets/${bucketName}/files`, {
      params: options,
    });
    return response.data;
  }

  async getFileInfo(bucketName: string, fileName: string): Promise<StorageFile> {
    const response = await this.httpClient.get(`/storage/buckets/${bucketName}/files/${fileName}`);
    return response.data;
  }

  async deleteFile(bucketName: string, fileName: string): Promise<void> {
    await this.httpClient.delete(`/storage/buckets/${bucketName}/files/${fileName}`);
  }

  async deleteFiles(bucketName: string, fileNames: string[]): Promise<{
    deleted: string[];
    failed: Array<{ fileName: string; error: string }>;
  }> {
    const response = await this.httpClient.post(`/storage/buckets/${bucketName}/delete-batch`, {
      fileNames,
    });
    return response.data;
  }

  async copyFile(
    sourceBucket: string,
    sourceFile: string,
    destBucket: string,
    destFile: string
  ): Promise<StorageFile> {
    const response = await this.httpClient.post(`/storage/copy`, {
      sourceBucket,
      sourceFile,
      destBucket,
      destFile,
    });
    return response.data;
  }

  async moveFile(
    sourceBucket: string,
    sourceFile: string,
    destBucket: string,
    destFile: string
  ): Promise<StorageFile> {
    const response = await this.httpClient.post(`/storage/move`, {
      sourceBucket,
      sourceFile,
      destBucket,
      destFile,
    });
    return response.data;
  }

  // File metadata and tags
  async updateFileMetadata(
    bucketName: string,
    fileName: string,
    metadata: Record<string, string>
  ): Promise<StorageFile> {
    const response = await this.httpClient.patch(`/storage/buckets/${bucketName}/files/${fileName}/metadata`, {
      metadata,
    });
    return response.data;
  }

  async updateFileTags(
    bucketName: string,
    fileName: string,
    tags: Record<string, string>
  ): Promise<StorageFile> {
    const response = await this.httpClient.patch(`/storage/buckets/${bucketName}/files/${fileName}/tags`, {
      tags,
    });
    return response.data;
  }

  async updateFileACL(
    bucketName: string,
    fileName: string,
    acl: 'private' | 'public-read' | 'public-read-write'
  ): Promise<StorageFile> {
    const response = await this.httpClient.patch(`/storage/buckets/${bucketName}/files/${fileName}/acl`, {
      acl,
    });
    return response.data;
  }

  // Bucket management
  async createBucket(
    name: string,
    options?: {
      acl?: 'private' | 'public-read' | 'public-read-write';
      versioning?: boolean;
      encryption?: boolean;
      lifecycle?: {
        expiration_days?: number;
        transition_days?: number;
        transition_storage_class?: string;
      };
    }
  ): Promise<{
    name: string;
    created_at: string;
    acl: string;
    versioning: boolean;
    encryption: boolean;
  }> {
    const response = await this.httpClient.post('/storage/buckets', {
      name,
      ...options,
    });
    return response.data;
  }

  async listBuckets(): Promise<Array<{
    name: string;
    created_at: string;
    file_count: number;
    total_size: number;
    acl: string;
  }>> {
    const response = await this.httpClient.get('/storage/buckets');
    return response.data;
  }

  async getBucketInfo(bucketName: string): Promise<{
    name: string;
    created_at: string;
    file_count: number;
    total_size: number;
    acl: string;
    versioning: boolean;
    encryption: boolean;
    lifecycle?: any;
  }> {
    const response = await this.httpClient.get(`/storage/buckets/${bucketName}`);
    return response.data;
  }

  async updateBucket(
    bucketName: string,
    options: {
      acl?: 'private' | 'public-read' | 'public-read-write';
      versioning?: boolean;
      encryption?: boolean;
      lifecycle?: {
        expiration_days?: number;
        transition_days?: number;
        transition_storage_class?: string;
      };
    }
  ): Promise<void> {
    await this.httpClient.patch(`/storage/buckets/${bucketName}`, options);
  }

  async deleteBucket(bucketName: string, force?: boolean): Promise<void> {
    await this.httpClient.delete(`/storage/buckets/${bucketName}`, {
      params: { force },
    });
  }

  // Image processing
  async resizeImage(
    bucketName: string,
    fileName: string,
    width: number,
    height: number,
    options?: {
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp' | 'gif';
      fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
      background?: string;
      gravity?: 'center' | 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';
    }
  ): Promise<StorageFile> {
    const response = await this.httpClient.post(`/storage/buckets/${bucketName}/resize`, {
      fileName,
      width,
      height,
      ...options,
    });
    return response.data;
  }

  async optimizeImage(
    bucketName: string,
    fileName: string,
    options?: {
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
      progressive?: boolean;
      lossless?: boolean;
    }
  ): Promise<StorageFile> {
    const response = await this.httpClient.post(`/storage/buckets/${bucketName}/optimize`, {
      fileName,
      ...options,
    });
    return response.data;
  }

  async addWatermark(
    bucketName: string,
    fileName: string,
    watermarkText: string,
    options?: {
      position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
      opacity?: number;
      fontSize?: number;
      fontColor?: string;
      fontFamily?: string;
    }
  ): Promise<StorageFile> {
    const response = await this.httpClient.post(`/storage/buckets/${bucketName}/watermark`, {
      fileName,
      watermarkText,
      ...options,
    });
    return response.data;
  }

  // Analytics and usage
  async getStorageUsage(): Promise<{
    total_files: number;
    total_size: number;
    total_bandwidth: number;
    buckets: Array<{
      name: string;
      file_count: number;
      size: number;
      bandwidth: number;
    }>;
  }> {
    const response = await this.httpClient.get('/storage/usage');
    return response.data;
  }

  async getStorageStats(
    bucketName?: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<{
    uploads: number;
    downloads: number;
    deletions: number;
    bandwidth: number;
    storage_used: number;
    daily_stats: Array<{
      date: string;
      uploads: number;
      downloads: number;
      bandwidth: number;
    }>;
  }> {
    const params: any = {};
    if (timeRange) {
      params.start_date = timeRange.start.toISOString();
      params.end_date = timeRange.end.toISOString();
    }

    const url = bucketName ? `/storage/buckets/${bucketName}/stats` : '/storage/stats';
    const response = await this.httpClient.get(url, { params });
    return response.data;
  }

  // Backup and sync
  async createBackup(
    bucketName: string,
    options?: {
      name?: string;
      description?: string;
      schedule?: string;
      retention_days?: number;
    }
  ): Promise<{
    id: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    created_at: string;
  }> {
    const response = await this.httpClient.post(`/storage/buckets/${bucketName}/backup`, options);
    return response.data;
  }

  async listBackups(bucketName: string): Promise<Array<{
    id: string;
    name: string;
    status: string;
    size: number;
    created_at: string;
    completed_at?: string;
  }>> {
    const response = await this.httpClient.get(`/storage/buckets/${bucketName}/backups`);
    return response.data;
  }

  async restoreBackup(bucketName: string, backupId: string): Promise<{
    id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    started_at: string;
  }> {
    const response = await this.httpClient.post(`/storage/buckets/${bucketName}/restore`, {
      backupId,
    });
    return response.data;
  }

  async deleteBackup(bucketName: string, backupId: string): Promise<void> {
    await this.httpClient.delete(`/storage/buckets/${bucketName}/backups/${backupId}`);
  }
}