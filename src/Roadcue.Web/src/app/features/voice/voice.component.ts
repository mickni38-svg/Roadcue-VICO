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
  END_WORDS,
  CONVERSATION_IDLE_MS,
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
  private busy = false;
  private conversationTimer: ReturnType<typeof setTimeout> | null = null;
  private ackedForCurrentBuffer = false;

  async onTap(): Promise<void> {
    const current = this.state();

    if (current === 'speaking') {
      this.synthesis.cancel();
      this.state.set('waiting-wake');
      return;
    }

    if (this.session) {
      this.stopSession();
      this.state.set('idle');
      return;
    }

    this.errorMessage.set('');
    this.synthesis.prime();
    this.startSession();
  }

  ngOnDestroy(): void {
    this.stopSession();
    this.clearConversationTimer();
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
   * Fire-and-forget short acknowledgement ("Ja") when VICO hears its
   * wake word. Does not toggle busy so the user can start talking
   * immediately after the acknowledgement.
   */
  private acknowledgeWake(): void {
    try {
      void this.synthesis.speak(WAKE_ACK).catch(() => {
        /* best-effort acknowledgement */
      });
    } catch {
      /* best-effort acknowledgement */
    }
  }

  private handleTranscript(transcript: string, isFinal: boolean): void {
    if (this.busy) return;

    // iOS/Safari may split one utterance into several final segments.
    // Keep accumulating them until the explicit end word SKIFTER is heard.
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
    } else if (
      wake !== -1 &&
      upper.slice(0, wake.before).trim() === '' &&
      !this.ackedForCurrentBuffer
    ) {
      this.ackedForCurrentBuffer = true;
      this.acknowledgeWake();
    }

    this.clearConversationTimer();

    // In an active conversation a new utterance does not need to repeat VICO.
    // If a wake word is present, only the text after it belongs to the message.
    const wakeAfter = wake !== -1 ? wake.after : 0;
    const body = full.slice(wakeAfter).trim();
    const bodyUpper = body.toUpperCase();
    const end = findFirstWordIndex(bodyUpper, END_WORDS);

    // Never submit on silence alone. A final recognition result containing
    // SKIFTER is required, which prevents incidental cabin speech from being
    // turned into an agent request.
    if (!isFinal || end === -1) return;

    const message = body.slice(0, end.before).trim();
    this.resetBuffers(true);

    if (!message) {
      this.state.set('listening');
      this.armConversationTimer();
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

    // Keep the conversation hot so follow-up messages can omit VICO, but every
    // utterance still has to end with SKIFTER before it is sent to the agent.
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
