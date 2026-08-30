import { InjectionToken } from '@angular/core';

export type GeolocationFailure = 'permission-denied' | 'unavailable' | 'timeout' | 'unsupported';

export interface GeolocationAdapter {
  watch(
    onPosition: (position: GeolocationPosition) => void,
    onError: (error: GeolocationFailure) => void,
  ): number | null;

  clear(watchId: number): void;
}

export const GEOLOCATION_ADAPTER = new InjectionToken<GeolocationAdapter>(
  'GEOLOCATION_ADAPTER',
);

export class BrowserGeolocationAdapter implements GeolocationAdapter {
  watch(
    onPosition: (position: GeolocationPosition) => void,
    onError: (error: GeolocationFailure) => void,
  ): number | null {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      onError('unsupported');
      return null;
    }

    return navigator.geolocation.watchPosition(
      onPosition,
      (error) => onError(this.mapError(error.code)),
      {
        enableHighAccuracy: true,
        maximumAge: 10_000,
        timeout: 15_000,
      },
    );
  }

  clear(watchId: number): void {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  private mapError(code: number): GeolocationFailure {
    if (code === 1) return 'permission-denied';
    if (code === 3) return 'timeout';
    return 'unavailable';
  }
}
