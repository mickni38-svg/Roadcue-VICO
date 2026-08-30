import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideEnvironmentInitializer,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClient, provideHttpClient } from '@angular/common/http';
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
import { AzureSpeechSynthesisAdapter } from './features/voice/azure-speech-synthesis.adapter';
import {
  BrowserGeolocationAdapter,
  GEOLOCATION_ADAPTER,
} from './features/location/geolocation.adapter';
import { LocationSyncService } from './features/location/location-sync.service';

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
      useFactory: (http: HttpClient) =>
        new AzureSpeechSynthesisAdapter(http, new WebSpeechSynthesisAdapter()),
      deps: [HttpClient],
    },
    {
      provide: GEOLOCATION_ADAPTER,
      useClass: BrowserGeolocationAdapter,
    },
    provideEnvironmentInitializer(() => {
      inject(LocationSyncService).start();
    }),
  ],
};
