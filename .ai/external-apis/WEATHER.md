# Weather

## Approved POC provider

Open-Meteo.

## Purpose

Provide weather context for the driver's current position and expected route.

Possible Roadcue features include:

- weather at current position
- weather ahead on the route
- rain/snow ahead
- wind and wind gusts
- visibility
- temperature
- precipitation probability

## Cost/status

Use the free Open-Meteo API for the non-commercial Roadcue POC.

Before commercial use, licensing/provider choice must be reviewed.

## Architecture

Open-Meteo calls must be isolated behind a Roadcue weather abstraction/service.

Example:

```text
WeatherService
    -> Open-Meteo
```

LangChain/LangGraph tools must not call Open-Meteo directly.

## Restrictions

- Do not introduce a paid weather provider during the POC without an explicit decision.
- Do not hardcode external URLs throughout business logic.
- Do not make live weather calls from automated tests.

## Testing

Mock the Roadcue weather service in automated tests.
