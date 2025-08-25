import { HttpClient } from '../core/http-client';
export interface TranscribeOptions {
    language?: string;
    responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
    temperature?: number;
    timestamps?: boolean;
    speakerDiarization?: boolean;
    resourceId?: string;
    resourceType?: 'project' | 'app';
    metadata?: Record<string, any>;
}
export interface TranscriptionResult {
    id: string;
    text: string;
    language?: string;
    duration?: number;
    segments?: TranscriptionSegment[];
    speakers?: SpeakerInfo[];
    metadata?: any;
    contentId?: string;
}
export interface TranscriptionSegment {
    id: number;
    start: number;
    end: number;
    text: string;
    speaker?: string;
    confidence?: number;
}
export interface SpeakerInfo {
    id: string;
    name?: string;
    segments: number[];
}
export interface SupportedLanguage {
    code: string;
    name: string;
}
export declare class SpeechModule {
    private client;
    constructor(client: HttpClient);
    transcribe(audioFile: Buffer | Blob | File, options?: TranscribeOptions): Promise<TranscriptionResult>;
    transcribeFromUrl(audioUrl: string, options?: TranscribeOptions): Promise<TranscriptionResult>;
    getSupportedLanguages(): Promise<SupportedLanguage[]>;
    textToSpeech(text: string, options?: {
        voice?: string;
        model?: string;
        speed?: number;
        language?: string;
        format?: 'mp3' | 'opus' | 'aac' | 'flac';
    }): Promise<{
        audioUrl: string;
        contentId?: string;
    }>;
    getVoices(): Promise<Array<{
        id: string;
        name: string;
        language: string;
        gender?: string;
    }>>;
    cloneVoice(audioFile: Buffer | Blob | File, options?: {
        name: string;
        description?: string;
        labels?: Record<string, string>;
    }): Promise<{
        voiceId: string;
        status: string;
    }>;
    startConversation(options?: {
        voiceId?: string;
        language?: string;
        systemPrompt?: string;
    }): Promise<{
        websocketUrl: string;
        sessionId: string;
    }>;
}
