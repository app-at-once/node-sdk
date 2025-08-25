"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OCRModule = void 0;
class OCRModule {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async extractFromImage(source, options) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'image');
        }
        if (options) {
            formData.append('options', JSON.stringify(options));
        }
        const response = await this.httpClient.post('/ocr/extract/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async extractFromPDF(source, options) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'document.pdf');
        }
        if (options) {
            formData.append('options', JSON.stringify(options));
        }
        const response = await this.httpClient.post('/ocr/extract/pdf', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async batchExtract(files, commonOptions) {
        const formData = new FormData();
        files.forEach((file, index) => {
            if (typeof file.source === 'string') {
                formData.append(`sources[${index}]`, file.source);
            }
            else {
                formData.append(`files[${index}]`, new Blob([file.source]), `file${index}`);
            }
            if (file.options) {
                formData.append(`options[${index}]`, JSON.stringify(file.options));
            }
        });
        if (commonOptions) {
            formData.append('commonOptions', JSON.stringify(commonOptions));
        }
        const response = await this.httpClient.post('/ocr/batch', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async extractRegion(source, region, options) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'image');
        }
        formData.append('region', JSON.stringify(region));
        if (options) {
            formData.append('options', JSON.stringify(options));
        }
        const response = await this.httpClient.post('/ocr/extract/region', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async extractStructured(source, documentType, schema) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'document');
        }
        formData.append('documentType', documentType);
        if (schema) {
            formData.append('schema', JSON.stringify(schema));
        }
        const response = await this.httpClient.post('/ocr/extract/structured', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async extractAndTranslate(source, targetLanguage, options) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'image');
        }
        formData.append('targetLanguage', targetLanguage);
        if (options) {
            formData.append('options', JSON.stringify(options));
        }
        const response = await this.httpClient.post('/ocr/extract-translate', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async searchText(source, searchQuery, options) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'document');
        }
        formData.append('searchQuery', searchQuery);
        if (options) {
            formData.append('options', JSON.stringify(options));
        }
        const response = await this.httpClient.post('/ocr/search', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async createSearchablePDF(source, options) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'document');
        }
        if (options) {
            formData.append('options', JSON.stringify(options));
        }
        const response = await this.httpClient.post('/ocr/create-searchable-pdf', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async detectOrientation(source) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'image');
        }
        const response = await this.httpClient.post('/ocr/detect-orientation', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async detectLanguage(source) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'document');
        }
        const response = await this.httpClient.post('/ocr/detect-language', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async getSupportedLanguages() {
        const response = await this.httpClient.get('/ocr/languages');
        return response.data;
    }
    async createJob(source, options) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'document');
        }
        if (options) {
            formData.append('options', JSON.stringify(options));
        }
        const response = await this.httpClient.post('/ocr/jobs', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async getJobStatus(jobId) {
        const response = await this.httpClient.get(`/ocr/jobs/${jobId}`);
        return response.data;
    }
    async waitForJob(jobId, options) {
        const timeout = options?.timeout || 300000;
        const pollInterval = options?.pollInterval || 2000;
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            const job = await this.getJobStatus(jobId);
            if (job.status === 'completed' && job.result) {
                return job.result;
            }
            if (job.status === 'failed') {
                throw new Error(job.error || 'OCR job failed');
            }
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
        throw new Error(`OCR job ${jobId} timed out after ${timeout}ms`);
    }
}
exports.OCRModule = OCRModule;
//# sourceMappingURL=ocr.js.map