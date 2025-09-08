import { HttpClient } from '../core/http-client';
import FormData from 'form-data';
import fs from 'fs';

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

export class VideoModule {
  constructor(private httpClient: HttpClient) {}
  /**
   * Generate a video from text prompt
   */
  async generate(options: VideoGenerationOptions): Promise<VideoGeneration> {
    const response = await this.httpClient.post('/ai/video/generate', options);
    return response.data;
  }

  /**
   * Upload and process a video file
   */
  async upload(
    filePath: string,
    options?: VideoUploadOptions
  ): Promise<ProcessedVideo> {
    const formData = new FormData();
    
    // Add file
    const fileStream = fs.createReadStream(filePath);
    const fileName = filePath.split('/').pop() || 'video.mp4';
    formData.append('file', fileStream, fileName);

    // Add other options
    if (options?.title) formData.append('title', options.title);
    if (options?.description) formData.append('description', options.description);
    if (options?.tags) {
      options.tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });
    }
    if (options?.autoTranscode !== undefined) {
      formData.append('autoTranscode', options.autoTranscode.toString());
    }
    if (options?.generateThumbnail !== undefined) {
      formData.append('generateThumbnail', options.generateThumbnail.toString());
    }

    const response = await this.httpClient.post('/ai/video/upload', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    return response.data;
  }

  /**
   * Upload video from buffer
   */
  async uploadBuffer(
    buffer: Buffer,
    fileName: string,
    options?: VideoUploadOptions
  ): Promise<ProcessedVideo> {
    const formData = new FormData();
    
    // Add buffer as file
    formData.append('file', buffer, fileName);

    // Add other options
    if (options?.title) formData.append('title', options.title);
    if (options?.description) formData.append('description', options.description);
    if (options?.tags) {
      options.tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });
    }
    if (options?.autoTranscode !== undefined) {
      formData.append('autoTranscode', options.autoTranscode.toString());
    }
    if (options?.generateThumbnail !== undefined) {
      formData.append('generateThumbnail', options.generateThumbnail.toString());
    }

    const response = await this.httpClient.post('/ai/video/upload', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    return response.data;
  }

  /**
   * Process an existing video
   */
  async process(options: VideoProcessingOptions): Promise<ProcessedVideo> {
    const response = await this.httpClient.post('/ai/video/process', options);
    return response.data;
  }

  /**
   * Get video processing job status
   */
  async getJobStatus(jobId: string): Promise<ProcessedVideo> {
    const response = await this.httpClient.get(`/ai/video/job/${jobId}`);
    return response.data;
  }

  /**
   * Get video generation status
   */
  async getGenerationStatus(
    generationId: string,
    provider: string
  ): Promise<VideoGeneration> {
    const response = await this.httpClient.get(
      `/ai/video/generation/${generationId}?provider=${provider}`
    );
    return response.data;
  }

  /**
   * Wait for video generation to complete
   */
  async waitForGeneration(
    generationId: string,
    provider: string,
    options?: {
      maxWaitTime?: number; // in milliseconds
      pollInterval?: number; // in milliseconds
    }
  ): Promise<VideoGeneration> {
    const maxWaitTime = options?.maxWaitTime || 600000; // 10 minutes default
    const pollInterval = options?.pollInterval || 5000; // 5 seconds default
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getGenerationStatus(generationId, provider);
      
      if (status.status === 'completed' || status.status === 'failed') {
        return status;
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Video generation timed out');
  }

  /**
   * Wait for video processing to complete
   */
  async waitForProcessing(
    jobId: string,
    options?: {
      maxWaitTime?: number; // in milliseconds
      pollInterval?: number; // in milliseconds
    }
  ): Promise<ProcessedVideo> {
    const maxWaitTime = options?.maxWaitTime || 300000; // 5 minutes default
    const pollInterval = options?.pollInterval || 2000; // 2 seconds default
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const job = await this.getJobStatus(jobId);
      
      if (job.status === 'completed' || job.status === 'failed') {
        return job;
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Video processing timed out');
  }

  /**
   * Generate video and wait for completion
   */
  async generateAndWait(
    options: VideoGenerationOptions,
    waitOptions?: {
      maxWaitTime?: number;
      pollInterval?: number;
    }
  ): Promise<VideoGeneration> {
    const generation = await this.generate(options);
    return this.waitForGeneration(
      generation.id,
      generation.provider,
      waitOptions
    );
  }

  /**
   * Upload video and wait for processing
   */
  async uploadAndWait(
    filePath: string,
    options?: VideoUploadOptions,
    waitOptions?: {
      maxWaitTime?: number;
      pollInterval?: number;
    }
  ): Promise<ProcessedVideo> {
    const video = await this.upload(filePath, options);
    
    if (video.status === 'completed') {
      return video;
    }
    
    return this.waitForProcessing(video.id, waitOptions);
  }
}