import { HttpClient } from '../core/http-client';
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
export declare class DeploymentModule {
    private httpClient;
    constructor(httpClient: HttpClient);
    detectProject(options: {
        projectPath?: string;
        packageJson?: any;
        gitUrl?: string;
    }): Promise<ProjectDetectionResult>;
    private zipProject;
    deploy(options: DeploymentOptions): Promise<DeploymentResult>;
    deployApp(appId: string, options: DeploymentOptions): Promise<DeploymentResult>;
    getProgress(deploymentId: string): Promise<DeploymentProgress>;
    waitForDeployment(deploymentId: string, options?: {
        timeout?: number;
        pollInterval?: number;
        onProgress?: (progress: DeploymentProgress) => void;
    }): Promise<DeploymentProgress>;
    trackProgress(deploymentId: string, options?: {
        onProgress?: (update: DeploymentProgress) => void;
        pollInterval?: number;
    }): Promise<DeploymentProgress>;
    getLogs(deploymentId: string, options?: {
        tail?: number;
    }): Promise<string[]>;
    runMigrations(deploymentId: string): Promise<any>;
    rollback(deploymentId: string): Promise<DeploymentResult>;
    scale(deploymentId: string, options: {
        minInstances?: number;
        maxInstances?: number;
    }): Promise<any>;
    stop(deploymentId: string): Promise<any>;
    restart(deploymentId: string): Promise<any>;
    getPlatforms(): Promise<any>;
    estimateCost(options: {
        projectPath: string;
        provider?: string;
        estimatedTraffic?: number;
    }): Promise<any>;
}
