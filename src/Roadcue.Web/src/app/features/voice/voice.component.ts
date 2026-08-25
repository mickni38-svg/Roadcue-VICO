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
  templateUrl: './voice.component.html',
  styleUrl: './voice.component.scss',
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
