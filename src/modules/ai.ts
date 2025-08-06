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
      dimensions?: number;
    }
  ): Promise<AIResponse> {
    const response = await this.httpClient.post('/ai/embeddings', {
      text,
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
    platform: string,
    contentType: string,
    options?: {
      targetAudience?: string;
      tone?: string;
    }
  ): Promise<{
    optimized: string;
  }> {
    const response = await this.httpClient.post('/ai/optimize', {
      content,
      platform,
      contentType,
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

  // Translation
  async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<{
    translation: string;
    detectedLanguage?: string;
  }> {
    const response = await this.httpClient.post('/ai/translate', {
      text,
      targetLanguage,
      sourceLanguage,
    });
    return response.data;
  }

  // Text Summarization
  async summarizeText(
    text: string,
    options?: {
      maxLength?: number;
      style?: 'bullet' | 'paragraph' | 'brief';
      focus?: string;
    }
  ): Promise<{
    summary: string;
    wordCount?: number;
  }> {
    const response = await this.httpClient.post('/ai/summarize', {
      text,
      ...options,
    });
    return response.data;
  }

  // Writing Enhancement
  async enhanceWriting(
    text: string,
    options?: {
      tone?: string;
      style?: string;
      purpose?: string;
      fixGrammar?: boolean;
    }
  ): Promise<{
    enhanced: string;
    suggestions: string[];
    grammarIssues: string[];
  }> {
    const response = await this.httpClient.post('/ai/enhance-writing', {
      text,
      ...options,
    });
    return response.data;
  }

  // Content Moderation
  async moderateContent(
    content: string
  ): Promise<{
    safe: boolean;
    issues: string[];
    severity: 'safe' | 'warning' | 'danger';
  }> {
    const response = await this.httpClient.post('/ai/moderate', {
      content,
    });
    return response.data;
  }

  // Code Generation
  async generateCode(
    description: string,
    language: string,
    options?: {
      framework?: string;
      style?: string;
      includeComments?: boolean;
    }
  ): Promise<{
    code: string;
    language: string;
    explanation?: string;
  }> {
    const response = await this.httpClient.post('/ai/code/generate', {
      description,
      language,
      ...options,
    });
    return response.data;
  }

  // Code Analysis
  async analyzeCode(
    code: string,
    language?: string
  ): Promise<{
    explanation: string;
    issues: string[];
    improvements: string[];
    complexity: string;
  }> {
    const response = await this.httpClient.post('/ai/code/analyze', {
      code,
      language,
    });
    return response.data;
  }

  // Reasoning and Problem Solving
  async solveReasoning(
    problem: string,
    options?: {
      stepByStep?: boolean;
      explainReasoning?: boolean;
      verifyAnswer?: boolean;
    }
  ): Promise<{
    solution: string;
    steps: string[];
    reasoning: string;
    confidence: number;
  }> {
    const response = await this.httpClient.post('/ai/reasoning/solve', {
      problem,
      ...options,
    });
    return response.data;
  }

  // Email Intelligence
  async generateEmailReply(
    originalEmail: string,
    context?: string,
    tone?: string
  ): Promise<{
    reply: string;
    suggestions?: string[];
  }> {
    const response = await this.httpClient.post('/ai/email/reply', {
      originalEmail,
      context,
      tone,
    });
    return response.data;
  }

  async optimizeEmailSubject(
    content: string,
    purpose: string
  ): Promise<{
    subjects: string[];
    bestOption?: string;
  }> {
    const response = await this.httpClient.post('/ai/email/subject', {
      content,
      purpose,
    });
    return response.data;
  }

  // Natural Language Processing
  async extractEntities(
    text: string
  ): Promise<{
    people: string[];
    organizations: string[];
    locations: string[];
    dates: string[];
    topics: string[];
  }> {
    const response = await this.httpClient.post('/ai/nlp/entities', {
      text,
    });
    return response.data;
  }

  async analyzeSentiment(
    text: string
  ): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    score: number;
    emotions: string[];
    explanation: string;
  }> {
    const response = await this.httpClient.post('/ai/nlp/sentiment', {
      text,
    });
    return response.data;
  }

  async extractKeywords(
    text: string,
    count?: number
  ): Promise<{
    keywords: string[];
    relevanceScores?: Record<string, number>;
  }> {
    const response = await this.httpClient.post('/ai/nlp/keywords', {
      text,
      count,
    });
    return response.data;
  }

  // Image Generation
  async generateImage(
    prompt: string,
    options?: {
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

}