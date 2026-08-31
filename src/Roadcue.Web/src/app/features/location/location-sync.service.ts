import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { roadcueApiUrl } from '../../core/roadcue-api';
import { GEOLOCATION_ADAPTER, GeolocationFailure } from './geolocation.adapter';

export const LOCATION_ENDPOINT = roadcueApiUrl('/api/location/current');

export interface LocationPayload {
  latitude: number;
  longitude: number;
  recordedAt: string;
  accuracyMeters: number | null;
  speedKmh: number | null;
  heading: number | null;
}

@Injectable({ providedIn: 'root' })
export class LocationSyncService {
  private readonly http = inject(HttpClient);
  private readonly geolocation = inject(GEOLOCATION_ADAPTER);
  private watchId: number | null = null;

  readonly error = signal<GeolocationFailure | null>(null);
  readonly active = signal(false);

  start(): void {
    if (this.watchId !== null || this.active()) return;

    this.error.set(null);
    const id = this.geolocation.watch(
      (position) => this.handlePosition(position),
      (error) => {
        this.error.set(error);
        this.active.set(false);
      },
    );

    this.watchId = id;
    this.active.set(id !== null);
  }

  stop(): void {
    if (this.watchId !== null) {
      this.geolocation.clear(this.watchId);
      this.watchId = null;
    }
    this.active.set(false);
  }

  private handlePosition(position: GeolocationPosition): void {
    const coords = position.coords;
    const payload: LocationPayload = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      recordedAt: new Date(position.timestamp).toISOString(),
      accuracyMeters: Number.isFinite(coords.accuracy) ? coords.accuracy : null,
      speedKmh:
        coords.speed === null || !Number.isFinite(coords.speed)
          ? null
          : coords.speed * 3.6,
      heading:
        coords.heading === null || !Number.isFinite(coords.heading)
          ? null
          : coords.heading,
    };

    this.http.post(LOCATION_ENDPOINT, payload).subscribe({
      error: () => {
        // Backend/network errors must not invent fallback coordinates or stop
        // browser permission handling. A later GPS sample may succeed.
      },
    });
  }
}
