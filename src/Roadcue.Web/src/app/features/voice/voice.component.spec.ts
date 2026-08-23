import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { VoiceComponent } from './voice.component';
import { AGENT_CHAT_ENDPOINT } from './agent-chat.service';
import { SPEECH_RECOGNITION_ADAPTER } from './speech-recognition.adapter';
import { SPEECH_SYNTHESIS_ADAPTER } from './speech-synthesis.adapter';

class FakeRecognition {
  transcript = 'hej vico';
  shouldReject: unknown = null;
  stopped = false;
  start(): Promise<string> {
    if (this.shouldReject) {
      return Promise.reject(this.shouldReject);
    }
    return Promise.resolve(this.transcript);
  }
  stop(): void {
    this.stopped = true;
  }
  isSupported(): boolean {
    return true;
  }
}

class FakeSynthesis {
  spoken: string[] = [];
  cancelled = false;
  shouldReject: unknown = null;
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
  isSupported(): boolean {
    return true;
  }
}

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

describe('VoiceComponent', () => {
  let recognition: FakeRecognition;
  let synthesis: FakeSynthesis;
  let httpMock: HttpTestingController;

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

  it('walks through idle → listening → processing → speaking → idle', async () => {
    const cmp = build();
    expect(cmp.state()).toBe('idle');

    let resolveSpeak!: () => void;
    synthesis.speak = (text: string) => {
      synthesis.spoken.push(text);
      return new Promise<void>((r) => (resolveSpeak = r));
    };

    const tap = cmp.onTap();
    await flush();
    // recognition resolved; state moved to processing
    expect(cmp.state()).toBe('processing');

    const req = httpMock.expectOne(AGENT_CHAT_ENDPOINT);
    expect(req.request.body).toEqual({
      message: 'hej vico',
      thread_id: null,
    });
    req.flush({ answer: 'Hej tilbage', thread_id: 't1' });
    await flush();
    expect(cmp.state()).toBe('speaking');
    expect(synthesis.spoken).toEqual(['Hej tilbage']);

    resolveSpeak();
    await tap;
    expect(cmp.state()).toBe('idle');
  });

  it('reuses thread_id on the follow-up utterance', async () => {
    const cmp = build();
    const first = cmp.onTap();
    await flush();
    httpMock
      .expectOne(AGENT_CHAT_ENDPOINT)
      .flush({ answer: 'ok', thread_id: 't-42' });
    await first;

    recognition.transcript = 'anden ytring';
    const second = cmp.onTap();
    await flush();
    const req = httpMock.expectOne(AGENT_CHAT_ENDPOINT);
    expect(req.request.body).toEqual({
      message: 'anden ytring',
      thread_id: 't-42',
    });
    req.flush({ answer: 'igen', thread_id: 't-42' });
    await second;
  });

  it('does not send HTTP when transcript is empty', async () => {
    const cmp = build();
    recognition.transcript = '   ';
    await cmp.onTap();
    httpMock.expectNone(AGENT_CHAT_ENDPOINT);
    expect(cmp.state()).toBe('error');
  });

  it('preserves thread_id when HTTP fails', async () => {
    const cmp = build();
    const first = cmp.onTap();
    await flush();
    httpMock
      .expectOne(AGENT_CHAT_ENDPOINT)
      .flush({ answer: 'ok', thread_id: 't-x' });
    await first;

    const second = cmp.onTap();
    await flush();
    httpMock
      .expectOne(AGENT_CHAT_ENDPOINT)
      .flush('boom', { status: 500, statusText: 'err' });
    await second;
    expect(cmp.state()).toBe('error');

    // The service still holds t-x; verify by triggering another call
    recognition.transcript = 'tredje';
    const third = cmp.onTap();
    await flush();
    const req = httpMock.expectOne(AGENT_CHAT_ENDPOINT);
    expect(req.request.body.thread_id).toBe('t-x');
    req.flush({ answer: 'ok', thread_id: 't-x' });
    await third;
  });

  it('cancels speech synthesis when tapped while speaking', async () => {
    const cmp = build();
    let resolveSpeak!: () => void;
    synthesis.speak = (text: string) => {
      synthesis.spoken.push(text);
      return new Promise<void>((r) => (resolveSpeak = r));
    };
    const tap = cmp.onTap();
    await flush();
    httpMock
      .expectOne(AGENT_CHAT_ENDPOINT)
      .flush({ answer: 'noget langt', thread_id: 't1' });
    await flush();
    expect(cmp.state()).toBe('speaking');

    await cmp.onTap();
    expect(synthesis.cancelled).toBeTrue();
    expect(cmp.state()).toBe('idle');
    resolveSpeak();
    await tap;
  });
});
