# Nearby Places / Places Along Route

## Approved POC provider

OpenStreetMap data via Overpass API.

## Purpose

Find useful places for the driver, preferably along Roadcue's internally expected route rather than only near the current GPS position.

Examples:

- fuel stations
- truck stops
- parking
- rest areas
- toilets
- restaurants
- shops
- other relevant POIs

## Important Roadcue rule

When an active internal route exists, prefer searching for places along the route or within an allowed detour.

Do not simply select the geographically nearest place if that would cause an unreasonable route deviation.

## Cost/status

OpenStreetMap data is open.

Public Overpass instances are suitable for development/POC use but have fair-use and capacity limits.

Before commercial production, usage strategy, caching and/or hosted infrastructure must be reviewed.

## Architecture

Overpass/OpenStreetMap calls must be isolated behind a Roadcue places abstraction/service.

Example:

```text
PlacesAlongRouteService
    -> Overpass API / OpenStreetMap
```

## Restrictions

- Do not use Google Places API.
- Do not introduce a paid POI provider during the POC without an explicit decision.
- Do not overload public Overpass instances.
- Cache reusable results where appropriate.
- Do not call live Overpass endpoints from automated tests.

## Testing

Mock the Roadcue places service.
