import { HttpClient } from '../core/http-client';
import { AIResponse } from '../types';
export declare class AIModule {
    private httpClient;
    constructor(httpClient: HttpClient);
    generateText(prompt: string, options?: {
        max_tokens?: number;
        temperature?: number;
        top_p?: number;
        stop?: string[];
        stream?: boolean;
    }): Promise<AIResponse>;
    chat(messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
    }>, options?: {
        max_tokens?: number;
        temperature?: number;
        stream?: boolean;
    }): Promise<AIResponse>;
    generateEmbeddings(text: string | string[], options?: {
        dimensions?: number;
    }): Promise<AIResponse>;
    generateBlogPost(topic: string, options?: {
        tone?: 'professional' | 'casual' | 'friendly' | 'formal';
        length?: 'short' | 'medium' | 'long';
        keywords?: string[];
        include_outline?: boolean;
        seo_optimized?: boolean;
    }): Promise<{
        title: string;
        content: string;
        outline?: string[];
        meta_description?: string;
        tags?: string[];
    }>;
    generateCaption(content: string, platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook', options?: {
        tone?: string;
        include_hashtags?: boolean;
        max_length?: number;
    }): Promise<{
        caption: string;
        hashtags?: string[];
        variations?: string[];
    }>;
    optimizeContent(content: string, platform: string, contentType: string, options?: {
        targetAudience?: string;
        tone?: string;
    }): Promise<{
        optimized: string;
    }>;
    generateScript(type: 'video' | 'podcast' | 'presentation' | 'commercial', topic: string, options?: {
        duration?: number;
        audience?: string;
        style?: string;
        include_cues?: boolean;
    }): Promise<{
        script: string;
        scenes?: Array<{
            scene: number;
            content: string;
            duration?: number;
            notes?: string;
        }>;
        total_duration?: number;
    }>;
    generateHashtags(content: string, platform?: 'instagram' | 'twitter' | 'linkedin' | 'tiktok', options?: {
        count?: number;
        popularity?: 'trending' | 'niche' | 'mixed';
        include_branded?: boolean;
    }): Promise<{
        hashtags: string[];
        popularity_scores?: Record<string, number>;
        categories?: Record<string, string[]>;
    }>;
    analyzeContent(content: string, analysis_type: 'sentiment' | 'readability' | 'seo' | 'engagement' | 'all'): Promise<{
        sentiment?: {
            score: number;
            label: 'positive' | 'negative' | 'neutral';
            confidence: number;
        };
        readability?: {
            score: number;
            grade_level: string;
            suggestions: string[];
        };
        seo?: {
            score: number;
            keywords: Array<{
                word: string;
                frequency: number;
            }>;
            suggestions: string[];
        };
        engagement?: {
            score: number;
            emotional_triggers: string[];
            call_to_actions: string[];
        };
    }>;
    generateIdeas(topic: string, content_type: 'blog' | 'video' | 'social' | 'email' | 'all', options?: {
        count?: number;
        audience?: string;
        keywords?: string[];
        trending?: boolean;
    }): Promise<{
        ideas: Array<{
            title: string;
            description: string;
            type: string;
            difficulty: 'easy' | 'medium' | 'hard';
            estimated_time?: string;
            keywords?: string[];
        }>;
        trending_topics?: string[];
    }>;
    translateText(text: string, targetLanguage: string, sourceLanguage?: string): Promise<{
        translation: string;
        detectedLanguage?: string;
    }>;
    summarizeText(text: string, options?: {
        maxLength?: number;
        style?: 'bullet' | 'paragraph' | 'brief';
        focus?: string;
    }): Promise<{
        summary: string;
        wordCount?: number;
    }>;
    enhanceWriting(text: string, options?: {
        tone?: string;
        style?: string;
        purpose?: string;
        fixGrammar?: boolean;
    }): Promise<{
        enhanced: string;
        suggestions: string[];
        grammarIssues: string[];
    }>;
    moderateContent(content: string): Promise<{
        safe: boolean;
        issues: string[];
        severity: 'safe' | 'warning' | 'danger';
    }>;
    generateCode(description: string, language: string, options?: {
        framework?: string;
        style?: string;
        includeComments?: boolean;
    }): Promise<{
        code: string;
        language: string;
        explanation?: string;
    }>;
    analyzeCode(code: string, language?: string): Promise<{
        explanation: string;
        issues: string[];
        improvements: string[];
        complexity: string;
    }>;
    solveReasoning(problem: string, options?: {
        stepByStep?: boolean;
        explainReasoning?: boolean;
        verifyAnswer?: boolean;
    }): Promise<{
        solution: string;
        steps: string[];
        reasoning: string;
        confidence: number;
    }>;
    generateEmailReply(originalEmail: string, context?: string, tone?: string): Promise<{
        reply: string;
        suggestions?: string[];
    }>;
    optimizeEmailSubject(content: string, purpose: string): Promise<{
        subjects: string[];
        bestOption?: string;
    }>;
    extractEntities(text: string): Promise<{
        people: string[];
        organizations: string[];
        locations: string[];
        dates: string[];
        topics: string[];
    }>;
    analyzeSentiment(text: string): Promise<{
        sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
        score: number;
        emotions: string[];
        explanation: string;
    }>;
    extractKeywords(text: string, count?: number): Promise<{
        keywords: string[];
        relevanceScores?: Record<string, number>;
    }>;
    generateImage(prompt: string, options?: {
        negativePrompt?: string;
        width?: number;
        height?: number;
        model?: 'SD3' | 'SDXL' | 'SD1.5' | 'Playground2.5' | 'FLUX.1';
        steps?: number;
        cfg?: number;
        seed?: number;
        scheduler?: string;
        outputFormat?: 'png' | 'jpg' | 'webp';
    }): Promise<{
        jobId: string;
        status: string;
        message: string;
        userId: string;
    }>;
    getImageJobStatus(jobId: string): Promise<{
        jobId: string;
        status: 'pending' | 'processing' | 'completed' | 'failed';
        progress: number;
        userId: string;
        results?: {
            url?: string;
            buffer?: Buffer;
            cost?: number;
            width?: number;
            height?: number;
            processingTime?: number;
            error?: string;
        };
        error?: string;
        createdAt: Date;
        completedAt?: Date;
    }>;
    generateBatchImages(prompts: string[], options?: {
        negativePrompt?: string;
        width?: number;
        height?: number;
        model?: 'SD3' | 'SDXL' | 'SD1.5' | 'Playground2.5' | 'FLUX.1';
        steps?: number;
        cfg?: number;
    }): Promise<{
        jobId: string;
        status: string;
        message: string;
        totalImages: number;
    }>;
    upscaleImage(imageUrl: string, scaleFactor?: 2 | 4 | 8, options?: {
        method?: string;
    }): Promise<{
        jobId: string;
        status: string;
        url?: string;
        cost?: number;
        processingTime?: number;
    }>;
    removeBackground(imageUrl: string, resourceId: string, resourceType: 'project' | 'app'): Promise<{
        jobId: string;
        status: string;
        url?: string;
        buffer?: string;
        cost?: number;
        processingTime?: number;
    }>;
    generateVideo(prompt: string, options?: {
        duration?: number;
        aspectRatio?: '16:9' | '9:16' | '1:1';
        resolution?: '720p' | '1080p';
        style?: 'realistic' | 'animated' | 'artistic';
        voiceEnabled?: boolean;
        voiceText?: string;
        voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
        voiceSpeed?: number;
        voiceProvider?: 'openai' | 'elevenlabs';
        seed?: number;
        fps?: number;
        model?: string;
        provider?: 'runware' | 'replicate';
    }): Promise<{
        jobId: string;
        status: string;
        message: string;
        userId: string;
    }>;
    getVideoJobStatus(jobId: string): Promise<{
        jobId: string;
        status: 'pending' | 'processing' | 'completed' | 'failed';
        progress: number;
        userId: string;
        results?: {
            url?: string;
            jobId?: string;
            status: string;
            cost?: number;
            duration?: number;
            processingTime?: number;
            error?: string;
            videoUrl?: string;
            audioUrl?: string;
        };
        error?: string;
        createdAt: Date;
        completedAt?: Date;
    }>;
    getVideoPipelines(): Promise<Array<{
        id: string;
        name: string;
        features: string[];
    }>>;
    generateAudio(text: string, options?: {
        voice?: string;
        provider?: 'openai' | 'elevenlabs';
        model?: string;
        speed?: number;
        format?: 'mp3' | 'opus' | 'aac' | 'flac';
    }): Promise<{
        jobId: string;
        status: string;
        message: string;
    }>;
    getAudioJobStatus(jobId: string): Promise<{
        jobId: string;
        status: 'pending' | 'processing' | 'completed' | 'failed';
        userId: string;
        results?: {
            url?: string;
            path?: string;
            contentId?: string;
            metadata?: {
                voice?: string;
                model?: string;
                speed?: number;
                provider?: string;
            };
        };
        error?: string;
        createdAt: Date;
        completedAt?: Date;
    }>;
    getAudioVoices(provider?: 'openai' | 'elevenlabs'): Promise<{
        provider: string;
        voices: Array<{
            id: string;
            name: string;
            gender?: string;
            labels?: Record<string, string>;
            category?: string;
        }>;
    }>;
    createVoiceClone(name: string, audioSamples: Buffer[], filenames: string[], options?: {
        description?: string;
        language?: string;
        quality?: 'standard' | 'premium';
    }): Promise<{
        voice_id: string;
        name: string;
        status: 'training' | 'ready' | 'failed';
        estimated_completion?: string;
    }>;
    getVoiceCloneStatus(voiceId: string): Promise<{
        voice_id: string;
        name: string;
        status: 'training' | 'ready' | 'failed';
        progress?: number;
        error?: string;
        created_at: string;
    }>;
    listVoiceClones(): Promise<Array<{
        voice_id: string;
        name: string;
        status: string;
        created_at: string;
        language?: string;
    }>>;
    generatePodcastScript(topic: string, duration: number, options?: {
        hosts?: number;
        style?: 'casual' | 'professional' | 'educational' | 'comedy';
        includeSegments?: string[];
        targetAudience?: string;
    }): Promise<{
        script: string;
        metadata?: {
            estimatedDuration: number;
            segmentCount: number;
        };
    }>;
    generateNewsletterContent(topic: string, sections: string[], options?: {
        tone?: string;
        wordCount?: number;
        includeCallToAction?: boolean;
        personalization?: boolean;
    }): Promise<{
        subject: string;
        preheader: string;
        content: string;
        callToAction?: string;
    }>;
    paraphraseText(text: string, options?: {
        style?: 'formal' | 'casual' | 'technical' | 'creative' | 'simple';
        preserveMeaning?: boolean;
        targetLength?: 'shorter' | 'same' | 'longer';
    }): Promise<{
        paraphrased: string;
        similarity?: number;
    }>;
    generateProductDescription(productName: string, features: string[], options?: {
        targetAudience?: string;
        tone?: string;
        includeSpecs?: boolean;
        seoOptimized?: boolean;
        wordCount?: number;
    }): Promise<{
        title: string;
        shortDescription: string;
        longDescription: string;
        bulletPoints: string[];
        seoKeywords?: string[];
    }>;
    generateLegalDocument(documentType: 'privacy-policy' | 'terms-of-service' | 'disclaimer' | 'cookie-policy', companyInfo: {
        name: string;
        website: string;
        email: string;
        address?: string;
    }, options?: {
        jurisdiction?: string;
        includeGDPR?: boolean;
        includeCCPA?: boolean;
        customClauses?: string[];
    }): Promise<{
        document: string;
        warnings?: string[];
    }>;
    generateQuizQuestions(topic: string, count: number, options?: {
        difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
        questionTypes?: ('multiple-choice' | 'true-false' | 'short-answer')[];
        includeExplanations?: boolean;
    }): Promise<{
        questions: Array<{
            question: string;
            type: string;
            options?: string[];
            correctAnswer: string;
            explanation?: string;
            difficulty: string;
        }>;
    }>;
    analyzeReadability(text: string): Promise<{
        score: number;
        gradeLevel: string;
        readingTime: number;
        suggestions: string[];
        metrics: {
            sentenceCount: number;
            wordCount: number;
            syllableCount: number;
            complexWords: number;
        };
    }>;
    batchGenerateContent(requests: Array<{
        type: 'blog' | 'social' | 'email' | 'product' | 'newsletter';
        params: any;
    }>): Promise<Array<{
        success: boolean;
        result?: any;
        error?: string;
    }>>;
    getContentTemplates(category?: string): Promise<Array<{
        id: string;
        name: string;
        category: string;
        description: string;
        variables: string[];
        example?: string;
    }>>;
    applyTemplate(templateId: string, variables: Record<string, string>): Promise<{
        content: string;
        metadata?: any;
    }>;
}
