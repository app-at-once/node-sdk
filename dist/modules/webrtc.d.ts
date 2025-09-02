import { HttpClient } from '../core/http-client';
export interface VideoSessionType {
    INSTANT: 'instant';
    SCHEDULED: 'scheduled';
    BROADCAST: 'broadcast';
    WEBINAR: 'webinar';
}
export interface VideoSessionStatus {
    WAITING: 'waiting';
    ACTIVE: 'active';
    ENDED: 'ended';
    CANCELLED: 'cancelled';
}
export interface ParticipantRole {
    HOST: 'host';
    MODERATOR: 'moderator';
    PARTICIPANT: 'participant';
    VIEWER: 'viewer';
}
export interface CreateVideoSessionOptions {
    title?: string;
    description?: string;
    type?: keyof VideoSessionType;
    maxParticipants?: number;
    scheduledAt?: Date | string;
    hostName?: string;
    settings?: {
        enableRecording?: boolean;
        enableTranscription?: boolean;
        enableChat?: boolean;
        enableScreenShare?: boolean;
        enableVirtualBackground?: boolean;
        waitingRoom?: boolean;
        muteOnJoin?: boolean;
        requirePermissionToUnmute?: boolean;
    };
    features?: string[];
}
export interface UpdateVideoSessionOptions {
    title?: string;
    description?: string;
    maxParticipants?: number;
    scheduledAt?: Date | string;
    settings?: Record<string, any>;
}
export interface JoinVideoSessionOptions {
    identity?: string;
    name?: string;
    role?: keyof ParticipantRole;
    deviceInfo?: {
        type?: 'desktop' | 'mobile' | 'tablet';
        browser?: string;
        os?: string;
        version?: string;
    };
}
export interface StartRecordingOptions {
    audioOnly?: boolean;
    videoOnly?: boolean;
    resolution?: string;
    audioBitrate?: number;
    videoBitrate?: number;
}
export interface GenerateTranscriptOptions {
    language?: string;
    translateTo?: string;
    includeSpeakerLabels?: boolean;
}
export interface UpdateParticipantPermissions {
    canPublish?: boolean;
    canSubscribe?: boolean;
    canPublishData?: boolean;
    canPublishSources?: string[];
    hidden?: boolean;
    recorder?: boolean;
}
export interface VideoSession {
    id: string;
    projectId: string;
    appId?: string;
    roomName: string;
    roomSid?: string;
    title?: string;
    description?: string;
    type: string;
    status: string;
    maxParticipants: number;
    startedAt?: string;
    endedAt?: string;
    scheduledAt?: string;
    duration?: number;
    hostId: string;
    settings: Record<string, any>;
    recordingUrl?: string;
    recordingStatus?: string;
    metadata: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    participants?: VideoParticipant[];
    recordings?: VideoRecording[];
    transcripts?: VideoTranscript[];
}
export interface VideoParticipant {
    id: string;
    sessionId: string;
    participantSid: string;
    identity: string;
    name?: string;
    role: string;
    permissions: Record<string, any>;
    joinedAt: string;
    leftAt?: string;
    duration?: number;
    connectionQuality?: string;
    deviceInfo?: Record<string, any>;
    trackInfo?: Record<string, any>;
    metadata: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}
export interface VideoRecording {
    id: string;
    sessionId: string;
    recordingId: string;
    type: string;
    status: string;
    startedAt: string;
    endedAt?: string;
    duration?: number;
    fileUrl?: string;
    fileSize?: string;
    format?: string;
    resolution?: string;
    metadata: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}
export interface VideoTranscript {
    id: string;
    sessionId: string;
    participantId?: string;
    language: string;
    text: string;
    startTime: number;
    endTime: number;
    confidence?: number;
    translation?: Record<string, string>;
    metadata: Record<string, any>;
    createdAt: string;
}
export interface VideoAnalytics {
    totalParticipants: number;
    averageDuration: number;
    peakConcurrentUsers: number;
    qualityMetrics: {
        excellent: number;
        good: number;
        poor: number;
    };
    deviceBreakdown: {
        desktop: number;
        mobile: number;
        tablet: number;
    };
}
export interface JoinSessionResponse {
    session: VideoSession;
    participantId: string;
    connectionId: string;
}
export interface ListSessionsResponse {
    sessions: VideoSession[];
    total: number;
}
export interface VideoSessionFilters {
    status?: string;
    type?: string;
    hostId?: string;
    limit?: number;
    offset?: number;
}
export declare class WebRTCModule {
    private httpClient;
    constructor(httpClient: HttpClient);
    createSession(options?: CreateVideoSessionOptions): Promise<VideoSession>;
    listSessions(filters?: VideoSessionFilters): Promise<ListSessionsResponse>;
    getSession(sessionId: string, includeDetails?: boolean): Promise<VideoSession>;
    updateSession(sessionId: string, options: UpdateVideoSessionOptions): Promise<VideoSession>;
    joinSession(sessionId: string, options?: JoinVideoSessionOptions): Promise<JoinSessionResponse>;
    leaveSession(sessionId: string, identity?: string): Promise<void>;
    endSession(sessionId: string): Promise<VideoSession>;
    getParticipants(sessionId: string): Promise<VideoParticipant[]>;
    updateParticipantPermissions(sessionId: string, identity: string, permissions: UpdateParticipantPermissions): Promise<{
        success: boolean;
    }>;
    muteParticipant(sessionId: string, identity: string, trackSid: string, muted: boolean): Promise<{
        success: boolean;
    }>;
    removeParticipant(sessionId: string, identity: string): Promise<void>;
    startRecording(sessionId: string, options?: StartRecordingOptions): Promise<VideoRecording>;
    stopRecording(sessionId: string, recordingId: string): Promise<VideoRecording>;
    getRecordings(sessionId: string): Promise<VideoRecording[]>;
    generateTranscript(sessionId: string, options?: GenerateTranscriptOptions): Promise<VideoTranscript[]>;
    getTranscripts(sessionId: string): Promise<VideoTranscript[]>;
    sendMessage(sessionId: string, message: any, targetIdentities?: string[]): Promise<{
        success: boolean;
    }>;
    getAnalytics(sessionId: string): Promise<VideoAnalytics>;
    waitForSession(sessionId: string, options?: {
        maxWaitTime?: number;
        pollInterval?: number;
    }): Promise<VideoSession>;
    createAndJoinSession(createOptions?: CreateVideoSessionOptions, joinOptions?: JoinVideoSessionOptions): Promise<JoinSessionResponse>;
    startVideoCall(sessionId: string, connectionId: string): Promise<{
        success: boolean;
    }>;
    endVideoCall(sessionId: string, connectionId: string): Promise<{
        success: boolean;
    }>;
    toggleMedia(sessionId: string, connectionId: string, mediaType: 'audio' | 'video', enabled: boolean): Promise<{
        success: boolean;
    }>;
    shareScreen(sessionId: string, connectionId: string, enabled: boolean): Promise<{
        success: boolean;
    }>;
    waitForRecording(sessionId: string, recordingId: string, options?: {
        maxWaitTime?: number;
        pollInterval?: number;
    }): Promise<VideoRecording>;
}
