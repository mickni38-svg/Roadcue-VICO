import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SpeechSynthesisAdapter } from './speech-synthesis.adapter';

export const AZURE_TTS_ENDPOINT = '/api/speech/tts';

/**
 * TTS-adapter der beder Roadcue.Api om at oplæse teksten via
 * Azure Speech og afspiller den returnerede MP3 med et
 * `HTMLAudioElement`. Falder tilbage til den injicerede
 * browser-adapter hvis backend-kaldet fejler, så en Azure-fejl
 * ikke bryder samtaleforløbet (UC-40 AC7).
 */
export class AzureSpeechSynthesisAdapter implements SpeechSynthesisAdapter {
  private currentAudio: HTMLAudioElement | null = null;
  private currentUrl: string | null = null;
  private primed = false;

  constructor(
    private readonly http: HttpClient,
    private readonly fallback: SpeechSynthesisAdapter,
  ) {}

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Audio' in window;
  }

  prime(): void {
    if (this.primed) return;
    // Frigør browserens audio-kanal (iOS Safari kræver en user
    // gesture første gang). En kort, stille lyd er nok.
    try {
      const audio = new Audio();
      audio.muted = true;
      // 1 sample af stilhed (WAV) - short data URI.
      audio.src =
        'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=';
      void audio.play().catch(() => {
        /* ignore - best effort */
      });
      this.primed = true;
    } catch {
      /* ignore */
    }
    // Prim også fallback for tilfælde vi skal bruge den.
    this.fallback.prime();
  }

  async speak(text: string): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Audio not supported');
    }

    let blob: Blob;
    try {
      blob = await firstValueFrom(
        this.http.post(AZURE_TTS_ENDPOINT, { text }, { responseType: 'blob' }),
      );
    } catch {
      // UC-40 AC7: Azure-fejl må ikke bryde samtalen. Brug
      // browser-TTS så chaufføren stadig får svaret læst højt.
      return this.fallback.speak(text);
    }

    this.cancel();

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    this.currentAudio = audio;
    this.currentUrl = url;

    return new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        this.cleanupCurrent();
        resolve();
      };
      audio.onerror = () => {
        this.cleanupCurrent();
        reject(new Error('audio-playback-error'));
      };
      audio.play().catch((err) => {
        this.cleanupCurrent();
        reject(err instanceof Error ? err : new Error('audio-play-rejected'));
      });
    });
  }

  cancel(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
      } catch {
        /* ignore */
      }
    }
    this.cleanupCurrent();
    // Cancel også fallback for det tilfælde den kører.
    this.fallback.cancel();
  }

  private cleanupCurrent(): void {
    if (this.currentUrl) {
      try {
        URL.revokeObjectURL(this.currentUrl);
      } catch {
        /* ignore */
      }
      this.currentUrl = null;
    }
    this.currentAudio = null;
  }
}
