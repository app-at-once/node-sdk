"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoModule = void 0;
const form_data_1 = __importDefault(require("form-data"));
const fs_1 = __importDefault(require("fs"));
class VideoModule {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async generate(options) {
        const response = await this.httpClient.post('/ai/video/generate', options);
        return response.data;
    }
    async upload(filePath, options) {
        const formData = new form_data_1.default();
        const fileStream = fs_1.default.createReadStream(filePath);
        const fileName = filePath.split('/').pop() || 'video.mp4';
        formData.append('file', fileStream, fileName);
        if (options?.title)
            formData.append('title', options.title);
        if (options?.description)
            formData.append('description', options.description);
        if (options?.tags) {
            options.tags.forEach((tag, index) => {
                formData.append(`tags[${index}]`, tag);
            });
        }
        if (options?.autoTranscode !== undefined) {
            formData.append('autoTranscode', options.autoTranscode.toString());
        }
        if (options?.generateThumbnail !== undefined) {
            formData.append('generateThumbnail', options.generateThumbnail.toString());
        }
        const response = await this.httpClient.post('/ai/video/upload', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });
        return response.data;
    }
    async uploadBuffer(buffer, fileName, options) {
        const formData = new form_data_1.default();
        formData.append('file', buffer, fileName);
        if (options?.title)
            formData.append('title', options.title);
        if (options?.description)
            formData.append('description', options.description);
        if (options?.tags) {
            options.tags.forEach((tag, index) => {
                formData.append(`tags[${index}]`, tag);
            });
        }
        if (options?.autoTranscode !== undefined) {
            formData.append('autoTranscode', options.autoTranscode.toString());
        }
        if (options?.generateThumbnail !== undefined) {
            formData.append('generateThumbnail', options.generateThumbnail.toString());
        }
        const response = await this.httpClient.post('/ai/video/upload', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });
        return response.data;
    }
    async process(options) {
        const response = await this.httpClient.post('/ai/video/process', options);
        return response.data;
    }
    async getJobStatus(jobId) {
        const response = await this.httpClient.get(`/ai/video/job/${jobId}`);
        return response.data;
    }
    async getGenerationStatus(generationId, provider) {
        const response = await this.httpClient.get(`/ai/video/generation/${generationId}?provider=${provider}`);
        return response.data;
    }
    async waitForGeneration(generationId, provider, options) {
        const maxWaitTime = options?.maxWaitTime || 600000;
        const pollInterval = options?.pollInterval || 5000;
        const startTime = Date.now();
        while (Date.now() - startTime < maxWaitTime) {
            const status = await this.getGenerationStatus(generationId, provider);
            if (status.status === 'completed' || status.status === 'failed') {
                return status;
            }
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
        throw new Error('Video generation timed out');
    }
    async waitForProcessing(jobId, options) {
        const maxWaitTime = options?.maxWaitTime || 300000;
        const pollInterval = options?.pollInterval || 2000;
        const startTime = Date.now();
        while (Date.now() - startTime < maxWaitTime) {
            const job = await this.getJobStatus(jobId);
            if (job.status === 'completed' || job.status === 'failed') {
                return job;
            }
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
        throw new Error('Video processing timed out');
    }
    async generateAndWait(options, waitOptions) {
        const generation = await this.generate(options);
        return this.waitForGeneration(generation.id, generation.provider, waitOptions);
    }
    async uploadAndWait(filePath, options, waitOptions) {
        const video = await this.upload(filePath, options);
        if (video.status === 'completed') {
            return video;
        }
        return this.waitForProcessing(video.id, waitOptions);
    }
}
exports.VideoModule = VideoModule;
//# sourceMappingURL=video.js.map