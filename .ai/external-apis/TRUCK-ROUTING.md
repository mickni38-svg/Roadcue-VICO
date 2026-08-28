# Truck Routing

## Approved provider

HERE Routing API v8.

## Purpose

Roadcue/VICO uses HERE to calculate an internal expected truck route.

The route is used as context for features such as:

- nearby places along the route
- weather along the route
- traffic incidents ahead
- ETA/context
- route deviation detection
- internal rerouting

Roadcue does not replace the driver's existing GPS/navigation device.

## Required routing mode

Truck routes must use:

```text
transportMode=truck
```

## Truck characteristics

Support truck-specific properties when available, including:

- height
- width
- length
- weight
- axle-related constraints where supported
- hazardous-goods restrictions where supported and relevant

## Route result

Roadcue should persist the information required to reuse the route as internal Route Context.

This may include:

- origin
- destination
- route/polyline
- distance
- estimated duration
- calculated timestamp
- relevant route sections/maneuvers if required by later features

## Cost constraint

Use the HERE free tier during the Roadcue POC.

Before commercial release, pricing, request limits and licence terms must be reviewed.

## Architecture

HERE must be isolated behind a Roadcue routing abstraction/service.

Example:

```text
TruckRoutingService
    -> HERE Routing API v8
```

LangChain/LangGraph tools must call Roadcue abstractions rather than HERE directly.

## Configuration

Credentials must come from configuration/environment variables.

Never hardcode API keys.

## Restrictions

- Do not use Google Maps Directions API.
- Do not implement a Google Maps navigation UI.
- Do not implement a replacement for the driver's normal GPS.
- Do not introduce a paid routing provider without an explicit architecture decision.

## Testing

All HERE routing calls must be mocked in automated tests.

Automated tests must never call the live HERE API.
