# Destination Geocoding

## Approved provider

HERE Geocoding & Search API.

## Purpose

Convert a destination supplied by the driver into coordinates that Roadcue can use internally.

Examples:

- `Hamburg`
- `Hamburg, Germany`
- `Industriestrasse 25, Hamburg`

Expected result includes at least:

- normalized destination name/address
- latitude
- longitude

## Cost constraint

Use the HERE free tier during the Roadcue POC.

Before commercial release, pricing and licence terms must be reviewed.

## Architecture

External HERE calls must be isolated behind a Roadcue abstraction/service.

Business logic, LangChain tools and LangGraph nodes must not call HERE directly.

Example responsibility:

```text
DestinationGeocodingService
    -> HERE Geocoding & Search API
```

## Configuration

API credentials must come from configuration/environment variables.

Never hardcode API keys.

## Restrictions

- Do not use Google Maps Geocoding API.
- Do not introduce another geocoding provider without an explicit decision.
- Do not make live HERE calls from automated tests.

## Testing

Mock the Roadcue geocoding abstraction/service.
