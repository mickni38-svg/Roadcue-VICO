import { HttpClient, HttpResponse, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  AzureSpeechSynthesisAdapter,
  AZURE_TTS_ENDPOINT,
} from './azure-speech-synthesis.adapter';
import { SpeechSynthesisAdapter } from './speech-synthesis.adapter';

class FakeFallback implements SpeechSynthesisAdapter {
  readonly spoken: string[] = [];
  primed = 0;
  cancelled = 0;

  isSupported(): boolean {
    return true;
  }

  prime(): void {
    this.primed++;
  }

  speak(text: string): Promise<void> {
    this.spoken.push(text);
    return Promise.resolve();
  }

  cancel(): void {
    this.cancelled++;
  }
}

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

describe('AzureSpeechSynthesisAdapter', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let fallback: FakeFallback;
  let audio: HTMLAudioElement;
  let play: jasmine.Spy;
  let pause: jasmine.Spy;
  let created: number;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    fallback = new FakeFallback();
    created = 0;

    play = jasmine.createSpy('play').and.returnValue(Promise.resolve());
    pause = jasmine.createSpy('pause');
    audio = {
      src: '',
      preload: '',
      muted: false,
      volume: 1,
      currentTime: 0,
      onended: null,
      onerror: null,
      play,
      pause,
    } as unknown as HTMLAudioElement;

    spyOn(URL, 'createObjectURL').and.returnValue('blob:azure-speech');
    spyOn(URL, 'revokeObjectURL');
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  function build(): AzureSpeechSynthesisAdapter {
    return new AzureSpeechSynthesisAdapter(http, fallback, () => {
      created++;
      return audio;
    });
  }

  it('reuses the audio element primed by the user gesture', async () => {
    const adapter = build();

    adapter.prime();
    await flush();

    expect(created).toBe(1);
    expect(audio.muted).toBeFalse();
    expect(play).toHaveBeenCalledTimes(1);
    expect(fallback.primed).toBe(1);

    const completed = adapter.speak('Hej fra Jeppe');
    httpMock.expectOne(AZURE_TTS_ENDPOINT).event(
      new HttpResponse<Blob>({
        body: new Blob(['mp3'], { type: 'audio/mpeg' }),
        status: 200,
        statusText: 'OK',
      }),
    );
    await flush();

    expect(created).toBe(1);
    expect(audio.src).toBe('blob:azure-speech');
    expect(play).toHaveBeenCalledTimes(2);

    audio.onended?.call(audio, new Event('ended'));
    await completed;

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:azure-speech');
    expect(fallback.spoken).toEqual([]);
  });

  it('uses browser speech when iPad rejects MP3 playback', async () => {
    play.and.returnValue(
      Promise.reject(new DOMException('Playback blocked', 'NotAllowedError')),
    );
    const adapter = build();

    const completed = adapter.speak('Læs dette op');
    httpMock.expectOne(AZURE_TTS_ENDPOINT).event(
      new HttpResponse<Blob>({
        body: new Blob(['mp3'], { type: 'audio/mpeg' }),
        status: 200,
        statusText: 'OK',
      }),
    );

    await completed;

    expect(fallback.spoken).toEqual(['Læs dette op']);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:azure-speech');
  });

  it('uses browser speech when the TTS endpoint fails', async () => {
    const adapter = build();

    const completed = adapter.speak('Fallback tekst');
    httpMock.expectOne(AZURE_TTS_ENDPOINT).error(
      new ProgressEvent('error'),
      { status: 502, statusText: 'Bad Gateway' },
    );

    await completed;

    expect(fallback.spoken).toEqual(['Fallback tekst']);
    expect(play).not.toHaveBeenCalled();
  });
});
