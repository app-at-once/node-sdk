import { HttpClient } from '../core/http-client';
import { 
  PushDevice, 
  PushCampaign, 
  PushTemplate,
  PushAnalytics 
} from '../types';

export class PushModule {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  // Send push notifications
  async send(options: {
    to: string | string[]; // userId(s) or deviceToken(s)
    title: string;
    body: string;
    data?: Record<string, any>;
    badge?: number;
    sound?: string;
    image?: string;
    priority?: 'high' | 'normal';
    targetType?: 'user' | 'device' | 'tag' | 'all';
    tags?: string[]; // For tag-based targeting
    silent?: boolean; // Silent notification
    mutableContent?: boolean; // iOS mutable content
    category?: string; // Notification category
    threadId?: string; // Group notifications
    ttl?: number; // Time to live in seconds
    scheduledAt?: Date;
  }): Promise<{
    messageId: string;
    status: 'sent' | 'scheduled' | 'queued' | 'failed';
    details?: any;
  }> {
    // Get app ID from API key
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    const payload = {
      ...options,
      scheduledAt: options.scheduledAt?.toISOString(),
    };

    const response = await this.httpClient.post(`/apps/${appId}/push/send`, payload);
    return response.data;
  }

  async sendBulk(notifications: Array<{
    to: string | string[];
    title: string;
    body: string;
    data?: Record<string, any>;
    badge?: number;
    sound?: string;
    image?: string;
    priority?: 'high' | 'normal';
    targetType?: 'user' | 'device' | 'tag' | 'all';
    tags?: string[];
    silent?: boolean;
  }>): Promise<{
    sent: number;
    failed: number;
    results: Array<{
      status: 'sent' | 'failed';
      messageId?: string;
      error?: string;
    }>;
  }> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    const response = await this.httpClient.post(`/apps/${appId}/push/send-bulk`, {
      notifications,
    });
    return response.data;
  }

  async sendWithTemplate(
    templateId: string,
    options: {
      to: string | string[];
      targetType?: 'user' | 'device' | 'tag' | 'all';
      tags?: string[];
      data?: Record<string, any>;
      variables?: Record<string, any>;
      scheduledAt?: Date;
    }
  ): Promise<{
    messageId: string;
    status: 'sent' | 'scheduled' | 'queued' | 'failed';
  }> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    const payload = {
      templateId,
      ...options,
      scheduledAt: options.scheduledAt?.toISOString(),
    };

    const response = await this.httpClient.post(`/apps/${appId}/push/send-template`, payload);
    return response.data;
  }

  // Device management
  async registerDevice(device: {
    userId: string;
    deviceToken: string;
    platform: 'ios' | 'android' | 'web';
    deviceInfo?: {
      model?: string;
      osVersion?: string;
      appVersion?: string;
      locale?: string;
      timezone?: string;
    };
    tags?: string[];
  }): Promise<PushDevice> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    const response = await this.httpClient.post(`/apps/${appId}/push/device/register`, device);
    return response.data;
  }

  async unregisterDevice(deviceToken: string): Promise<void> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    await this.httpClient.delete(`/apps/${appId}/push/device/${deviceToken}`);
  }

  async updateDevice(
    deviceToken: string,
    updates: {
      tags?: string[];
      deviceInfo?: Record<string, any>;
      active?: boolean;
    }
  ): Promise<PushDevice> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    const response = await this.httpClient.patch(
      `/apps/${appId}/push/device/${deviceToken}`,
      updates
    );
    return response.data;
  }

  async getDevice(deviceToken: string): Promise<PushDevice> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    const response = await this.httpClient.get(`/apps/${appId}/push/device/${deviceToken}`);
    return response.data;
  }

  async listDevices(options?: {
    userId?: string;
    platform?: 'ios' | 'android' | 'web';
    tags?: string[];
    active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{
    devices: PushDevice[];
    total: number;
  }> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    const response = await this.httpClient.get(`/apps/${appId}/push/devices`, {
      params: options,
    });
    return response.data;
  }

  // Push templates
  async createTemplate(template: {
    name: string;
    title: string;
    body: string;
    data?: Record<string, any>;
    sound?: string;
    badge?: number;
    image?: string;
    variables?: Array<{
      name: string;
      type: 'string' | 'number' | 'boolean';
      required?: boolean;
      defaultValue?: any;
    }>;
    tags?: string[];
    category?: string;
  }): Promise<PushTemplate> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    const response = await this.httpClient.post(`/apps/${appId}/push/templates`, template);
    return response.data;
  }

  async updateTemplate(
    templateId: string,
    updates: Partial<{
      name: string;
      title: string;
      body: string;
      data: Record<string, any>;
      sound: string;
      badge: number;
      image: string;
      variables: Array<any>;
      tags: string[];
      category: string;
    }>
  ): Promise<PushTemplate> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    const response = await this.httpClient.patch(
      `/apps/${appId}/push/templates/${templateId}`,
      updates
    );
    return response.data;
  }

  async getTemplate(templateId: string): Promise<PushTemplate> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    const response = await this.httpClient.get(`/apps/${appId}/push/templates/${templateId}`);
    return response.data;
  }

  async listTemplates(options?: {
    category?: string;
    tags?: string[];
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    templates: PushTemplate[];
    total: number;
  }> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    const response = await this.httpClient.get(`/apps/${appId}/push/templates`, {
      params: options,
    });
    return response.data;
  }

  async deleteTemplate(templateId: string): Promise<void> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    await this.httpClient.delete(`/apps/${appId}/push/templates/${templateId}`);
  }

  async previewTemplate(
    templateId: string,
    variables?: Record<string, any>
  ): Promise<{
    title: string;
    body: string;
    data: Record<string, any>;
  }> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    const response = await this.httpClient.post(
      `/apps/${appId}/push/templates/${templateId}/preview`,
      { variables }
    );
    return response.data;
  }

  // Push campaigns
  async createCampaign(campaign: {
    name: string;
    title: string;
    body: string;
    targetType: 'all' | 'segment' | 'tags';
    tags?: string[];
    segment?: {
      platform?: 'ios' | 'android' | 'web';
      lastActiveAfter?: Date;
      lastActiveWithin?: number; // days
      locale?: string[];
      timezone?: string[];
    };
    data?: Record<string, any>;
    image?: string;
    sound?: string;
    badge?: number;
    scheduledAt?: Date;
    expiresAt?: Date;
  }): Promise<PushCampaign> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    const payload = {
      ...campaign,
      scheduledAt: campaign.scheduledAt?.toISOString(),
      expiresAt: campaign.expiresAt?.toISOString(),
      segment: campaign.segment ? {
        ...campaign.segment,
        lastActiveAfter: campaign.segment.lastActiveAfter?.toISOString(),
      } : undefined,
    };

    const response = await this.httpClient.post(`/apps/${appId}/push/campaigns`, payload);
    return response.data;
  }

  async updateCampaign(
    campaignId: string,
    updates: Partial<{
      name: string;
      title: string;
      body: string;
      targetType: 'all' | 'segment' | 'tags';
      tags: string[];
      segment: any;
      data: Record<string, any>;
      scheduledAt: Date;
      expiresAt: Date;
    }>
  ): Promise<PushCampaign> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    const payload = {
      ...updates,
      scheduledAt: updates.scheduledAt?.toISOString(),
      expiresAt: updates.expiresAt?.toISOString(),
    };

    const response = await this.httpClient.patch(
      `/apps/${appId}/push/campaigns/${campaignId}`,
      payload
    );
    return response.data;
  }

  async getCampaign(campaignId: string): Promise<PushCampaign> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    const response = await this.httpClient.get(`/apps/${appId}/push/campaigns/${campaignId}`);
    return response.data;
  }

  async listCampaigns(options?: {
    status?: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled';
    limit?: number;
    offset?: number;
  }): Promise<{
    campaigns: PushCampaign[];
    total: number;
  }> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    const response = await this.httpClient.get(`/apps/${appId}/push/campaigns`, {
      params: options,
    });
    return response.data;
  }

  async launchCampaign(campaignId: string): Promise<{
    campaignId: string;
    status: 'running';
    startedAt: string;
  }> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    const response = await this.httpClient.post(
      `/apps/${appId}/push/campaigns/${campaignId}/launch`
    );
    return response.data;
  }

  async cancelCampaign(campaignId: string): Promise<void> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    await this.httpClient.post(`/apps/${appId}/push/campaigns/${campaignId}/cancel`);
  }

  async deleteCampaign(campaignId: string): Promise<void> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    await this.httpClient.delete(`/apps/${appId}/push/campaigns/${campaignId}`);
  }

  // Analytics and tracking
  async trackDelivered(messageId: string): Promise<void> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    await this.httpClient.post(`/apps/${appId}/push/track/delivered/${messageId}`);
  }

  async trackOpened(messageId: string, userId?: string): Promise<void> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    await this.httpClient.post(`/apps/${appId}/push/track/opened/${messageId}`, {
      userId,
    });
  }

  async getMessageStatus(messageId: string): Promise<{
    messageId: string;
    status: 'sent' | 'delivered' | 'opened' | 'failed';
    sentAt?: string;
    deliveredAt?: string;
    openedAt?: string;
    error?: string;
  }> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    const response = await this.httpClient.get(`/apps/${appId}/push/messages/${messageId}`);
    return response.data;
  }

  async getLogs(options?: {
    userId?: string;
    deviceId?: string;
    status?: 'sent' | 'delivered' | 'opened' | 'failed';
    from?: Date;
    to?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{
    logs: Array<{
      id: string;
      userId?: string;
      deviceId?: string;
      title: string;
      body: string;
      status: string;
      platform?: string;
      sentAt?: string;
      deliveredAt?: string;
      openedAt?: string;
      error?: string;
    }>;
    total: number;
  }> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    const params: any = { ...options };
    if (options?.from) params.from = options.from.toISOString();
    if (options?.to) params.to = options.to.toISOString();

    const response = await this.httpClient.get(`/apps/${appId}/push/logs`, { params });
    return response.data;
  }

  async getStats(
    from?: Date,
    to?: Date
  ): Promise<{
    total: number;
    sent: number;
    delivered: number;
    opened: number;
    failed: number;
    byPlatform: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    const params: any = {};
    if (from) params.from = from.toISOString();
    if (to) params.to = to.toISOString();

    const response = await this.httpClient.get(`/apps/${appId}/push/stats`, { params });
    return response.data;
  }

  async getAnalytics(
    timeRange?: { start: Date; end: Date }
  ): Promise<PushAnalytics> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    const params: any = {};
    if (timeRange) {
      params.start_date = timeRange.start.toISOString();
      params.end_date = timeRange.end.toISOString();
    }

    const response = await this.httpClient.get(`/apps/${appId}/push/analytics`, { params });
    return response.data;
  }

  // Push configuration
  async getConfig(): Promise<{
    fcmConfig?: any;
    apnsConfig?: any;
    defaultSettings?: {
      sound?: string;
      badge?: boolean;
      priority?: 'high' | 'normal';
    };
  }> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    const response = await this.httpClient.get(`/apps/${appId}/push/config`);
    return response.data;
  }

  async updateConfig(config: {
    fcmConfig?: {
      projectId: string;
      privateKey: string;
      clientEmail: string;
    };
    apnsConfig?: {
      keyId: string;
      teamId: string;
      privateKey: string;
      bundleId: string;
      production: boolean;
    };
    defaultSettings?: {
      sound?: string;
      badge?: boolean;
      priority?: 'high' | 'normal';
    };
  }): Promise<void> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    await this.httpClient.put(`/apps/${appId}/push/config`, config);
  }

  // Test push notification
  async sendTest(
    deviceToken: string,
    platform: 'ios' | 'android'
  ): Promise<{
    messageId: string;
    status: 'sent' | 'failed';
    message?: string;
  }> {
    const appIdResponse = await this.httpClient.get('/projects/auth/me');
    const appId = appIdResponse.data.appId;

    const response = await this.httpClient.post(`/apps/${appId}/push/test`, {
      deviceToken,
      platform,
    });
    return response.data;
  }
}