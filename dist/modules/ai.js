"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIModule = void 0;
class AIModule {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async generateText(prompt, options) {
        const response = await this.httpClient.post('/ai/text', {
            prompt,
            ...options,
        });
        return response.data;
    }
    async chat(messages, options) {
        const response = await this.httpClient.post('/ai/chat', {
            messages,
            ...options,
        });
        return response.data;
    }
    async generateEmbeddings(text, options) {
        const response = await this.httpClient.post('/ai/embeddings', {
            input: text,
            ...options,
        });
        return response.data;
    }
    async generateBlogPost(topic, options) {
        const response = await this.httpClient.post('/ai/blog-post', {
            topic,
            ...options,
        });
        return response.data;
    }
    async generateCaption(content, platform, options) {
        const response = await this.httpClient.post('/ai/caption', {
            content,
            platform,
            ...options,
        });
        return response.data;
    }
    async optimizeContent(content, goal, options) {
        const response = await this.httpClient.post('/ai/optimize', {
            content,
            goal,
            ...options,
        });
        return response.data;
    }
    async generateScript(type, topic, options) {
        const response = await this.httpClient.post('/ai/script', {
            type,
            topic,
            ...options,
        });
        return response.data;
    }
    async generateHashtags(content, platform, options) {
        const response = await this.httpClient.post('/ai/hashtags', {
            content,
            platform,
            ...options,
        });
        return response.data;
    }
    async analyzeContent(content, analysis_type) {
        const response = await this.httpClient.post('/ai/analyze', {
            content,
            analysis_type,
        });
        return response.data;
    }
    async generateIdeas(topic, content_type, options) {
        const response = await this.httpClient.post('/ai/ideas', {
            topic,
            content_type,
            ...options,
        });
        return response.data;
    }
    async generateImage(prompt, options) {
        const response = await this.httpClient.post('/ai/image', {
            prompt,
            ...options,
        });
        return response.data;
    }
    async generateVideo(prompt, options) {
        const response = await this.httpClient.post('/ai/video', {
            prompt,
            ...options,
        });
        return response.data;
    }
    async getVideoStatus(jobId) {
        const response = await this.httpClient.get(`/ai/video/${jobId}`);
        return response.data;
    }
    async generateAudio(text, options) {
        const response = await this.httpClient.post('/ai/audio', {
            text,
            ...options,
        });
        return response.data;
    }
    async createVoiceClone(name, audioSamples, filenames, options) {
        const { default: FormData } = await Promise.resolve().then(() => __importStar(require('form-data')));
        const formData = new FormData();
        formData.append('name', name);
        if (options?.description) {
            formData.append('description', options.description);
        }
        if (options?.language) {
            formData.append('language', options.language);
        }
        if (options?.quality) {
            formData.append('quality', options.quality);
        }
        audioSamples.forEach((sample, index) => {
            const filename = filenames[index] || `sample_${index}.wav`;
            formData.append('samples', sample, filename);
        });
        const response = await this.httpClient.post('/ai/voice-clone', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });
        return response.data;
    }
    async getVoiceCloneStatus(voiceId) {
        const response = await this.httpClient.get(`/ai/voice-clone/${voiceId}`);
        return response.data;
    }
    async listVoiceClones() {
        const response = await this.httpClient.get('/ai/voice-clone');
        return response.data;
    }
    async deleteVoiceClone(voiceId) {
        await this.httpClient.delete(`/ai/voice-clone/${voiceId}`);
    }
    async listModels() {
        const response = await this.httpClient.get('/ai/models');
        return response.data;
    }
    async getModelInfo(modelId) {
        const response = await this.httpClient.get(`/ai/models/${modelId}`);
        return response.data;
    }
    async getServiceStatus() {
        const response = await this.httpClient.get('/ai/status');
        return response.data;
    }
    async getUsageStats(timeRange) {
        const params = {};
        if (timeRange) {
            params.start_date = timeRange.start.toISOString();
            params.end_date = timeRange.end.toISOString();
        }
        const response = await this.httpClient.get('/ai/usage', { params });
        return response.data;
    }
}
exports.AIModule = AIModule;
//# sourceMappingURL=ai.js.map