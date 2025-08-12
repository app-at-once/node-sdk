"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeModule = void 0;
const socket_io_client_1 = require("socket.io-client");
const constants_1 = require("../constants");
class RealtimeModule {
    constructor(httpClient, apiKey) {
        this.socket = null;
        this.subscriptions = new Map();
        this.channels = new Map();
        this.presenceChannels = new Map();
        this.options = {};
        this.connectionState = 'disconnected';
        this.reconnectAttempts = 0;
        this.connectionListeners = [];
        this.errorListeners = [];
        this.httpClient = httpClient;
        this.apiKey = apiKey;
    }
    async connect(options = {}) {
        if (this.socket && this.socket.connected) {
            return;
        }
        this.options = {
            autoReconnect: true,
            maxReconnectAttempts: 5,
            reconnectDelay: 1000,
            timeout: 10000,
            debug: false,
            ...options,
        };
        const realtimeUrl = constants_1.APPATONCE_BASE_URL.replace('/api/v1', '');
        this.connectionState = 'connecting';
        this.log('Connecting to realtime server...');
        return new Promise((resolve, reject) => {
            try {
                this.socket = (0, socket_io_client_1.io)(realtimeUrl, {
                    path: '/socket.io/',
                    query: {
                        apiKey: this.apiKey,
                    },
                    timeout: this.options.timeout,
                    autoConnect: true,
                    reconnection: this.options.autoReconnect,
                    reconnectionAttempts: this.options.maxReconnectAttempts,
                    reconnectionDelay: this.options.reconnectDelay,
                    transports: ['websocket', 'polling'],
                    withCredentials: true,
                });
                this.setupEventHandlers();
                this.socket.on('connect', () => {
                    this.log('Socket.io connected, waiting for authentication...');
                });
                this.socket.on('connected', (data) => {
                    this.connectionState = 'connected';
                    this.reconnectAttempts = 0;
                    this.log('Connected to realtime server with auth:', data);
                    this.notifyConnectionChange(true);
                    resolve();
                });
                this.socket.on('connect_error', (error) => {
                    this.connectionState = 'disconnected';
                    this.log('Connection error:', error);
                    this.notifyError(error);
                    reject(error);
                });
                this.socket.on('error', (data) => {
                    this.connectionState = 'disconnected';
                    this.log('Authentication error:', data);
                    this.notifyError(new Error(data.message || 'Authentication failed'));
                    reject(new Error(data.message || 'Authentication failed'));
                });
                this.socket.on('disconnect', (reason) => {
                    this.connectionState = 'disconnected';
                    this.log('Disconnected from realtime server:', reason);
                    this.notifyConnectionChange(false);
                });
                this.socket.on('reconnect', (attemptNumber) => {
                    this.connectionState = 'connected';
                    this.reconnectAttempts = 0;
                    this.log(`Reconnected after ${attemptNumber} attempts`);
                    this.notifyConnectionChange(true);
                    this.resubscribeAll();
                });
                this.socket.on('reconnect_attempt', (attemptNumber) => {
                    this.connectionState = 'reconnecting';
                    this.reconnectAttempts = attemptNumber;
                    this.log(`Reconnection attempt ${attemptNumber}`);
                });
                this.socket.on('reconnect_error', (error) => {
                    this.log('Reconnection error:', error);
                    this.notifyError(error);
                });
                this.socket.on('reconnect_failed', () => {
                    this.connectionState = 'disconnected';
                    this.log('Reconnection failed after maximum attempts');
                    this.notifyError(new Error('Reconnection failed'));
                });
            }
            catch (error) {
                this.connectionState = 'disconnected';
                reject(error);
            }
        });
    }
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.connectionState = 'disconnected';
        this.subscriptions.clear();
        this.channels.clear();
        this.presenceChannels.clear();
        this.log('Disconnected from realtime server');
    }
    isConnected() {
        return this.socket?.connected || false;
    }
    getConnectionState() {
        return this.connectionState;
    }
    setupEventHandlers() {
        if (!this.socket)
            return;
        this.socket.on('database_change', (data) => {
            this.handleDatabaseChange(data);
        });
        this.socket.on('channel_message', (data) => {
            this.handleChannelMessage(data);
        });
        this.socket.on('presence_update', (data) => {
            this.handlePresenceUpdate(data);
        });
        this.socket.on('workflow_event', (data) => {
            this.handleWorkflowEvent(data);
        });
        this.socket.on('logic_event', (data) => {
            this.handleLogicEvent(data);
        });
        this.socket.on('analytics_update', (data) => {
            this.handleAnalyticsUpdate(data);
        });
        this.socket.on('error', (error) => {
            this.log('Socket error:', error);
            this.notifyError(error);
        });
        this.socket.on('subscription_confirmed', (data) => {
            this.log('Subscription confirmed:', data);
        });
        this.socket.on('subscription_error', (data) => {
            this.log('Subscription error:', data);
            this.notifyError(new Error(data.message || 'Subscription error'));
        });
    }
    handleDatabaseChange(data) {
        const subscriptionId = `database:${data.table}`;
        const subscription = this.subscriptions.get(subscriptionId);
        if (subscription) {
            try {
                subscription.callback(data);
            }
            catch (error) {
                this.log('Error in database change callback:', error);
                this.notifyError(error);
            }
        }
    }
    handleChannelMessage(data) {
        const channel = this.channels.get(data.channel);
        if (channel) {
            try {
                channel.callback(data.message);
            }
            catch (error) {
                this.log('Error in channel message callback:', error);
                this.notifyError(error);
            }
        }
    }
    handlePresenceUpdate(data) {
        const subscriptionId = `presence:${data.channel}`;
        const subscription = this.subscriptions.get(subscriptionId);
        if (subscription) {
            if (!this.presenceChannels.has(data.channel)) {
                this.presenceChannels.set(data.channel, new Map());
            }
            const presenceMap = this.presenceChannels.get(data.channel);
            const update = {
                joined: [],
                left: [],
                updated: [],
            };
            if (data.joined) {
                data.joined.forEach((user) => {
                    presenceMap.set(user.id, user);
                    update.joined.push(user);
                });
            }
            if (data.left) {
                data.left.forEach((userId) => {
                    const user = presenceMap.get(userId);
                    if (user) {
                        presenceMap.delete(userId);
                        update.left.push({ id: userId, left_at: new Date().toISOString() });
                    }
                });
            }
            if (data.updated) {
                data.updated.forEach((user) => {
                    presenceMap.set(user.id, user);
                    update.updated.push(user);
                });
            }
            try {
                subscription.callback(update);
            }
            catch (error) {
                this.log('Error in presence update callback:', error);
                this.notifyError(error);
            }
        }
    }
    handleWorkflowEvent(data) {
        const subscriptionId = `workflow:${data.workflow_id}`;
        const subscription = this.subscriptions.get(subscriptionId);
        if (subscription) {
            try {
                subscription.callback(data);
            }
            catch (error) {
                this.log('Error in workflow event callback:', error);
                this.notifyError(error);
            }
        }
    }
    handleLogicEvent(data) {
        const subscriptionId = `logic:${data.logic_name}`;
        const subscription = this.subscriptions.get(subscriptionId);
        if (subscription) {
            try {
                subscription.callback(data);
            }
            catch (error) {
                this.log('Error in logic event callback:', error);
                this.notifyError(error);
            }
        }
    }
    handleAnalyticsUpdate(data) {
        const subscriptionId = `analytics:${data.type}:${data.target_id}`;
        const subscription = this.subscriptions.get(subscriptionId);
        if (subscription) {
            try {
                subscription.callback(data);
            }
            catch (error) {
                this.log('Error in analytics update callback:', error);
                this.notifyError(error);
            }
        }
    }
    async subscribeToTable(tableName, callback, options = {}) {
        if (!this.ensureConnected()) {
            throw new Error('Not connected to realtime server');
        }
        const subscriptionId = `database:${tableName}`;
        if (this.subscriptions.has(subscriptionId)) {
            await this.unsubscribeFromTable(tableName);
        }
        const subscription = {
            id: subscriptionId,
            type: 'database',
            callback,
            active: true,
        };
        this.subscriptions.set(subscriptionId, subscription);
        this.socket.emit('subscribe_table', {
            table: tableName,
            events: options.events || ['INSERT', 'UPDATE', 'DELETE'],
            filter: options.filter,
            realtime: options.realtime !== false,
        });
        this.log(`Subscribed to table: ${tableName}`);
        return () => this.unsubscribeFromTable(tableName);
    }
    async unsubscribeFromTable(tableName) {
        const subscriptionId = `database:${tableName}`;
        if (this.subscriptions.has(subscriptionId)) {
            this.subscriptions.delete(subscriptionId);
            if (this.socket?.connected) {
                this.socket.emit('unsubscribe_table', { table: tableName });
            }
            this.log(`Unsubscribed from table: ${tableName}`);
        }
    }
    async subscribeToChannel(channelName, callback) {
        if (!this.ensureConnected()) {
            throw new Error('Not connected to realtime server');
        }
        if (this.channels.has(channelName)) {
            await this.unsubscribeFromChannel(channelName);
        }
        const channel = {
            name: channelName,
            callback,
            subscribers: 1,
        };
        this.channels.set(channelName, channel);
        this.socket.emit('subscribe_channel', { channel: channelName });
        this.log(`Subscribed to channel: ${channelName}`);
        return () => this.unsubscribeFromChannel(channelName);
    }
    async unsubscribeFromChannel(channelName) {
        if (this.channels.has(channelName)) {
            this.channels.delete(channelName);
            if (this.socket?.connected) {
                this.socket.emit('unsubscribe_channel', { channel: channelName });
            }
            this.log(`Unsubscribed from channel: ${channelName}`);
        }
    }
    async publishToChannel(channelName, message) {
        if (!this.ensureConnected()) {
            throw new Error('Not connected to realtime server');
        }
        this.socket.emit('publish_channel', {
            channel: channelName,
            message,
        });
        this.log(`Published to channel: ${channelName}`);
    }
    async joinPresence(channelName, userInfo, callback) {
        if (!this.ensureConnected()) {
            throw new Error('Not connected to realtime server');
        }
        const subscriptionId = `presence:${channelName}`;
        if (this.subscriptions.has(subscriptionId)) {
            await this.leavePresence(channelName);
        }
        const subscription = {
            id: subscriptionId,
            type: 'presence',
            callback,
            active: true,
        };
        this.subscriptions.set(subscriptionId, subscription);
        if (!this.presenceChannels.has(channelName)) {
            this.presenceChannels.set(channelName, new Map());
        }
        this.socket.emit('join_presence', {
            channel: channelName,
            user: userInfo,
        });
        this.log(`Joined presence channel: ${channelName}`);
        return () => this.leavePresence(channelName);
    }
    async leavePresence(channelName) {
        const subscriptionId = `presence:${channelName}`;
        if (this.subscriptions.has(subscriptionId)) {
            this.subscriptions.delete(subscriptionId);
            if (this.socket?.connected) {
                this.socket.emit('leave_presence', { channel: channelName });
            }
            this.presenceChannels.delete(channelName);
            this.log(`Left presence channel: ${channelName}`);
        }
    }
    async updatePresence(channelName, userInfo) {
        if (!this.ensureConnected()) {
            throw new Error('Not connected to realtime server');
        }
        this.socket.emit('update_presence', {
            channel: channelName,
            user: userInfo,
        });
        this.log(`Updated presence in channel: ${channelName}`);
    }
    async getPresence(channelName) {
        if (!this.ensureConnected()) {
            throw new Error('Not connected to realtime server');
        }
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Presence request timeout'));
            }, 5000);
            this.socket.emit('get_presence', { channel: channelName }, (response) => {
                clearTimeout(timeout);
                if (response.error) {
                    reject(new Error(response.error));
                }
                else {
                    resolve(response.users || []);
                }
            });
        });
    }
    async subscribeToWorkflow(workflowId, callback) {
        if (!this.ensureConnected()) {
            throw new Error('Not connected to realtime server');
        }
        const subscriptionId = `workflow:${workflowId}`;
        if (this.subscriptions.has(subscriptionId)) {
            await this.unsubscribeFromWorkflow(workflowId);
        }
        const subscription = {
            id: subscriptionId,
            type: 'workflow',
            callback,
            active: true,
        };
        this.subscriptions.set(subscriptionId, subscription);
        this.socket.emit('subscribe_workflow', { workflow_id: workflowId });
        this.log(`Subscribed to workflow: ${workflowId}`);
        return () => this.unsubscribeFromWorkflow(workflowId);
    }
    async unsubscribeFromWorkflow(workflowId) {
        const subscriptionId = `workflow:${workflowId}`;
        if (this.subscriptions.has(subscriptionId)) {
            this.subscriptions.delete(subscriptionId);
            if (this.socket?.connected) {
                this.socket.emit('unsubscribe_workflow', { workflow_id: workflowId });
            }
            this.log(`Unsubscribed from workflow: ${workflowId}`);
        }
    }
    async subscribeToLogic(logicName, callback) {
        if (!this.ensureConnected()) {
            throw new Error('Not connected to realtime server');
        }
        const subscriptionId = `logic:${logicName}`;
        if (this.subscriptions.has(subscriptionId)) {
            await this.unsubscribeFromLogic(logicName);
        }
        const subscription = {
            id: subscriptionId,
            type: 'logic',
            callback,
            active: true,
        };
        this.subscriptions.set(subscriptionId, subscription);
        this.socket.emit('subscribe_logic', { logic_name: logicName });
        this.log(`Subscribed to logic: ${logicName}`);
        return () => this.unsubscribeFromLogic(logicName);
    }
    async unsubscribeFromLogic(logicName) {
        const subscriptionId = `logic:${logicName}`;
        if (this.subscriptions.has(subscriptionId)) {
            this.subscriptions.delete(subscriptionId);
            if (this.socket?.connected) {
                this.socket.emit('unsubscribe_logic', { logic_name: logicName });
            }
            this.log(`Unsubscribed from logic: ${logicName}`);
        }
    }
    async subscribeToAnalytics(type, targetId, callback, options = {}) {
        if (!this.ensureConnected()) {
            throw new Error('Not connected to realtime server');
        }
        const subscriptionId = `analytics:${type}:${targetId}`;
        if (this.subscriptions.has(subscriptionId)) {
            await this.unsubscribeFromAnalytics(type, targetId);
        }
        const subscription = {
            id: subscriptionId,
            type: 'analytics',
            callback,
            active: true,
        };
        this.subscriptions.set(subscriptionId, subscription);
        this.socket.emit('subscribe_analytics', {
            type,
            target_id: targetId,
            interval: options.interval || 30,
            metrics: options.metrics,
        });
        this.log(`Subscribed to analytics: ${type}:${targetId}`);
        return () => this.unsubscribeFromAnalytics(type, targetId);
    }
    async unsubscribeFromAnalytics(type, targetId) {
        const subscriptionId = `analytics:${type}:${targetId}`;
        if (this.subscriptions.has(subscriptionId)) {
            this.subscriptions.delete(subscriptionId);
            if (this.socket?.connected) {
                this.socket.emit('unsubscribe_analytics', {
                    type,
                    target_id: targetId,
                });
            }
            this.log(`Unsubscribed from analytics: ${type}:${targetId}`);
        }
    }
    getActiveSubscriptions() {
        return Array.from(this.subscriptions.values()).map(sub => ({
            id: sub.id,
            type: sub.type,
            active: sub.active,
        }));
    }
    getActiveChannels() {
        return Array.from(this.channels.values()).map(channel => ({
            name: channel.name,
            subscribers: channel.subscribers,
        }));
    }
    unsubscribeAll() {
        for (const [id, subscription] of this.subscriptions) {
            if (subscription.type === 'database') {
                const tableName = id.replace('database:', '');
                this.unsubscribeFromTable(tableName);
            }
            else if (subscription.type === 'workflow') {
                const workflowId = id.replace('workflow:', '');
                this.unsubscribeFromWorkflow(workflowId);
            }
            else if (subscription.type === 'logic') {
                const logicName = id.replace('logic:', '');
                this.unsubscribeFromLogic(logicName);
            }
            else if (subscription.type === 'presence') {
                const channelName = id.replace('presence:', '');
                this.leavePresence(channelName);
            }
            else if (subscription.type === 'analytics') {
                const parts = id.split(':');
                if (parts.length >= 3) {
                    this.unsubscribeFromAnalytics(parts[1], parts[2]);
                }
            }
        }
        for (const channelName of this.channels.keys()) {
            this.unsubscribeFromChannel(channelName);
        }
        this.log('Unsubscribed from all subscriptions');
    }
    getConnectionStatus() {
        return {
            connected: this.isConnected(),
            state: this.connectionState,
            reconnectAttempts: this.reconnectAttempts,
            maxReconnectAttempts: this.options.maxReconnectAttempts || 5,
            subscriptionCount: this.subscriptions.size,
            channelCount: this.channels.size,
            presenceChannelCount: this.presenceChannels.size,
        };
    }
    onConnectionStateChange(callback) {
        this.connectionListeners.push(callback);
        return () => {
            const index = this.connectionListeners.indexOf(callback);
            if (index > -1) {
                this.connectionListeners.splice(index, 1);
            }
        };
    }
    onError(callback) {
        this.errorListeners.push(callback);
        return () => {
            const index = this.errorListeners.indexOf(callback);
            if (index > -1) {
                this.errorListeners.splice(index, 1);
            }
        };
    }
    ensureConnected() {
        if (!this.socket || !this.socket.connected) {
            return false;
        }
        return true;
    }
    async resubscribeAll() {
        this.log('Resubscribing to all subscriptions...');
        for (const [id, subscription] of this.subscriptions) {
            if (!subscription.active)
                continue;
            try {
                if (subscription.type === 'database') {
                    const tableName = id.replace('database:', '');
                    this.socket.emit('subscribe_table', {
                        table: tableName,
                        events: ['INSERT', 'UPDATE', 'DELETE'],
                    });
                }
                else if (subscription.type === 'workflow') {
                    const workflowId = id.replace('workflow:', '');
                    this.socket.emit('subscribe_workflow', { workflow_id: workflowId });
                }
                else if (subscription.type === 'logic') {
                    const logicName = id.replace('logic:', '');
                    this.socket.emit('subscribe_logic', { logic_name: logicName });
                }
                else if (subscription.type === 'presence') {
                    const channelName = id.replace('presence:', '');
                    this.socket.emit('join_presence', { channel: channelName });
                }
                else if (subscription.type === 'analytics') {
                    const parts = id.split(':');
                    if (parts.length >= 3) {
                        this.socket.emit('subscribe_analytics', {
                            type: parts[1],
                            target_id: parts[2],
                        });
                    }
                }
            }
            catch (error) {
                this.log(`Error resubscribing to ${id}:`, error);
            }
        }
        for (const channelName of this.channels.keys()) {
            try {
                this.socket.emit('subscribe_channel', { channel: channelName });
            }
            catch (error) {
                this.log(`Error resubscribing to channel ${channelName}:`, error);
            }
        }
        this.log('Resubscription completed');
    }
    notifyConnectionChange(connected) {
        this.connectionListeners.forEach(callback => {
            try {
                callback(connected);
            }
            catch (error) {
                this.log('Error in connection state callback:', error);
            }
        });
    }
    notifyError(error) {
        this.errorListeners.forEach(callback => {
            try {
                callback(error);
            }
            catch (callbackError) {
                this.log('Error in error callback:', callbackError);
            }
        });
    }
    log(message, ...args) {
        if (this.options.debug) {
            console.log(`[AppAtOnce Realtime] ${message}`, ...args);
        }
    }
}
exports.RealtimeModule = RealtimeModule;
//# sourceMappingURL=realtime.js.map