# Device Location / GPS

## Approved technology

Use the W3C Browser Geolocation API in the Angular frontend.

```ts
navigator.geolocation
```

## Cost

Free. No external GPS provider is required.

## Purpose

Provide the driver's current device position to Roadcue/VICO.

Typical data:

- latitude
- longitude
- accuracy
- timestamp
- optionally speed and heading when available

## Responsibilities

The Angular frontend obtains the device position and sends the required location data to the Roadcue backend.

The backend must not depend directly on browser APIs.

## Restrictions

- Do not use Google Maps merely to obtain GPS coordinates.
- Do not introduce a paid GPS/location SDK.
- Do not hardcode test coordinates in production logic.
- Roadcue is not a map-navigation application.

## Testing

Frontend tests must mock `navigator.geolocation`.

Automated tests must not depend on a real device GPS position.
