import { InjectionToken } from '@angular/core';

export interface SpeechRecognitionAdapter {
  isSupported(): boolean;
  start(): Promise<string>;
  stop(): void;
}

export const SPEECH_RECOGNITION_ADAPTER =
  new InjectionToken<SpeechRecognitionAdapter>('SPEECH_RECOGNITION_ADAPTER');

interface WebSpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
}

export class WebSpeechRecognitionAdapter implements SpeechRecognitionAdapter {
  private recognition: WebSpeechRecognition | null = null;

  isSupported(): boolean {
    const w = window as any;
    return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
  }

  start(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const w = window as any;
      const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
      if (!Ctor) {
        reject(new Error('Speech recognition not supported'));
        return;
      }
      const rec: WebSpeechRecognition = new Ctor();
      rec.lang = 'da-DK';
      rec.continuous = false;
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      let transcript = '';
      rec.onresult = (event: any) => {
        transcript = event.results?.[0]?.[0]?.transcript ?? '';
      };
      rec.onerror = (event: any) => {
        reject(new Error(event?.error ?? 'speech-recognition-error'));
      };
      rec.onend = () => {
        this.recognition = null;
        resolve(transcript.trim());
      };

      this.recognition = rec;
      rec.start();
    });
  }

  stop(): void {
    try {
      this.recognition?.stop();
    } catch {
      // ignore
    }
  }
}
