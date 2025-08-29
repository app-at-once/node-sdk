"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsModule = void 0;
class AnalyticsModule {
    constructor(httpClient, tableName) {
        this.httpClient = httpClient;
        this.tableName = tableName;
    }
    async query(options) {
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
        }
        catch (error) {
            throw new Error(`Analytics query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async count(filters) {
        const result = await this.query({
            metric: 'count',
            filters,
        });
        return result.data?.[0]?.value || 0;
    }
    async sum(column, filters) {
        const result = await this.query({
            metric: 'sum',
            column,
            filters,
        });
        return result.data?.[0]?.value || 0;
    }
    async avg(column, filters) {
        const result = await this.query({
            metric: 'avg',
            column,
            filters,
        });
        return result.data?.[0]?.value || 0;
    }
    async min(column, filters) {
        const result = await this.query({
            metric: 'min',
            column,
            filters,
        });
        return result.data?.[0]?.value ?? null;
    }
    async max(column, filters) {
        const result = await this.query({
            metric: 'max',
            column,
            filters,
        });
        return result.data?.[0]?.value ?? null;
    }
    async countDistinct(column, filters) {
        const result = await this.query({
            metric: 'distinct',
            column,
            filters,
        });
        return result.data?.[0]?.value || 0;
    }
    async timeSeries(options) {
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
    async groupBy(options) {
        const result = await this.query({
            metric: options.metric || 'count',
            column: options.column,
            groupBy: options.groupBy,
            filters: options.filters,
            limit: options.limit,
        });
        return result.data || [];
    }
    realtime(options, onUpdate) {
        const handleUpdate = async () => {
            try {
                const result = await this.query(options);
                onUpdate(result);
            }
            catch (error) {
                console.error('Real-time analytics update failed:', error);
            }
        };
        handleUpdate();
        const interval = setInterval(handleUpdate, 5000);
        return () => {
            clearInterval(interval);
        };
    }
}
exports.AnalyticsModule = AnalyticsModule;
//# sourceMappingURL=analytics.js.map