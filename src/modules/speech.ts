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

export class SpeechModule {
  constructor(private client: HttpClient) {}

  /**
   * Transcribe an audio file
   * @param audioFile Audio file (Buffer or Blob)
   * @param options Transcription options
   * @returns Transcription result
   */
  async transcribe(
    audioFile: Buffer | Blob | File,
    options?: TranscribeOptions
  ): Promise<TranscriptionResult> {
    const formData = new FormData();
    
    if (audioFile instanceof Buffer) {
      // Convert Buffer to Blob for FormData
      const blob = new Blob([audioFile], { type: 'audio/mpeg' });
      formData.append('audio', blob, 'audio.mp3');
    } else if (audioFile instanceof Blob || audioFile instanceof File) {
      formData.append('audio', audioFile);
    } else {
      throw new Error('Invalid audio file type');
    }

    // Add options to FormData
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });
    }

    const response = await this.client.post<TranscriptionResult>(
      '/ai/speech-to-text/transcribe',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Transcribe audio from a URL
   * @param audioUrl URL of the audio file
   * @param options Transcription options
   * @returns Transcription result
   */
  async transcribeFromUrl(
    audioUrl: string,
    options?: TranscribeOptions
  ): Promise<TranscriptionResult> {
    const response = await this.client.post<TranscriptionResult>(
      '/ai/speech-to-text/transcribe-url',
      {
        audioUrl,
        ...options,
      }
    );

    return response.data;
  }

  /**
   * Get list of supported languages
   * @returns Array of supported languages
   */
  async getSupportedLanguages(): Promise<SupportedLanguage[]> {
    const response = await this.client.get<SupportedLanguage[]>(
      '/ai/speech-to-text/languages'
    );

    return response.data;
  }

  /**
   * Generate speech from text (Text-to-Speech)
   * @param text Text to convert to speech
   * @param options TTS options
   * @returns Audio data URL or buffer
   */
  async textToSpeech(
    text: string,
    options?: {
      voice?: string;
      model?: string;
      speed?: number;
      language?: string;
      format?: 'mp3' | 'opus' | 'aac' | 'flac';
    }
  ): Promise<{ audioUrl: string; contentId?: string }> {
    const response = await this.client.post<{ audioUrl: string; contentId?: string }>(
      '/ai/text-to-speech',
      {
        text,
        ...options,
      }
    );

    return response.data;
  }

  /**
   * Get available TTS voices
   * @returns Array of available voices
   */
  async getVoices(): Promise<Array<{ id: string; name: string; language: string; gender?: string }>> {
    const response = await this.client.get<Array<{ id: string; name: string; language: string; gender?: string }>>(
      '/ai/text-to-speech/voices'
    );

    return response.data;
  }

  /**
   * Create a voice clone (if supported)
   * @param audioFile Audio file for voice cloning
   * @param options Voice cloning options
   * @returns Voice ID
   */
  async cloneVoice(
    audioFile: Buffer | Blob | File,
    options?: {
      name: string;
      description?: string;
      labels?: Record<string, string>;
    }
  ): Promise<{ voiceId: string; status: string }> {
    const formData = new FormData();
    
    if (audioFile instanceof Buffer) {
      const blob = new Blob([audioFile], { type: 'audio/mpeg' });
      formData.append('audio', blob, 'voice.mp3');
    } else if (audioFile instanceof File || audioFile instanceof Blob) {
      formData.append('audio', audioFile);
    } else {
      throw new Error('audioFile must be a Buffer, File, or Blob');
    }

    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });
    }

    const response = await this.client.post<{ voiceId: string; status: string }>(
      '/ai/voice-clone',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Start a real-time conversation (if supported)
   * @param options Conversation options
   * @returns WebSocket connection details
   */
  async startConversation(options?: {
    voiceId?: string;
    language?: string;
    systemPrompt?: string;
  }): Promise<{ websocketUrl: string; sessionId: string }> {
    const response = await this.client.post<{ websocketUrl: string; sessionId: string }>(
      '/ai/conversation/start',
      options
    );

    return response.data;
  }
}