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
            text,
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
    async optimizeContent(content, platform, contentType, options) {
        const response = await this.httpClient.post('/ai/optimize', {
            content,
            platform,
            contentType,
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
    async translateText(text, targetLanguage, sourceLanguage) {
        const response = await this.httpClient.post('/ai/translate', {
            text,
            targetLanguage,
            sourceLanguage,
        });
        return response.data;
    }
    async summarizeText(text, options) {
        const response = await this.httpClient.post('/ai/summarize', {
            text,
            ...options,
        });
        return response.data;
    }
    async enhanceWriting(text, options) {
        const response = await this.httpClient.post('/ai/enhance-writing', {
            text,
            ...options,
        });
        return response.data;
    }
    async moderateContent(content) {
        const response = await this.httpClient.post('/ai/moderate', {
            content,
        });
        return response.data;
    }
    async generateCode(description, language, options) {
        const response = await this.httpClient.post('/ai/code/generate', {
            description,
            language,
            ...options,
        });
        return response.data;
    }
    async analyzeCode(code, language) {
        const response = await this.httpClient.post('/ai/code/analyze', {
            code,
            language,
        });
        return response.data;
    }
    async solveReasoning(problem, options) {
        const response = await this.httpClient.post('/ai/reasoning/solve', {
            problem,
            ...options,
        });
        return response.data;
    }
    async generateEmailReply(originalEmail, context, tone) {
        const response = await this.httpClient.post('/ai/email/reply', {
            originalEmail,
            context,
            tone,
        });
        return response.data;
    }
    async optimizeEmailSubject(content, purpose) {
        const response = await this.httpClient.post('/ai/email/subject', {
            content,
            purpose,
        });
        return response.data;
    }
    async extractEntities(text) {
        const response = await this.httpClient.post('/ai/nlp/entities', {
            text,
        });
        return response.data;
    }
    async analyzeSentiment(text) {
        const response = await this.httpClient.post('/ai/nlp/sentiment', {
            text,
        });
        return response.data;
    }
    async extractKeywords(text, count) {
        const response = await this.httpClient.post('/ai/nlp/keywords', {
            text,
            count,
        });
        return response.data;
    }
    async generateImage(prompt, options) {
        const response = await this.httpClient.post('/ai/images/generate', {
            prompt,
            ...options,
        });
        return response.data;
    }
    async getImageJobStatus(jobId) {
        const response = await this.httpClient.get(`/ai/images/job/${jobId}`);
        return response.data;
    }
    async generateBatchImages(prompts, options) {
        const response = await this.httpClient.post('/ai/images/generate-batch', {
            prompts,
            ...options,
        });
        return response.data;
    }
    async upscaleImage(imageUrl, scaleFactor = 4, options) {
        const response = await this.httpClient.post('/ai/upscale', {
            imageUrl,
            scaleFactor,
            ...options,
        });
        return response.data;
    }
    async removeBackground(imageUrl, resourceId, resourceType) {
        const response = await this.httpClient.post('/ai/remove-background', {
            imageUrl,
            resourceId,
            resourceType,
        });
        return response.data;
    }
    async generateVideo(prompt, options) {
        const response = await this.httpClient.post('/ai/videos/generate', {
            prompt,
            ...options,
        });
        return response.data;
    }
    async getVideoJobStatus(jobId) {
        const response = await this.httpClient.get(`/ai/videos/job/${jobId}`);
        return response.data;
    }
    async getVideoPipelines() {
        const response = await this.httpClient.get('/ai/videos/pipelines');
        return response.data;
    }
    async generateAudio(text, options) {
        const response = await this.httpClient.post('/ai/audio/generate', {
            text,
            ...options,
        });
        return response.data;
    }
    async getAudioJobStatus(jobId) {
        const response = await this.httpClient.get(`/ai/audio/job/${jobId}`);
        return response.data;
    }
    async getAudioVoices(provider = 'openai') {
        const response = await this.httpClient.get('/ai/audio/voices', {
            params: { provider },
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
    async generatePodcastScript(topic, duration, options) {
        const response = await this.httpClient.post('/ai/generate/podcast-script', {
            topic,
            duration,
            ...options,
        });
        return response.data;
    }
    async generateNewsletterContent(topic, sections, options) {
        const response = await this.httpClient.post('/ai/generate/newsletter', {
            topic,
            sections,
            ...options,
        });
        return response.data;
    }
    async paraphraseText(text, options) {
        const response = await this.httpClient.post('/ai/paraphrase', {
            text,
            ...options,
        });
        return response.data;
    }
    async generateProductDescription(productName, features, options) {
        const response = await this.httpClient.post('/ai/generate/product-description', {
            productName,
            features,
            ...options,
        });
        return response.data;
    }
    async generateLegalDocument(documentType, companyInfo, options) {
        const response = await this.httpClient.post('/ai/generate/legal-document', {
            documentType,
            companyInfo,
            ...options,
        });
        return response.data;
    }
    async generateQuizQuestions(topic, count, options) {
        const response = await this.httpClient.post('/ai/generate/quiz', {
            topic,
            count,
            ...options,
        });
        return response.data;
    }
    async analyzeReadability(text) {
        const response = await this.httpClient.post('/ai/analyze/readability', {
            text,
        });
        return response.data;
    }
    async batchGenerateContent(requests) {
        const response = await this.httpClient.post('/ai/batch-generate', {
            requests,
        });
        return response.data;
    }
    async getContentTemplates(category) {
        const response = await this.httpClient.get('/ai/templates', {
            params: { category },
        });
        return response.data;
    }
    async applyTemplate(templateId, variables) {
        const response = await this.httpClient.post('/ai/templates/apply', {
            templateId,
            variables,
        });
        return response.data;
    }
}
exports.AIModule = AIModule;
//# sourceMappingURL=ai.js.map