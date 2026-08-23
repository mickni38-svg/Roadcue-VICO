import { InjectionToken } from '@angular/core';

export interface SpeechSynthesisAdapter {
  isSupported(): boolean;
  speak(text: string): Promise<void>;
  cancel(): void;
}

export const SPEECH_SYNTHESIS_ADAPTER =
  new InjectionToken<SpeechSynthesisAdapter>('SPEECH_SYNTHESIS_ADAPTER');

export class WebSpeechSynthesisAdapter implements SpeechSynthesisAdapter {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  speak(text: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'da-DK';
      utter.onend = () => resolve();
      utter.onerror = (event: any) =>
        reject(new Error(event?.error ?? 'speech-synthesis-error'));
      window.speechSynthesis.speak(utter);
    });
  }

  cancel(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  }
}
