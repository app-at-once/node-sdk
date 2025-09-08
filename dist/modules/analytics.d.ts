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
export declare class AnalyticsModule {
    private readonly httpClient;
    private readonly tableName;
    constructor(httpClient: HttpClient, tableName: string);
    query(options: AnalyticsQuery): Promise<AnalyticsResult>;
    count(filters?: Record<string, any>): Promise<number>;
    sum(column: string, filters?: Record<string, any>): Promise<number>;
    avg(column: string, filters?: Record<string, any>): Promise<number>;
    min(column: string, filters?: Record<string, any>): Promise<number | null>;
    max(column: string, filters?: Record<string, any>): Promise<number | null>;
    countDistinct(column: string, filters?: Record<string, any>): Promise<number>;
    timeSeries(options: TimeSeriesOptions): Promise<Array<{
        timestamp: string;
        value: number;
    }>>;
    groupBy(options: GroupByOptions): Promise<Array<Record<string, any>>>;
    realtime(options: AnalyticsQuery, onUpdate: (result: AnalyticsResult) => void): () => void;
}
