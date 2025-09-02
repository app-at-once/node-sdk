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

export class WebRTCModule {
  constructor(private httpClient: HttpClient) {}

  /**
   * Create a new video session
   */
  async createSession(options?: CreateVideoSessionOptions): Promise<VideoSession> {
    const response = await this.httpClient.post('/video/sessions', options || {});
    return response.data;
  }

  /**
   * List video sessions
   */
  async listSessions(filters?: VideoSessionFilters): Promise<ListSessionsResponse> {
    const response = await this.httpClient.get('/video/sessions', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get video session details
   */
  async getSession(sessionId: string, includeDetails = false): Promise<VideoSession> {
    const response = await this.httpClient.get(`/video/sessions/${sessionId}`, {
      params: { includeDetails },
    });
    return response.data;
  }

  /**
   * Update video session
   */
  async updateSession(
    sessionId: string,
    options: UpdateVideoSessionOptions
  ): Promise<VideoSession> {
    const response = await this.httpClient.patch(`/video/sessions/${sessionId}`, options);
    return response.data;
  }

  /**
   * Join video session
   */
  async joinSession(
    sessionId: string,
    options?: JoinVideoSessionOptions
  ): Promise<JoinSessionResponse> {
    const response = await this.httpClient.post(
      `/video/sessions/${sessionId}/join`,
      options || {}
    );
    return response.data;
  }

  /**
   * Leave video session
   */
  async leaveSession(sessionId: string, identity?: string): Promise<void> {
    await this.httpClient.post(`/video/sessions/${sessionId}/leave`, { identity });
  }

  /**
   * End video session
   */
  async endSession(sessionId: string): Promise<VideoSession> {
    const response = await this.httpClient.post(`/video/sessions/${sessionId}/end`);
    return response.data;
  }

  /**
   * Get session participants
   */
  async getParticipants(sessionId: string): Promise<VideoParticipant[]> {
    const response = await this.httpClient.get(`/video/sessions/${sessionId}/participants`);
    return response.data;
  }

  /**
   * Update participant permissions
   */
  async updateParticipantPermissions(
    sessionId: string,
    identity: string,
    permissions: UpdateParticipantPermissions
  ): Promise<{ success: boolean }> {
    const response = await this.httpClient.patch(
      `/video/sessions/${sessionId}/participants/${identity}/permissions`,
      permissions
    );
    return response.data;
  }

  /**
   * Mute or unmute a participant
   */
  async muteParticipant(
    sessionId: string,
    identity: string,
    trackSid: string,
    muted: boolean
  ): Promise<{ success: boolean }> {
    const response = await this.httpClient.post(
      `/video/sessions/${sessionId}/participants/${identity}/mute`,
      { trackSid, muted }
    );
    return response.data;
  }

  /**
   * Remove participant from session
   */
  async removeParticipant(sessionId: string, identity: string): Promise<void> {
    await this.httpClient.delete(
      `/video/sessions/${sessionId}/participants/${identity}`
    );
  }

  /**
   * Start recording
   */
  async startRecording(
    sessionId: string,
    options?: StartRecordingOptions
  ): Promise<VideoRecording> {
    const response = await this.httpClient.post(
      `/video/sessions/${sessionId}/recording/start`,
      options || {}
    );
    return response.data;
  }

  /**
   * Stop recording
   */
  async stopRecording(
    sessionId: string,
    recordingId: string
  ): Promise<VideoRecording> {
    const response = await this.httpClient.post(
      `/video/sessions/${sessionId}/recording/${recordingId}/stop`
    );
    return response.data;
  }

  /**
   * Get recordings for a session
   */
  async getRecordings(sessionId: string): Promise<VideoRecording[]> {
    const response = await this.httpClient.get(`/video/sessions/${sessionId}/recordings`);
    return response.data;
  }

  /**
   * Generate transcript for recorded session
   */
  async generateTranscript(
    sessionId: string,
    options?: GenerateTranscriptOptions
  ): Promise<VideoTranscript[]> {
    const response = await this.httpClient.post(
      `/video/sessions/${sessionId}/transcript`,
      options || {}
    );
    return response.data;
  }

  /**
   * Get transcripts for a session
   */
  async getTranscripts(sessionId: string): Promise<VideoTranscript[]> {
    const response = await this.httpClient.get(`/video/sessions/${sessionId}/transcripts`);
    return response.data;
  }

  /**
   * Send data message to session participants
   */
  async sendMessage(
    sessionId: string,
    message: any,
    targetIdentities?: string[]
  ): Promise<{ success: boolean }> {
    const response = await this.httpClient.post(
      `/video/sessions/${sessionId}/message`,
      { message, targetIdentities }
    );
    return response.data;
  }

  /**
   * Get session analytics
   */
  async getAnalytics(sessionId: string): Promise<VideoAnalytics> {
    const response = await this.httpClient.get(`/video/sessions/${sessionId}/analytics`);
    return response.data;
  }

  /**
   * Helper function to wait for session to be ready
   */
  async waitForSession(
    sessionId: string,
    options?: {
      maxWaitTime?: number; // in milliseconds
      pollInterval?: number; // in milliseconds
    }
  ): Promise<VideoSession> {
    const maxWaitTime = options?.maxWaitTime || 30000; // 30 seconds default
    const pollInterval = options?.pollInterval || 1000; // 1 second default
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const session = await this.getSession(sessionId);
      
      if (session.status === 'active') {
        return session;
      }

      if (session.status === 'ended' || session.status === 'cancelled') {
        throw new Error(`Session ${sessionId} is not available (status: ${session.status})`);
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Session ${sessionId} did not become active within ${maxWaitTime}ms`);
  }

  /**
   * Helper function to create and join a session in one call
   */
  async createAndJoinSession(
    createOptions?: CreateVideoSessionOptions,
    joinOptions?: JoinVideoSessionOptions
  ): Promise<JoinSessionResponse> {
    const session = await this.createSession(createOptions);
    return await this.joinSession(session.id, joinOptions);
  }

  /**
   * Start video call (handles WebRTC connection internally)
   */
  async startVideoCall(sessionId: string, connectionId: string): Promise<{ success: boolean }> {
    const response = await this.httpClient.post(
      `/video/sessions/${sessionId}/start-call`,
      { connectionId }
    );
    return response.data;
  }

  /**
   * End video call
   */
  async endVideoCall(sessionId: string, connectionId: string): Promise<{ success: boolean }> {
    const response = await this.httpClient.post(
      `/video/sessions/${sessionId}/end-call`,
      { connectionId }
    );
    return response.data;
  }

  /**
   * Toggle audio/video
   */
  async toggleMedia(
    sessionId: string,
    connectionId: string,
    mediaType: 'audio' | 'video',
    enabled: boolean
  ): Promise<{ success: boolean }> {
    const response = await this.httpClient.post(
      `/video/sessions/${sessionId}/toggle-media`,
      { connectionId, mediaType, enabled }
    );
    return response.data;
  }

  /**
   * Share screen
   */
  async shareScreen(
    sessionId: string,
    connectionId: string,
    enabled: boolean
  ): Promise<{ success: boolean }> {
    const response = await this.httpClient.post(
      `/video/sessions/${sessionId}/share-screen`,
      { connectionId, enabled }
    );
    return response.data;
  }

  /**
   * Helper function to wait for recording to complete
   */
  async waitForRecording(
    sessionId: string,
    recordingId: string,
    options?: {
      maxWaitTime?: number; // in milliseconds
      pollInterval?: number; // in milliseconds
    }
  ): Promise<VideoRecording> {
    const maxWaitTime = options?.maxWaitTime || 300000; // 5 minutes default
    const pollInterval = options?.pollInterval || 5000; // 5 seconds default
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const recordings = await this.getRecordings(sessionId);
      const recording = recordings.find(r => r.recordingId === recordingId);
      
      if (recording) {
        if (recording.status === 'completed') {
          return recording;
        }
        
        if (recording.status === 'failed') {
          throw new Error(`Recording ${recordingId} failed`);
        }
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Recording ${recordingId} did not complete within ${maxWaitTime}ms`);
  }
}