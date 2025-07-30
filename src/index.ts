import { HttpClient } from './core/http-client';
import { QueryBuilder } from './core/query-builder';
import { AuthModule } from './modules/auth';
import { LogicModule } from './modules/logic';
import { AIModule } from './modules/ai';
import { StorageModule } from './modules/storage';
import { EmailModule } from './modules/email';
import { PushModule } from './modules/push';
import { RealtimeModule } from './modules/realtime';
import { WorkflowModule } from './modules/workflow';
import { N8nWorkflowModule } from './modules/n8n-workflow';
import { SchemaModule } from './modules/schema';
import { TriggersModule } from './modules/triggers';
import { PaymentModule } from './modules/payment';
import { ImageProcessingModule } from './modules/image-processing';
import { PDFModule } from './modules/pdf';
import { OCRModule } from './modules/ocr';
import { DocumentConversionModule } from './modules/document-conversion';
import { ProjectOAuthModule } from './project-oauth';
import { ClientConfig } from './types';

export class AppAtOnceClient {
  private httpClient: HttpClient;
  
  // Module instances
  public readonly auth: AuthModule;
  public readonly logic: LogicModule;
  public readonly ai: AIModule;
  public readonly storage: StorageModule;
  public readonly email: EmailModule;
  public readonly push: PushModule;
  public readonly realtime: RealtimeModule;
  public readonly workflow: WorkflowModule;
  public readonly n8nWorkflow: N8nWorkflowModule;
  public readonly schema: SchemaModule;
  public readonly triggers: TriggersModule;
  public readonly payment: PaymentModule;
  public readonly imageProcessing: ImageProcessingModule;
  public readonly pdf: PDFModule;
  public readonly ocr: OCRModule;
  public readonly documentConversion: DocumentConversionModule;
  public readonly projectOAuth: ProjectOAuthModule;

  constructor(config: ClientConfig) {
    this.httpClient = new HttpClient(config);
    
    // Initialize all modules
    this.auth = new AuthModule(this.httpClient);
    this.logic = new LogicModule(this.httpClient);
    this.ai = new AIModule(this.httpClient);
    this.storage = new StorageModule(this.httpClient);
    this.email = new EmailModule(this.httpClient);
    this.push = new PushModule(this.httpClient);
    this.realtime = new RealtimeModule(this.httpClient);
    this.workflow = new WorkflowModule(this.httpClient);
    this.n8nWorkflow = new N8nWorkflowModule(this.httpClient);
    this.schema = new SchemaModule(this.httpClient);
    this.triggers = new TriggersModule(this.httpClient);
    this.payment = new PaymentModule(this.httpClient);
    this.imageProcessing = new ImageProcessingModule(this.httpClient);
    this.pdf = new PDFModule(this.httpClient);
    this.ocr = new OCRModule(this.httpClient);
    this.documentConversion = new DocumentConversionModule(this.httpClient);
    this.projectOAuth = new ProjectOAuthModule(this.httpClient);
  }

  // Core database operations - fluent query builder API
  table<T = any>(tableName: string): QueryBuilder<T> {
    return new QueryBuilder<T>(this.httpClient, tableName);
  }

  // Convenience methods for common operations
  async select<T = any>(tableName: string): Promise<T[]> {
    const result = await this.table<T>(tableName).execute();
    return result.data;
  }

  async insert<T = any>(tableName: string, data: Partial<T>): Promise<T> {
    return await this.table<T>(tableName).insert(data);
  }

  async update<T = any>(
    tableName: string, 
    where: Record<string, any>, 
    data: Partial<T>
  ): Promise<T[]> {
    let query = this.table<T>(tableName);
    
    // Apply where conditions
    Object.entries(where).forEach(([field, value]) => {
      query = query.eq(field, value);
    });
    
    return await query.update(data);
  }

  async delete(tableName: string, where: Record<string, any>): Promise<{ count: number }> {
    let query = this.table(tableName);
    
    // Apply where conditions
    Object.entries(where).forEach(([field, value]) => {
      query = query.eq(field, value);
    });
    
    return await query.delete();
  }

  async count(tableName: string, where?: Record<string, any>): Promise<number> {
    let query = this.table(tableName);
    
    // Apply where conditions if provided
    if (where) {
      Object.entries(where).forEach(([field, value]) => {
        query = query.eq(field, value);
      });
    }
    
    return await query.count();
  }

  // Connection and utility methods
  async ping(): Promise<{ status: string; timestamp: string; version: string }> {
    const response = await this.httpClient.get('/health');
    return response.data;
  }

  updateApiKey(apiKey: string): void {
    this.httpClient.updateApiKey(apiKey);
  }

  getConfig(): ClientConfig {
    return this.httpClient.getConfig();
  }

  // Batch operations
  async batch(operations: Array<{
    type: 'select' | 'insert' | 'update' | 'delete';
    table: string;
    data?: any;
    where?: Record<string, any>;
  }>): Promise<Array<{
    success: boolean;
    result?: any;
    error?: string;
  }>> {
    const response = await this.httpClient.post('/batch', { operations });
    return response.data.results || [];
  }

  // Transaction support
  async transaction<T>(
    callback: (client: AppAtOnceClient) => Promise<T>
  ): Promise<T> {
    const response = await this.httpClient.post('/transactions/begin');
    const transactionId = response.data.transaction_id;

    try {
      // Create a new client instance for this transaction
      const txClient = new AppAtOnceClient({
        ...this.getConfig(),
        headers: {
          'X-Transaction-ID': transactionId,
        },
      });

      const result = await callback(txClient);
      
      // Commit the transaction
      await this.httpClient.post(`/transactions/${transactionId}/commit`);
      
      return result;
    } catch (error) {
      // Rollback the transaction
      await this.httpClient.post(`/transactions/${transactionId}/rollback`);
      throw error;
    }
  }

  // Event handling for connection state
  onConnectionChange(callback: (connected: boolean) => void): () => void {
    return this.realtime.onConnectionStateChange(callback);
  }

  onError(callback: (error: any) => void): () => void {
    return this.realtime.onError(callback);
  }

  // Cleanup
  async disconnect(): Promise<void> {
    if (this.realtime.isConnected()) {
      this.realtime.disconnect();
    }
  }
}

// Static factory methods
export namespace AppAtOnceClient {
  export function create(config: ClientConfig): AppAtOnceClient {
    return new AppAtOnceClient(config);
  }

  export function createWithApiKey(apiKey: string, baseUrl?: string): AppAtOnceClient {
    return new AppAtOnceClient({
      apiKey,
      baseUrl: baseUrl || 'https://api.appatonce.com',
    });
  }

  export function createWithCredentials(
    email: string,
    password: string,
    baseUrl?: string
  ): Promise<AppAtOnceClient> {
    const client = new AppAtOnceClient({
      apiKey: '', // Will be set after authentication
      baseUrl: baseUrl || 'https://api.appatonce.com',
    });

    return client.auth.signIn({ email, password }).then((session) => {
      client.updateApiKey(session.access_token);
      return client;
    });
  }

  /**
   * Create a project-specific client for multi-tenant authentication
   * This enables authentication against a project's own user database
   */
  export function createForProject(projectId: string, apiKey: string, baseUrl?: string): AppAtOnceClient {
    return new AppAtOnceClient({
      apiKey,
      projectId,
      baseUrl: baseUrl || 'https://api.appatonce.com',
    });
  }

  /**
   * Create an app-specific client for multi-tenant authentication
   * This enables authentication against an app's own user database
   */
  export function createForApp(appId: string, apiKey: string, baseUrl?: string): AppAtOnceClient {
    return new AppAtOnceClient({
      apiKey,
      appId,
      baseUrl: baseUrl || 'https://api.appatonce.com',
    });
  }
}

// Export all types for TypeScript users
export * from './types';
export * from './core/query-builder';
export * from './core/http-client';
export * from './modules/auth';
export * from './modules/logic';
export * from './modules/ai';
export * from './modules/storage';
export * from './modules/email';
export * from './modules/push';
export * from './modules/realtime';
export * from './modules/workflow';
export * from './modules/n8n-workflow';
export * from './modules/schema';
export * from './modules/triggers';
export * from './modules/payment';
export * from './modules/image-processing';
export * from './modules/pdf';
export * from './modules/ocr';
export * from './modules/document-conversion';
export * from './auth/oauth';
export * from './project-oauth';
export * from './types/project-oauth';

// Default export
export default AppAtOnceClient;