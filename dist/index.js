"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppAtOnceClient = void 0;
const http_client_1 = require("./core/http-client");
const query_builder_1 = require("./core/query-builder");
const auth_1 = require("./modules/auth");
const logic_1 = require("./modules/logic");
const ai_1 = require("./modules/ai");
const storage_1 = require("./modules/storage");
const email_1 = require("./modules/email");
const push_1 = require("./modules/push");
const realtime_1 = require("./modules/realtime");
const workflow_1 = require("./modules/workflow");
const n8n_workflow_1 = require("./modules/n8n-workflow");
const schema_1 = require("./modules/schema");
const triggers_1 = require("./modules/triggers");
const payment_1 = require("./modules/payment");
const image_processing_1 = require("./modules/image-processing");
const pdf_1 = require("./modules/pdf");
const ocr_1 = require("./modules/ocr");
const document_conversion_1 = require("./modules/document-conversion");
const project_oauth_1 = require("./project-oauth");
class AppAtOnceClient {
    constructor(config) {
        this.httpClient = new http_client_1.HttpClient(config);
        this.auth = new auth_1.AuthModule(this.httpClient);
        this.logic = new logic_1.LogicModule(this.httpClient);
        this.ai = new ai_1.AIModule(this.httpClient);
        this.storage = new storage_1.StorageModule(this.httpClient);
        this.email = new email_1.EmailModule(this.httpClient);
        this.push = new push_1.PushModule(this.httpClient);
        this.realtime = new realtime_1.RealtimeModule(this.httpClient);
        this.workflow = new workflow_1.WorkflowModule(this.httpClient);
        this.n8nWorkflow = new n8n_workflow_1.N8nWorkflowModule(this.httpClient);
        this.schema = new schema_1.SchemaModule(this.httpClient);
        this.triggers = new triggers_1.TriggersModule(this.httpClient);
        this.payment = new payment_1.PaymentModule(this.httpClient);
        this.imageProcessing = new image_processing_1.ImageProcessingModule(this.httpClient);
        this.pdf = new pdf_1.PDFModule(this.httpClient);
        this.ocr = new ocr_1.OCRModule(this.httpClient);
        this.documentConversion = new document_conversion_1.DocumentConversionModule(this.httpClient);
        this.projectOAuth = new project_oauth_1.ProjectOAuthModule(this.httpClient);
    }
    table(tableName) {
        return new query_builder_1.QueryBuilder(this.httpClient, tableName);
    }
    async select(tableName) {
        const result = await this.table(tableName).execute();
        return result.data;
    }
    async insert(tableName, data) {
        return await this.table(tableName).insert(data);
    }
    async update(tableName, where, data) {
        let query = this.table(tableName);
        Object.entries(where).forEach(([field, value]) => {
            query = query.eq(field, value);
        });
        return await query.update(data);
    }
    async delete(tableName, where) {
        let query = this.table(tableName);
        Object.entries(where).forEach(([field, value]) => {
            query = query.eq(field, value);
        });
        return await query.delete();
    }
    async count(tableName, where) {
        let query = this.table(tableName);
        if (where) {
            Object.entries(where).forEach(([field, value]) => {
                query = query.eq(field, value);
            });
        }
        return await query.count();
    }
    async ping() {
        const response = await this.httpClient.get('/health');
        return response.data;
    }
    updateApiKey(apiKey) {
        this.httpClient.updateApiKey(apiKey);
    }
    getConfig() {
        return this.httpClient.getConfig();
    }
    async batch(operations) {
        const response = await this.httpClient.post('/batch', { operations });
        return response.data.results || [];
    }
    async transaction(callback) {
        const response = await this.httpClient.post('/transactions/begin');
        const transactionId = response.data.transaction_id;
        try {
            const txClient = new AppAtOnceClient({
                ...this.getConfig(),
                headers: {
                    'X-Transaction-ID': transactionId,
                },
            });
            const result = await callback(txClient);
            await this.httpClient.post(`/transactions/${transactionId}/commit`);
            return result;
        }
        catch (error) {
            await this.httpClient.post(`/transactions/${transactionId}/rollback`);
            throw error;
        }
    }
    onConnectionChange(callback) {
        return this.realtime.onConnectionStateChange(callback);
    }
    onError(callback) {
        return this.realtime.onError(callback);
    }
    async disconnect() {
        if (this.realtime.isConnected()) {
            this.realtime.disconnect();
        }
    }
}
exports.AppAtOnceClient = AppAtOnceClient;
(function (AppAtOnceClient) {
    function create(config) {
        return new AppAtOnceClient(config);
    }
    AppAtOnceClient.create = create;
    function createWithApiKey(apiKey, baseUrl) {
        return new AppAtOnceClient({
            apiKey,
            baseUrl: baseUrl || 'https://api.appatonce.com',
        });
    }
    AppAtOnceClient.createWithApiKey = createWithApiKey;
    function createWithCredentials(email, password, baseUrl) {
        const client = new AppAtOnceClient({
            apiKey: '',
            baseUrl: baseUrl || 'https://api.appatonce.com',
        });
        return client.auth.signIn({ email, password }).then((session) => {
            client.updateApiKey(session.access_token);
            return client;
        });
    }
    AppAtOnceClient.createWithCredentials = createWithCredentials;
    function createForProject(projectId, apiKey, baseUrl) {
        return new AppAtOnceClient({
            apiKey,
            projectId,
            baseUrl: baseUrl || 'https://api.appatonce.com',
        });
    }
    AppAtOnceClient.createForProject = createForProject;
    function createForApp(appId, apiKey, baseUrl) {
        return new AppAtOnceClient({
            apiKey,
            appId,
            baseUrl: baseUrl || 'https://api.appatonce.com',
        });
    }
    AppAtOnceClient.createForApp = createForApp;
})(AppAtOnceClient || (exports.AppAtOnceClient = AppAtOnceClient = {}));
__exportStar(require("./types"), exports);
__exportStar(require("./core/query-builder"), exports);
__exportStar(require("./core/http-client"), exports);
__exportStar(require("./modules/auth"), exports);
__exportStar(require("./modules/logic"), exports);
__exportStar(require("./modules/ai"), exports);
__exportStar(require("./modules/storage"), exports);
__exportStar(require("./modules/email"), exports);
__exportStar(require("./modules/push"), exports);
__exportStar(require("./modules/realtime"), exports);
__exportStar(require("./modules/workflow"), exports);
__exportStar(require("./modules/n8n-workflow"), exports);
__exportStar(require("./modules/schema"), exports);
__exportStar(require("./modules/triggers"), exports);
__exportStar(require("./modules/payment"), exports);
__exportStar(require("./modules/image-processing"), exports);
__exportStar(require("./modules/pdf"), exports);
__exportStar(require("./modules/ocr"), exports);
__exportStar(require("./modules/document-conversion"), exports);
__exportStar(require("./auth/oauth"), exports);
__exportStar(require("./project-oauth"), exports);
__exportStar(require("./types/project-oauth"), exports);
exports.default = AppAtOnceClient;
//# sourceMappingURL=index.js.map