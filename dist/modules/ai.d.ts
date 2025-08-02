import { HttpClient } from '../core/http-client';
import { AIResponse } from '../types';
export declare class AIModule {
    private httpClient;
    constructor(httpClient: HttpClient);
    generateText(prompt: string, options?: {
        model?: string;
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
        model?: string;
        max_tokens?: number;
        temperature?: number;
        stream?: boolean;
    }): Promise<AIResponse>;
    generateEmbeddings(text: string | string[], options?: {
        model?: string;
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
    optimizeContent(content: string, goal: 'seo' | 'readability' | 'engagement' | 'conversion', options?: {
        target_audience?: string;
        keywords?: string[];
        tone?: string;
    }): Promise<{
        optimized_content: string;
        improvements: string[];
        score: number;
        suggestions: string[];
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
    generateImage(prompt: string, options?: {
        model?: string;
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
        model?: string;
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
    deleteVoiceClone(voiceId: string): Promise<void>;
    listModels(): Promise<{
        text_models: string[];
        image_models: string[];
        video_models: string[];
        audio_models: string[];
        embedding_models: string[];
    }>;
    getModelInfo(modelId: string): Promise<{
        id: string;
        name: string;
        type: string;
        description: string;
        max_tokens?: number;
        pricing?: {
            input_tokens?: number;
            output_tokens?: number;
            per_request?: number;
        };
        capabilities: string[];
    }>;
    getServiceStatus(): Promise<{
        status: 'operational' | 'degraded' | 'down';
        services: {
            ollama: {
                status: string;
                models: string[];
            };
            openai: {
                status: string;
                available: boolean;
            };
            comfyui: {
                status: string;
                queue_size?: number;
            };
        };
        last_updated: string;
    }>;
    getUsageStats(timeRange?: {
        start: Date;
        end: Date;
    }): Promise<{
        total_requests: number;
        total_tokens: number;
        total_cost: number;
        by_model: Record<string, {
            requests: number;
            tokens: number;
            cost: number;
        }>;
        daily_usage: Array<{
            date: string;
            requests: number;
            tokens: number;
            cost: number;
        }>;
    }>;
}
