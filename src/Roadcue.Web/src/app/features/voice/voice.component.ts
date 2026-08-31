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
  private recognitionGeneration = 0;
  private capturing = false;
  private finalizedText = '';
  private interimText = '';
  private busy = false;
  private conversationTimer: ReturnType<typeof setTimeout> | null = null;
  private ackedForCurrentBuffer = false;

  async onTap(): Promise<void> {
    const current = this.state();

    if (current === 'speaking') {
      // processMessage() resumes recognition after the cancelled speech has
      // actually settled. Do not start a second recognizer here.
      this.synthesis.cancel();
      return;
    }

    if (this.session) {
      this.stopSession();
      this.state.set('idle');
      return;
    }

    this.errorMessage.set('');
    this.synthesis.prime();
    this.capturing = false;
    this.resetBuffers();
    this.state.set('waiting-wake');
    this.startRecognition();
  }

  ngOnDestroy(): void {
    this.stopSession();
    this.clearConversationTimer();
  }

  private startRecognition(): void {
    const generation = ++this.recognitionGeneration;
    this.session = this.recognition.listen({
      onTranscript: (transcript, isFinal) => {
        if (generation !== this.recognitionGeneration) return;
        this.handleTranscript(transcript, isFinal);
      },
      onError: (err) => {
        if (generation !== this.recognitionGeneration) return;
        this.errorMessage.set(`Mikrofonfejl: ${err}`);
        this.state.set('error');
        this.stopSession();
      },
    });
  }

  private stopRecognition(): void {
    // Invalidate callbacks from the old browser recognizer before stopping it.
    // Web Speech may still deliver a queued final result after stop().
    this.recognitionGeneration++;
    this.session?.stop();
    this.session = null;
  }

  private stopSession(): void {
    this.stopRecognition();
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
   * wake word. Recognition intentionally stays active for this very short
   * acknowledgement so the driver can continue speaking immediately.
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

    const wakeAfter = wake !== -1 ? wake.after : 0;
    const body = full.slice(wakeAfter).trim();
    const bodyUpper = body.toUpperCase();
    const end = findFirstWordIndex(bodyUpper, END_WORDS);

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

    // VICO must not listen to its own loudspeaker output. Stop recognition
    // before TTS starts and invalidate callbacks from the old recognizer.
    // This prevents a tail such as "og Thomas" from becoming the beginning
    // of the driver's next hot follow-up.
    this.clearConversationTimer();
    this.stopRecognition();
    this.resetBuffers(true);
    this.state.set('speaking');

    try {
      await this.synthesis.speak(answer);
    } catch {
      // Keep the answer in the UI. Listening is resumed below.
    }

    // Start a fresh recognition session only after playback has completely
    // settled. The conversation stays hot, so the next question does not need
    // the VICO wake word, but it still has to end with SKIFTER.
    this.resetBuffers(true);
    this.capturing = true;
    this.busy = false;
    this.state.set('listening');
    this.startRecognition();
    this.armConversationTimer();
  }

  private describe(err: unknown, fallback: string): string {
    if (err instanceof Error && err.message) {
      return `${fallback} (${err.message})`;
    }
    return fallback;
  }
}

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
