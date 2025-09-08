import { QueryFilter, QueryOptions, JoinClause, QueryResult } from '../types';
import { HttpClient } from './http-client';
import { AnalyticsModule } from '../modules/analytics';

export class QueryBuilder<T = any> {
  private httpClient: HttpClient;
  private tableName: string;
  private selectFields: string[] = ['*'];
  private whereFilters: QueryFilter[] = [];
  private orFilters: QueryFilter[][] = []; // Support for OR conditions
  private orderByFields: { field: string; direction: 'asc' | 'desc' }[] = [];
  private joinClauses: JoinClause[] = [];
  private limitValue?: number;
  private offsetValue?: number;
  private groupByFields: string[] = [];
  private havingFilters: QueryFilter[] = [];
  private _analytics?: AnalyticsModule;

  constructor(httpClient: HttpClient, tableName: string) {
    this.httpClient = httpClient;
    this.tableName = tableName;
  }

  // SELECT methods
  select(...fields: string[]): this {
    this.selectFields = fields.length > 0 ? fields : ['*'];
    return this;
  }

  // WHERE methods with multiple signatures for better DX
  where(conditions: Record<string, any>): this;
  where(field: string, value: any): this;
  where(field: string, operator: string, value: any): this;
  where(fieldOrConditions: string | Record<string, any>, operatorOrValue?: any, value?: any): this {
    // Object syntax: where({ id: 1, name: 'john' })
    if (typeof fieldOrConditions === 'object' && fieldOrConditions !== null) {
      Object.entries(fieldOrConditions).forEach(([field, value]) => {
        this.whereFilters.push({ field, operator: 'eq', value });
      });
      return this;
    }

    // Two arguments: where('id', 1) - defaults to 'eq'
    if (arguments.length === 2) {
      const field = fieldOrConditions as string;
      const value = operatorOrValue;
      // Handle null values properly
      if (value === null) {
        this.whereFilters.push({ field, operator: 'is', value: null });
      } else {
        this.whereFilters.push({ field, operator: 'eq', value });
      }
      return this;
    }

    // Three arguments: where('age', '>', 18)
    if (arguments.length === 3) {
      const field = fieldOrConditions as string;
      const operator = operatorOrValue as string;
      // Handle null values with proper SQL operators
      if (value === null && operator === 'eq') {
        this.whereFilters.push({ field, operator: 'is', value: null });
      } else if (value === null && operator === 'ne') {
        this.whereFilters.push({ field, operator: 'not', value: null });
      } else {
        this.whereFilters.push({ field, operator: operator as any, value });
      }
      return this;
    }

    throw new Error('Invalid where() arguments');
  }

  // Alias for where() for better readability
  filter(conditions: Record<string, any>): this;
  filter(field: string, value: any): this;
  filter(field: string, operator: string, value: any): this;
  filter(fieldOrConditions: string | Record<string, any>, operatorOrValue?: any, value?: any): this {
    // Need to handle argument count properly when forwarding to where()
    if (arguments.length === 1) {
      return this.where(fieldOrConditions as any);
    } else if (arguments.length === 2) {
      return this.where(fieldOrConditions as string, operatorOrValue);
    } else {
      return this.where(fieldOrConditions as string, operatorOrValue, value);
    }
  }

  // Convenience method for AND conditions
  and(conditions: Record<string, any>): this;
  and(field: string, value: any): this;
  and(field: string, operator: string, value: any): this;
  and(fieldOrConditions: string | Record<string, any>, operatorOrValue?: any, value?: any): this {
    // Need to handle argument count properly when forwarding to where()
    if (arguments.length === 1) {
      return this.where(fieldOrConditions as any);
    } else if (arguments.length === 2) {
      return this.where(fieldOrConditions as string, operatorOrValue);
    } else {
      return this.where(fieldOrConditions as string, operatorOrValue, value);
    }
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

  // OR conditions support
  or(...conditions: Array<(qb: QueryBuilder<T>) => QueryBuilder<T>>): this {
    const orGroup: QueryFilter[] = [];
    
    for (const condition of conditions) {
      const tempBuilder = new QueryBuilder<T>(this.httpClient, this.tableName);
      condition(tempBuilder);
      orGroup.push(...tempBuilder.whereFilters);
    }
    
    if (orGroup.length > 0) {
      this.orFilters.push(orGroup);
    }
    
    return this;
  }

  // Alternative OR syntax for simple conditions
  orWhere(conditions: Record<string, any>): this;
  orWhere(field: string, value: any): this;
  orWhere(field: string, operator: string, value: any): this;
  orWhere(fieldOrConditions: string | Record<string, any>, operatorOrValue?: any, value?: any): this {
    const orGroup: QueryFilter[] = [];
    
    // Object syntax: orWhere({ id: 1, name: 'john' })
    if (typeof fieldOrConditions === 'object' && fieldOrConditions !== null) {
      Object.entries(fieldOrConditions).forEach(([field, val]) => {
        if (val === null) {
          orGroup.push({ field, operator: 'is', value: null });
        } else {
          orGroup.push({ field, operator: 'eq', value: val });
        }
      });
    }
    // Two arguments: orWhere('id', 1)
    else if (arguments.length === 2) {
      const field = fieldOrConditions as string;
      const val = operatorOrValue;
      if (val === null) {
        orGroup.push({ field, operator: 'is', value: null });
      } else {
        orGroup.push({ field, operator: 'eq', value: val });
      }
    }
    // Three arguments: orWhere('age', '>', 18)
    else if (arguments.length === 3) {
      const field = fieldOrConditions as string;
      const operator = operatorOrValue as string;
      if (value === null && operator === 'eq') {
        orGroup.push({ field, operator: 'is', value: null });
      } else if (value === null && operator === 'ne') {
        orGroup.push({ field, operator: 'not', value: null });
      } else {
        orGroup.push({ field, operator: operator as any, value });
      }
    }
    
    if (orGroup.length > 0) {
      this.orFilters.push(orGroup);
    }
    
    return this;
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
    
    // Check if this is a single ID query that should use the GET by ID endpoint
    if (this.whereFilters.length === 1 && 
        this.whereFilters[0].field === 'id' && 
        this.whereFilters[0].operator === 'eq' &&
        !this.limitValue && !this.offsetValue && !this.orderByFields.length) {
      // Use the GET by ID endpoint for better performance
      const id = this.whereFilters[0].value;
      try {
        const response = await this.httpClient.get(`/data/${this.tableName}/${id}`);
        return {
          data: response.data ? [response.data] : [],
          count: response.data ? 1 : 0,
        };
      } catch (error: any) {
        // If it's a 404, return empty result
        if (error.statusCode === 404) {
          return {
            data: [],
            count: 0,
          };
        }
        throw error;
      }
    }
    
    // Use the regular query endpoint
    const response = await this.httpClient.get(`/data/${this.tableName}`, {
      params: this.buildQueryParams(options),
    });

    return {
      data: response.data || [],
      count: response.meta?.total,
    };
  }
  
  // Find a single record by ID
  async findById(id: string | number): Promise<T | null> {
    try {
      const response = await this.httpClient.get(`/data/${this.tableName}/${id}`);
      return response.data || null;
    } catch (error: any) {
      // If it's a 404, return null
      if (error.statusCode === 404) {
        return null;
      }
      throw error;
    }
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
    
    // Batch delete with WHERE conditions
    // Pass WHERE conditions as query parameters, similar to SELECT
    const params = this.buildQueryParams(options);
    const response = await this.httpClient.delete(`/data/${this.tableName}`, {
      params: params,  // Pass as query params, not in body
    });
    return { count: response.data.count || response.data.deleted || 0 };
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

  // ANALYTICS methods (legacy)
  async analyticsQuery(options: {
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

  // Analytics getter
  get analytics(): AnalyticsModule {
    if (!this._analytics) {
      this._analytics = new AnalyticsModule(this.httpClient, this.tableName);
    }
    return this._analytics;
  }

  // UTILITY methods
  private buildQueryOptions(): QueryOptions {
    const options: any = {
      select: this.selectFields,
      where: this.whereFilters,
      orderBy: this.orderByFields,
      limit: this.limitValue,
      offset: this.offsetValue,
      joins: this.joinClauses,
    };
    
    // Add OR conditions if present
    if (this.orFilters.length > 0) {
      options.or = this.orFilters;
    }
    
    return options;
  }

  private buildQueryParams(options: QueryOptions): Record<string, any> {
    const params: Record<string, any> = {};

    if (options.select) {
      params.select = Array.isArray(options.select) ? options.select.join(',') : options.select;
    }

    // Convert where conditions to the proper array format expected by the server
    // The server expects: where[0][field]=name&where[0][operator]=eq&where[0][value]=test
    if (options.where && options.where.length > 0) {
      options.where.forEach((filter: any, index: number) => {
        params[`where[${index}][field]`] = filter.field;
        params[`where[${index}][operator]`] = filter.operator;
        
        // Handle different value types
        if (filter.value === null) {
          params[`where[${index}][value]`] = null;
        } else if (filter.value === undefined) {
          // Skip undefined values
          delete params[`where[${index}][value]`];
        } else if (Array.isArray(filter.value)) {
          // For 'in' and 'nin' operators, send as array
          params[`where[${index}][value]`] = filter.value;
        } else {
          params[`where[${index}][value]`] = filter.value;
        }
      });
    }
    
    // Handle OR conditions - send as structured data
    if ((options as any).or && (options as any).or.length > 0) {
      // OR conditions need special handling - might need to be sent as POST body
      // For now, we add them as a JSON string
      params.or = JSON.stringify((options as any).or);
    }

    // Convert orderBy to the proper array format
    if (options.orderBy && options.orderBy.length > 0) {
      options.orderBy.forEach((order: any, index: number) => {
        params[`orderBy[${index}][field]`] = order.field;
        params[`orderBy[${index}][direction]`] = order.direction;
      });
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
    cloned.orFilters = this.orFilters.map(group => [...group]);
    cloned.orderByFields = [...this.orderByFields];
    cloned.joinClauses = [...this.joinClauses];
    cloned.limitValue = this.limitValue;
    cloned.offsetValue = this.offsetValue;
    cloned.groupByFields = [...this.groupByFields];
    cloned.havingFilters = [...this.havingFilters];
    return cloned;
  }
}