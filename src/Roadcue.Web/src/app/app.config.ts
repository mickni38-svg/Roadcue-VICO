import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';
import {
  SPEECH_RECOGNITION_ADAPTER,
  WebSpeechRecognitionAdapter,
} from './features/voice/speech-recognition.adapter';
import {
  SPEECH_SYNTHESIS_ADAPTER,
  WebSpeechSynthesisAdapter,
} from './features/voice/speech-synthesis.adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    {
      provide: SPEECH_RECOGNITION_ADAPTER,
      useClass: WebSpeechRecognitionAdapter,
    },
    {
      provide: SPEECH_SYNTHESIS_ADAPTER,
      useClass: WebSpeechSynthesisAdapter,
    },
  ],
};
