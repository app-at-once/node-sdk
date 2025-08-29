"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebRTCModule = void 0;
class WebRTCModule {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async createSession(options) {
        const response = await this.httpClient.post('/video/sessions', options || {});
        return response.data;
    }
    async listSessions(filters) {
        const response = await this.httpClient.get('/video/sessions', {
            params: filters,
        });
        return response.data;
    }
    async getSession(sessionId, includeDetails = false) {
        const response = await this.httpClient.get(`/video/sessions/${sessionId}`, {
            params: { includeDetails },
        });
        return response.data;
    }
    async updateSession(sessionId, options) {
        const response = await this.httpClient.patch(`/video/sessions/${sessionId}`, options);
        return response.data;
    }
    async joinSession(sessionId, options) {
        const response = await this.httpClient.post(`/video/sessions/${sessionId}/join`, options || {});
        return response.data;
    }
    async leaveSession(sessionId, identity) {
        await this.httpClient.post(`/video/sessions/${sessionId}/leave`, { identity });
    }
    async endSession(sessionId) {
        const response = await this.httpClient.post(`/video/sessions/${sessionId}/end`);
        return response.data;
    }
    async getParticipants(sessionId) {
        const response = await this.httpClient.get(`/video/sessions/${sessionId}/participants`);
        return response.data;
    }
    async updateParticipantPermissions(sessionId, identity, permissions) {
        const response = await this.httpClient.patch(`/video/sessions/${sessionId}/participants/${identity}/permissions`, permissions);
        return response.data;
    }
    async muteParticipant(sessionId, identity, trackSid, muted) {
        const response = await this.httpClient.post(`/video/sessions/${sessionId}/participants/${identity}/mute`, { trackSid, muted });
        return response.data;
    }
    async removeParticipant(sessionId, identity) {
        await this.httpClient.delete(`/video/sessions/${sessionId}/participants/${identity}`);
    }
    async startRecording(sessionId, options) {
        const response = await this.httpClient.post(`/video/sessions/${sessionId}/recording/start`, options || {});
        return response.data;
    }
    async stopRecording(sessionId, recordingId) {
        const response = await this.httpClient.post(`/video/sessions/${sessionId}/recording/${recordingId}/stop`);
        return response.data;
    }
    async getRecordings(sessionId) {
        const response = await this.httpClient.get(`/video/sessions/${sessionId}/recordings`);
        return response.data;
    }
    async generateTranscript(sessionId, options) {
        const response = await this.httpClient.post(`/video/sessions/${sessionId}/transcript`, options || {});
        return response.data;
    }
    async getTranscripts(sessionId) {
        const response = await this.httpClient.get(`/video/sessions/${sessionId}/transcripts`);
        return response.data;
    }
    async sendMessage(sessionId, message, targetIdentities) {
        const response = await this.httpClient.post(`/video/sessions/${sessionId}/message`, { message, targetIdentities });
        return response.data;
    }
    async getAnalytics(sessionId) {
        const response = await this.httpClient.get(`/video/sessions/${sessionId}/analytics`);
        return response.data;
    }
    async waitForSession(sessionId, options) {
        const maxWaitTime = options?.maxWaitTime || 30000;
        const pollInterval = options?.pollInterval || 1000;
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
    async createAndJoinSession(createOptions, joinOptions) {
        const session = await this.createSession(createOptions);
        return await this.joinSession(session.id, joinOptions);
    }
    async startVideoCall(sessionId, connectionId) {
        const response = await this.httpClient.post(`/video/sessions/${sessionId}/start-call`, { connectionId });
        return response.data;
    }
    async endVideoCall(sessionId, connectionId) {
        const response = await this.httpClient.post(`/video/sessions/${sessionId}/end-call`, { connectionId });
        return response.data;
    }
    async toggleMedia(sessionId, connectionId, mediaType, enabled) {
        const response = await this.httpClient.post(`/video/sessions/${sessionId}/toggle-media`, { connectionId, mediaType, enabled });
        return response.data;
    }
    async shareScreen(sessionId, connectionId, enabled) {
        const response = await this.httpClient.post(`/video/sessions/${sessionId}/share-screen`, { connectionId, enabled });
        return response.data;
    }
    async waitForRecording(sessionId, recordingId, options) {
        const maxWaitTime = options?.maxWaitTime || 300000;
        const pollInterval = options?.pollInterval || 5000;
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
exports.WebRTCModule = WebRTCModule;
//# sourceMappingURL=webrtc.js.map