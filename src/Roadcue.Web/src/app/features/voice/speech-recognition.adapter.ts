import { InjectionToken } from '@angular/core';

export interface ContinuousRecognitionHandlers {
  /** Fires whenever the recognizer produces text (interim or final). */
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export interface ContinuousRecognitionSession {
  stop(): void;
}

export interface SpeechRecognitionAdapter {
  isSupported(): boolean;
  /**
   * Starts a long-running recognition session that auto-restarts when the
   * browser ends the underlying utterance (needed on iOS Safari, which stops
   * after each pause). Call stop() on the returned session to end for good.
   */
  listen(handlers: ContinuousRecognitionHandlers): ContinuousRecognitionSession;
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
  isSupported(): boolean {
    const w = window as any;
    return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
  }

  listen(
    handlers: ContinuousRecognitionHandlers,
  ): ContinuousRecognitionSession {
    const w = window as any;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      handlers.onError?.('Speech recognition not supported');
      return { stop: () => undefined };
    }

    let stopped = false;
    let rec: WebSpeechRecognition | null = null;

    const spawn = (): void => {
      if (stopped) return;
      const r: WebSpeechRecognition = new Ctor();
      r.lang = 'da-DK';
      r.continuous = true;
      r.interimResults = true;
      r.maxAlternatives = 1;

      r.onresult = (event: any) => {
        const results = event.results;
        if (!results) return;
        // Report each new result – final or interim – so the caller can
        // react to wake-words the moment they arrive.
        for (let i = event.resultIndex ?? 0; i < results.length; i++) {
          const res = results[i];
          const transcript: string = res?.[0]?.transcript ?? '';
          if (!transcript) continue;
          handlers.onTranscript(transcript, !!res.isFinal);
        }
      };
      r.onerror = (event: any) => {
        const err = event?.error ?? 'speech-recognition-error';
        // "no-speech" and "aborted" are normal during long pauses – ignore.
        if (err !== 'no-speech' && err !== 'aborted') {
          handlers.onError?.(err);
        }
      };
      r.onend = () => {
        // iOS stops after each utterance; restart until caller calls stop().
        if (!stopped) {
          setTimeout(spawn, 100);
        }
      };
      rec = r;
      try {
        r.start();
      } catch {
        // start() throws if called too soon after end; retry shortly.
        if (!stopped) setTimeout(spawn, 200);
      }
    };

    spawn();

    return {
      stop: () => {
        stopped = true;
        try {
          rec?.stop();
        } catch {
          // ignore
        }
      },
    };
  }
}

