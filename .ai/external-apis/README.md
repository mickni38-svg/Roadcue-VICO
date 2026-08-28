# Roadcue External APIs

This folder is the Single Source of Truth for external services used by Roadcue/VICO.

## Rules for Copilot

Copilot must:

1. Use only providers approved in this folder.
2. Prefer free or free-tier services during the POC.
3. Never introduce a paid provider without an explicit architecture decision.
4. Never hardcode API keys, secrets or credentials.
5. Read credentials from configuration/environment variables.
6. Isolate external APIs behind Roadcue service abstractions.
7. Mock all external API calls in automated tests.
8. Never call live external APIs from automated tests.
9. Do not introduce Google Maps or Google Directions unless explicitly approved later.

## Approved services

| Capability | Approved provider | POC cost/status |
|---|---|---|
| Device GPS | W3C Browser Geolocation API | Free |
| Geocoding | HERE Geocoding & Search API | Free tier |
| Truck routing | HERE Routing API v8 | Free tier |
| Weather | Open-Meteo | Free for non-commercial POC |
| Nearby places | OpenStreetMap / Overpass API | Free with public-instance usage limits |
| Traffic incidents | TBD / national or European open traffic data | Must be free/free-tier |

## Important

The APIs in this folder are implementation constraints.

Use cases describe what Roadcue must do.
This folder describes which external technologies/providers are allowed to implement those use cases.
