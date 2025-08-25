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

  // Image Generation (Unified Service with Queue)
  async generateImage(
    prompt: string,
    options?: {
      negativePrompt?: string;
      width?: number;
      height?: number;
      model?: 'SD3' | 'SDXL' | 'SD1.5' | 'Playground2.5' | 'FLUX.1';
      steps?: number;
      cfg?: number;
      seed?: number;
      scheduler?: string;
      outputFormat?: 'png' | 'jpg' | 'webp';
    }
  ): Promise<{
    jobId: string;
    status: string;
    message: string;
    userId: string;
  }> {
    const response = await this.httpClient.post('/ai/images/generate', {
      prompt,
      ...options,
    });
    return response.data;
  }

  // Get image generation job status
  async getImageJobStatus(jobId: string): Promise<{
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
  }> {
    const response = await this.httpClient.get(`/ai/images/job/${jobId}`);
    return response.data;
  }

  // Batch image generation
  async generateBatchImages(
    prompts: string[],
    options?: {
      negativePrompt?: string;
      width?: number;
      height?: number;
      model?: 'SD3' | 'SDXL' | 'SD1.5' | 'Playground2.5' | 'FLUX.1';
      steps?: number;
      cfg?: number;
    }
  ): Promise<{
    jobId: string;
    status: string;
    message: string;
    totalImages: number;
  }> {
    const response = await this.httpClient.post('/ai/images/generate-batch', {
      prompts,
      ...options,
    });
    return response.data;
  }

  // Image upscaling
  async upscaleImage(
    imageUrl: string,
    scaleFactor: 2 | 4 | 8 = 4,
    options?: {
      method?: string;
    }
  ): Promise<{
    jobId: string;
    status: string;
    url?: string;
    cost?: number;
    processingTime?: number;
  }> {
    const response = await this.httpClient.post('/ai/upscale', {
      imageUrl,
      scaleFactor,
      ...options,
    });
    return response.data;
  }

  // Remove background
  async removeBackground(
    imageUrl: string,
    resourceId: string,
    resourceType: 'project' | 'app'
  ): Promise<{
    jobId: string;
    status: string;
    url?: string;
    buffer?: string;
    cost?: number;
    processingTime?: number;
  }> {
    const response = await this.httpClient.post('/ai/remove-background', {
      imageUrl,
      resourceId,
      resourceType,
    });
    return response.data;
  }

  // Video Generation (Unified Service with Queue)
  async generateVideo(
    prompt: string,
    options?: {
      duration?: number; // seconds (6 or 10 for Hailuo)
      aspectRatio?: '16:9' | '9:16' | '1:1';
      resolution?: '720p' | '1080p';
      style?: 'realistic' | 'animated' | 'artistic';
      voiceEnabled?: boolean;
      voiceText?: string; // If not provided, will generate from prompt
      voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
      voiceSpeed?: number; // 0.25 to 4.0
      voiceProvider?: 'openai' | 'elevenlabs';
      seed?: number;
      fps?: number;
      model?: string;
      provider?: 'runware' | 'replicate';
    }
  ): Promise<{
    jobId: string;
    status: string;
    message: string;
    userId: string;
  }> {
    const response = await this.httpClient.post('/ai/videos/generate', {
      prompt,
      ...options,
    });
    return response.data;
  }

  // Get video generation job status
  async getVideoJobStatus(jobId: string): Promise<{
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
  }> {
    const response = await this.httpClient.get(`/ai/videos/job/${jobId}`);
    return response.data;
  }

  // Get available video pipelines
  async getVideoPipelines(): Promise<Array<{
    id: string;
    name: string;
    features: string[];
  }>> {
    const response = await this.httpClient.get('/ai/videos/pipelines');
    return response.data;
  }

  // Audio Generation (Unified Service with Queue)
  async generateAudio(
    text: string,
    options?: {
      voice?: string;
      provider?: 'openai' | 'elevenlabs';
      model?: string;
      speed?: number;
      format?: 'mp3' | 'opus' | 'aac' | 'flac';
    }
  ): Promise<{
    jobId: string;
    status: string;
    message: string;
  }> {
    const response = await this.httpClient.post('/ai/audio/generate', {
      text,
      ...options,
    });
    return response.data;
  }

  // Get audio generation job status
  async getAudioJobStatus(jobId: string): Promise<{
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
  }> {
    const response = await this.httpClient.get(`/ai/audio/job/${jobId}`);
    return response.data;
  }

  // Get available voices
  async getAudioVoices(provider: 'openai' | 'elevenlabs' = 'openai'): Promise<{
    provider: string;
    voices: Array<{
      id: string;
      name: string;
      gender?: string;
      labels?: Record<string, string>;
      category?: string;
    }>;
  }> {
    const response = await this.httpClient.get('/ai/audio/voices', {
      params: { provider },
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

  // Enhanced Text Generation Features

  async generatePodcastScript(
    topic: string,
    duration: number,
    options?: {
      hosts?: number;
      style?: 'casual' | 'professional' | 'educational' | 'comedy';
      includeSegments?: string[];
      targetAudience?: string;
    }
  ): Promise<{
    script: string;
    metadata?: {
      estimatedDuration: number;
      segmentCount: number;
    };
  }> {
    const response = await this.httpClient.post('/ai/generate/podcast-script', {
      topic,
      duration,
      ...options,
    });
    return response.data;
  }

  async generateNewsletterContent(
    topic: string,
    sections: string[],
    options?: {
      tone?: string;
      wordCount?: number;
      includeCallToAction?: boolean;
      personalization?: boolean;
    }
  ): Promise<{
    subject: string;
    preheader: string;
    content: string;
    callToAction?: string;
  }> {
    const response = await this.httpClient.post('/ai/generate/newsletter', {
      topic,
      sections,
      ...options,
    });
    return response.data;
  }

  async paraphraseText(
    text: string,
    options?: {
      style?: 'formal' | 'casual' | 'technical' | 'creative' | 'simple';
      preserveMeaning?: boolean;
      targetLength?: 'shorter' | 'same' | 'longer';
    }
  ): Promise<{
    paraphrased: string;
    similarity?: number;
  }> {
    const response = await this.httpClient.post('/ai/paraphrase', {
      text,
      ...options,
    });
    return response.data;
  }

  async generateProductDescription(
    productName: string,
    features: string[],
    options?: {
      targetAudience?: string;
      tone?: string;
      includeSpecs?: boolean;
      seoOptimized?: boolean;
      wordCount?: number;
    }
  ): Promise<{
    title: string;
    shortDescription: string;
    longDescription: string;
    bulletPoints: string[];
    seoKeywords?: string[];
  }> {
    const response = await this.httpClient.post('/ai/generate/product-description', {
      productName,
      features,
      ...options,
    });
    return response.data;
  }

  async generateLegalDocument(
    documentType: 'privacy-policy' | 'terms-of-service' | 'disclaimer' | 'cookie-policy',
    companyInfo: {
      name: string;
      website: string;
      email: string;
      address?: string;
    },
    options?: {
      jurisdiction?: string;
      includeGDPR?: boolean;
      includeCCPA?: boolean;
      customClauses?: string[];
    }
  ): Promise<{
    document: string;
    warnings?: string[];
  }> {
    const response = await this.httpClient.post('/ai/generate/legal-document', {
      documentType,
      companyInfo,
      ...options,
    });
    return response.data;
  }

  async generateQuizQuestions(
    topic: string,
    count: number,
    options?: {
      difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
      questionTypes?: ('multiple-choice' | 'true-false' | 'short-answer')[];
      includeExplanations?: boolean;
    }
  ): Promise<{
    questions: Array<{
      question: string;
      type: string;
      options?: string[];
      correctAnswer: string;
      explanation?: string;
      difficulty: string;
    }>;
  }> {
    const response = await this.httpClient.post('/ai/generate/quiz', {
      topic,
      count,
      ...options,
    });
    return response.data;
  }

  async analyzeReadability(
    text: string
  ): Promise<{
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
  }> {
    const response = await this.httpClient.post('/ai/analyze/readability', {
      text,
    });
    return response.data;
  }

  // Batch Processing for Enhanced Features
  async batchGenerateContent(
    requests: Array<{
      type: 'blog' | 'social' | 'email' | 'product' | 'newsletter';
      params: any;
    }>
  ): Promise<Array<{
    success: boolean;
    result?: any;
    error?: string;
  }>> {
    const response = await this.httpClient.post('/ai/batch-generate', {
      requests,
    });
    return response.data;
  }

  // Content Templates
  async getContentTemplates(
    category?: string
  ): Promise<Array<{
    id: string;
    name: string;
    category: string;
    description: string;
    variables: string[];
    example?: string;
  }>> {
    const response = await this.httpClient.get('/ai/templates', {
      params: { category },
    });
    return response.data;
  }

  async applyTemplate(
    templateId: string,
    variables: Record<string, string>
  ): Promise<{
    content: string;
    metadata?: any;
  }> {
    const response = await this.httpClient.post('/ai/templates/apply', {
      templateId,
      variables,
    });
    return response.data;
  }

}