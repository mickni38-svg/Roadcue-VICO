import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { AgentChatService } from './agent-chat.service';
import {
  SPEECH_RECOGNITION_ADAPTER,
  SpeechRecognitionAdapter,
} from './speech-recognition.adapter';
import {
  SPEECH_SYNTHESIS_ADAPTER,
  SpeechSynthesisAdapter,
} from './speech-synthesis.adapter';
import { VOICE_EMOJI, VOICE_LABEL, VoiceState } from './voice-state';

@Component({
  selector: 'app-voice',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="voice">
      <button
        type="button"
        class="voice__emoji"
        [attr.aria-label]="label()"
        (click)="onTap()"
      >
        <span class="voice__emoji-glyph" [attr.data-state]="state()">{{
          emoji()
        }}</span>
      </button>
      <p class="voice__label">{{ label() }}</p>
      @if (lastAnswer()) {
        <p class="voice__answer">{{ lastAnswer() }}</p>
      }
      @if (errorMessage()) {
        <p class="voice__error">{{ errorMessage() }}</p>
      }
    </main>
  `,
  styles: [
    `
      :host {
        display: flex;
        min-height: 100dvh;
        align-items: center;
        justify-content: center;
        background: #0b0f14;
        color: #f5f7fa;
        font-family: system-ui, sans-serif;
      }
      .voice {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        text-align: center;
        padding: 1rem;
      }
      .voice__emoji {
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: clamp(6rem, 30vw, 14rem);
        line-height: 1;
        padding: 0;
      }
      .voice__emoji-glyph[data-state='listening'] {
        animation: pulse 1.2s ease-in-out infinite;
      }
      .voice__emoji-glyph[data-state='processing'] {
        animation: spin 1.6s linear infinite;
        display: inline-block;
      }
      .voice__emoji-glyph[data-state='speaking'] {
        animation: bob 0.8s ease-in-out infinite;
        display: inline-block;
      }
      .voice__label {
        font-size: 1.25rem;
        margin: 0;
      }
      .voice__answer {
        max-width: 32rem;
        opacity: 0.9;
      }
      .voice__error {
        color: #ff8b8b;
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.08); }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes bob {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }
    `,
  ],
})
export class VoiceComponent {
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

  async onTap(): Promise<void> {
    const current = this.state();
    if (current === 'listening') {
      this.recognition.stop();
      return;
    }
    if (current === 'speaking') {
      this.synthesis.cancel();
      this.state.set('idle');
      return;
    }
    if (current === 'processing') {
      return;
    }
    await this.startCycle();
  }

  private async startCycle(): Promise<void> {
    this.errorMessage.set('');
    this.state.set('listening');

    let transcript = '';
    try {
      transcript = (await this.recognition.start()).trim();
    } catch (err) {
      this.fail(this.describe(err, 'Kunne ikke starte mikrofonen.'));
      return;
    }

    if (!transcript) {
      this.fail('Jeg hørte ingen tale. Prøv igen.');
      return;
    }

    this.state.set('processing');
    let answer = '';
    try {
      const response = await this.chat.sendMessage(transcript);
      answer = response.answer ?? '';
      this.lastAnswer.set(answer);
    } catch (err) {
      this.fail(this.describe(err, 'Der opstod en fejl. Prøv igen.'));
      return;
    }

    if (!answer) {
      this.state.set('idle');
      return;
    }

    this.state.set('speaking');
    try {
      await this.synthesis.speak(answer);
    } catch {
      // TTS-fejl: bevar svaret i UI'et, men gå tilbage til idle uden retry.
    }
    this.state.set('idle');
  }

  private fail(message: string): void {
    this.errorMessage.set(message);
    this.state.set('error');
  }

  private describe(err: unknown, fallback: string): string {
    if (err instanceof Error && err.message) {
      return `${fallback} (${err.message})`;
    }
    return fallback;
  }
}
