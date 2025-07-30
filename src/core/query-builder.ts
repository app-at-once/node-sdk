import { QueryFilter, QueryOptions, JoinClause, QueryResult } from '../types';
import { HttpClient } from './http-client';

export class QueryBuilder<T = any> {
  private httpClient: HttpClient;
  private tableName: string;
  private selectFields: string[] = ['*'];
  private whereFilters: QueryFilter[] = [];
  private orderByFields: { field: string; direction: 'asc' | 'desc' }[] = [];
  private joinClauses: JoinClause[] = [];
  private limitValue?: number;
  private offsetValue?: number;
  private groupByFields: string[] = [];
  private havingFilters: QueryFilter[] = [];

  constructor(httpClient: HttpClient, tableName: string) {
    this.httpClient = httpClient;
    this.tableName = tableName;
  }

  // SELECT methods
  select(...fields: string[]): this {
    this.selectFields = fields.length > 0 ? fields : ['*'];
    return this;
  }

  // WHERE methods
  where(field: string, operator: string, value: any): this {
    this.whereFilters.push({ field, operator: operator as any, value });
    return this;
  }

  eq(field: string, value: any): this {
    return this.where(field, 'eq', value);
  }

  ne(field: string, value: any): this {
    return this.where(field, 'ne', value);
  }

  gt(field: string, value: any): this {
    return this.where(field, 'gt', value);
  }

  gte(field: string, value: any): this {
    return this.where(field, 'gte', value);
  }

  lt(field: string, value: any): this {
    return this.where(field, 'lt', value);
  }

  lte(field: string, value: any): this {
    return this.where(field, 'lte', value);
  }

  like(field: string, value: string): this {
    return this.where(field, 'like', value);
  }

  ilike(field: string, value: string): this {
    return this.where(field, 'ilike', value);
  }

  in(field: string, values: any[]): this {
    return this.where(field, 'in', values);
  }

  notIn(field: string, values: any[]): this {
    return this.where(field, 'nin', values);
  }

  isNull(field: string): this {
    return this.where(field, 'is', null);
  }

  isNotNull(field: string): this {
    return this.where(field, 'not', null);
  }

  between(field: string, min: any, max: any): this {
    return this.where(field, 'gte', min).where(field, 'lte', max);
  }

  notBetween(field: string, min: any, max: any): this {
    return this.where(field, 'lt', min).where(field, 'gt', max);
  }

  // ORDER BY methods
  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): this {
    this.orderByFields.push({ field, direction });
    return this;
  }

  // JOIN methods
  join(table: string, on: string, type: 'inner' | 'left' | 'right' | 'full' = 'inner'): this {
    this.joinClauses.push({ type, table, on });
    return this;
  }

  leftJoin(table: string, on: string): this {
    return this.join(table, on, 'left');
  }

  rightJoin(table: string, on: string): this {
    return this.join(table, on, 'right');
  }

  innerJoin(table: string, on: string): this {
    return this.join(table, on, 'inner');
  }

  fullJoin(table: string, on: string): this {
    return this.join(table, on, 'full');
  }

  // LIMIT and OFFSET
  limit(count: number): this {
    this.limitValue = count;
    return this;
  }

  offset(count: number): this {
    this.offsetValue = count;
    return this;
  }

  // GROUP BY and HAVING
  groupBy(...fields: string[]): this {
    this.groupByFields = fields;
    return this;
  }

  having(field: string, operator: string, value: any): this {
    this.havingFilters.push({ field, operator: operator as any, value });
    return this;
  }

  // PAGINATION
  paginate(page: number, pageSize: number = 10): this {
    this.limitValue = pageSize;
    this.offsetValue = (page - 1) * pageSize;
    return this;
  }

  // EXECUTE methods
  async execute(): Promise<QueryResult<T>> {
    const options = this.buildQueryOptions();
    const response = await this.httpClient.get(`/data/${this.tableName}`, {
      params: this.buildQueryParams(options),
    });

    return {
      data: response.data || [],
      count: response.meta?.total,
    };
  }

  async first(): Promise<T | null> {
    const result = await this.limit(1).execute();
    return result.data[0] || null;
  }

  async count(): Promise<number> {
    const response = await this.httpClient.get(`/data/${this.tableName}/count`, {
      params: this.buildQueryParams(this.buildQueryOptions()),
    });
    return response.data.count || 0;
  }

  async exists(): Promise<boolean> {
    const count = await this.count();
    return count > 0;
  }

  // MUTATION methods
  async insert(data: Partial<T>): Promise<T> {
    const response = await this.httpClient.post(`/data/${this.tableName}`, data);
    return response.data;
  }

  async insertMany(data: Partial<T>[]): Promise<T[]> {
    const response = await this.httpClient.post(`/data/${this.tableName}/bulk`, { data });
    return response.data;
  }

  async update(data: Partial<T>): Promise<T[]> {
    const options = this.buildQueryOptions();
    
    // Check if we have a single ID filter
    const idFilter = this.whereFilters.find(f => f.field === 'id' && f.operator === 'eq');
    if (idFilter && this.whereFilters.length === 1) {
      // Single record update
      const response = await this.httpClient.patch(`/data/${this.tableName}/${idFilter.value}`, data);
      return [response.data];
    }
    
    // Batch update (not yet implemented on server)
    const response = await this.httpClient.patch(`/data/${this.tableName}`, {
      data,
      where: options.where,
    });
    return response.data;
  }

  async upsert(data: Partial<T>, conflictFields: string[] = ['id']): Promise<T> {
    const response = await this.httpClient.post(`/data/${this.tableName}/upsert`, {
      data,
      conflictFields,
    });
    return response.data;
  }

  async delete(): Promise<{ count: number }> {
    const options = this.buildQueryOptions();
    
    // Check if we have a single ID filter
    const idFilter = this.whereFilters.find(f => f.field === 'id' && f.operator === 'eq');
    if (idFilter && this.whereFilters.length === 1) {
      // Single record delete
      const response = await this.httpClient.delete(`/data/${this.tableName}/${idFilter.value}`);
      return { count: response.data.deleted ? 1 : 0 };
    }
    
    // Batch delete (not yet implemented on server)
    const response = await this.httpClient.delete(`/data/${this.tableName}`, {
      data: { where: options.where },
    });
    return { count: response.data.count || 0 };
  }

  // SEARCH methods
  async search(query: string, options?: {
    fields?: string[];
    highlight?: boolean;
    limit?: number;
  }): Promise<QueryResult<T>> {
    const response = await this.httpClient.post(`/data/${this.tableName}/search`, {
      query,
      fields: options?.fields,
      highlight: options?.highlight,
      limit: options?.limit || 10,
      where: this.whereFilters,
    });

    return {
      data: response.data.results || [],
      count: response.data.total,
    };
  }

  // ANALYTICS methods
  async analytics(options: {
    metrics: string[];
    dimensions?: string[];
    timeRange?: { start: Date; end: Date };
    interval?: string;
    realtime?: boolean;
  }): Promise<any[]> {
    const response = await this.httpClient.post(`/data/${this.tableName}/analytics`, {
      ...options,
      where: this.whereFilters,
    });

    return response.data.results || [];
  }

  // AGGREGATION methods
  async aggregate(functions: string[]): Promise<any> {
    const response = await this.httpClient.post(`/data/${this.tableName}/aggregate`, {
      functions,
      where: this.whereFilters,
      groupBy: this.groupByFields,
      having: this.havingFilters,
    });

    return response.data;
  }

  async sum(field: string): Promise<number> {
    const response = await this.httpClient.post(`/data/${this.tableName}/aggregate`, {
      sum: [field],
      where: this.whereFilters,
    });
    return parseFloat(response.data[`sum_${field}`]) || 0;
  }

  async avg(field: string): Promise<number> {
    const response = await this.httpClient.post(`/data/${this.tableName}/aggregate`, {
      avg: [field],
      where: this.whereFilters,
    });
    return parseFloat(response.data[`avg_${field}`]) || 0;
  }

  async min(field: string): Promise<any> {
    const response = await this.httpClient.post(`/data/${this.tableName}/aggregate`, {
      min: [field],
      where: this.whereFilters,
    });
    return response.data[`min_${field}`];
  }

  async max(field: string): Promise<any> {
    const response = await this.httpClient.post(`/data/${this.tableName}/aggregate`, {
      max: [field],
      where: this.whereFilters,
    });
    return response.data[`max_${field}`];
  }

  // UTILITY methods
  private buildQueryOptions(): QueryOptions {
    return {
      select: this.selectFields,
      where: this.whereFilters,
      orderBy: this.orderByFields,
      limit: this.limitValue,
      offset: this.offsetValue,
      joins: this.joinClauses,
    };
  }

  private buildQueryParams(options: QueryOptions): Record<string, any> {
    const params: Record<string, any> = {};

    if (options.select) {
      params.select = Array.isArray(options.select) ? options.select.join(',') : options.select;
    }

    if (options.where && options.where.length > 0) {
      // Send arrays directly - axios handles serialization correctly
      params.where = options.where;
    }

    if (options.orderBy && options.orderBy.length > 0) {
      // Send arrays directly - axios handles serialization correctly
      params.orderBy = options.orderBy;
    }

    if (options.limit) {
      params.limit = options.limit;
    }

    if (options.offset) {
      params.offset = options.offset;
    }

    if (options.joins && options.joins.length > 0) {
      params.joins = JSON.stringify(options.joins);
    }

    if (this.groupByFields.length > 0) {
      params.groupBy = this.groupByFields.join(',');
    }

    if (this.havingFilters.length > 0) {
      params.having = JSON.stringify(this.havingFilters);
    }

    return params;
  }

  // Clone the query builder
  clone(): QueryBuilder<T> {
    const cloned = new QueryBuilder<T>(this.httpClient, this.tableName);
    cloned.selectFields = [...this.selectFields];
    cloned.whereFilters = [...this.whereFilters];
    cloned.orderByFields = [...this.orderByFields];
    cloned.joinClauses = [...this.joinClauses];
    cloned.limitValue = this.limitValue;
    cloned.offsetValue = this.offsetValue;
    cloned.groupByFields = [...this.groupByFields];
    cloned.havingFilters = [...this.havingFilters];
    return cloned;
  }
}