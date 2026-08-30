import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GEOLOCATION_ADAPTER, GeolocationAdapter, GeolocationFailure } from './geolocation.adapter';
import { LOCATION_ENDPOINT, LocationSyncService } from './location-sync.service';

class FakeGeolocationAdapter implements GeolocationAdapter {
  onPosition: ((position: GeolocationPosition) => void) | null = null;
  onError: ((error: GeolocationFailure) => void) | null = null;
  cleared: number[] = [];

  watch(
    onPosition: (position: GeolocationPosition) => void,
    onError: (error: GeolocationFailure) => void,
  ): number {
    this.onPosition = onPosition;
    this.onError = onError;
    return 42;
  }

  clear(watchId: number): void {
    this.cleared.push(watchId);
  }

  emitPosition(position: GeolocationPosition): void {
    this.onPosition?.(position);
  }

  emitError(error: GeolocationFailure): void {
    this.onError?.(error);
  }
}

describe('LocationSyncService', () => {
  let service: LocationSyncService;
  let fake: FakeGeolocationAdapter;
  let http: HttpTestingController;

  beforeEach(() => {
    fake = new FakeGeolocationAdapter();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: GEOLOCATION_ADAPTER, useValue: fake },
      ],
    });

    service = TestBed.inject(LocationSyncService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    service.stop();
    http.verify();
  });

  it('posts a browser GPS sample without driverId', () => {
    service.start();
    fake.emitPosition({
      timestamp: Date.UTC(2026, 7, 30, 17, 30, 0),
      coords: {
        latitude: 55.6761,
        longitude: 12.5683,
        accuracy: 8,
        altitude: null,
        altitudeAccuracy: null,
        heading: 180,
        speed: 10,
        toJSON: () => ({}),
      },
      toJSON: () => ({}),
    } as GeolocationPosition);

    const request = http.expectOne(LOCATION_ENDPOINT);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      latitude: 55.6761,
      longitude: 12.5683,
      recordedAt: '2026-08-30T17:30:00.000Z',
      accuracyMeters: 8,
      speedKmh: 36,
      heading: 180,
    });
    expect(request.request.body.driverId).toBeUndefined();
    request.flush({});
  });

  it('maps missing optional speed and heading to null', () => {
    service.start();
    fake.emitPosition({
      timestamp: Date.UTC(2026, 7, 30, 17, 30, 0),
      coords: {
        latitude: 55,
        longitude: 12,
        accuracy: 20,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        toJSON: () => ({}),
      },
      toJSON: () => ({}),
    } as GeolocationPosition);

    const request = http.expectOne(LOCATION_ENDPOINT);
    expect(request.request.body.speedKmh).toBeNull();
    expect(request.request.body.heading).toBeNull();
    request.flush({});
  });

  it('does not post when permission is denied', () => {
    service.start();
    fake.emitError('permission-denied');

    http.expectNone(LOCATION_ENDPOINT);
    expect(service.error()).toBe('permission-denied');
    expect(service.active()).toBeFalse();
  });

  it('clears the browser watch on stop', () => {
    service.start();
    service.stop();

    expect(fake.cleared).toEqual([42]);
    expect(service.active()).toBeFalse();
  });
});
