"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageEditorModule = void 0;
class ImageEditorModule {
    constructor(client) {
        this.client = client;
    }
    async createImage(data) {
        const content = {
            resourceId: data.resourceId,
            resourceType: data.resourceType,
            contentType: 'image',
            title: data.title,
            content: {
                canvasData: typeof data.canvasData === 'string' ? data.canvasData : JSON.stringify(data.canvasData),
                width: data.width,
                height: data.height,
            },
            source: 'image-editor',
        };
        const response = await this.client.post('/content', content);
        return response.data;
    }
    async updateImage(contentId, data) {
        const updatePayload = {};
        if (data.title) {
            updatePayload.title = data.title;
        }
        if (data.canvasData || data.width || data.height) {
            updatePayload.content = {};
            if (data.canvasData) {
                updatePayload.content.canvasData = typeof data.canvasData === 'string'
                    ? data.canvasData
                    : JSON.stringify(data.canvasData);
            }
            if (data.width)
                updatePayload.content.width = data.width;
            if (data.height)
                updatePayload.content.height = data.height;
        }
        const response = await this.client.put(`/content/${contentId}`, updatePayload);
        return response.data;
    }
    async exportImage(contentId, options) {
        const params = new URLSearchParams({
            format: options.format,
            ...(options.quality && { quality: options.quality.toString() }),
            ...(options.scale && { scale: options.scale.toString() }),
            ...(options.includeBleed && { includeBleed: 'true' }),
            ...(options.transparentBackground && { transparentBackground: 'true' }),
        });
        const response = await this.client.get(`/content/${contentId}/export?${params}`);
        return response.data;
    }
    async uploadImage(imageData, resourceId, resourceType = 'project') {
        const formData = new FormData();
        if (typeof imageData === 'string') {
            if (imageData.startsWith('data:')) {
                const response = await fetch(imageData);
                const blob = await response.blob();
                formData.append('file', blob, 'image.png');
            }
            else {
                formData.append('imageData', imageData);
            }
        }
        else {
            formData.append('file', imageData);
        }
        formData.append('resourceId', resourceId);
        formData.append('resourceType', resourceType);
        const response = await this.client.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async getTemplates(category) {
        const url = category ? `/image-templates?category=${category}` : '/image-templates';
        const response = await this.client.get(url);
        return response.data;
    }
    async getTemplateById(templateId) {
        const response = await this.client.get(`/image-templates/${templateId}`);
        return response.data;
    }
    async removeBackground(contentId) {
        const response = await this.client.post(`/content/${contentId}/remove-background`);
        return response.data;
    }
    async applyFilter(contentId, filter, options) {
        const response = await this.client.post(`/content/${contentId}/filter`, {
            filter,
            options,
        });
        return response.data;
    }
    async generateImageAI(prompt, options) {
        const response = await this.client.post('/ai/image', {
            prompt,
            ...options,
        });
        return response.data;
    }
    async createFromTemplate(templateId, customizations) {
        const template = await this.getTemplateById(templateId);
        const customizedElements = template.elements.map((element, index) => {
            if (customizations.elements && customizations.elements[index]) {
                return {
                    ...element,
                    properties: {
                        ...element.properties,
                        ...customizations.elements[index].properties,
                    },
                };
            }
            return element;
        });
        const canvasData = {
            version: '2.0.0',
            objects: customizedElements,
            background: template.backgroundColor,
            width: template.width,
            height: template.height,
        };
        return this.createImage({
            resourceId: customizations.resourceId,
            resourceType: customizations.resourceType,
            title: customizations.title,
            canvasData,
            width: template.width,
            height: template.height,
        });
    }
}
exports.ImageEditorModule = ImageEditorModule;
//# sourceMappingURL=image-editor.js.map