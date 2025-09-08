import { HttpClient } from '../core/http-client';

export interface AnalyticsQuery {
  metric: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct';
  column?: string;
  filters?: Record<string, any>;
  groupBy?: string[];
  timeGroup?: 'minute' | 'hour' | 'day' | 'week' | 'month';
  timeRange?: string;
  limit?: number;
}

export interface TimeSeriesOptions {
  metric: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct';
  column?: string;
  interval: 'minute' | 'hour' | 'day' | 'week' | 'month';
  timeRange?: string;
  filters?: Record<string, any>;
}

export interface GroupByOptions {
  metric: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct';
  column?: string;
  groupBy: string[];
  filters?: Record<string, any>;
  limit?: number;
}

export interface AnalyticsResult {
  data: Array<{
    value: number;
    timestamp?: string;
    [key: string]: any;
  }>;
  metadata?: {
    timeRange?: string;
    groupBy?: string[];
    metric: string;
    column?: string;
  };
}

export class AnalyticsModule {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly tableName: string
  ) {}

  /**
   * Perform analytics query on the table
   */
  async query(options: AnalyticsQuery): Promise<AnalyticsResult> {
    const endpoint = `/database/tables/${this.tableName}/analytics`;
    
    const payload = {
      metric: options.metric || 'count',
      column: options.column,
      filters: options.filters || {},
      groupBy: options.groupBy,
      timeGroup: options.timeGroup,
      timeRange: options.timeRange || '7d',
      limit: options.limit || 100,
    };

    try {
      const response = await this.httpClient.post(endpoint, payload);
      return response.data;
    } catch (error) {
      throw new Error(`Analytics query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Count records
   */
  async count(filters?: Record<string, any>): Promise<number> {
    const result = await this.query({
      metric: 'count',
      filters,
    });
    return result.data?.[0]?.value || 0;
  }

  /**
   * Sum values in a column
   */
  async sum(column: string, filters?: Record<string, any>): Promise<number> {
    const result = await this.query({
      metric: 'sum',
      column,
      filters,
    });
    return result.data?.[0]?.value || 0;
  }

  /**
   * Average values in a column
   */
  async avg(column: string, filters?: Record<string, any>): Promise<number> {
    const result = await this.query({
      metric: 'avg',
      column,
      filters,
    });
    return result.data?.[0]?.value || 0;
  }

  /**
   * Find minimum value in a column
   */
  async min(column: string, filters?: Record<string, any>): Promise<number | null> {
    const result = await this.query({
      metric: 'min',
      column,
      filters,
    });
    return result.data?.[0]?.value ?? null;
  }

  /**
   * Find maximum value in a column
   */
  async max(column: string, filters?: Record<string, any>): Promise<number | null> {
    const result = await this.query({
      metric: 'max',
      column,
      filters,
    });
    return result.data?.[0]?.value ?? null;
  }

  /**
   * Count distinct values in a column
   */
  async countDistinct(column: string, filters?: Record<string, any>): Promise<number> {
    const result = await this.query({
      metric: 'distinct',
      column,
      filters,
    });
    return result.data?.[0]?.value || 0;
  }

  /**
   * Get time-series data
   */
  async timeSeries(options: TimeSeriesOptions): Promise<Array<{
    timestamp: string;
    value: number;
  }>> {
    const result = await this.query({
      metric: options.metric || 'count',
      column: options.column,
      timeGroup: options.interval,
      timeRange: options.timeRange || '7d',
      filters: options.filters,
    });
    return result.data?.map(point => ({
      timestamp: point.timestamp || '',
      value: point.value
    })) || [];
  }

  /**
   * Get grouped analytics
   */
  async groupBy(options: GroupByOptions): Promise<Array<Record<string, any>>> {
    const result = await this.query({
      metric: options.metric || 'count',
      column: options.column,
      groupBy: options.groupBy,
      filters: options.filters,
      limit: options.limit,
    });
    return result.data || [];
  }

  /**
   * Real-time analytics with WebSocket updates
   */
  realtime(
    options: AnalyticsQuery,
    onUpdate: (result: AnalyticsResult) => void
  ): () => void {
    // Subscribe to real-time updates
    // TODO: WebSocket integration with channel: `analytics:${this.tableName}`
    
    const handleUpdate = async () => {
      try {
        const result = await this.query(options);
        onUpdate(result);
      } catch (error) {
        console.error('Real-time analytics update failed:', error);
      }
    };

    // Initial query
    handleUpdate();

    // Set up polling interval (WebSocket integration to be added)
    const interval = setInterval(handleUpdate, 5000); // 5 second polling

    // Return unsubscribe function
    return () => {
      clearInterval(interval);
    };
  }
}