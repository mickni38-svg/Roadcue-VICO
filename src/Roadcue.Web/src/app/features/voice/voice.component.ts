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
  CONVERSATION_IDLE_MS,
  SILENCE_SUBMIT_MS,
  WAKE_ACK,
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
  private conversationTimer: ReturnType<typeof setTimeout> | null = null;
  private silenceTimer: ReturnType<typeof setTimeout> | null = null;
  // Guard so "Ja" is spoken at most once per buffer cycle. Otherwise
  // every interim result that still contains the wake word would
  // re-trigger the ack, which sounds like "Ja, Ja, Ja...".
  private ackedForCurrentBuffer = false;

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
    this.clearConversationTimer();
    this.clearSilenceTimer();
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
    this.clearConversationTimer();
    this.clearSilenceTimer();
    this.resetBuffers();
  }

  private resetBuffers(keepCapturing = false): void {
    if (!keepCapturing) this.capturing = false;
    this.finalizedText = '';
    this.interimText = '';
    this.ackedForCurrentBuffer = false;
  }

  private armConversationTimer(): void {
    this.clearConversationTimer();
    this.conversationTimer = setTimeout(() => {
      this.conversationTimer = null;
      this.capturing = false;
      this.resetBuffers();
      // Only fall back to waiting-wake if we're still in an idle
      // conversational state (avoid overriding an active exchange).
      if (!this.busy && this.state() === 'listening') {
        this.state.set('waiting-wake');
      }
    }, CONVERSATION_IDLE_MS);
  }

  private clearConversationTimer(): void {
    if (this.conversationTimer !== null) {
      clearTimeout(this.conversationTimer);
      this.conversationTimer = null;
    }
  }

  /**
   * (Re)starts a short "silence" timer. When it fires without any new
   * transcript, the accumulated body (everything after the wake word)
   * is submitted to the agent, which itself decides whether the input
   * is a question or a command (UC-03). This replaces the old requirement
   * to end each utterance with the word "SKIFTER".
   */
  private armSilenceTimer(body: string): void {
    this.clearSilenceTimer();
    this.silenceTimer = setTimeout(() => {
      this.silenceTimer = null;
      this.resetBuffers(true);
      const trimmed = body.trim();
      if (!trimmed) {
        this.state.set('listening');
        this.armConversationTimer();
        return;
      }
      void this.processMessage(trimmed);
    }, SILENCE_SUBMIT_MS);
  }

  private clearSilenceTimer(): void {
    if (this.silenceTimer !== null) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  /**
   * Fire-and-forget short acknowledgement ("Ja") when VICO hears its
   * wake word. Does not toggle {@link busy} so the user can start
   * talking immediately after the ack.
   */
  private acknowledgeWake(): void {
    try {
      void this.synthesis.speak(WAKE_ACK).catch(() => {
        /* ignore – best-effort ack */
      });
    } catch {
      /* ignore */
    }
  }

  private handleTranscript(transcript: string, isFinal: boolean): void {
    if (this.busy) return;

    // Web Speech on iOS Safari emits each pause as a separate final segment.
    // Accumulate all finals since the wake word and keep the latest interim
    // as a tentative tail; a 2s silence timer decides when to submit.
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
      if (!this.ackedForCurrentBuffer) {
        this.ackedForCurrentBuffer = true;
        this.acknowledgeWake();
      }
      this.clearConversationTimer();
    } else if (
      wake !== -1 &&
      upper.slice(0, wake.before).trim() === '' &&
      !this.ackedForCurrentBuffer
    ) {
      // Already in conversation mode; user re-invoked "VICO" as a lone
      // attention word. Acknowledge once for this buffer cycle.
      this.ackedForCurrentBuffer = true;
      this.acknowledgeWake();
    }

    // Isolate the body that follows the wake word (if any). In
    // conversation mode the buffer may not contain a wake word at all,
    // in which case the whole buffer is the body.
    const wakeAfter = wake !== -1 ? wake.after : 0;
    const body = full.slice(wakeAfter).trim();

    // Every new transcript (interim or final) restarts the silence timer.
    // When the driver stops speaking for ~2s, the accumulated body is
    // sent to the agent automatically – no end-word required.
    this.armSilenceTimer(body);
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
      this.state.set('listening');
      this.capturing = true;
      this.armConversationTimer();
      this.busy = false;
      return;
    }

    if (!answer) {
      this.state.set('listening');
      this.capturing = true;
      this.armConversationTimer();
      this.busy = false;
      return;
    }

    this.state.set('speaking');
    try {
      await this.synthesis.speak(answer);
    } catch {
      // Keep the answer in the UI, but return to listening state.
    }
    // Stay hot: the user can continue without repeating "VICO" until
    // the idle timer expires.
    this.capturing = true;
    this.state.set('listening');
    this.armConversationTimer();
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

