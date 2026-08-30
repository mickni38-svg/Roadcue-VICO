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
  stopped = false;
  sessions = 0;

  isSupported(): boolean {
    return true;
  }

  listen(handlers: ContinuousRecognitionHandlers): ContinuousRecognitionSession {
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
    if (this.shouldReject) {
      return Promise.reject(this.shouldReject);
    }
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

describe('VoiceComponent (wake-word flow)', () => {
  let recognition: FakeRecognition;
  let synthesis: FakeSynthesis;
  let httpMock: HttpTestingController;

  const SILENCE_MS = 2000;

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

  it('starts idle and enters waiting-wake after first tap (primes TTS)', async () => {
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
    recognition.emit('bare noget snak uden aktivering', true);
    jasmine.clock().tick(SILENCE_MS + 10);
    expect(cmp.state()).toBe('waiting-wake');
    httpMock.expectNone(AGENT_CHAT_ENDPOINT);
  });

  it('captures message after wake word and submits after 2s of silence', async () => {
    const cmp = build();
    await cmp.onTap();
    let resolveSpeak!: () => void;
    synthesis.speak = (text: string) => {
      synthesis.spoken.push(text);
      return new Promise<void>((r) => (resolveSpeak = r));
    };
    recognition.emit('Hej VICO vis mig chaufførerne', true);
    expect(cmp.state()).toBe('listening');
    httpMock.expectNone(AGENT_CHAT_ENDPOINT);
    jasmine.clock().tick(SILENCE_MS + 10);
    await flush();
    expect(cmp.state()).toBe('processing');
    const req = httpMock.expectOne(AGENT_CHAT_ENDPOINT);
    expect(req.request.body).toEqual({
      message: 'vis mig chaufførerne',
      thread_id: null,
    });
    req.flush({ answer: 'Her er de', thread_id: 't1' });
    await flush();
    expect(cmp.state()).toBe('speaking');
    // "Ja" is spoken as the wake acknowledgement before the answer.
    expect(synthesis.spoken).toEqual(['Ja', 'Her er de']);
    resolveSpeak();
    await flush();
    // After an answer VICO stays hot in listening (conversation mode).
    expect(cmp.state()).toBe('listening');
  });

  it('accepts VIGGO and VIGO as wake words', async () => {
    const cmp = build();
    await cmp.onTap();
    recognition.emit('viggo hvad er klokken', true);
    jasmine.clock().tick(SILENCE_MS + 10);
    await flush();
    const req = httpMock.expectOne(AGENT_CHAT_ENDPOINT);
    expect(req.request.body.message).toBe('hvad er klokken');
    req.flush({ answer: 'ok', thread_id: 't' });
    await flush();

    recognition.emit('vigo tak', true);
    jasmine.clock().tick(SILENCE_MS + 10);
    await flush();
    const req2 = httpMock.expectOne(AGENT_CHAT_ENDPOINT);
    expect(req2.request.body.message).toBe('tak');
    req2.flush({ answer: 'velbekomme', thread_id: 't' });
    await flush();
  });

  it('reuses thread_id on the follow-up utterance', async () => {
    const cmp = build();
    await cmp.onTap();
    recognition.emit('vico første besked', true);
    jasmine.clock().tick(SILENCE_MS + 10);
    await flush();
    httpMock
      .expectOne(AGENT_CHAT_ENDPOINT)
      .flush({ answer: 'a', thread_id: 't-42' });
    await flush();

    recognition.emit('vico anden besked', true);
    jasmine.clock().tick(SILENCE_MS + 10);
    await flush();
    const req = httpMock.expectOne(AGENT_CHAT_ENDPOINT);
    expect(req.request.body).toEqual({
      message: 'anden besked',
      thread_id: 't-42',
    });
    req.flush({ answer: 'b', thread_id: 't-42' });
    await flush();
  });

  it('does NOT send early when finals arrive quickly (iOS pauses become final)', async () => {
    const cmp = build();
    await cmp.onTap();
    // iOS Safari marks each pause as final; new speech before 2s must
    // restart the silence timer instead of submitting immediately.
    recognition.emit('vico hvad er', true);
    expect(cmp.state()).toBe('listening');
    jasmine.clock().tick(1500);
    httpMock.expectNone(AGENT_CHAT_ENDPOINT);
    recognition.emit('klokken', true);
    jasmine.clock().tick(1500);
    httpMock.expectNone(AGENT_CHAT_ENDPOINT);
    jasmine.clock().tick(SILENCE_MS + 10);
    await flush();
    const req = httpMock.expectOne(AGENT_CHAT_ENDPOINT);
    expect(req.request.body.message).toBe('hvad er klokken');
    req.flush({ answer: 'ok', thread_id: 't' });
    await flush();
  });

  it('accumulates message across separate final segments until silence', async () => {
    const cmp = build();
    await cmp.onTap();
    recognition.emit('vico', true); // wake in its own final
    expect(cmp.state()).toBe('listening');
    recognition.emit('hvad er klokken', true); // body in its own final
    httpMock.expectNone(AGENT_CHAT_ENDPOINT);
    jasmine.clock().tick(SILENCE_MS + 10); // silence completes the utterance
    await flush();
    const req = httpMock.expectOne(AGENT_CHAT_ENDPOINT);
    expect(req.request.body.message).toBe('hvad er klokken');
    req.flush({ answer: 'ok', thread_id: 't' });
    await flush();
  });

  it('cancels speech and returns to waiting-wake when tapped while speaking', async () => {
    const cmp = build();
    await cmp.onTap();
    let resolveSpeak!: () => void;
    synthesis.speak = (text: string) => {
      synthesis.spoken.push(text);
      return new Promise<void>((r) => (resolveSpeak = r));
    };
    recognition.emit('vico hej', true);
    jasmine.clock().tick(SILENCE_MS + 10);
    await flush();
    httpMock
      .expectOne(AGENT_CHAT_ENDPOINT)
      .flush({ answer: 'lang tekst', thread_id: 't' });
    await flush();
    expect(cmp.state()).toBe('speaking');

    await cmp.onTap();
    expect(synthesis.cancelled).toBeTrue();
    // Tapping while speaking cancels TTS and forces back to waiting-wake.
    expect(cmp.state()).toBe('waiting-wake');
    resolveSpeak();
    await flush();
  });

  it('stops session and returns to idle when tapped while waiting', async () => {
    const cmp = build();
    await cmp.onTap();
    expect(cmp.state()).toBe('waiting-wake');
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
