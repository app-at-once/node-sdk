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
const constants_1 = require("../constants");
class HttpClient {
    constructor(apiKey, timeout) {
        this.debug = process.env.DEBUG === 'true' || process.env.APPATONCE_DEBUG === 'true';
        this.apiKey = apiKey;
        this.timeout = timeout || 120000;
        const baseUrl = constants_1.APPATONCE_BASE_URL;
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
        };
        this.client = axios_1.default.create({
            baseURL: baseUrl,
            timeout: this.timeout,
            headers,
            paramsSerializer: (params) => {
                return this.serializeParams(params);
            }
        });
        this.setupInterceptors();
    }
    serializeParams(params) {
        const parts = [];
        const hasIndexedFormat = Object.keys(params || {}).some(key => /\[\d+\]\[/.test(key));
        if (hasIndexedFormat) {
            Object.keys(params).forEach(key => {
                const value = params[key];
                if (value !== null && value !== undefined) {
                    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
                }
            });
        }
        else {
            const encode = (key, value) => {
                if (value === null || value === undefined) {
                    return;
                }
                if (typeof key === 'string' && key.includes('[') && key.includes(']')) {
                    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
                }
                else if (Array.isArray(value)) {
                    value.forEach((item, index) => {
                        if (typeof item === 'object' && item !== null) {
                            Object.keys(item).forEach(prop => {
                                const encodedKey = `${key}[${index}][${prop}]`;
                                if (item[prop] !== null && item[prop] !== undefined) {
                                    parts.push(`${encodeURIComponent(encodedKey)}=${encodeURIComponent(item[prop])}`);
                                }
                            });
                        }
                        else {
                            parts.push(`${encodeURIComponent(`${key}[${index}]`)}=${encodeURIComponent(item)}`);
                        }
                    });
                }
                else if (typeof value === 'object') {
                    Object.keys(value).forEach((k) => {
                        encode(`${key}[${k}]`, value[k]);
                    });
                }
                else {
                    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
                }
            };
            Object.keys(params || {}).forEach((key) => {
                encode(key, params[key]);
            });
        }
        const serialized = parts.join('&');
        if (this.debug) {
            console.log('[HttpClient] Serialized params:', serialized);
            console.log('[HttpClient] Original params:', JSON.stringify(params, null, 2));
        }
        return serialized;
    }
    setupInterceptors() {
        this.client.interceptors.request.use((config) => {
            console.log(`[SDK HTTP] ${config.method?.toUpperCase()} ${config.url}`);
            console.log('[SDK HTTP] Headers:', config.headers);
            if (config.params) {
                console.log('[SDK HTTP] Query params object:', JSON.stringify(config.params, null, 2));
                if (config.paramsSerializer && typeof config.paramsSerializer === 'function') {
                    const serialized = config.paramsSerializer(config.params);
                    console.log('[SDK HTTP] Serialized query string:', serialized);
                }
            }
            if (config.data) {
                console.log('[SDK HTTP] Body present, size:', JSON.stringify(config.data).length);
            }
            else {
                console.log('[SDK HTTP] No body data');
            }
            if (this.debug) {
                console.log(`[AppAtOnce SDK] ${config.method?.toUpperCase()} ${config.url}`);
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
            if (this.debug) {
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
            if (this.debug || status === 500) {
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
                'x-api-key': this.apiKey,
            },
        });
        return this.formatResponse(response);
    }
    async uploadFileFromBrowser(url, file, options) {
        console.log('uploadFileFromBrowser called with:', { url, fileName: file.name, fileType: file.type, fileSize: file.size, options });
        const formData = new FormData();
        formData.append('file', file);
        console.log('FormData file appended');
        if (options) {
            Object.keys(options).forEach(key => {
                if (options[key] !== undefined) {
                    formData.append(key, typeof options[key] === 'object' ? JSON.stringify(options[key]) : options[key]);
                    console.log(`FormData appended: ${key} = ${typeof options[key] === 'object' ? JSON.stringify(options[key]) : options[key]}`);
                }
            });
        }
        console.log('FormData created with file:', file.name, 'size:', file.size);
        console.log('Sending request to:', url);
        console.log('API Key being used:', this.apiKey);
        const response = await this.client.post(url, formData, {
            headers: {
                'x-api-key': this.apiKey,
            },
            transformRequest: [(data, _headers) => {
                    return data;
                }],
        });
        return this.formatResponse(response);
    }
    updateApiKey(apiKey) {
        this.apiKey = apiKey;
        this.client.defaults.headers.common['x-api-key'] = apiKey;
    }
    setHeader(key, value) {
        this.client.defaults.headers.common[key] = value;
    }
    setDebug(debug) {
        this.debug = debug;
    }
}
exports.HttpClient = HttpClient;
//# sourceMappingURL=http-client.js.map