import { HttpClient } from '../core/http-client';
import * as archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';

export interface ProjectDetectionResult {
  type: string;
  framework: string;
  language: string;
  buildCommand?: string;
  startCommand?: string;
  recommendedPlatforms?: {
    backend?: any;
    frontend?: any;
  };
  estimatedCost?: {
    monthly: number;
    breakdown: Record<string, number>;
  };
  migrationCommand?: string;
}

export interface DeploymentOptions {
  projectPath: string;
  branch?: string;
  environmentVariables?: Record<string, string>;
  autoMigrate?: boolean;
  preferredProvider?: string;
  customDomain?: string;
}

export interface DeploymentResult {
  deploymentId: string;
  status: string;
  provider?: string;
  url?: string;
  message?: string;
  estimatedTime?: string;
  trackingUrl?: string;
}

export interface DeploymentProgress {
  deploymentId: string;
  status: string;
  stage: string;
  progress: number;
  logs: string[];
  url?: string;
  error?: string;
}

export class DeploymentModule {
  constructor(private httpClient: HttpClient) {}

  /**
   * Detect project type and configuration
   */
  async detectProject(options: { projectPath?: string; packageJson?: any; gitUrl?: string }): Promise<ProjectDetectionResult> {
    // Try to read package.json from projectPath if provided
    let requestData: any = {};
    
    if (options.projectPath && !options.packageJson) {
      try {
        // Try to read package.json if we're in Node.js environment
        if (typeof window === 'undefined') {
          const fs = require('fs');
          const path = require('path');
          const packageJsonPath = path.join(options.projectPath, 'package.json');
          if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            console.log('[SDK] Read package.json from:', packageJsonPath);
            requestData.packageJson = packageJson;
          } else {
            console.log('[SDK] package.json not found at:', packageJsonPath);
          }
        }
      } catch (error) {
        console.log('[SDK] Error reading package.json:', (error as Error).message);
        // Don't send projectPath as fallback - it won't work from client
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

  /**
   * Zip project files for deployment
   */
  private async zipProject(projectPath: string, excludePatterns?: string[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const archive = archiver.create('zip', {
        zlib: { level: 9 } // Maximum compression
      });
      
      const buffers: Buffer[] = [];
      
      archive.on('data', (chunk: Buffer) => {
        buffers.push(chunk);
      });
      
      archive.on('end', () => {
        const finalBuffer = Buffer.concat(buffers);
        console.log(`[SDK] Project zipped: ${(finalBuffer.length / 1024 / 1024).toFixed(2)} MB`);
        resolve(finalBuffer);
      });
      
      archive.on('error', (err: Error) => {
        reject(err);
      });
      
      // Default exclude patterns
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
      
      // Add the project directory
      archive.glob('**/*', {
        cwd: projectPath,
        ignore: allExcludes,
        dot: true // Include dotfiles
      });
      
      archive.finalize();
    });
  }

  /**
   * Deploy a project using auto-detection
   */
  async deploy(options: DeploymentOptions): Promise<DeploymentResult> {
    // If we have a project path, zip it and send as multipart
    if (options.projectPath && fs.existsSync(options.projectPath)) {
      console.log('[SDK] Zipping project files from:', options.projectPath);
      
      // Read configuration files for different frameworks
      const projectPath = options.projectPath;
      
      // JavaScript/TypeScript: package.json
      const packageJsonPath = path.join(projectPath, 'package.json');
      let packageJson;
      if (fs.existsSync(packageJsonPath)) {
        console.log('[SDK] Read package.json from:', packageJsonPath);
        packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      }
      
      // PHP: composer.json
      const composerJsonPath = path.join(projectPath, 'composer.json');
      let composerJson;
      if (fs.existsSync(composerJsonPath)) {
        console.log('[SDK] Read composer.json from:', composerJsonPath);
        composerJson = JSON.parse(fs.readFileSync(composerJsonPath, 'utf8'));
      }
      
      // Python: requirements.txt
      const requirementsTxtPath = path.join(projectPath, 'requirements.txt');
      let requirementsTxt;
      if (fs.existsSync(requirementsTxtPath)) {
        console.log('[SDK] Read requirements.txt from:', requirementsTxtPath);
        requirementsTxt = fs.readFileSync(requirementsTxtPath, 'utf8');
      }
      
      // Python: Pipfile
      const pipfilePath = path.join(projectPath, 'Pipfile');
      let pipfile;
      if (fs.existsSync(pipfilePath)) {
        console.log('[SDK] Read Pipfile from:', pipfilePath);
        // Simple parsing - for more complex Pipfile parsing, use a library
        pipfile = fs.readFileSync(pipfilePath, 'utf8');
      }
      
      // Ruby: Gemfile
      const gemfilePath = path.join(projectPath, 'Gemfile');
      let gemfile;
      if (fs.existsSync(gemfilePath)) {
        console.log('[SDK] Read Gemfile from:', gemfilePath);
        gemfile = fs.readFileSync(gemfilePath, 'utf8');
      }
      
      // Flutter: pubspec.yaml
      const pubspecYamlPath = path.join(projectPath, 'pubspec.yaml');
      let pubspecYaml;
      if (fs.existsSync(pubspecYamlPath)) {
        console.log('[SDK] Read pubspec.yaml from:', pubspecYamlPath);
        // For proper YAML parsing, you'd need a YAML parser library
        pubspecYaml = fs.readFileSync(pubspecYamlPath, 'utf8');
      }
      
      // Zip the project
      const zipBuffer = await this.zipProject(options.projectPath);
      
      // Create form data
      const FormData = require('form-data');
      const formData = new FormData();
      
      // Add the zip file
      formData.append('file', zipBuffer, {
        filename: 'project.zip',
        contentType: 'application/zip'
      });
      
      // Add deployment options as JSON with all configuration files
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
      
      // Send as multipart
      const response = await this.httpClient.post('/smart-deployment/deploy-zip', formData, {
        headers: {
          ...formData.getHeaders()
        }
      });
      
      return response.data;
    } else {
      // Fallback to JSON-only deployment (for backward compatibility)
      const response = await this.httpClient.post('/smart-deployment/deploy', options);
      return response.data;
    }
  }

  /**
   * Deploy to a specific app (deprecated - use deploy() instead)
   * @deprecated The API key already contains the necessary context
   */
  async deployApp(appId: string, options: DeploymentOptions): Promise<DeploymentResult> {
    // For backward compatibility, but redirect to the main deploy method
    return this.deploy(options);
  }

  /**
   * Get deployment progress
   */
  async getProgress(deploymentId: string): Promise<DeploymentProgress> {
    const response = await this.httpClient.get(`/smart-deployment/deployments/${deploymentId}/progress`);
    return response.data;
  }

  /**
   * Poll deployment progress until complete
   */
  async waitForDeployment(
    deploymentId: string,
    options?: {
      timeout?: number; // Max wait time in ms (default: 10 minutes)
      pollInterval?: number; // Poll interval in ms (default: 3 seconds)
      onProgress?: (progress: DeploymentProgress) => void;
    }
  ): Promise<DeploymentProgress> {
    const timeout = options?.timeout || 600000; // 10 minutes default
    const pollInterval = options?.pollInterval || 3000; // 3 seconds default
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const checkProgress = async () => {
        try {
          // Check timeout
          if (Date.now() - startTime > timeout) {
            reject(new Error('Deployment timeout'));
            return;
          }

          const progress = await this.getProgress(deploymentId);
          
          // Call progress callback if provided
          if (options?.onProgress) {
            options.onProgress(progress);
          }

          // Check if deployment is complete
          if (progress.status === 'deployed' || progress.status === 'running' || progress.stage === 'completed') {
            resolve(progress);
          } else if (progress.status === 'failed' || progress.stage === 'failed') {
            reject(new Error(progress.error || 'Deployment failed'));
          } else {
            // Continue polling
            setTimeout(checkProgress, pollInterval);
          }
        } catch (error) {
          reject(error);
        }
      };

      // Start polling
      checkProgress();
    });
  }

  /**
   * Track deployment progress with real-time updates
   */
  async trackProgress(
    deploymentId: string,
    options?: {
      onProgress?: (update: DeploymentProgress) => void;
      pollInterval?: number;
    }
  ): Promise<DeploymentProgress> {
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
          } else if (progress.status === 'failed') {
            reject(new Error(progress.error || 'Deployment failed'));
          } else {
            setTimeout(checkProgress, pollInterval);
          }
        } catch (error) {
          reject(error);
        }
      };

      checkProgress();
    });
  }

  /**
   * Get deployment logs
   */
  async getLogs(deploymentId: string, options?: { tail?: number }): Promise<string[]> {
    const response = await this.httpClient.get(`/smart-deployment/deployments/${deploymentId}/logs`, {
      params: options
    });
    return response.data;
  }

  /**
   * Run migrations for a deployment
   */
  async runMigrations(deploymentId: string): Promise<any> {
    const response = await this.httpClient.post(`/smart-deployment/deployments/${deploymentId}/migrate`);
    return response.data;
  }

  /**
   * Rollback a deployment
   */
  async rollback(deploymentId: string): Promise<DeploymentResult> {
    const response = await this.httpClient.post(`/smart-deployment/deployments/${deploymentId}/rollback`);
    return response.data;
  }

  /**
   * Scale a deployment
   */
  async scale(deploymentId: string, options: { minInstances?: number; maxInstances?: number }): Promise<any> {
    const response = await this.httpClient.post(`/smart-deployment/deployments/${deploymentId}/scale`, options);
    return response.data;
  }

  /**
   * Stop a deployment
   */
  async stop(deploymentId: string): Promise<any> {
    const response = await this.httpClient.post(`/smart-deployment/deployments/${deploymentId}/stop`);
    return response.data;
  }

  /**
   * Restart a deployment
   */
  async restart(deploymentId: string): Promise<any> {
    const response = await this.httpClient.post(`/smart-deployment/deployments/${deploymentId}/restart`);
    return response.data;
  }

  /**
   * Get available platforms
   */
  async getPlatforms(): Promise<any> {
    const response = await this.httpClient.get('/smart-deployment/platforms');
    return response.data;
  }

  /**
   * Estimate deployment cost
   */
  async estimateCost(options: {
    projectPath: string;
    provider?: string;
    estimatedTraffic?: number;
  }): Promise<any> {
    const response = await this.httpClient.post('/smart-deployment/estimate-cost', options);
    return response.data;
  }
}