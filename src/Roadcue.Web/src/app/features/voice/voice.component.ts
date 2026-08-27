import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnDestroy,
} from '@angular/core';
import { AgentChatService } from './agent-chat.service';
import {
  SPEECH_RECOGNITION_ADAPTER,
  SpeechRecognitionAdapter,
  ContinuousRecognitionSession,
} from './speech-recognition.adapter';
import {
  SPEECH_SYNTHESIS_ADAPTER,
  SpeechSynthesisAdapter,
} from './speech-synthesis.adapter';
import {
  VOICE_EMOJI,
  VOICE_LABEL,
  VoiceState,
  WAKE_WORDS,
  END_WORD,
} from './voice-state';

@Component({
  selector: 'app-voice',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './voice.component.html',
  styleUrl: './voice.component.scss',
})
export class VoiceComponent implements OnDestroy {
  private readonly chat = inject(AgentChatService);
  private readonly recognition = inject<SpeechRecognitionAdapter>(
    SPEECH_RECOGNITION_ADAPTER,
  );
  private readonly synthesis = inject<SpeechSynthesisAdapter>(
    SPEECH_SYNTHESIS_ADAPTER,
  );

  readonly state = signal<VoiceState>('idle');
  readonly lastAnswer = signal<string>('');
  readonly errorMessage = signal<string>('');

  readonly emoji = computed(() => VOICE_EMOJI[this.state()]);
  readonly label = computed(() =>
    this.errorMessage() ? this.errorMessage() : VOICE_LABEL[this.state()],
  );

  private session: ContinuousRecognitionSession | null = null;
  private capturing = false;
  private capturedText = '';
  private busy = false; // true while sending to backend or speaking

  async onTap(): Promise<void> {
    const current = this.state();

    if (current === 'speaking') {
      this.synthesis.cancel();
      this.state.set('waiting-wake');
      return;
    }

    if (this.session) {
      // Already listening – tap stops everything and returns to idle.
      this.stopSession();
      this.state.set('idle');
      return;
    }

    // First tap: prime TTS (needed for iOS) and start continuous recognition.
    this.errorMessage.set('');
    this.synthesis.prime();
    this.startSession();
  }

  ngOnDestroy(): void {
    this.stopSession();
  }

  private startSession(): void {
    this.capturing = false;
    this.capturedText = '';
    this.state.set('waiting-wake');
    this.session = this.recognition.listen({
      onTranscript: (transcript, isFinal) =>
        this.handleTranscript(transcript, isFinal),
      onError: (err) => {
        this.errorMessage.set(`Mikrofonfejl: ${err}`);
        this.state.set('error');
        this.stopSession();
      },
    });
  }

  private stopSession(): void {
    this.session?.stop();
    this.session = null;
    this.capturing = false;
    this.capturedText = '';
  }

  private handleTranscript(transcript: string, isFinal: boolean): void {
    if (this.busy) return;

    const upper = transcript.toUpperCase();
    const wake = findFirstWordIndex(upper, WAKE_WORDS);
    const end = findFirstWordIndex(upper, [END_WORD]);

    // Decide where the payload starts:
    //  - if the current segment contains a wake word, always skip past it
    //    (handles the case where the recognizer re-emits the whole utterance
    //    including the wake word).
    //  - otherwise, only continue capturing if we already started.
    let start: number;
    if (wake !== -1) {
      start = wake.after;
      if (!this.capturing) {
        this.capturing = true;
        this.state.set('listening');
      }
    } else if (this.capturing) {
      start = 0;
    } else {
      return;
    }

    const skifterSaid = end !== -1 && end.before > start;
    const bodyEnd = skifterSaid ? end.before : transcript.length;
    this.capturedText = transcript.slice(start, bodyEnd).trim();

    // Only "SKIFTER" ends the capture. iOS Safari flags every pause as final,
    // so acting on isFinal would cut the user off mid-sentence.
    if (!skifterSaid) return;

    const message = this.capturedText;
    this.capturing = false;
    this.capturedText = '';
    if (!message) {
      this.state.set('waiting-wake');
      return;
    }
    void this.processMessage(message);
  }

  private async processMessage(message: string): Promise<void> {
    this.busy = true;
    this.state.set('processing');
    let answer = '';
    try {
      const response = await this.chat.sendMessage(message);
      answer = response.answer ?? '';
      this.lastAnswer.set(answer);
    } catch (err) {
      this.errorMessage.set(this.describe(err, 'Der opstod en fejl.'));
      this.state.set('waiting-wake');
      this.busy = false;
      return;
    }

    if (!answer) {
      this.state.set('waiting-wake');
      this.busy = false;
      return;
    }

    this.state.set('speaking');
    try {
      await this.synthesis.speak(answer);
    } catch {
      // Keep the answer in the UI, but return to listening state.
    }
    this.state.set('waiting-wake');
    this.busy = false;
  }

  private describe(err: unknown, fallback: string): string {
    if (err instanceof Error && err.message) {
      return `${fallback} (${err.message})`;
    }
    return fallback;
  }
}

/**
 * Finds the first occurrence of any word in `words` inside `haystack`
 * (already uppercased). Returns the character indexes immediately before and
 * after the match, or -1 if not found. Uses word boundaries so 'VICOSA' does
 * not trigger 'VICO'.
 */
function findFirstWordIndex(
  haystack: string,
  words: readonly string[],
): { before: number; after: number } | -1 {
  let best: { before: number; after: number } | -1 = -1;
  for (const w of words) {
    const re = new RegExp(`\\b${w}\\b`);
    const m = re.exec(haystack);
    if (m && (best === -1 || m.index < best.before)) {
      best = { before: m.index, after: m.index + w.length };
    }
  }
  return best;
}

