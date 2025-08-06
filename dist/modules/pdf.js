"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFModule = void 0;
class PDFModule {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async generateFromHTML(html, options) {
        const response = await this.httpClient.post('/pdf/generate/html', {
            html,
            options,
        });
        return response.data;
    }
    async generateFromURL(url, options) {
        const response = await this.httpClient.post('/pdf/generate/url', {
            url,
            ...options,
        });
        return response.data;
    }
    async generateFromTemplate(templateId, data, options) {
        const response = await this.httpClient.post('/pdf/generate/template', {
            templateId,
            data,
            options,
        });
        return response.data;
    }
    async merge(documents, options) {
        const formData = new FormData();
        documents.forEach((doc, index) => {
            if (typeof doc === 'string') {
                formData.append(`documents[${index}]`, doc);
            }
            else {
                formData.append(`files[${index}]`, new Blob([doc]), `document${index}.pdf`);
            }
        });
        if (options) {
            formData.append('options', JSON.stringify(options));
        }
        const response = await this.httpClient.post('/pdf/merge', formData, {
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
            formData.append('file', new Blob([source]), 'document.pdf');
        }
        formData.append('options', JSON.stringify(options));
        const response = await this.httpClient.post('/pdf/split', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async extractPages(source, pageRanges) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'document.pdf');
        }
        formData.append('pageRanges', pageRanges);
        const response = await this.httpClient.post('/pdf/extract-pages', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async rotatePages(source, rotation, pages) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'document.pdf');
        }
        formData.append('rotation', rotation.toString());
        if (pages) {
            formData.append('pages', pages);
        }
        const response = await this.httpClient.post('/pdf/rotate', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async addWatermark(source, watermark) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'document.pdf');
        }
        if (watermark.image) {
            if (typeof watermark.image === 'string') {
                formData.append('watermarkImage', watermark.image);
            }
            else {
                formData.append('watermarkFile', new Blob([watermark.image]), 'watermark');
            }
        }
        const watermarkOptions = { ...watermark };
        delete watermarkOptions.image;
        formData.append('watermark', JSON.stringify(watermarkOptions));
        const response = await this.httpClient.post('/pdf/watermark', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async compress(source, options) {
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
        const response = await this.httpClient.post('/pdf/compress', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async protect(source, options) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'document.pdf');
        }
        formData.append('options', JSON.stringify(options));
        const response = await this.httpClient.post('/pdf/protect', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async unlock(source, password) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'document.pdf');
        }
        formData.append('password', password);
        const response = await this.httpClient.post('/pdf/unlock', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async getInfo(source) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'document.pdf');
        }
        const response = await this.httpClient.post('/pdf/info', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async toImages(source, options) {
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
        const response = await this.httpClient.post('/pdf/to-images', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async addFormFields(source, fields) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'document.pdf');
        }
        formData.append('fields', JSON.stringify(fields));
        const response = await this.httpClient.post('/pdf/add-form-fields', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async fillForm(source, data, options) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'document.pdf');
        }
        formData.append('data', JSON.stringify(data));
        if (options) {
            formData.append('options', JSON.stringify(options));
        }
        const response = await this.httpClient.post('/pdf/fill-form', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async sign(source, signature, certificate) {
        const formData = new FormData();
        if (typeof source === 'string') {
            formData.append('source', source);
        }
        else {
            formData.append('file', new Blob([source]), 'document.pdf');
        }
        if (signature.image) {
            if (typeof signature.image === 'string') {
                formData.append('signatureImage', signature.image);
            }
            else {
                formData.append('signatureFile', new Blob([signature.image]), 'signature');
            }
        }
        const signatureOptions = { ...signature };
        delete signatureOptions.image;
        formData.append('signature', JSON.stringify(signatureOptions));
        if (certificate) {
            formData.append('certificate', new Blob([certificate.pfx]), 'certificate.pfx');
            formData.append('certificatePassword', certificate.password);
        }
        const response = await this.httpClient.post('/pdf/sign', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
}
exports.PDFModule = PDFModule;
//# sourceMappingURL=pdf.js.map