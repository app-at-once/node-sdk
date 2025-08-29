import { HttpClient } from '../core/http-client';
import { EmailTemplate, EmailAttachment, EmailRecipient } from '../types';

export class EmailModule {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  // Send email methods
  async sendEmail(options: {
    to: string | EmailRecipient | EmailRecipient[];
    from?: string;
    subject: string;
    text?: string;
    html?: string;
    cc?: string | EmailRecipient | EmailRecipient[];
    bcc?: string | EmailRecipient | EmailRecipient[];
    attachments?: EmailAttachment[];
    headers?: Record<string, string>;
    tags?: Record<string, string>;
    metadata?: Record<string, any>;
    template?: string | {
      id?: string;
      name?: string;
      variables?: Record<string, any>;
    };
    data?: Record<string, any>; // Alias for template.variables
    priority?: 'low' | 'normal' | 'high';
    sendAt?: Date;
  }): Promise<{
    id: string;
    status: 'queued' | 'sending' | 'sent' | 'failed';
    message_id: string;
    created_at: string;
  }> {
    // Normalize recipients
    const normalizeRecipients = (recipients: string | EmailRecipient | EmailRecipient[]): EmailRecipient[] => {
      if (typeof recipients === 'string') {
        return [{ email: recipients }];
      }
      if (!Array.isArray(recipients)) {
        return [recipients];
      }
      return recipients;
    };

    // Handle template shortcuts
    let templateConfig = options.template;
    if (typeof options.template === 'string') {
      templateConfig = { name: options.template, variables: options.data };
    } else if (options.template && options.data) {
      templateConfig = { ...options.template, variables: options.data };
    }

    const payload = {
      ...options,
      to: normalizeRecipients(options.to),
      cc: options.cc ? normalizeRecipients(options.cc) : undefined,
      bcc: options.bcc ? normalizeRecipients(options.bcc) : undefined,
      template: templateConfig,
      sendAt: options.sendAt?.toISOString(),
    };

    // Remove the data field from payload as it's merged into template.variables
    delete (payload as any).data;

    const response = await this.httpClient.post('/email/send', payload);
    return response.data;
  }

  async sendBulkEmail(options: {
    emails: Array<{
      to: EmailRecipient[];
      subject: string;
      text?: string;
      html?: string;
      template?: {
        id: string;
        variables?: Record<string, any>;
      };
      tags?: Record<string, string>;
      metadata?: Record<string, any>;
    }>;
    from?: string;
    cc?: EmailRecipient[];
    bcc?: EmailRecipient[];
    headers?: Record<string, string>;
    priority?: 'low' | 'normal' | 'high';
    sendAt?: Date;
  }): Promise<{
    batch_id: string;
    total_emails: number;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    created_at: string;
  }> {
    const payload = {
      ...options,
      sendAt: options.sendAt?.toISOString(),
    };

    const response = await this.httpClient.post('/email/send-bulk', payload);
    return response.data;
  }

  async sendTemplateEmail(
    templateId: string,
    options: {
      to: EmailRecipient[];
      from?: string;
      variables?: Record<string, any>;
      cc?: EmailRecipient[];
      bcc?: EmailRecipient[];
      attachments?: EmailAttachment[];
      headers?: Record<string, string>;
      tags?: Record<string, string>;
      metadata?: Record<string, any>;
      priority?: 'low' | 'normal' | 'high';
      sendAt?: Date;
    }
  ): Promise<{
    id: string;
    status: 'queued' | 'sending' | 'sent' | 'failed';
    message_id: string;
    created_at: string;
  }> {
    const payload = {
      templateId,
      ...options,
      sendAt: options.sendAt?.toISOString(),
    };

    const response = await this.httpClient.post('/email/send-template', payload);
    return response.data;
  }

  // Email status and tracking
  async getEmailStatus(emailId: string): Promise<{
    id: string;
    status: 'queued' | 'sending' | 'sent' | 'delivered' | 'bounced' | 'complained' | 'failed';
    sent_at?: string;
    delivered_at?: string;
    opened_at?: string;
    clicked_at?: string;
    bounced_at?: string;
    complained_at?: string;
    error?: string;
    tracking: {
      opens: number;
      clicks: number;
      unsubscribes: number;
    };
  }> {
    const response = await this.httpClient.get(`/email/${emailId}/status`);
    return response.data;
  }

  async getBulkEmailStatus(batchId: string): Promise<{
    batch_id: string;
    total_emails: number;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    created_at: string;
    completed_at?: string;
    stats: {
      queued: number;
      sent: number;
      delivered: number;
      bounced: number;
      failed: number;
    };
  }> {
    const response = await this.httpClient.get(`/email/bulk/${batchId}/status`);
    return response.data;
  }

  async getEmailEvents(
    emailId: string,
    options?: {
      types?: Array<'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed'>;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    events: Array<{
      type: string;
      timestamp: string;
      data?: any;
    }>;
    total: number;
  }> {
    const response = await this.httpClient.get(`/email/${emailId}/events`, {
      params: options,
    });
    return response.data;
  }

  // Email templates
  async createTemplate(template: {
    name: string;
    subject: string;
    text?: string;
    html?: string;
    variables?: Array<{
      name: string;
      type: 'string' | 'number' | 'boolean' | 'date';
      default_value?: any;
      required?: boolean;
      description?: string;
    }>;
    category?: string;
    tags?: string[];
    metadata?: Record<string, any>;
  }): Promise<EmailTemplate> {
    const response = await this.httpClient.post('/email/templates', template);
    return response.data;
  }

  async updateTemplate(templateId: string, updates: {
    name?: string;
    subject?: string;
    text?: string;
    html?: string;
    variables?: Array<{
      name: string;
      type: 'string' | 'number' | 'boolean' | 'date';
      default_value?: any;
      required?: boolean;
      description?: string;
    }>;
    category?: string;
    tags?: string[];
    metadata?: Record<string, any>;
  }): Promise<EmailTemplate> {
    const response = await this.httpClient.patch(`/email/templates/${templateId}`, updates);
    return response.data;
  }

  async getTemplate(templateId: string): Promise<EmailTemplate> {
    const response = await this.httpClient.get(`/email/templates/${templateId}`);
    return response.data;
  }

  async listTemplates(options?: {
    category?: string;
    tags?: string[];
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'name' | 'created_at' | 'updated_at';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    templates: EmailTemplate[];
    total: number;
  }> {
    const response = await this.httpClient.get('/email/templates', {
      params: options,
    });
    return response.data;
  }

  async deleteTemplate(templateId: string): Promise<void> {
    await this.httpClient.delete(`/email/templates/${templateId}`);
  }

  async previewTemplate(
    templateId: string,
    variables?: Record<string, any>
  ): Promise<{
    subject: string;
    text: string;
    html: string;
  }> {
    const response = await this.httpClient.post(`/email/templates/${templateId}/preview`, {
      variables,
    });
    return response.data;
  }

  async testTemplate(
    templateId: string,
    options: {
      to: string;
      variables?: Record<string, any>;
    }
  ): Promise<{
    id: string;
    status: string;
    message: string;
  }> {
    const response = await this.httpClient.post(`/email/templates/${templateId}/test`, options);
    return response.data;
  }

  // Contact management
  async createContact(contact: {
    email: string;
    name?: string;
    tags?: string[];
    metadata?: Record<string, any>;
    lists?: string[];
    subscribed?: boolean;
  }): Promise<{
    id: string;
    email: string;
    name?: string;
    tags: string[];
    metadata: Record<string, any>;
    subscribed: boolean;
    created_at: string;
  }> {
    const response = await this.httpClient.post('/email/contacts', contact);
    return response.data;
  }

  async updateContact(contactId: string, updates: {
    name?: string;
    tags?: string[];
    metadata?: Record<string, any>;
    subscribed?: boolean;
  }): Promise<{
    id: string;
    email: string;
    name?: string;
    tags: string[];
    metadata: Record<string, any>;
    subscribed: boolean;
    updated_at: string;
  }> {
    const response = await this.httpClient.patch(`/email/contacts/${contactId}`, updates);
    return response.data;
  }

  async getContact(contactId: string): Promise<{
    id: string;
    email: string;
    name?: string;
    tags: string[];
    metadata: Record<string, any>;
    subscribed: boolean;
    created_at: string;
    updated_at: string;
  }> {
    const response = await this.httpClient.get(`/email/contacts/${contactId}`);
    return response.data;
  }

  async listContacts(options?: {
    subscribed?: boolean;
    tags?: string[];
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'email' | 'name' | 'created_at' | 'updated_at';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    contacts: Array<{
      id: string;
      email: string;
      name?: string;
      tags: string[];
      subscribed: boolean;
      created_at: string;
    }>;
    total: number;
  }> {
    const response = await this.httpClient.get('/email/contacts', {
      params: options,
    });
    return response.data;
  }

  async deleteContact(contactId: string): Promise<void> {
    await this.httpClient.delete(`/email/contacts/${contactId}`);
  }

  async subscribeContact(contactId: string): Promise<void> {
    await this.httpClient.post(`/email/contacts/${contactId}/subscribe`);
  }

  async unsubscribeContact(contactId: string): Promise<void> {
    await this.httpClient.post(`/email/contacts/${contactId}/unsubscribe`);
  }

  // Email lists
  async createList(list: {
    name: string;
    description?: string;
    tags?: string[];
  }): Promise<{
    id: string;
    name: string;
    description?: string;
    tags: string[];
    subscriber_count: number;
    created_at: string;
  }> {
    const response = await this.httpClient.post('/email/lists', list);
    return response.data;
  }

  async updateList(listId: string, updates: {
    name?: string;
    description?: string;
    tags?: string[];
  }): Promise<{
    id: string;
    name: string;
    description?: string;
    tags: string[];
    subscriber_count: number;
    updated_at: string;
  }> {
    const response = await this.httpClient.patch(`/email/lists/${listId}`, updates);
    return response.data;
  }

  async getList(listId: string): Promise<{
    id: string;
    name: string;
    description?: string;
    tags: string[];
    subscriber_count: number;
    created_at: string;
    updated_at: string;
  }> {
    const response = await this.httpClient.get(`/email/lists/${listId}`);
    return response.data;
  }

  async listLists(): Promise<Array<{
    id: string;
    name: string;
    description?: string;
    tags: string[];
    subscriber_count: number;
    created_at: string;
  }>> {
    const response = await this.httpClient.get('/email/lists');
    return response.data;
  }

  async deleteList(listId: string): Promise<void> {
    await this.httpClient.delete(`/email/lists/${listId}`);
  }

  async addContactToList(listId: string, contactId: string): Promise<void> {
    await this.httpClient.post(`/email/lists/${listId}/contacts`, { contactId });
  }

  async removeContactFromList(listId: string, contactId: string): Promise<void> {
    await this.httpClient.delete(`/email/lists/${listId}/contacts/${contactId}`);
  }

  async getListContacts(listId: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<{
    contacts: Array<{
      id: string;
      email: string;
      name?: string;
      subscribed: boolean;
    }>;
    total: number;
  }> {
    const response = await this.httpClient.get(`/email/lists/${listId}/contacts`, {
      params: options,
    });
    return response.data;
  }

  // Email campaigns
  async createCampaign(campaign: {
    name: string;
    subject: string;
    templateId?: string;
    text?: string;
    html?: string;
    lists?: string[];
    tags?: string[];
    sendAt?: Date;
    timezone?: string;
  }): Promise<{
    id: string;
    name: string;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
    recipient_count: number;
    created_at: string;
  }> {
    const payload = {
      ...campaign,
      sendAt: campaign.sendAt?.toISOString(),
    };

    const response = await this.httpClient.post('/email/campaigns', payload);
    return response.data;
  }

  async updateCampaign(campaignId: string, updates: {
    name?: string;
    subject?: string;
    templateId?: string;
    text?: string;
    html?: string;
    lists?: string[];
    tags?: string[];
    sendAt?: Date;
    timezone?: string;
  }): Promise<{
    id: string;
    name: string;
    status: string;
    recipient_count: number;
    updated_at: string;
  }> {
    const payload = {
      ...updates,
      sendAt: updates.sendAt?.toISOString(),
    };

    const response = await this.httpClient.patch(`/email/campaigns/${campaignId}`, payload);
    return response.data;
  }

  async getCampaign(campaignId: string): Promise<{
    id: string;
    name: string;
    subject: string;
    status: string;
    recipient_count: number;
    sent_count: number;
    opened_count: number;
    clicked_count: number;
    bounce_count: number;
    created_at: string;
    sent_at?: string;
  }> {
    const response = await this.httpClient.get(`/email/campaigns/${campaignId}`);
    return response.data;
  }

  async listCampaigns(options?: {
    status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
    limit?: number;
    offset?: number;
  }): Promise<{
    campaigns: Array<{
      id: string;
      name: string;
      status: string;
      recipient_count: number;
      sent_count: number;
      created_at: string;
    }>;
    total: number;
  }> {
    const response = await this.httpClient.get('/email/campaigns', {
      params: options,
    });
    return response.data;
  }

  async sendCampaign(campaignId: string): Promise<{
    id: string;
    status: 'sending';
    started_at: string;
  }> {
    const response = await this.httpClient.post(`/email/campaigns/${campaignId}/send`);
    return response.data;
  }

  async cancelCampaign(campaignId: string): Promise<void> {
    await this.httpClient.post(`/email/campaigns/${campaignId}/cancel`);
  }

  async deleteCampaign(campaignId: string): Promise<void> {
    await this.httpClient.delete(`/email/campaigns/${campaignId}`);
  }

  // Analytics and reporting
  async getEmailAnalytics(
    timeRange?: { start: Date; end: Date }
  ): Promise<{
    total_sent: number;
    total_delivered: number;
    total_opened: number;
    total_clicked: number;
    total_bounced: number;
    total_complained: number;
    delivery_rate: number;
    open_rate: number;
    click_rate: number;
    bounce_rate: number;
    complaint_rate: number;
    daily_stats: Array<{
      date: string;
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
      bounced: number;
    }>;
  }> {
    const params: any = {};
    if (timeRange) {
      params.start_date = timeRange.start.toISOString();
      params.end_date = timeRange.end.toISOString();
    }

    const response = await this.httpClient.get('/email/analytics', { params });
    return response.data;
  }

  async getDomainReputation(): Promise<{
    domain: string;
    reputation_score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    blacklist_status: Array<{
      list: string;
      listed: boolean;
      checked_at: string;
    }>;
    last_updated: string;
  }> {
    const response = await this.httpClient.get('/email/reputation');
    return response.data;
  }

  async getSuppressionList(options?: {
    type?: 'bounced' | 'complained' | 'unsubscribed';
    limit?: number;
    offset?: number;
  }): Promise<{
    suppressions: Array<{
      email: string;
      type: 'bounced' | 'complained' | 'unsubscribed';
      reason?: string;
      created_at: string;
    }>;
    total: number;
  }> {
    const response = await this.httpClient.get('/email/suppressions', {
      params: options,
    });
    return response.data;
  }

  async removeFromSuppressionList(email: string): Promise<void> {
    await this.httpClient.delete(`/email/suppressions/${email}`);
  }
}