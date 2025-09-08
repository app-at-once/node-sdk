"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentConversionModule = void 0;
class DocumentConversionModule {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async convert(source, targetFormat, options) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'document');
        }
        formData.append('targetFormat', targetFormat);
        if (options) {
            formData.append('options', JSON.stringify(options));
        }
        const response = await this.httpClient.post('/document-conversion/convert', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async batchConvert(documents, commonOptions) {
        const formData = new FormData();
        documents.forEach((doc, index) => {
            if (typeof doc.source === 'string') {
                formData.append(`sources[${index}]`, doc.source);
            }
            else {
                formData.append(`files[${index}]`, new Blob([doc.source]), `document${index}`);
            }
            formData.append(`targetFormats[${index}]`, doc.targetFormat);
            if (doc.options) {
                formData.append(`options[${index}]`, JSON.stringify(doc.options));
            }
        });
        if (commonOptions) {
            formData.append('commonOptions', JSON.stringify(commonOptions));
        }
        const response = await this.httpClient.post('/document-conversion/batch', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async convertOffice(source, targetFormat, options) {
        return this.convert(source, targetFormat, options);
    }
    async toPDF(source, options) {
        return this.convert(source, 'pdf', options);
    }
    async fromPDF(source, targetFormat, options) {
        return this.convert(source, targetFormat, options);
    }
    async convertImage(source, targetFormat, options) {
        return this.convert(source, targetFormat, options);
    }
    async convertEbook(source, targetFormat, options) {
        return this.convert(source, targetFormat, options);
    }
    async convertHTML(source, targetFormat, options) {
        return this.convert(source, targetFormat, options);
    }
    async convertMarkdown(source, targetFormat, options) {
        return this.convert(source, targetFormat, options);
    }
    async convertCAD(source, targetFormat, options) {
        return this.convert(source, targetFormat, options);
    }
    async getInfo(source) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'document');
        }
        const response = await this.httpClient.post('/document-conversion/info', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async getSupportedFormats(sourceFormat) {
        const params = sourceFormat ? { sourceFormat } : {};
        const response = await this.httpClient.get('/document-conversion/formats', { params });
        return response.data;
    }
    async validateConversion(sourceFormat, targetFormat) {
        const response = await this.httpClient.post('/document-conversion/validate', {
            sourceFormat,
            targetFormat,
        });
        return response.data;
    }
    async createJob(source, targetFormat, options) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'document');
        }
        formData.append('targetFormat', targetFormat);
        if (options) {
            formData.append('options', JSON.stringify(options));
        }
        const response = await this.httpClient.post('/document-conversion/jobs', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async getJobStatus(jobId) {
        const response = await this.httpClient.get(`/document-conversion/jobs/${jobId}`);
        return response.data;
    }
    async cancelJob(jobId) {
        await this.httpClient.delete(`/document-conversion/jobs/${jobId}`);
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
                throw new Error(job.error || 'Conversion job failed');
            }
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
        throw new Error(`Conversion job ${jobId} timed out after ${timeout}ms`);
    }
    async merge(documents, targetFormat, options) {
        const formData = new FormData();
        documents.forEach((doc, index) => {
            if (typeof doc === 'string') {
                formData.append(`documents[${index}]`, doc);
            }
            else {
                formData.append(`files[${index}]`, new Blob([doc]), `document${index}`);
            }
        });
        formData.append('targetFormat', targetFormat);
        if (options) {
            formData.append('options', JSON.stringify(options));
        }
        const response = await this.httpClient.post('/document-conversion/merge', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async split(source, options) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'document');
        }
        formData.append('options', JSON.stringify(options));
        const response = await this.httpClient.post('/document-conversion/split', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
}
exports.DocumentConversionModule = DocumentConversionModule;
//# sourceMappingURL=document-conversion.js.map