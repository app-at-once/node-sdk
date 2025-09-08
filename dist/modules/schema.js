"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaModule = void 0;
class SchemaModule {
    constructor(httpClient, realtime) {
        this.httpClient = httpClient;
        this.realtime = realtime;
    }
    async createTable(tableSchema) {
        const response = await this.httpClient.post('/schema/tables', tableSchema);
        return response.data;
    }
    async updateTable(tableName, updates) {
        const response = await this.httpClient.patch(`/schema/tables/${tableName}`, updates);
        return response.data;
    }
    async getTable(tableName) {
        const response = await this.httpClient.get(`/schema/tables/${tableName}`);
        const result = response.data;
        if (result.schema && result.schema.columns && !result.columns) {
            result.columns = result.schema.columns;
        }
        return result;
    }
    async listTables(options) {
        const response = await this.httpClient.get('/schema/tables', {
            params: options,
        });
        return response.data;
    }
    async deleteTable(tableName, options) {
        const response = await this.httpClient.delete(`/schema/tables/${tableName}`, {
            data: options,
        });
        return response.data;
    }
    async renameTable(tableName, newName) {
        const response = await this.httpClient.post(`/schema/tables/${tableName}/rename`, {
            new_name: newName,
        });
        return response.data;
    }
    async copyTable(sourceTable, targetTable, options) {
        const response = await this.httpClient.post(`/schema/tables/${sourceTable}/copy`, {
            target_table: targetTable,
            ...options,
        });
        return response.data;
    }
    async addColumn(tableName, column) {
        const response = await this.httpClient.post(`/schema/tables/${tableName}/columns`, column);
        return response.data;
    }
    async updateColumn(tableName, columnName, updates) {
        const response = await this.httpClient.patch(`/schema/tables/${tableName}/columns/${columnName}`, updates);
        return response.data;
    }
    async dropColumn(tableName, columnName) {
        const response = await this.httpClient.delete(`/schema/tables/${tableName}/columns/${columnName}`);
        return response.data;
    }
    async renameColumn(tableName, columnName, newName) {
        const response = await this.httpClient.post(`/schema/tables/${tableName}/columns/${columnName}/rename`, {
            new_name: newName,
        });
        return response.data;
    }
    async createIndex(tableName, index) {
        const response = await this.httpClient.post(`/schema/tables/${tableName}/indexes`, index);
        return response.data;
    }
    async dropIndex(tableName, indexName) {
        const response = await this.httpClient.delete(`/schema/tables/${tableName}/indexes/${indexName}`);
        return response.data;
    }
    async listIndexes(tableName) {
        const response = await this.httpClient.get(`/schema/tables/${tableName}/indexes`);
        return response.data;
    }
    async addConstraint(tableName, constraint) {
        const response = await this.httpClient.post(`/schema/tables/${tableName}/constraints`, constraint);
        return response.data;
    }
    async dropConstraint(tableName, constraintName) {
        const response = await this.httpClient.delete(`/schema/tables/${tableName}/constraints/${constraintName}`);
        return response.data;
    }
    async listConstraints(tableName) {
        const response = await this.httpClient.get(`/schema/tables/${tableName}/constraints`);
        return response.data;
    }
    async createTrigger(tableName, trigger) {
        const response = await this.httpClient.post(`/schema/tables/${tableName}/triggers`, trigger);
        return response.data;
    }
    async updateTrigger(tableName, triggerName, updates) {
        const response = await this.httpClient.patch(`/schema/tables/${tableName}/triggers/${triggerName}`, updates);
        return response.data;
    }
    async deleteTrigger(tableName, triggerName) {
        const response = await this.httpClient.delete(`/schema/tables/${tableName}/triggers/${triggerName}`);
        return response.data;
    }
    async enableTrigger(tableName, triggerName) {
        await this.httpClient.post(`/schema/tables/${tableName}/triggers/${triggerName}/enable`);
    }
    async disableTrigger(tableName, triggerName) {
        await this.httpClient.post(`/schema/tables/${tableName}/triggers/${triggerName}/disable`);
    }
    async listTriggers(tableName) {
        const response = await this.httpClient.get(`/schema/tables/${tableName}/triggers`);
        return response.data;
    }
    async analyzeTable(tableName) {
        const response = await this.httpClient.get(`/schema/tables/${tableName}/analyze`);
        return response.data;
    }
    async optimizeTable(tableName, options) {
        const response = await this.httpClient.post(`/schema/tables/${tableName}/optimize`, options);
        return response.data;
    }
    async suggestIndexes(tableName, options) {
        const response = await this.httpClient.get(`/schema/tables/${tableName}/suggest-indexes`, {
            params: options,
        });
        return response.data;
    }
    async createMigration(migration) {
        const response = await this.httpClient.post('/schema/migrations', migration);
        return response.data;
    }
    async runMigration(migrationId, options) {
        const response = await this.httpClient.post(`/schema/migrations/${migrationId}/run`, options);
        return response.data;
    }
    async rollbackMigration(migrationId) {
        const response = await this.httpClient.post(`/schema/migrations/${migrationId}/rollback`);
        return response.data;
    }
    async listMigrations() {
        const response = await this.httpClient.get('/schema/migrations');
        return response.data;
    }
    async getMigrationStatus() {
        const response = await this.httpClient.get('/schema/migrations/status');
        return response.data;
    }
    async compareSchemas(source, target) {
        const response = await this.httpClient.post('/schema/compare', {
            source,
            target,
        });
        return response.data;
    }
    async generateMigrationFromDiff(source, target, migrationName) {
        const response = await this.httpClient.post('/schema/generate-migration', {
            source,
            target,
            migration_name: migrationName,
        });
        return response.data;
    }
    async backupSchema(options) {
        const response = await this.httpClient.post('/schema/backup', options);
        return response.data;
    }
    async restoreSchema(backupId, options) {
        const response = await this.httpClient.post(`/schema/restore/${backupId}`, options);
        return response.data;
    }
    async listSchemaBackups() {
        const response = await this.httpClient.get('/schema/backups');
        return response.data;
    }
    async deleteSchemaBackup(backupId) {
        await this.httpClient.delete(`/schema/backups/${backupId}`);
    }
    async generateDocumentation(options) {
        const response = await this.httpClient.post('/schema/documentation', options);
        return response.data;
    }
    async generateERDiagram(options) {
        const response = await this.httpClient.post('/schema/er-diagram', options);
        return response.data;
    }
    async getTableCreationStatus(jobId) {
        const response = await this.httpClient.get(`/schema/tables/jobs/${jobId}`);
        return response.data;
    }
    async dropTable(tableName, options) {
        return this.deleteTable(tableName, options);
    }
    async migrate(schema, options) {
        const migrationId = `migration-${Date.now()}`;
        const endpoint = options?.dryRun ? '/schema/preview' : '/schema/migrate';
        if (options?.onProgress && this.realtime) {
            if (!this.realtime.isConnected()) {
                await this.realtime.connect();
            }
            const socket = this.realtime.socket;
            if (socket) {
                socket.emit('join_room', { room: `migration:${migrationId}` });
                const progressHandler = (data) => {
                    if (data.migrationId === migrationId && options.onProgress) {
                        options.onProgress(data);
                        if (data.type === 'complete' || data.type === 'error') {
                            socket.off('migration_progress', progressHandler);
                            socket.emit('leave_room', { room: `migration:${migrationId}` });
                        }
                    }
                };
                socket.on('migration_progress', progressHandler);
            }
        }
        const response = await this.httpClient.post(endpoint, {
            schema,
            migrationId,
            dryRun: options?.dryRun,
            force: options?.force,
            dropTables: options?.dropTables,
            dev: options?.dev
        });
        return response.data;
    }
    async generateMigrationPlan(schema) {
        const response = await this.httpClient.post('/schema/migrate/plan', {
            schema
        });
        return response.data;
    }
    async syncSchema(schema, options) {
        const migrationId = `migration-${Date.now()}`;
        if (options?.onProgress && this.realtime) {
            if (!this.realtime.isConnected()) {
                await this.realtime.connect();
            }
            const socket = this.realtime.socket;
            if (socket) {
                socket.emit('join_room', { room: `migration:${migrationId}` });
                const progressHandler = (data) => {
                    if (data.migrationId === migrationId && options.onProgress) {
                        options.onProgress(data);
                        if (data.type === 'complete' || data.type === 'error') {
                            socket.off('migration_progress', progressHandler);
                            socket.emit('leave_room', { room: `migration:${migrationId}` });
                        }
                    }
                };
                socket.on('migration_progress', progressHandler);
            }
        }
        const response = await this.httpClient.post('/schema/sync', {
            schema,
            migrationId,
            dryRun: options?.dryRun
        });
        return response.data;
    }
    async getCurrentSchema(options) {
        const response = await this.httpClient.get('/schema/current', {
            params: options
        });
        return response.data;
    }
    async validateSchema(schema) {
        const response = await this.httpClient.post('/schema/validate', {
            schema
        });
        return response.data;
    }
}
exports.SchemaModule = SchemaModule;
//# sourceMappingURL=schema.js.map