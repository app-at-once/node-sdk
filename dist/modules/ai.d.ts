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
        style?: string;
        size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
        quality?: 'standard' | 'hd';
        n?: number;
    }): Promise<{
        images: Array<{
            url: string;
            revised_prompt?: string;
        }>;
        usage?: {
            tokens?: number;
            cost?: number;
        };
    }>;
    generateVideo(prompt: string, options?: {
        duration?: number;
        style?: string;
        resolution?: '720p' | '1080p' | '4k';
        fps?: number;
    }): Promise<{
        job_id: string;
        status: 'queued' | 'processing' | 'completed' | 'failed';
        estimated_completion?: string;
    }>;
    getVideoStatus(jobId: string): Promise<{
        job_id: string;
        status: 'queued' | 'processing' | 'completed' | 'failed';
        progress?: number;
        video_url?: string;
        error?: string;
    }>;
    generateAudio(text: string, options?: {
        voice?: string;
        response_format?: 'mp3' | 'opus' | 'aac' | 'flac';
        speed?: number;
    }): Promise<{
        audio_url: string;
        duration: number;
        format: string;
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
}
