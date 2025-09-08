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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentModule = void 0;
const archiver = __importStar(require("archiver"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class DeploymentModule {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async detectProject(options) {
        let requestData = {};
        if (options.projectPath && !options.packageJson) {
            try {
                if (typeof window === 'undefined') {
                    const fs = require('fs');
                    const path = require('path');
                    const packageJsonPath = path.join(options.projectPath, 'package.json');
                    if (fs.existsSync(packageJsonPath)) {
                        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                        console.log('[SDK] Read package.json from:', packageJsonPath);
                        requestData.packageJson = packageJson;
                    }
                    else {
                        console.log('[SDK] package.json not found at:', packageJsonPath);
                    }
                }
            }
            catch (error) {
                console.log('[SDK] Error reading package.json:', error.message);
            }
        }
        if (options.packageJson) {
            requestData.packageJson = options.packageJson;
        }
        if (options.gitUrl) {
            requestData.gitUrl = options.gitUrl;
        }
        console.log('[SDK] Sending request data keys:', Object.keys(requestData));
        console.log('[SDK] Has packageJson?', !!requestData.packageJson);
        if (requestData.packageJson) {
            console.log('[SDK] Package name:', requestData.packageJson.name);
            console.log('[SDK] Dependencies count:', Object.keys(requestData.packageJson.dependencies || {}).length);
        }
        const response = await this.httpClient.post('/smart-deployment/detect', requestData);
        return response.data;
    }
    async zipProject(projectPath, excludePatterns) {
        return new Promise((resolve, reject) => {
            const archive = archiver.create('zip', {
                zlib: { level: 9 }
            });
            const buffers = [];
            archive.on('data', (chunk) => {
                buffers.push(chunk);
            });
            archive.on('end', () => {
                const finalBuffer = Buffer.concat(buffers);
                console.log(`[SDK] Project zipped: ${(finalBuffer.length / 1024 / 1024).toFixed(2)} MB`);
                resolve(finalBuffer);
            });
            archive.on('error', (err) => {
                reject(err);
            });
            const defaultExcludes = [
                'node_modules/**',
                '.git/**',
                'dist/**',
                'build/**',
                '.env*',
                '*.log',
                '.DS_Store',
                'coverage/**',
                '.nyc_output/**',
                '*.tgz',
                '*.zip'
            ];
            const allExcludes = [...defaultExcludes, ...(excludePatterns || [])];
            archive.glob('**/*', {
                cwd: projectPath,
                ignore: allExcludes,
                dot: true
            });
            archive.finalize();
        });
    }
    async deploy(options) {
        if (options.projectPath && fs.existsSync(options.projectPath)) {
            console.log('[SDK] Zipping project files from:', options.projectPath);
            const projectPath = options.projectPath;
            const packageJsonPath = path.join(projectPath, 'package.json');
            let packageJson;
            if (fs.existsSync(packageJsonPath)) {
                console.log('[SDK] Read package.json from:', packageJsonPath);
                packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            }
            const composerJsonPath = path.join(projectPath, 'composer.json');
            let composerJson;
            if (fs.existsSync(composerJsonPath)) {
                console.log('[SDK] Read composer.json from:', composerJsonPath);
                composerJson = JSON.parse(fs.readFileSync(composerJsonPath, 'utf8'));
            }
            const requirementsTxtPath = path.join(projectPath, 'requirements.txt');
            let requirementsTxt;
            if (fs.existsSync(requirementsTxtPath)) {
                console.log('[SDK] Read requirements.txt from:', requirementsTxtPath);
                requirementsTxt = fs.readFileSync(requirementsTxtPath, 'utf8');
            }
            const pipfilePath = path.join(projectPath, 'Pipfile');
            let pipfile;
            if (fs.existsSync(pipfilePath)) {
                console.log('[SDK] Read Pipfile from:', pipfilePath);
                pipfile = fs.readFileSync(pipfilePath, 'utf8');
            }
            const gemfilePath = path.join(projectPath, 'Gemfile');
            let gemfile;
            if (fs.existsSync(gemfilePath)) {
                console.log('[SDK] Read Gemfile from:', gemfilePath);
                gemfile = fs.readFileSync(gemfilePath, 'utf8');
            }
            const pubspecYamlPath = path.join(projectPath, 'pubspec.yaml');
            let pubspecYaml;
            if (fs.existsSync(pubspecYamlPath)) {
                console.log('[SDK] Read pubspec.yaml from:', pubspecYamlPath);
                pubspecYaml = fs.readFileSync(pubspecYamlPath, 'utf8');
            }
            const zipBuffer = await this.zipProject(options.projectPath);
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('file', zipBuffer, {
                filename: 'project.zip',
                contentType: 'application/zip'
            });
            const deploymentData = {
                ...options,
                packageJson,
                composerJson,
                requirementsTxt,
                pipfile,
                gemfile,
                pubspecYaml,
                projectName: packageJson?.name || composerJson?.name || 'unnamed-project'
            };
            formData.append('data', JSON.stringify(deploymentData));
            console.log('[SDK] Uploading project zip...');
            const response = await this.httpClient.post('/smart-deployment/deploy-zip', formData, {
                headers: {
                    ...formData.getHeaders()
                }
            });
            return response.data;
        }
        else {
            const response = await this.httpClient.post('/smart-deployment/deploy', options);
            return response.data;
        }
    }
    async deployApp(appId, options) {
        return this.deploy(options);
    }
    async getProgress(deploymentId) {
        const response = await this.httpClient.get(`/smart-deployment/deployments/${deploymentId}/progress`);
        return response.data;
    }
    async waitForDeployment(deploymentId, options) {
        const timeout = options?.timeout || 600000;
        const pollInterval = options?.pollInterval || 3000;
        const startTime = Date.now();
        return new Promise((resolve, reject) => {
            const checkProgress = async () => {
                try {
                    if (Date.now() - startTime > timeout) {
                        reject(new Error('Deployment timeout'));
                        return;
                    }
                    const progress = await this.getProgress(deploymentId);
                    if (options?.onProgress) {
                        options.onProgress(progress);
                    }
                    if (progress.status === 'deployed' || progress.status === 'running' || progress.stage === 'completed') {
                        resolve(progress);
                    }
                    else if (progress.status === 'failed' || progress.stage === 'failed') {
                        reject(new Error(progress.error || 'Deployment failed'));
                    }
                    else {
                        setTimeout(checkProgress, pollInterval);
                    }
                }
                catch (error) {
                    reject(error);
                }
            };
            checkProgress();
        });
    }
    async trackProgress(deploymentId, options) {
        const pollInterval = options?.pollInterval || 3000;
        return new Promise((resolve, reject) => {
            const checkProgress = async () => {
                try {
                    const progress = await this.getProgress(deploymentId);
                    if (options?.onProgress) {
                        options.onProgress(progress);
                    }
                    if (progress.status === 'running' || progress.status === 'deployed') {
                        resolve(progress);
                    }
                    else if (progress.status === 'failed') {
                        reject(new Error(progress.error || 'Deployment failed'));
                    }
                    else {
                        setTimeout(checkProgress, pollInterval);
                    }
                }
                catch (error) {
                    reject(error);
                }
            };
            checkProgress();
        });
    }
    async getLogs(deploymentId, options) {
        const response = await this.httpClient.get(`/smart-deployment/deployments/${deploymentId}/logs`, {
            params: options
        });
        return response.data;
    }
    async runMigrations(deploymentId) {
        const response = await this.httpClient.post(`/smart-deployment/deployments/${deploymentId}/migrate`);
        return response.data;
    }
    async rollback(deploymentId) {
        const response = await this.httpClient.post(`/smart-deployment/deployments/${deploymentId}/rollback`);
        return response.data;
    }
    async scale(deploymentId, options) {
        const response = await this.httpClient.post(`/smart-deployment/deployments/${deploymentId}/scale`, options);
        return response.data;
    }
    async stop(deploymentId) {
        const response = await this.httpClient.post(`/smart-deployment/deployments/${deploymentId}/stop`);
        return response.data;
    }
    async restart(deploymentId) {
        const response = await this.httpClient.post(`/smart-deployment/deployments/${deploymentId}/restart`);
        return response.data;
    }
    async getPlatforms() {
        const response = await this.httpClient.get('/smart-deployment/platforms');
        return response.data;
    }
    async estimateCost(options) {
        const response = await this.httpClient.post('/smart-deployment/estimate-cost', options);
        return response.data;
    }
}
exports.DeploymentModule = DeploymentModule;
//# sourceMappingURL=deployment.js.map