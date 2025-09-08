"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageModule = void 0;
class StorageModule {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async uploadFile(bucketName, file, fileName, options) {
        const response = await this.httpClient.uploadFile(`/storage/buckets/${bucketName}/upload`, file, fileName, {
            contentType: options?.contentType,
            metadata: options?.metadata,
            cacheControl: options?.cacheControl,
            acl: options?.acl,
            tags: options?.tags,
        });
        return response.data;
    }
    async upload(bucketName, file, path, options) {
        console.log('upload called with:', { bucketName, fileName: file?.name, fileType: file?.type, fileSize: file?.size, path });
        if (!file || !(file instanceof File)) {
            throw new Error('Invalid file object provided to upload');
        }
        const fileName = path || `${Date.now()}-${file.name}`;
        const uploadOptions = {
            contentType: options?.contentType || file.type,
            metadata: options?.metadata,
        };
        const response = await this.httpClient.uploadFileFromBrowser(`/storage/upload`, file, {
            ...uploadOptions,
            bucket: bucketName,
            public: bucketName === 'appatonce-public',
            filename: fileName
        });
        const uploadedFile = response.data;
        if (options?.returnPublicUrl !== false) {
            if (uploadedFile.url) {
                return uploadedFile.url;
            }
            if (uploadedFile.key || uploadedFile.filename || uploadedFile.name) {
                const fileName = uploadedFile.key || uploadedFile.filename || uploadedFile.name;
                try {
                    const urlResult = await this.getPublicUrl(bucketName, fileName);
                    return urlResult.url;
                }
                catch (error) {
                    return fileName;
                }
            }
        }
        return uploadedFile.key || uploadedFile.filename || uploadedFile.name;
    }
    async uploadAndGetUrl(bucketName, file, folder) {
        console.log('uploadAndGetUrl called with:', { bucketName, fileName: file.name, fileType: file.type, fileSize: file.size, folder });
        const path = folder ? `${folder}/${Date.now()}-${file.name}` : `${Date.now()}-${file.name}`;
        return this.upload(bucketName, file, path);
    }
    async uploadBase64(bucketName, base64Data, fileName, options) {
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
    async uploadFromUrl(bucketName, url, fileName, options) {
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
    async downloadFile(bucketName, fileName, options) {
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
    async getFileUrl(bucketName, fileName, options) {
        const response = await this.httpClient.post(`/storage/buckets/${bucketName}/url`, {
            fileName,
            expiresIn: options?.expiresIn,
            download: options?.download,
            transform: options?.transform,
        });
        return response.data;
    }
    async getPublicUrl(bucketName, fileName) {
        const response = await this.httpClient.get(`/storage/buckets/${bucketName}/public-url/${fileName}`);
        return response.data;
    }
    async listFiles(bucketName, options) {
        const response = await this.httpClient.get(`/storage/buckets/${bucketName}/files`, {
            params: options,
        });
        return response.data;
    }
    async getFileInfo(bucketName, fileName) {
        const response = await this.httpClient.get(`/storage/buckets/${bucketName}/files/${fileName}`);
        return response.data;
    }
    async deleteFile(bucketName, fileName) {
        await this.httpClient.delete(`/storage/buckets/${bucketName}/files/${fileName}`);
    }
    async deleteFiles(bucketName, fileNames) {
        const response = await this.httpClient.post(`/storage/buckets/${bucketName}/delete-batch`, {
            fileNames,
        });
        return response.data;
    }
    async copyFile(sourceBucket, sourceFile, destBucket, destFile) {
        const response = await this.httpClient.post(`/storage/copy`, {
            sourceBucket,
            sourceFile,
            destBucket,
            destFile,
        });
        return response.data;
    }
    async moveFile(sourceBucket, sourceFile, destBucket, destFile) {
        const response = await this.httpClient.post(`/storage/move`, {
            sourceBucket,
            sourceFile,
            destBucket,
            destFile,
        });
        return response.data;
    }
    async updateFileMetadata(bucketName, fileName, metadata) {
        const response = await this.httpClient.patch(`/storage/buckets/${bucketName}/files/${fileName}/metadata`, {
            metadata,
        });
        return response.data;
    }
    async updateFileTags(bucketName, fileName, tags) {
        const response = await this.httpClient.patch(`/storage/buckets/${bucketName}/files/${fileName}/tags`, {
            tags,
        });
        return response.data;
    }
    async updateFileACL(bucketName, fileName, acl) {
        const response = await this.httpClient.patch(`/storage/buckets/${bucketName}/files/${fileName}/acl`, {
            acl,
        });
        return response.data;
    }
    async createBucket(name, options) {
        const response = await this.httpClient.post('/storage/buckets', {
            name,
            ...options,
        });
        return response.data;
    }
    async listBuckets() {
        const response = await this.httpClient.get('/storage/buckets');
        return response.data;
    }
    async getBucketInfo(bucketName) {
        const response = await this.httpClient.get(`/storage/buckets/${bucketName}`);
        return response.data;
    }
    async updateBucket(bucketName, options) {
        await this.httpClient.patch(`/storage/buckets/${bucketName}`, options);
    }
    async deleteBucket(bucketName, force) {
        await this.httpClient.delete(`/storage/buckets/${bucketName}`, {
            params: { force },
        });
    }
    async resizeImage(bucketName, fileName, width, height, options) {
        const response = await this.httpClient.post(`/storage/buckets/${bucketName}/resize`, {
            fileName,
            width,
            height,
            ...options,
        });
        return response.data;
    }
    async optimizeImage(bucketName, fileName, options) {
        const response = await this.httpClient.post(`/storage/buckets/${bucketName}/optimize`, {
            fileName,
            ...options,
        });
        return response.data;
    }
    async addWatermark(bucketName, fileName, watermarkText, options) {
        const response = await this.httpClient.post(`/storage/buckets/${bucketName}/watermark`, {
            fileName,
            watermarkText,
            ...options,
        });
        return response.data;
    }
    async getStorageUsage() {
        const response = await this.httpClient.get('/storage/usage');
        return response.data;
    }
    async getStorageStats(bucketName, timeRange) {
        const params = {};
        if (timeRange) {
            params.start_date = timeRange.start.toISOString();
            params.end_date = timeRange.end.toISOString();
        }
        const url = bucketName ? `/storage/buckets/${bucketName}/stats` : '/storage/stats';
        const response = await this.httpClient.get(url, { params });
        return response.data;
    }
    async createBackup(bucketName, options) {
        const response = await this.httpClient.post(`/storage/buckets/${bucketName}/backup`, options);
        return response.data;
    }
    async listBackups(bucketName) {
        const response = await this.httpClient.get(`/storage/buckets/${bucketName}/backups`);
        return response.data;
    }
    async restoreBackup(bucketName, backupId) {
        const response = await this.httpClient.post(`/storage/buckets/${bucketName}/restore`, {
            backupId,
        });
        return response.data;
    }
    async deleteBackup(bucketName, backupId) {
        await this.httpClient.delete(`/storage/buckets/${bucketName}/backups/${backupId}`);
    }
}
exports.StorageModule = StorageModule;
//# sourceMappingURL=storage.js.map