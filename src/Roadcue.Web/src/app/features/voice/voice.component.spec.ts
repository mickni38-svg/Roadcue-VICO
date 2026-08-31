import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { VoiceComponent } from './voice.component';
import { AGENT_CHAT_ENDPOINT } from './agent-chat.service';
import {
  ContinuousRecognitionHandlers,
  ContinuousRecognitionSession,
  SPEECH_RECOGNITION_ADAPTER,
} from './speech-recognition.adapter';
import { SPEECH_SYNTHESIS_ADAPTER } from './speech-synthesis.adapter';

class FakeRecognition {
  handlers: ContinuousRecognitionHandlers | null = null;
  oldHandlers: ContinuousRecognitionHandlers[] = [];
  stopped = false;
  sessions = 0;

  isSupported(): boolean {
    return true;
  }

  listen(handlers: ContinuousRecognitionHandlers): ContinuousRecognitionSession {
    if (this.handlers) this.oldHandlers.push(this.handlers);
    this.handlers = handlers;
    this.stopped = false;
    this.sessions++;
    return {
      stop: () => {
        this.stopped = true;
      },
    };
  }

  emit(transcript: string, isFinal = true): void {
    this.handlers?.onTranscript(transcript, isFinal);
  }

  emitFromOldSession(transcript: string, isFinal = true): void {
    this.oldHandlers.at(-1)?.onTranscript(transcript, isFinal);
  }

  emitError(err: string): void {
    this.handlers?.onError?.(err);
  }
}

class FakeSynthesis {
  spoken: string[] = [];
  cancelled = false;
  primed = 0;
  shouldReject: unknown = null;

  isSupported(): boolean {
    return true;
  }
  prime(): void {
    this.primed++;
  }
  speak(text: string): Promise<void> {
    this.spoken.push(text);
    if (this.shouldReject) return Promise.reject(this.shouldReject);
    return Promise.resolve();
  }
  cancel(): void {
    this.cancelled = true;
  }
}

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

describe('VoiceComponent (wake-word + SKIFTER flow)', () => {
  let recognition: FakeRecognition;
  let synthesis: FakeSynthesis;
  let httpMock: HttpTestingController;

  beforeEach(() => jasmine.clock().install());
  afterEach(() => jasmine.clock().uninstall());

  function build(): VoiceComponent {
    recognition = new FakeRecognition();
    synthesis = new FakeSynthesis();
    TestBed.configureTestingModule({
      imports: [VoiceComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SPEECH_RECOGNITION_ADAPTER, useValue: recognition },
        { provide: SPEECH_SYNTHESIS_ADAPTER, useValue: synthesis },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    return TestBed.createComponent(VoiceComponent).componentInstance;
  }

  afterEach(() => {
    httpMock?.verify();
    TestBed.resetTestingModule();
  });

  it('starts idle and enters waiting-wake after first tap', async () => {
    const cmp = build();
    expect(cmp.state()).toBe('idle');
    await cmp.onTap();
    expect(cmp.state()).toBe('waiting-wake');
    expect(synthesis.primed).toBe(1);
    expect(recognition.sessions).toBe(1);
  });

  it('ignores transcripts without a wake word', async () => {
    const cmp = build();
    await cmp.onTap();
    recognition.emit('bare noget snak skifter', true);
    expect(cmp.state()).toBe('waiting-wake');
    httpMock.expectNone(AGENT_CHAT_ENDPOINT);
  });

  it('does not submit merely because the driver becomes silent', async () => {
    const cmp = build();
    await cmp.onTap();
    recognition.emit('VICO hvad er en rasteplads', true);
    expect(cmp.state()).toBe('listening');
    jasmine.clock().tick(10_000);
    httpMock.expectNone(AGENT_CHAT_ENDPOINT);
  });

  it('submits the message only when final SKIFTER is heard', async () => {
    const cmp = build();
    await cmp.onTap();
    let resolveSpeak!: () => void;
    synthesis.speak = (text: string) => {
      synthesis.spoken.push(text);
      return text === 'Ja' ? Promise.resolve() : new Promise<void>((r) => (resolveSpeak = r));
    };

    recognition.emit('Hej VICO vis mig chaufførerne', true);
    recognition.emit('skifter', true);
    await flush();
    const req = httpMock.expectOne(AGENT_CHAT_ENDPOINT);
    expect(req.request.body).toEqual({ message: 'vis mig chaufførerne', thread_id: null });
    req.flush({ answer: 'Her er de', thread_id: 't1' });
    await flush();
    expect(cmp.state()).toBe('speaking');
    expect(recognition.stopped).toBeTrue();

    resolveSpeak();
    await flush();
    expect(cmp.state()).toBe('listening');
    expect(recognition.sessions).toBe(2);
  });

  it('does not capture the tail of VICO speech as the next user message', async () => {
    const cmp = build();
    await cmp.onTap();
    let resolveSpeak!: () => void;
    synthesis.speak = (text: string) =>
      text === 'Ja' ? Promise.resolve() : new Promise<void>((r) => (resolveSpeak = r));

    recognition.emit('vico hvor mange venner har jeg skifter', true);
    await flush();
    httpMock.expectOne(AGENT_CHAT_ENDPOINT).flush({
      answer: 'Michael, du har Peter og Thomas.',
      thread_id: 't-42',
    });
    await flush();
    expect(cmp.state()).toBe('speaking');

    // Simuler en queued final-result fra den stoppede Web Speech-session.
    recognition.emit('og Thomas', true);
    resolveSpeak();
    await flush();

    // Selv en sen callback fra den gamle session skal ignoreres.
    recognition.emitFromOldSession('og Thomas', true);
    recognition.emit('kan du finde min lokation skifter', true);
    await flush();

    const req = httpMock.expectOne(AGENT_CHAT_ENDPOINT);
    expect(req.request.body).toEqual({
      message: 'kan du finde min lokation',
      thread_id: 't-42',
    });
    req.flush({ answer: 'ok', thread_id: 't-42' });
    await flush();
  });

  it('reuses thread_id on a hot follow-up without repeating VICO', async () => {
    const cmp = build();
    await cmp.onTap();
    recognition.emit('vico første besked skifter', true);
    await flush();
    httpMock.expectOne(AGENT_CHAT_ENDPOINT).flush({ answer: 'a', thread_id: 't-42' });
    await flush();

    recognition.emit('anden besked skifter', true);
    await flush();
    const req = httpMock.expectOne(AGENT_CHAT_ENDPOINT);
    expect(req.request.body).toEqual({ message: 'anden besked', thread_id: 't-42' });
    req.flush({ answer: 'b', thread_id: 't-42' });
    await flush();
  });

  it('accumulates separate iOS final segments until SKIFTER', async () => {
    const cmp = build();
    await cmp.onTap();
    recognition.emit('vico', true);
    recognition.emit('hvad er', true);
    recognition.emit('klokken', true);
    recognition.emit('skifter', true);
    await flush();
    const req = httpMock.expectOne(AGENT_CHAT_ENDPOINT);
    expect(req.request.body.message).toBe('hvad er klokken');
    req.flush({ answer: 'ok', thread_id: 't' });
    await flush();
  });

  it('does not send an empty request for VICO SKIFTER', async () => {
    const cmp = build();
    await cmp.onTap();
    recognition.emit('vico skifter', true);
    await flush();
    httpMock.expectNone(AGENT_CHAT_ENDPOINT);
    expect(cmp.state()).toBe('listening');
  });

  it('stops session and returns to idle when tapped while waiting', async () => {
    const cmp = build();
    await cmp.onTap();
    await cmp.onTap();
    expect(cmp.state()).toBe('idle');
    expect(recognition.stopped).toBeTrue();
  });

  it('shows error and stops session on recognition error', async () => {
    const cmp = build();
    await cmp.onTap();
    recognition.emitError('audio-capture');
    expect(cmp.state()).toBe('error');
    expect(recognition.stopped).toBeTrue();
  });
});
