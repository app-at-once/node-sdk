import { HttpClient } from '../core/http-client';

export interface Content {
  id: string;
  resourceId: string;
  resourceType: 'project' | 'app';
  contentType: string;
  title: string;
  content: any;
  source?: string;
  sourceDetails?: any;
  parameters?: any;
  metadata?: any;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContentDto {
  resourceId: string;
  resourceType: 'project' | 'app';
  contentType: string;
  title: string;
  content: any;
  source?: string;
  sourceDetails?: any;
  parameters?: any;
  metadata?: any;
  status?: string;
}

export interface UpdateContentDto {
  title?: string;
  content?: any;
  contentType?: string;
  status?: string;
  metadata?: any;
}

export interface GetContentsOptions {
  resourceId?: string;
  resourceType?: 'project' | 'app';
  contentType?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ContentModule {
  constructor(private client: HttpClient) {}

  /**
   * Create new content
   * @param data Content creation data
   * @returns Created content
   */
  async create(data: CreateContentDto): Promise<Content> {
    const response = await this.client.post<Content>('/content', data);
    return response.data;
  }

  /**
   * Get all contents with optional filters
   * @param options Query options
   * @returns Array of contents
   */
  async getAll(options?: GetContentsOptions): Promise<Content[]> {
    const params = new URLSearchParams();

    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/content?${queryString}` : '/content';

    const response = await this.client.get<Content[]>(url);
    return response.data;
  }

  /**
   * Get content by ID
   * @param contentId Content ID
   * @returns Content details
   */
  async getById(contentId: string): Promise<Content> {
    const response = await this.client.get<Content>(`/content/${contentId}`);
    return response.data;
  }

  /**
   * Update content
   * @param contentId Content ID
   * @param data Update data
   * @returns Updated content
   */
  async update(contentId: string, data: UpdateContentDto): Promise<Content> {
    const response = await this.client.put<Content>(`/content/${contentId}`, data);
    return response.data;
  }

  /**
   * Delete content
   * @param contentId Content ID
   */
  async delete(contentId: string): Promise<void> {
    await this.client.delete(`/content/${contentId}`);
  }

  /**
   * Archive content
   * @param contentId Content ID
   */
  async archive(contentId: string): Promise<void> {
    await this.client.put(`/content/${contentId}/archive`);
  }

  /**
   * Restore archived content
   * @param contentId Content ID
   */
  async restore(contentId: string): Promise<void> {
    await this.client.put(`/content/${contentId}/restore`);
  }

  /**
   * Duplicate content
   * @param contentId Content ID
   * @returns Duplicated content
   */
  async duplicate(contentId: string): Promise<Content> {
    const response = await this.client.post<Content>(`/content/${contentId}/duplicate`);
    return response.data;
  }

  /**
   * Export content
   * @param contentId Content ID
   * @param format Export format
   * @returns Export data
   */
  async export(contentId: string, format: 'json' | 'html' | 'pdf' = 'json'): Promise<any> {
    const response = await this.client.get(`/content/${contentId}/export?format=${format}`);
    return response.data;
  }

  /**
   * Generate AI content using existing AI endpoints
   * @param type Content type
   * @param data Generation parameters
   * @returns Generated content
   */
  async generateAI(type: 'blog_post' | 'caption' | 'email' | 'summary' | 'custom', data: any): Promise<any> {
    let endpoint: string;
    let payload: any;

    switch (type) {
      case 'blog_post':
        endpoint = '/ai/blog-post';
        payload = {
          topic: data.topic || data.prompt,
          keywords: data.keywords || [],
          tone: data.tone,
        };
        break;

      case 'caption':
        endpoint = '/ai/caption';
        payload = {
          content: data.content || data.prompt,
          platform: data.platform || 'general',
          hashtags: data.hashtags || [],
          tone: data.tone,
        };
        break;

      case 'email':
        endpoint = '/ai/email-reply';
        payload = {
          originalEmail: data.originalEmail || data.prompt,
          context: data.context,
          tone: data.tone,
        };
        break;

      case 'summary':
        endpoint = '/ai/summarize';
        payload = {
          text: data.text || data.prompt,
          maxLength: data.maxLength,
          style: data.style || 'paragraph',
          focus: data.focus,
        };
        break;

      default:
        endpoint = '/ai/text';
        payload = {
          prompt: data.prompt,
          model: data.model,
          temperature: data.temperature,
          maxTokens: data.maxTokens,
        };
    }

    const response = await this.client.post(endpoint, payload);
    return response.data;
  }
}