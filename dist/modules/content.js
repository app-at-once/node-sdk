"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentModule = void 0;
class ContentModule {
    constructor(client) {
        this.client = client;
    }
    async create(data) {
        const response = await this.client.post('/content', data);
        return response.data;
    }
    async getAll(options) {
        const params = new URLSearchParams();
        if (options) {
            Object.entries(options).forEach(([key, value]) => {
                if (value !== undefined) {
                    params.append(key, String(value));
                }
            });
        }
        const queryString = params.toString();
        const url = queryString ? `/content?${queryString}` : '/content';
        const response = await this.client.get(url);
        return response.data;
    }
    async getById(contentId) {
        const response = await this.client.get(`/content/${contentId}`);
        return response.data;
    }
    async update(contentId, data) {
        const response = await this.client.put(`/content/${contentId}`, data);
        return response.data;
    }
    async delete(contentId) {
        await this.client.delete(`/content/${contentId}`);
    }
    async archive(contentId) {
        await this.client.put(`/content/${contentId}/archive`);
    }
    async restore(contentId) {
        await this.client.put(`/content/${contentId}/restore`);
    }
    async duplicate(contentId) {
        const response = await this.client.post(`/content/${contentId}/duplicate`);
        return response.data;
    }
    async export(contentId, format = 'json') {
        const response = await this.client.get(`/content/${contentId}/export?format=${format}`);
        return response.data;
    }
    async generateAI(type, data) {
        let endpoint;
        let payload;
        switch (type) {
            case 'blog_post':
                endpoint = '/ai/blog-post';
                payload = {
                    topic: data.topic || data.prompt,
                    keywords: data.keywords || [],
                    tone: data.tone,
                };
                break;
            case 'caption':
                endpoint = '/ai/caption';
                payload = {
                    content: data.content || data.prompt,
                    platform: data.platform || 'general',
                    hashtags: data.hashtags || [],
                    tone: data.tone,
                };
                break;
            case 'email':
                endpoint = '/ai/email-reply';
                payload = {
                    originalEmail: data.originalEmail || data.prompt,
                    context: data.context,
                    tone: data.tone,
                };
                break;
            case 'summary':
                endpoint = '/ai/summarize';
                payload = {
                    text: data.text || data.prompt,
                    maxLength: data.maxLength,
                    style: data.style || 'paragraph',
                    focus: data.focus,
                };
                break;
            default:
                endpoint = '/ai/text';
                payload = {
                    prompt: data.prompt,
                    model: data.model,
                    temperature: data.temperature,
                    maxTokens: data.maxTokens,
                };
        }
        const response = await this.client.post(endpoint, payload);
        return response.data;
    }
}
exports.ContentModule = ContentModule;
//# sourceMappingURL=content.js.map