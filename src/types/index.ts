// Core Client Types
export interface ClientConfig {
  apiKey: string;
  realtimeUrl?: string;
  debug?: boolean;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  projectId?: string; // For multi-tenant authentication
  appId?: string; // For app-specific authentication
}

export interface ApiResponse<T = any> {
  data: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: any;
  };
}

// Database Types
export interface TableField {
  name: string;
  type: 'string' | 'text' | 'integer' | 'decimal' | 'boolean' | 'json' | 'jsonb' | 'timestamp' | 'uuid' | 'vector';
  nullable?: boolean;
  unique?: boolean;
  default?: any;
  primary_key?: boolean;
  references?: {
    table: string;
    field: string;
  };
  smart_pattern?: string;
  triggers?: string[] | false;
}

export interface TableSchema {
  name: string;
  fields: TableField[];
  indexes?: TableIndex[];
  metadata?: {
    realtime?: boolean;
    triggers?: boolean;
    searchable?: boolean;
  };
}

export interface TableIndex {
  name?: string;
  fields: string[];
  unique?: boolean;
  method?: 'btree' | 'hash' | 'gin' | 'gist';
}

export interface QueryFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'ilike' | 'is' | 'not';
  value: any;
}

export interface QueryOptions {
  select?: string | string[];
  where?: QueryFilter[];
  orderBy?: { field: string; direction: 'asc' | 'desc' }[];
  limit?: number;
  offset?: number;
  joins?: JoinClause[];
}

export interface JoinClause {
  type: 'inner' | 'left' | 'right' | 'full';
  table: string;
  on: string;
  alias?: string;
}

// Logic Types
export interface LogicDefinition {
  name: string;
  description?: string;
  nodes: LogicNode[];
  trigger?: LogicTrigger;
  variables?: Record<string, any>;
  status?: 'draft' | 'active' | 'paused' | 'archived';
  tags?: string[];
  version?: number;
}

export interface LogicNode {
  id: string;
  name: string;
  type: 'ai' | 'email' | 'push-notification' | 'node' | 'payment' | 'webhook' | 'database' | 'condition' | 'loop' | 'parallel' | 'function' | 'transform' | 'image-processing' | 'pdf' | 'ocr' | 'document-conversion';
  config: Record<string, any>;
  inputs?: string[];
  outputs?: string[];
  condition?: LogicCondition;
  loopConfig?: LoopConfig;
}

export interface LogicCondition {
  type: 'if' | 'switch' | 'expression';
  expression?: string;
  cases?: ConditionCase[];
  defaultOutput?: string;
}

export interface ConditionCase {
  condition: string;
  output: string;
}

export interface LoopConfig {
  type: 'for' | 'while' | 'forEach';
  collection?: string;
  condition?: string;
  iterations?: number;
  iteratorVar?: string;
  body: string[];
}

export interface LogicTrigger {
  type: 'manual' | 'webhook' | 'schedule' | 'event' | 'api';
  config: Record<string, any>;
}

export interface LogicExecutionOptions {
  async?: boolean;
  debug?: boolean;
  timeout?: number;
  input?: Record<string, any>;
  variables?: Record<string, any>;
}

export interface LogicExecutionResult {
  id: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  input?: any;
  output?: any;
  error?: any;
  nodeResults?: NodeResult[];
  duration?: number;
  variables?: Record<string, any>;
}

export interface NodeResult {
  nodeId: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  output?: any;
  error?: any;
  iterations?: number;
}

// Auth Types - matches auth.users table schema
export interface AuthUser {
  id: string;
  email: string;
  password_hash?: string;
  name?: string;
  username?: string;
  avatar?: string;
  avatar_url?: string;
  email_verified?: boolean;
  phone?: string;
  phone_verified?: boolean;
  bio?: string;
  location?: string;
  website?: string;
  date_of_birth?: string;
  gender?: string;
  oauth_providers?: string[];
  metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  last_login_at?: string;
  last_login_ip?: string;
  login_count?: number;
  failed_login_attempts?: number;
  locked_until?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token?: string;
  user: AuthUser;
  expires_at: number;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  name?: string;
  metadata?: Record<string, any>;
}

export interface SignInCredentials {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface AuthConfig {
  requireEmailVerification?: boolean;
  allowSignup?: boolean;
  passwordRequirements?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSymbols?: boolean;
  };
}

// AI Types
export interface AIRequest {
  type: 'text' | 'embeddings' | 'chat' | 'image' | 'video' | 'audio' | 'voice-clone';
  input: string | string[];
  options?: Record<string, any>;
}

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  usage?: {
    tokens?: number;
    cost?: number;
  };
}

// Storage Types
export interface StorageFile {
  id: string;
  filename: string;
  size: number;
  contentType: string;
  url?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UploadOptions {
  public?: boolean;
  contentType?: string;
  metadata?: Record<string, any>;
  process?: {
    resize?: { width: number; height: number };
    optimize?: boolean;
    format?: 'jpeg' | 'png' | 'webp' | 'avif';
    quality?: number;
  };
}

export interface StorageUploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  cacheControl?: string;
  acl?: 'private' | 'public-read' | 'public-read-write';
  tags?: Record<string, string>;
}

export interface StorageDownloadOptions {
  quality?: number;
  width?: number;
  height?: number;
  format?: string;
}

// Email Types
export interface EmailMessage {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: EmailAttachment[];
  template?: {
    name: string;
    data: Record<string, any>;
  };
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html?: string;
  text?: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

// Realtime Types
export interface RealtimeEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  data: any;
  old?: any;
  timestamp: string;
}

export interface RealtimeSubscription {
  id: string;
  type: 'database' | 'workflow' | 'presence' | 'analytics' | 'logic';
  callback: (data: any) => void;
  active: boolean;
}

export interface RealtimeChannel {
  name: string;
  callback: (message: any) => void;
  subscribers: number;
}

export interface RealtimeMessage {
  type: 'channel_message' | 'database_change' | 'workflow_event' | 'user_presence';
  channel: string;
  data: any;
}

export interface RealtimeConnection {
  connected: boolean;
  subscriptions: RealtimeSubscription[];
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribe(table: string, callback: (event: RealtimeEvent) => void, filter?: Record<string, any>): string;
  unsubscribe(subscriptionId: string): void;
}

// Search Types
export interface SearchOptions {
  query: string;
  table?: string;
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
  highlight?: boolean;
}

export interface SearchResult {
  id: string;
  table: string;
  score: number;
  data: any;
  highlights?: Record<string, string[]>;
}

// Workflow Types
export interface WorkflowDefinition {
  name: string;
  description?: string;
  steps: WorkflowStep[];
  trigger?: WorkflowTrigger;
  status?: 'draft' | 'active' | 'paused' | 'archived';
}

export interface WorkflowTrigger {
  type: 'manual' | 'webhook' | 'schedule' | 'event';
  config: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'ai' | 'email' | 'push-notification' | 'node' | 'payment' | 'webhook' | 'database' | 'condition' | 'loop' | 'image-processing' | 'pdf' | 'ocr' | 'document-conversion';
  config: Record<string, any>;
  nextStepId?: string;
  errorStepId?: string;
}

export interface WorkflowStepResult {
  stepId: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  startedAt: Date;
  completedAt?: Date;
  output?: any;
  error?: any;
}

// Error Types
export interface AppAtOnceError extends Error {
  code: string;
  details?: any;
  statusCode?: number;
}

// Utility Types
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type QueryResult<T = any> = {
  data: T[];
  error?: string;
  count?: number;
};

export type MutationResult<T = any> = {
  data: T;
  error?: string;
};

// Additional types for modules
export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  verified: boolean;
  active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  settings: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  settings: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  permissions: string[];
  created_at: string;
  expires_at?: string;
  metadata: Record<string, any>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  input?: any;
  output?: any;
  error?: any;
  currentStep: number;
  stepResults: WorkflowStepResult[];
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
}

// Trigger Types
export interface TriggerConfig {
  cron?: string;
  timezone?: string;
  webhook?: {
    url?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
  };
  event?: {
    source: string;
    eventType: string;
    filters?: Record<string, any>;
  };
}

export interface TriggerTarget {
  type: 'workflow' | 'logic' | 'node' | 'tool';
  id: string;
  config?: Record<string, any>;
}

export interface Trigger {
  id?: string;
  name: string;
  description?: string;
  type: 'cron' | 'webhook' | 'event';
  config: TriggerConfig;
  target: TriggerTarget;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface TriggerExecution {
  id: string;
  triggerId: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  input?: any;
  output?: any;
  error?: any;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
}

export interface ColumnDefinition {
  name: string;
  type: string;
  length?: number;
  precision?: number;
  scale?: number;
  required?: boolean;
  unique?: boolean;
  primaryKey?: boolean;
  defaultValue?: any;
  min?: number;
  max?: number;
  foreignKey?: {
    table: string;
    column: string;
  };
  // Search & AI properties
  searchable?: boolean;  // Index for full-text search
  embeddable?: boolean;  // Generate embeddings for semantic search
  searchWeight?: number; // Boost factor for search relevance (1.0 = normal, 2.0 = double weight)
}

export interface IndexDefinition {
  name: string;
  columns: string[];
  type?: 'btree' | 'hash' | 'gin' | 'gist' | 'hnsw' | 'ivfflat';
  unique?: boolean;
}

export interface ConstraintDefinition {
  name: string;
  type: 'primary_key' | 'foreign_key' | 'unique' | 'check' | 'not_null';
  columns: string[];
  definition?: string;
  referenced_table?: string;
  referenced_columns?: string[];
}

// Push Notification Types
export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  image?: string;
  priority: 'high' | 'normal';
  status: 'sent' | 'delivered' | 'opened' | 'failed';
  platform?: 'ios' | 'android' | 'web';
  sentAt: string;
  deliveredAt?: string;
  openedAt?: string;
  error?: string;
}

export interface PushDevice {
  id: string;
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
  tags: string[];
  active: boolean;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

export interface PushTemplate {
  id: string;
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
  tags: string[];
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PushCampaign {
  id: string;
  name: string;
  title: string;
  body: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled';
  targetType: 'all' | 'segment' | 'tags';
  tags?: string[];
  segment?: {
    platform?: 'ios' | 'android' | 'web';
    lastActiveAfter?: string;
    lastActiveWithin?: number;
    locale?: string[];
    timezone?: string[];
  };
  recipientCount: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  failedCount: number;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PushAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalFailed: number;
  deliveryRate: number;
  openRate: number;
  byPlatform: {
    ios: { sent: number; delivered: number; opened: number };
    android: { sent: number; delivered: number; opened: number };
    web: { sent: number; delivered: number; opened: number };
  };
  byHour: Array<{
    hour: string;
    sent: number;
    delivered: number;
    opened: number;
  }>;
  byDay: Array<{
    date: string;
    sent: number;
    delivered: number;
    opened: number;
  }>;
}

// Export all OAuth types
export * from './oauth';