"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
const analytics_1 = require("../modules/analytics");
class QueryBuilder {
    constructor(httpClient, tableName) {
        this.selectFields = ['*'];
        this.whereFilters = [];
        this.orFilters = [];
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
    where(fieldOrConditions, operatorOrValue, value) {
        if (typeof fieldOrConditions === 'object' && fieldOrConditions !== null) {
            Object.entries(fieldOrConditions).forEach(([field, value]) => {
                this.whereFilters.push({ field, operator: 'eq', value });
            });
            return this;
        }
        if (arguments.length === 2) {
            const field = fieldOrConditions;
            const value = operatorOrValue;
            if (value === null) {
                this.whereFilters.push({ field, operator: 'is', value: null });
            }
            else {
                this.whereFilters.push({ field, operator: 'eq', value });
            }
            return this;
        }
        if (arguments.length === 3) {
            const field = fieldOrConditions;
            const operator = operatorOrValue;
            if (value === null && operator === 'eq') {
                this.whereFilters.push({ field, operator: 'is', value: null });
            }
            else if (value === null && operator === 'ne') {
                this.whereFilters.push({ field, operator: 'not', value: null });
            }
            else {
                this.whereFilters.push({ field, operator: operator, value });
            }
            return this;
        }
        throw new Error('Invalid where() arguments');
    }
    filter(fieldOrConditions, operatorOrValue, value) {
        if (arguments.length === 1) {
            return this.where(fieldOrConditions);
        }
        else if (arguments.length === 2) {
            return this.where(fieldOrConditions, operatorOrValue);
        }
        else {
            return this.where(fieldOrConditions, operatorOrValue, value);
        }
    }
    and(fieldOrConditions, operatorOrValue, value) {
        if (arguments.length === 1) {
            return this.where(fieldOrConditions);
        }
        else if (arguments.length === 2) {
            return this.where(fieldOrConditions, operatorOrValue);
        }
        else {
            return this.where(fieldOrConditions, operatorOrValue, value);
        }
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
    or(...conditions) {
        const orGroup = [];
        for (const condition of conditions) {
            const tempBuilder = new QueryBuilder(this.httpClient, this.tableName);
            condition(tempBuilder);
            orGroup.push(...tempBuilder.whereFilters);
        }
        if (orGroup.length > 0) {
            this.orFilters.push(orGroup);
        }
        return this;
    }
    orWhere(fieldOrConditions, operatorOrValue, value) {
        const orGroup = [];
        if (typeof fieldOrConditions === 'object' && fieldOrConditions !== null) {
            Object.entries(fieldOrConditions).forEach(([field, val]) => {
                if (val === null) {
                    orGroup.push({ field, operator: 'is', value: null });
                }
                else {
                    orGroup.push({ field, operator: 'eq', value: val });
                }
            });
        }
        else if (arguments.length === 2) {
            const field = fieldOrConditions;
            const val = operatorOrValue;
            if (val === null) {
                orGroup.push({ field, operator: 'is', value: null });
            }
            else {
                orGroup.push({ field, operator: 'eq', value: val });
            }
        }
        else if (arguments.length === 3) {
            const field = fieldOrConditions;
            const operator = operatorOrValue;
            if (value === null && operator === 'eq') {
                orGroup.push({ field, operator: 'is', value: null });
            }
            else if (value === null && operator === 'ne') {
                orGroup.push({ field, operator: 'not', value: null });
            }
            else {
                orGroup.push({ field, operator: operator, value });
            }
        }
        if (orGroup.length > 0) {
            this.orFilters.push(orGroup);
        }
        return this;
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
        if (this.whereFilters.length === 1 &&
            this.whereFilters[0].field === 'id' &&
            this.whereFilters[0].operator === 'eq' &&
            !this.limitValue && !this.offsetValue && !this.orderByFields.length) {
            const id = this.whereFilters[0].value;
            try {
                const response = await this.httpClient.get(`/data/${this.tableName}/${id}`);
                return {
                    data: response.data ? [response.data] : [],
                    count: response.data ? 1 : 0,
                };
            }
            catch (error) {
                if (error.statusCode === 404) {
                    return {
                        data: [],
                        count: 0,
                    };
                }
                throw error;
            }
        }
        const response = await this.httpClient.get(`/data/${this.tableName}`, {
            params: this.buildQueryParams(options),
        });
        return {
            data: response.data || [],
            count: response.meta?.total,
        };
    }
    async findById(id) {
        try {
            const response = await this.httpClient.get(`/data/${this.tableName}/${id}`);
            return response.data || null;
        }
        catch (error) {
            if (error.statusCode === 404) {
                return null;
            }
            throw error;
        }
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
        const params = this.buildQueryParams(options);
        const response = await this.httpClient.delete(`/data/${this.tableName}`, {
            params: params,
        });
        return { count: response.data.count || response.data.deleted || 0 };
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
    async analyticsQuery(options) {
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
    get analytics() {
        if (!this._analytics) {
            this._analytics = new analytics_1.AnalyticsModule(this.httpClient, this.tableName);
        }
        return this._analytics;
    }
    buildQueryOptions() {
        const options = {
            select: this.selectFields,
            where: this.whereFilters,
            orderBy: this.orderByFields,
            limit: this.limitValue,
            offset: this.offsetValue,
            joins: this.joinClauses,
        };
        if (this.orFilters.length > 0) {
            options.or = this.orFilters;
        }
        return options;
    }
    buildQueryParams(options) {
        const params = {};
        if (options.select) {
            params.select = Array.isArray(options.select) ? options.select.join(',') : options.select;
        }
        if (options.where && options.where.length > 0) {
            options.where.forEach((filter, index) => {
                params[`where[${index}][field]`] = filter.field;
                params[`where[${index}][operator]`] = filter.operator;
                if (filter.value === null) {
                    params[`where[${index}][value]`] = null;
                }
                else if (filter.value === undefined) {
                    delete params[`where[${index}][value]`];
                }
                else if (Array.isArray(filter.value)) {
                    params[`where[${index}][value]`] = filter.value;
                }
                else {
                    params[`where[${index}][value]`] = filter.value;
                }
            });
        }
        if (options.or && options.or.length > 0) {
            params.or = JSON.stringify(options.or);
        }
        if (options.orderBy && options.orderBy.length > 0) {
            options.orderBy.forEach((order, index) => {
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
    clone() {
        const cloned = new QueryBuilder(this.httpClient, this.tableName);
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
exports.QueryBuilder = QueryBuilder;
//# sourceMappingURL=query-builder.js.map