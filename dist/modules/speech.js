"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpeechModule = void 0;
class SpeechModule {
    constructor(client) {
        this.client = client;
    }
    async transcribe(audioFile, options) {
        const formData = new FormData();
        if (audioFile instanceof Buffer) {
            const blob = new Blob([audioFile], { type: 'audio/mpeg' });
            formData.append('audio', blob, 'audio.mp3');
        }
        else if (audioFile instanceof Blob || audioFile instanceof File) {
            formData.append('audio', audioFile);
        }
        else {
            throw new Error('Invalid audio file type');
        }
        if (options) {
            Object.entries(options).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
                }
            });
        }
        const response = await this.client.post('/ai/speech-to-text/transcribe', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async transcribeFromUrl(audioUrl, options) {
        const response = await this.client.post('/ai/speech-to-text/transcribe-url', {
            audioUrl,
            ...options,
        });
        return response.data;
    }
    async getSupportedLanguages() {
        const response = await this.client.get('/ai/speech-to-text/languages');
        return response.data;
    }
    async textToSpeech(text, options) {
        const response = await this.client.post('/ai/text-to-speech', {
            text,
            ...options,
        });
        return response.data;
    }
    async getVoices() {
        const response = await this.client.get('/ai/text-to-speech/voices');
        return response.data;
    }
    async cloneVoice(audioFile, options) {
        const formData = new FormData();
        if (audioFile instanceof Buffer) {
            const blob = new Blob([audioFile], { type: 'audio/mpeg' });
            formData.append('audio', blob, 'voice.mp3');
        }
        else if (audioFile instanceof File || audioFile instanceof Blob) {
            formData.append('audio', audioFile);
        }
        else {
            throw new Error('audioFile must be a Buffer, File, or Blob');
        }
        if (options) {
            Object.entries(options).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
                }
            });
        }
        const response = await this.client.post('/ai/voice-clone', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    async startConversation(options) {
        const response = await this.client.post('/ai/conversation/start', options);
        return response.data;
    }
}
exports.SpeechModule = SpeechModule;
//# sourceMappingURL=speech.js.map