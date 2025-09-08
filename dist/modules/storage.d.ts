import { HttpClient } from '../core/http-client';
import { StorageFile, StorageUploadOptions, StorageDownloadOptions } from '../types';
export declare class StorageModule {
    private httpClient;
    constructor(httpClient: HttpClient);
    uploadFile(bucketName: string, file: Buffer, fileName: string, options?: StorageUploadOptions): Promise<StorageFile>;
    upload(bucketName: string, file: File, path?: string, options?: {
        metadata?: Record<string, any>;
        contentType?: string;
        returnPublicUrl?: boolean;
    }): Promise<string>;
    uploadAndGetUrl(bucketName: string, file: File, folder?: string): Promise<string>;
    uploadBase64(bucketName: string, base64Data: string, fileName: string, options?: StorageUploadOptions): Promise<StorageFile>;
    uploadFromUrl(bucketName: string, url: string, fileName: string, options?: StorageUploadOptions): Promise<StorageFile>;
    downloadFile(bucketName: string, fileName: string, options?: StorageDownloadOptions): Promise<Buffer>;
    getFileUrl(bucketName: string, fileName: string, options?: {
        expiresIn?: number;
        download?: boolean;
        transform?: {
            width?: number;
            height?: number;
            quality?: number;
            format?: string;
        };
    }): Promise<{
        url: string;
        expires_at?: string;
    }>;
    getPublicUrl(bucketName: string, fileName: string): Promise<{
        url: string;
    }>;
    listFiles(bucketName: string, options?: {
        prefix?: string;
        limit?: number;
        offset?: number;
        search?: string;
        sortBy?: 'name' | 'size' | 'created_at' | 'modified_at';
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        files: StorageFile[];
        total: number;
        hasMore: boolean;
    }>;
    getFileInfo(bucketName: string, fileName: string): Promise<StorageFile>;
    deleteFile(bucketName: string, fileName: string): Promise<void>;
    deleteFiles(bucketName: string, fileNames: string[]): Promise<{
        deleted: string[];
        failed: Array<{
            fileName: string;
            error: string;
        }>;
    }>;
    copyFile(sourceBucket: string, sourceFile: string, destBucket: string, destFile: string): Promise<StorageFile>;
    moveFile(sourceBucket: string, sourceFile: string, destBucket: string, destFile: string): Promise<StorageFile>;
    updateFileMetadata(bucketName: string, fileName: string, metadata: Record<string, string>): Promise<StorageFile>;
    updateFileTags(bucketName: string, fileName: string, tags: Record<string, string>): Promise<StorageFile>;
    updateFileACL(bucketName: string, fileName: string, acl: 'private' | 'public-read' | 'public-read-write'): Promise<StorageFile>;
    createBucket(name: string, options?: {
        acl?: 'private' | 'public-read' | 'public-read-write';
        versioning?: boolean;
        encryption?: boolean;
        lifecycle?: {
            expiration_days?: number;
            transition_days?: number;
            transition_storage_class?: string;
        };
    }): Promise<{
        name: string;
        created_at: string;
        acl: string;
        versioning: boolean;
        encryption: boolean;
    }>;
    listBuckets(): Promise<Array<{
        name: string;
        created_at: string;
        file_count: number;
        total_size: number;
        acl: string;
    }>>;
    getBucketInfo(bucketName: string): Promise<{
        name: string;
        created_at: string;
        file_count: number;
        total_size: number;
        acl: string;
        versioning: boolean;
        encryption: boolean;
        lifecycle?: any;
    }>;
    updateBucket(bucketName: string, options: {
        acl?: 'private' | 'public-read' | 'public-read-write';
        versioning?: boolean;
        encryption?: boolean;
        lifecycle?: {
            expiration_days?: number;
            transition_days?: number;
            transition_storage_class?: string;
        };
    }): Promise<void>;
    deleteBucket(bucketName: string, force?: boolean): Promise<void>;
    resizeImage(bucketName: string, fileName: string, width: number, height: number, options?: {
        quality?: number;
        format?: 'jpeg' | 'png' | 'webp' | 'gif';
        fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
        background?: string;
        gravity?: 'center' | 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';
    }): Promise<StorageFile>;
    optimizeImage(bucketName: string, fileName: string, options?: {
        quality?: number;
        format?: 'jpeg' | 'png' | 'webp';
        progressive?: boolean;
        lossless?: boolean;
    }): Promise<StorageFile>;
    addWatermark(bucketName: string, fileName: string, watermarkText: string, options?: {
        position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
        opacity?: number;
        fontSize?: number;
        fontColor?: string;
        fontFamily?: string;
    }): Promise<StorageFile>;
    getStorageUsage(): Promise<{
        total_files: number;
        total_size: number;
        total_bandwidth: number;
        buckets: Array<{
            name: string;
            file_count: number;
            size: number;
            bandwidth: number;
        }>;
    }>;
    getStorageStats(bucketName?: string, timeRange?: {
        start: Date;
        end: Date;
    }): Promise<{
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
    }>;
    createBackup(bucketName: string, options?: {
        name?: string;
        description?: string;
        schedule?: string;
        retention_days?: number;
    }): Promise<{
        id: string;
        name: string;
        status: 'pending' | 'running' | 'completed' | 'failed';
        created_at: string;
    }>;
    listBackups(bucketName: string): Promise<Array<{
        id: string;
        name: string;
        status: string;
        size: number;
        created_at: string;
        completed_at?: string;
    }>>;
    restoreBackup(bucketName: string, backupId: string): Promise<{
        id: string;
        status: 'pending' | 'running' | 'completed' | 'failed';
        started_at: string;
    }>;
    deleteBackup(bucketName: string, backupId: string): Promise<void>;
}
