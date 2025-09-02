"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdgeFunctions = void 0;
class EdgeFunctions {
    constructor(httpClient) {
        this.basePath = '/edge-functions';
        this.client = httpClient;
    }
    async create(config) {
        return this.client.post(this.basePath, config);
    }
    async list(filters) {
        const response = await this.client.get(this.basePath, { params: filters });
        return response.data || [];
    }
    async get(id) {
        const response = await this.client.get(`${this.basePath}/${id}`);
        return response.data;
    }
    async update(id, updates) {
        const response = await this.client.put(`${this.basePath}/${id}`, updates);
        return response.data;
    }
    async delete(id) {
        await this.client.delete(`${this.basePath}/${id}`);
    }
    async deploy(id, options) {
        const response = await this.client.post(`${this.basePath}/${id}/deploy`, options);
        return response.data;
    }
    async rollback(id, deploymentId) {
        const response = await this.client.post(`${this.basePath}/${id}/rollback/${deploymentId}`);
        return response.data;
    }
    async execute(id, params) {
        const response = await this.client.post(`${this.basePath}/${id}/execute`, params || {});
        return response.data;
    }
    async getLogs(id, options) {
        const params = {};
        if (options) {
            if (options.level)
                params.level = options.level;
            if (options.limit)
                params.limit = options.limit;
            if (options.startTime)
                params.startTime = options.startTime.toISOString();
            if (options.endTime)
                params.endTime = options.endTime.toISOString();
        }
        const response = await this.client.get(`${this.basePath}/${id}/logs`, { params });
        return response.data || [];
    }
    async getMetrics(id, period) {
        const response = await this.client.get(`${this.basePath}/${id}/metrics`, { params: { period: period || '24h' } });
        return response.data;
    }
    async getDeployments(id, limit) {
        const response = await this.client.get(`${this.basePath}/${id}/deployments`, { params: { limit: limit || 20 } });
        return response.data || [];
    }
    async getVersions(id, limit) {
        const response = await this.client.get(`${this.basePath}/${id}/versions`, { params: { limit: limit || 20 } });
        return response.data || [];
    }
    async restoreVersion(id, versionNumber) {
        const response = await this.client.post(`${this.basePath}/${id}/versions/${versionNumber}/restore`);
        return response.data;
    }
    async getTemplates(filters) {
        const response = await this.client.get(`${this.basePath}/templates`, { params: filters });
        return response.data || [];
    }
    async createFromTemplate(templateName, config) {
        const response = await this.client.post(`${this.basePath}/from-template`, {
            templateName,
            ...config,
        });
        return response.data;
    }
    async validateCode(code, runtime) {
        const response = await this.client.post(`${this.basePath}/validate`, { code, runtime });
        return response.data;
    }
    async streamLogs(id, onLog) {
        console.warn('Real-time log streaming not yet implemented');
        return () => { };
    }
    static createHttpHandler(handler) {
        return `
export default {
  async fetch(request, env, ctx) {
    const handler = ${handler.toString()};
    return handler(request);
  },
};`;
    }
    static createCronHandler(schedule, handler) {
        return {
            name: 'cron-job',
            runtime: 'javascript',
            code: `
export default {
  async scheduled(event, env, ctx) {
    const handler = ${handler.toString()};
    await handler();
  },
};`,
            triggers: [{
                    type: 'cron',
                    config: { schedule },
                }],
        };
    }
    static createWebhookHandler(handler) {
        return `
export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    
    const payload = await request.json();
    const handler = ${handler.toString()};
    const result = await handler(payload);
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};`;
    }
}
exports.EdgeFunctions = EdgeFunctions;
//# sourceMappingURL=edge-functions.js.map