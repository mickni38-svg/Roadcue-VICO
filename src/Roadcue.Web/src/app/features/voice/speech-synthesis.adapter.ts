import { InjectionToken } from '@angular/core';

export interface SpeechSynthesisAdapter {
  isSupported(): boolean;
  /**
   * Must be called during a user gesture (iOS requires the audio channel to
   * be unlocked synchronously from a tap before background speak() calls will
   * produce sound).
   */
  prime(): void;
  speak(text: string): Promise<void>;
  cancel(): void;
}

export const SPEECH_SYNTHESIS_ADAPTER =
  new InjectionToken<SpeechSynthesisAdapter>('SPEECH_SYNTHESIS_ADAPTER');

export class WebSpeechSynthesisAdapter implements SpeechSynthesisAdapter {
  private primed = false;

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  prime(): void {
    if (!this.isSupported() || this.primed) return;
    try {
      // Empty utterance unlocks the audio channel on iOS Safari/Chrome.
      const warmup = new SpeechSynthesisUtterance('');
      warmup.volume = 0;
      window.speechSynthesis.speak(warmup);
      // Some browsers pause synthesis when the tab was previously idle.
      window.speechSynthesis.resume();
      this.primed = true;
    } catch {
      // ignore – best-effort priming
    }
  }

  speak(text: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }
      this.ensureVoicesLoaded().then(() => {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'da-DK';
        const daVoice = window.speechSynthesis
          .getVoices()
          .find((v) => v.lang?.toLowerCase().startsWith('da'));
        if (daVoice) utter.voice = daVoice;
        utter.onend = () => resolve();
        utter.onerror = (event: any) =>
          reject(new Error(event?.error ?? 'speech-synthesis-error'));
        // resume() first – iOS often pauses synthesis behind the scenes.
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utter);
      });
    });
  }

  cancel(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  private ensureVoicesLoaded(): Promise<void> {
    return new Promise<void>((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        resolve();
        return;
      }
      const handler = () => {
        window.speechSynthesis.removeEventListener(
          'voiceschanged',
          handler as any,
        );
        resolve();
      };
      window.speechSynthesis.addEventListener('voiceschanged', handler as any);
      // Safety net – some browsers never fire voiceschanged.
      setTimeout(resolve, 750);
    });
  }
}

