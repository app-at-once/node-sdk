import { HttpClient } from '../core/http-client';
export interface VideoGenerationOptions {
    prompt: string;
    provider?: 'runway' | 'stability' | 'replicate' | 'd-id' | 'synthesia';
    model?: string;
    options?: {
        duration?: number;
        resolution?: string;
        style?: string;
        fpsRate?: number;
        aspectRatio?: string;
        camera?: string;
        lighting?: string;
        webhook?: string;
    };
}
export interface VideoProcessingOptions {
    videoUrl?: string;
    options?: {
        transcode?: {
            format?: 'mp4' | 'webm' | 'mov';
            codec?: 'h264' | 'h265' | 'vp9';
            quality?: 'low' | 'medium' | 'high' | 'ultra';
            resolution?: '480p' | '720p' | '1080p' | '4K';
            fps?: 24 | 30 | 60;
            bitrate?: string;
        };
        thumbnail?: {
            timestamps?: number[];
            count?: number;
            width?: number;
            height?: number;
        };
        optimize?: boolean;
        watermark?: {
            text?: string;
            imageUrl?: string;
            position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
            opacity?: number;
        };
    };
}
export interface VideoUploadOptions {
    title?: string;
    description?: string;
    tags?: string[];
    autoTranscode?: boolean;
    generateThumbnail?: boolean;
}
export interface VideoGeneration {
    id: string;
    provider: string;
    prompt: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    videoUrl?: string;
    error?: string;
    metadata?: any;
    createdAt: string;
    completedAt?: string;
}
export interface ProcessedVideo {
    id: string;
    originalUrl: string;
    processedUrl?: string;
    thumbnails: string[];
    metadata: {
        duration: number;
        width: number;
        height: number;
        fps: number;
        codec: string;
        bitrate: number;
        size: number;
        format: string;
        hasAudio: boolean;
        audioCodec?: string;
        audioBitrate?: number;
        audioChannels?: number;
    };
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
    progress?: number;
    createdAt: string;
    completedAt?: string;
}
export declare class VideoModule {
    private httpClient;
    constructor(httpClient: HttpClient);
    generate(options: VideoGenerationOptions): Promise<VideoGeneration>;
    upload(filePath: string, options?: VideoUploadOptions): Promise<ProcessedVideo>;
    uploadBuffer(buffer: Buffer, fileName: string, options?: VideoUploadOptions): Promise<ProcessedVideo>;
    process(options: VideoProcessingOptions): Promise<ProcessedVideo>;
    getJobStatus(jobId: string): Promise<ProcessedVideo>;
    getGenerationStatus(generationId: string, provider: string): Promise<VideoGeneration>;
    waitForGeneration(generationId: string, provider: string, options?: {
        maxWaitTime?: number;
        pollInterval?: number;
    }): Promise<VideoGeneration>;
    waitForProcessing(jobId: string, options?: {
        maxWaitTime?: number;
        pollInterval?: number;
    }): Promise<ProcessedVideo>;
    generateAndWait(options: VideoGenerationOptions, waitOptions?: {
        maxWaitTime?: number;
        pollInterval?: number;
    }): Promise<VideoGeneration>;
    uploadAndWait(filePath: string, options?: VideoUploadOptions, waitOptions?: {
        maxWaitTime?: number;
        pollInterval?: number;
    }): Promise<ProcessedVideo>;
}
