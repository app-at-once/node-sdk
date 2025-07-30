"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
class QueryBuilder {
    constructor(httpClient, tableName) {
        this.selectFields = ['*'];
        this.whereFilters = [];
        this.orderByFields = [];
        this.joinClauses = [];
        this.groupByFields = [];
        this.havingFilters = [];
        this.httpClient = httpClient;
        this.tableName = tableName;
    }
    select(...fields) {
        this.selectFields = fields.length > 0 ? fields : ['*'];
        return this;
    }
    where(field, operator, value) {
        this.whereFilters.push({ field, operator: operator, value });
        return this;
    }
    eq(field, value) {
        return this.where(field, 'eq', value);
    }
    ne(field, value) {
        return this.where(field, 'ne', value);
    }
    gt(field, value) {
        return this.where(field, 'gt', value);
    }
    gte(field, value) {
        return this.where(field, 'gte', value);
    }
    lt(field, value) {
        return this.where(field, 'lt', value);
    }
    lte(field, value) {
        return this.where(field, 'lte', value);
    }
    like(field, value) {
        return this.where(field, 'like', value);
    }
    ilike(field, value) {
        return this.where(field, 'ilike', value);
    }
    in(field, values) {
        return this.where(field, 'in', values);
    }
    notIn(field, values) {
        return this.where(field, 'nin', values);
    }
    isNull(field) {
        return this.where(field, 'is', null);
    }
    isNotNull(field) {
        return this.where(field, 'not', null);
    }
    between(field, min, max) {
        return this.where(field, 'gte', min).where(field, 'lte', max);
    }
    notBetween(field, min, max) {
        return this.where(field, 'lt', min).where(field, 'gt', max);
    }
    orderBy(field, direction = 'asc') {
        this.orderByFields.push({ field, direction });
        return this;
    }
    join(table, on, type = 'inner') {
        this.joinClauses.push({ type, table, on });
        return this;
    }
    leftJoin(table, on) {
        return this.join(table, on, 'left');
    }
    rightJoin(table, on) {
        return this.join(table, on, 'right');
    }
    innerJoin(table, on) {
        return this.join(table, on, 'inner');
    }
    fullJoin(table, on) {
        return this.join(table, on, 'full');
    }
    limit(count) {
        this.limitValue = count;
        return this;
    }
    offset(count) {
        this.offsetValue = count;
        return this;
    }
    groupBy(...fields) {
        this.groupByFields = fields;
        return this;
    }
    having(field, operator, value) {
        this.havingFilters.push({ field, operator: operator, value });
        return this;
    }
    paginate(page, pageSize = 10) {
        this.limitValue = pageSize;
        this.offsetValue = (page - 1) * pageSize;
        return this;
    }
    async execute() {
        const options = this.buildQueryOptions();
        const response = await this.httpClient.get(`/data/${this.tableName}`, {
            params: this.buildQueryParams(options),
        });
        return {
            data: response.data || [],
            count: response.meta?.total,
        };
    }
    async first() {
        const result = await this.limit(1).execute();
        return result.data[0] || null;
    }
    async count() {
        const response = await this.httpClient.get(`/data/${this.tableName}/count`, {
            params: this.buildQueryParams(this.buildQueryOptions()),
        });
        return response.data.count || 0;
    }
    async exists() {
        const count = await this.count();
        return count > 0;
    }
    async insert(data) {
        const response = await this.httpClient.post(`/data/${this.tableName}`, data);
        return response.data;
    }
    async insertMany(data) {
        const response = await this.httpClient.post(`/data/${this.tableName}/bulk`, { data });
        return response.data;
    }
    async update(data) {
        const options = this.buildQueryOptions();
        const idFilter = this.whereFilters.find(f => f.field === 'id' && f.operator === 'eq');
        if (idFilter && this.whereFilters.length === 1) {
            const response = await this.httpClient.patch(`/data/${this.tableName}/${idFilter.value}`, data);
            return [response.data];
        }
        const response = await this.httpClient.patch(`/data/${this.tableName}`, {
            data,
            where: options.where,
        });
        return response.data;
    }
    async upsert(data, conflictFields = ['id']) {
        const response = await this.httpClient.post(`/data/${this.tableName}/upsert`, {
            data,
            conflictFields,
        });
        return response.data;
    }
    async delete() {
        const options = this.buildQueryOptions();
        const idFilter = this.whereFilters.find(f => f.field === 'id' && f.operator === 'eq');
        if (idFilter && this.whereFilters.length === 1) {
            const response = await this.httpClient.delete(`/data/${this.tableName}/${idFilter.value}`);
            return { count: response.data.deleted ? 1 : 0 };
        }
        const response = await this.httpClient.delete(`/data/${this.tableName}`, {
            data: { where: options.where },
        });
        return { count: response.data.count || 0 };
    }
    async search(query, options) {
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
    async analytics(options) {
        const response = await this.httpClient.post(`/data/${this.tableName}/analytics`, {
            ...options,
            where: this.whereFilters,
        });
        return response.data.results || [];
    }
    async aggregate(functions) {
        const response = await this.httpClient.post(`/data/${this.tableName}/aggregate`, {
            functions,
            where: this.whereFilters,
            groupBy: this.groupByFields,
            having: this.havingFilters,
        });
        return response.data;
    }
    async sum(field) {
        const response = await this.httpClient.post(`/data/${this.tableName}/aggregate`, {
            sum: [field],
            where: this.whereFilters,
        });
        return parseFloat(response.data[`sum_${field}`]) || 0;
    }
    async avg(field) {
        const response = await this.httpClient.post(`/data/${this.tableName}/aggregate`, {
            avg: [field],
            where: this.whereFilters,
        });
        return parseFloat(response.data[`avg_${field}`]) || 0;
    }
    async min(field) {
        const response = await this.httpClient.post(`/data/${this.tableName}/aggregate`, {
            min: [field],
            where: this.whereFilters,
        });
        return response.data[`min_${field}`];
    }
    async max(field) {
        const response = await this.httpClient.post(`/data/${this.tableName}/aggregate`, {
            max: [field],
            where: this.whereFilters,
        });
        return response.data[`max_${field}`];
    }
    buildQueryOptions() {
        return {
            select: this.selectFields,
            where: this.whereFilters,
            orderBy: this.orderByFields,
            limit: this.limitValue,
            offset: this.offsetValue,
            joins: this.joinClauses,
        };
    }
    buildQueryParams(options) {
        const params = {};
        if (options.select) {
            params.select = Array.isArray(options.select) ? options.select.join(',') : options.select;
        }
        if (options.where && options.where.length > 0) {
            params.where = options.where;
        }
        if (options.orderBy && options.orderBy.length > 0) {
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
    clone() {
        const cloned = new QueryBuilder(this.httpClient, this.tableName);
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
exports.QueryBuilder = QueryBuilder;
//# sourceMappingURL=query-builder.js.map