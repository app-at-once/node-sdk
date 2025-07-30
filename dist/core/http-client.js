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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const axios_1 = __importDefault(require("axios"));
class HttpClient {
    constructor(config) {
        this.config = config;
        const baseUrl = config.baseUrl || 'https://api.appatonce.com';
        const normalizedBaseUrl = baseUrl.endsWith('/api/v1')
            ? baseUrl
            : baseUrl.endsWith('/')
                ? `${baseUrl}api/v1`
                : `${baseUrl}/api/v1`;
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': config.apiKey,
        };
        if (config.projectId) {
            headers['x-project-id'] = config.projectId;
        }
        if (config.appId) {
            headers['x-app-id'] = config.appId;
        }
        this.client = axios_1.default.create({
            baseURL: normalizedBaseUrl,
            timeout: config.timeout || 30000,
            headers,
        });
        this.setupInterceptors();
    }
    setupInterceptors() {
        this.client.interceptors.request.use((config) => {
            if (this.config.debug) {
                console.log(`[AppAtOnce SDK] ${config.method?.toUpperCase()} ${config.url}`);
            }
            if (this.config.debug) {
                console.log(`[AppAtOnce SDK Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
                if (config.data) {
                    console.log('[AppAtOnce SDK Request Body]:', JSON.stringify(config.data, null, 2));
                }
            }
            return config;
        }, (error) => {
            return Promise.reject(this.handleError(error));
        });
        this.client.interceptors.response.use((response) => {
            if (this.config.debug) {
                console.log(`[AppAtOnce SDK] Response:`, response.data);
            }
            return response;
        }, (error) => {
            return Promise.reject(this.handleError(error));
        });
    }
    handleError(error) {
        const appError = new Error();
        if (error.response) {
            const { status, data } = error.response;
            let errorMessage = data?.message || data?.error || 'Request failed';
            if (typeof data === 'string') {
                errorMessage = data;
            }
            if (data?.data?.message) {
                errorMessage = data.data.message;
            }
            appError.message = errorMessage;
            if (data?.stack) {
                console.error('Server error stack:', data.stack);
            }
            if (this.config.debug || status === 500) {
                console.error('Full error response:', {
                    status,
                    data,
                    headers: error.response.headers
                });
            }
            appError.code = data?.code || `HTTP_${status}`;
            appError.statusCode = status;
            appError.details = data?.details || data;
        }
        else if (error.request) {
            appError.message = 'Network error - no response received';
            appError.code = 'NETWORK_ERROR';
        }
        else {
            appError.message = error.message || 'Unknown error';
            appError.code = 'UNKNOWN_ERROR';
        }
        return appError;
    }
    async get(url, config) {
        const response = await this.client.get(url, config);
        return this.formatResponse(response);
    }
    async post(url, data, config) {
        const response = await this.client.post(url, data, config);
        return this.formatResponse(response);
    }
    async put(url, data, config) {
        const response = await this.client.put(url, data, config);
        return this.formatResponse(response);
    }
    async patch(url, data, config) {
        const response = await this.client.patch(url, data, config);
        return this.formatResponse(response);
    }
    async delete(url, config) {
        const response = await this.client.delete(url, config);
        return this.formatResponse(response);
    }
    formatResponse(response) {
        return {
            data: response.data,
            meta: {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
            },
        };
    }
    async uploadFile(url, file, filename, options) {
        const { default: FormData } = await Promise.resolve().then(() => __importStar(require('form-data')));
        const formData = new FormData();
        formData.append('file', file, filename);
        if (options) {
            Object.keys(options).forEach(key => {
                formData.append(key, typeof options[key] === 'object' ? JSON.stringify(options[key]) : options[key]);
            });
        }
        const response = await this.client.post(url, formData, {
            headers: {
                ...formData.getHeaders(),
                'x-api-key': this.config.apiKey,
            },
        });
        return this.formatResponse(response);
    }
    updateApiKey(apiKey) {
        this.config.apiKey = apiKey;
        this.client.defaults.headers.common['x-api-key'] = apiKey;
    }
    getConfig() {
        return { ...this.config };
    }
}
exports.HttpClient = HttpClient;
//# sourceMappingURL=http-client.js.map