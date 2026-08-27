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
  private finalizedText = '';
  private interimText = '';
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
    this.resetBuffers();
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
    this.resetBuffers();
  }

  private resetBuffers(): void {
    this.capturing = false;
    this.finalizedText = '';
    this.interimText = '';
  }

  private handleTranscript(transcript: string, isFinal: boolean): void {
    if (this.busy) return;

    // Web Speech on iOS Safari emits each pause as a separate final segment.
    // Accumulate all finals since the wake word and keep the latest interim
    // as a tentative tail so we can react the moment SKIFTER appears.
    if (isFinal) {
      this.finalizedText = (this.finalizedText + ' ' + transcript).trim();
      this.interimText = '';
    } else {
      this.interimText = transcript.trim();
    }

    const full = (this.finalizedText + ' ' + this.interimText).trim();
    if (!full) return;
    const upper = full.toUpperCase();

    const wake = findFirstWordIndex(upper, WAKE_WORDS);
    if (!this.capturing) {
      if (wake === -1) return;
      this.capturing = true;
      this.state.set('listening');
    }

    // Isolate the body that follows the wake word. If wake was not found in
    // this cumulative buffer (e.g. it was trimmed) we treat the whole buffer
    // as body.
    const wakeAfter = wake !== -1 ? wake.after : 0;
    const bodyUpper = upper.slice(wakeAfter);
    const endInBody = findFirstWordIndex(bodyUpper, [END_WORD]);
    if (endInBody === -1) return; // Only SKIFTER ends capture.

    const message = full
      .slice(wakeAfter, wakeAfter + endInBody.before)
      .trim();
    this.resetBuffers();

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

