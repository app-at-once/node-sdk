import { HttpClient } from '../core/http-client';
import { AIResponse } from '../types';

export class AIModule {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  // Text Generation
  async generateText(
    prompt: string,
    options?: {
      model?: string;
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
      stop?: string[];
      stream?: boolean;
    }
  ): Promise<AIResponse> {
    const response = await this.httpClient.post('/ai/text', {
      prompt,
      ...options,
    });
    return response.data;
  }

  // Chat Completion
  async chat(
    messages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>,
    options?: {
      model?: string;
      max_tokens?: number;
      temperature?: number;
      stream?: boolean;
    }
  ): Promise<AIResponse> {
    const response = await this.httpClient.post('/ai/chat', {
      messages,
      ...options,
    });
    return response.data;
  }

  // Embeddings
  async generateEmbeddings(
    text: string | string[],
    options?: {
      model?: string;
      dimensions?: number;
    }
  ): Promise<AIResponse> {
    const response = await this.httpClient.post('/ai/embeddings', {
      input: text,
      ...options,
    });
    return response.data;
  }

  // Content Generation
  async generateBlogPost(
    topic: string,
    options?: {
      tone?: 'professional' | 'casual' | 'friendly' | 'formal';
      length?: 'short' | 'medium' | 'long';
      keywords?: string[];
      include_outline?: boolean;
      seo_optimized?: boolean;
    }
  ): Promise<{
    title: string;
    content: string;
    outline?: string[];
    meta_description?: string;
    tags?: string[];
  }> {
    const response = await this.httpClient.post('/ai/blog-post', {
      topic,
      ...options,
    });
    return response.data;
  }

  async generateCaption(
    content: string,
    platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook',
    options?: {
      tone?: string;
      include_hashtags?: boolean;
      max_length?: number;
    }
  ): Promise<{
    caption: string;
    hashtags?: string[];
    variations?: string[];
  }> {
    const response = await this.httpClient.post('/ai/caption', {
      content,
      platform,
      ...options,
    });
    return response.data;
  }

  async optimizeContent(
    content: string,
    goal: 'seo' | 'readability' | 'engagement' | 'conversion',
    options?: {
      target_audience?: string;
      keywords?: string[];
      tone?: string;
    }
  ): Promise<{
    optimized_content: string;
    improvements: string[];
    score: number;
    suggestions: string[];
  }> {
    const response = await this.httpClient.post('/ai/optimize', {
      content,
      goal,
      ...options,
    });
    return response.data;
  }

  // Script Generation
  async generateScript(
    type: 'video' | 'podcast' | 'presentation' | 'commercial',
    topic: string,
    options?: {
      duration?: number;
      audience?: string;
      style?: string;
      include_cues?: boolean;
    }
  ): Promise<{
    script: string;
    scenes?: Array<{
      scene: number;
      content: string;
      duration?: number;
      notes?: string;
    }>;
    total_duration?: number;
  }> {
    const response = await this.httpClient.post('/ai/script', {
      type,
      topic,
      ...options,
    });
    return response.data;
  }

  // Hashtag Generation
  async generateHashtags(
    content: string,
    platform?: 'instagram' | 'twitter' | 'linkedin' | 'tiktok',
    options?: {
      count?: number;
      popularity?: 'trending' | 'niche' | 'mixed';
      include_branded?: boolean;
    }
  ): Promise<{
    hashtags: string[];
    popularity_scores?: Record<string, number>;
    categories?: Record<string, string[]>;
  }> {
    const response = await this.httpClient.post('/ai/hashtags', {
      content,
      platform,
      ...options,
    });
    return response.data;
  }

  // Content Analysis
  async analyzeContent(
    content: string,
    analysis_type: 'sentiment' | 'readability' | 'seo' | 'engagement' | 'all'
  ): Promise<{
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
      keywords: Array<{ word: string; frequency: number }>;
      suggestions: string[];
    };
    engagement?: {
      score: number;
      emotional_triggers: string[];
      call_to_actions: string[];
    };
  }> {
    const response = await this.httpClient.post('/ai/analyze', {
      content,
      analysis_type,
    });
    return response.data;
  }

  // Content Ideas Generation
  async generateIdeas(
    topic: string,
    content_type: 'blog' | 'video' | 'social' | 'email' | 'all',
    options?: {
      count?: number;
      audience?: string;
      keywords?: string[];
      trending?: boolean;
    }
  ): Promise<{
    ideas: Array<{
      title: string;
      description: string;
      type: string;
      difficulty: 'easy' | 'medium' | 'hard';
      estimated_time?: string;
      keywords?: string[];
    }>;
    trending_topics?: string[];
  }> {
    const response = await this.httpClient.post('/ai/ideas', {
      topic,
      content_type,
      ...options,
    });
    return response.data;
  }

  // Image Generation
  async generateImage(
    prompt: string,
    options?: {
      model?: string;
      style?: string;
      size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
      quality?: 'standard' | 'hd';
      n?: number;
    }
  ): Promise<{
    images: Array<{
      url: string;
      revised_prompt?: string;
    }>;
    usage?: {
      tokens?: number;
      cost?: number;
    };
  }> {
    const response = await this.httpClient.post('/ai/image', {
      prompt,
      ...options,
    });
    return response.data;
  }

  // Video Generation
  async generateVideo(
    prompt: string,
    options?: {
      duration?: number;
      style?: string;
      resolution?: '720p' | '1080p' | '4k';
      fps?: number;
    }
  ): Promise<{
    job_id: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    estimated_completion?: string;
  }> {
    const response = await this.httpClient.post('/ai/video', {
      prompt,
      ...options,
    });
    return response.data;
  }

  async getVideoStatus(jobId: string): Promise<{
    job_id: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress?: number;
    video_url?: string;
    error?: string;
  }> {
    const response = await this.httpClient.get(`/ai/video/${jobId}`);
    return response.data;
  }

  // Audio Generation
  async generateAudio(
    text: string,
    options?: {
      voice?: string;
      model?: string;
      response_format?: 'mp3' | 'opus' | 'aac' | 'flac';
      speed?: number;
    }
  ): Promise<{
    audio_url: string;
    duration: number;
    format: string;
  }> {
    const response = await this.httpClient.post('/ai/audio', {
      text,
      ...options,
    });
    return response.data;
  }

  // Voice Cloning
  async createVoiceClone(
    name: string,
    audioSamples: Buffer[],
    filenames: string[],
    options?: {
      description?: string;
      language?: string;
      quality?: 'standard' | 'premium';
    }
  ): Promise<{
    voice_id: string;
    name: string;
    status: 'training' | 'ready' | 'failed';
    estimated_completion?: string;
  }> {
    // Dynamic import to avoid ESLint error
    const { default: FormData } = await import('form-data');
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

    // Add audio samples
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

  async getVoiceCloneStatus(voiceId: string): Promise<{
    voice_id: string;
    name: string;
    status: 'training' | 'ready' | 'failed';
    progress?: number;
    error?: string;
    created_at: string;
  }> {
    const response = await this.httpClient.get(`/ai/voice-clone/${voiceId}`);
    return response.data;
  }

  async listVoiceClones(): Promise<Array<{
    voice_id: string;
    name: string;
    status: string;
    created_at: string;
    language?: string;
  }>> {
    const response = await this.httpClient.get('/ai/voice-clone');
    return response.data;
  }

  async deleteVoiceClone(voiceId: string): Promise<void> {
    await this.httpClient.delete(`/ai/voice-clone/${voiceId}`);
  }

  // AI Models and Configuration
  async listModels(): Promise<{
    text_models: string[];
    image_models: string[];
    video_models: string[];
    audio_models: string[];
    embedding_models: string[];
  }> {
    const response = await this.httpClient.get('/ai/models');
    return response.data;
  }

  async getModelInfo(modelId: string): Promise<{
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
  }> {
    const response = await this.httpClient.get(`/ai/models/${modelId}`);
    return response.data;
  }

  // Service Status
  async getServiceStatus(): Promise<{
    status: 'operational' | 'degraded' | 'down';
    services: {
      ollama: { status: string; models: string[] };
      openai: { status: string; available: boolean };
      comfyui: { status: string; queue_size?: number };
    };
    last_updated: string;
  }> {
    const response = await this.httpClient.get('/ai/status');
    return response.data;
  }

  // Usage and Analytics
  async getUsageStats(timeRange?: { start: Date; end: Date }): Promise<{
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
  }> {
    const params: Record<string, any> = {};
    if (timeRange) {
      params.start_date = timeRange.start.toISOString();
      params.end_date = timeRange.end.toISOString();
    }

    const response = await this.httpClient.get('/ai/usage', { params });
    return response.data;
  }
}