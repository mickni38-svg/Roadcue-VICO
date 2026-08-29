import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SpeechSynthesisAdapter } from './speech-synthesis.adapter';

export const AZURE_TTS_ENDPOINT = '/api/speech/tts';

const SILENT_AUDIO_DATA_URL =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=';

/**
 * TTS-adapter der beder Roadcue.Api om at oplæse teksten via
 * Azure Speech og afspiller den returnerede MP3 med et
 * HTMLAudioElement. Falder tilbage til den injicerede
 * browser-adapter hvis backend-kaldet eller lydafspilningen fejler,
 * så en Azure-/browserfejl ikke bryder samtaleforløbet (UC-40 AC7).
 */
export class AzureSpeechSynthesisAdapter implements SpeechSynthesisAdapter {
  private audio: HTMLAudioElement | null = null;
  private currentUrl: string | null = null;
  private currentCompletion: (() => void) | null = null;
  private primed = false;

  constructor(
    private readonly http: HttpClient,
    private readonly fallback: SpeechSynthesisAdapter,
    private readonly createAudio: () => HTMLAudioElement = () => new Audio(),
  ) {}

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Audio' in window;
  }

  prime(): void {
    if (this.primed) return;

    // iPadOS kræver, at et audio-element startes direkte i brugerens
    // tap-handler. Behold og genbrug præcis dette element til Jeppe-MP3'en;
    // et muted engangselement frigør ikke et nyt element senere.
    try {
      const audio = this.ensureAudio();
      audio.preload = 'auto';
      audio.muted = false;
      audio.volume = 1;
      audio.src = SILENT_AUDIO_DATA_URL;
      void audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
        })
        .catch(() => {
          /* best effort - playback-fallback håndterer en senere afvisning */
        });
      this.primed = true;
    } catch {
      /* ignore - best effort */
    }

    // Prim også fallback for tilfælde hvor Azure eller MP3-afspilningen fejler.
    this.fallback.prime();
  }

  async speak(text: string): Promise<void> {
    if (!this.isSupported()) {
      return this.fallback.speak(text);
    }

    let blob: Blob;
    try {
      blob = await firstValueFrom(
        this.http.post(AZURE_TTS_ENDPOINT, { text }, { responseType: 'blob' }),
      );
    } catch {
      // UC-40 AC7: Azure-fejl må ikke bryde samtalen.
      return this.fallback.speak(text);
    }

    this.stopCurrentAudio();
    this.fallback.cancel();

    const audio = this.ensureAudio();
    const url = URL.createObjectURL(blob);
    this.currentUrl = url;

    return new Promise<void>((resolve, reject) => {
      let settled = false;

      const complete = (): void => {
        if (settled) return;
        settled = true;
        this.currentCompletion = null;
        this.cleanupCurrent();
        resolve();
      };

      const useFallback = (): void => {
        if (settled) return;
        settled = true;
        this.currentCompletion = null;
        this.cleanupCurrent();
        void this.fallback.speak(text).then(resolve, reject);
      };

      this.currentCompletion = complete;
      audio.onended = complete;
      audio.onerror = useFallback;
      audio.preload = 'auto';
      audio.muted = false;
      audio.volume = 1;
      audio.src = url;

      try {
        void audio.play().catch(useFallback);
      } catch {
        useFallback();
      }
    });
  }

  cancel(): void {
    this.stopCurrentAudio();
    this.fallback.cancel();
  }

  private ensureAudio(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = this.createAudio();
    }
    return this.audio;
  }

  private stopCurrentAudio(): void {
    const complete = this.currentCompletion;
    this.currentCompletion = null;

    if (this.audio) {
      try {
        this.audio.pause();
      } catch {
        /* ignore */
      }
    }

    this.cleanupCurrent();
    complete?.();
  }

  private cleanupCurrent(): void {
    if (this.audio) {
      this.audio.onended = null;
      this.audio.onerror = null;
    }

    if (this.currentUrl) {
      try {
        URL.revokeObjectURL(this.currentUrl);
      } catch {
        /* ignore */
      }
      this.currentUrl = null;
    }
  }
}
