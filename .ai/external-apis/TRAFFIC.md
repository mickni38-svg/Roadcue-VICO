# Traffic Incidents

## Status

Provider not yet locked.

The implementation must use a free/open or free-tier traffic-data source during the Roadcue POC.

## Preferred direction

Prefer official or open traffic data, including where practical:

- national road/traffic authorities
- European National Access Points (NAP)
- DATEX II feeds
- other official open traffic datasets

## Purpose

Provide traffic information relevant to the driver's current internal Roadcue route.

Examples:

- accidents
- road closures
- road works
- congestion
- restrictions
- incidents ahead on the expected route

## Roadcue rule

Traffic results must be filtered against the driver's expected internal route whenever possible.

A traffic incident that is geographically nearby but irrelevant to the current route should not normally be surfaced.

## Architecture

Traffic-provider integrations must be isolated behind a Roadcue traffic abstraction/service.

Example:

```text
TrafficIncidentService
    -> approved traffic provider
```

## Restrictions

- Do not choose a paid traffic provider without an explicit architecture decision.
- Do not use Google Maps Traffic APIs.
- Do not let Copilot silently select a provider.
- If no provider has been approved for the target country, stop implementation and request a provider decision.
- Do not make live traffic-provider calls from automated tests.

## Testing

Mock the Roadcue traffic service in automated tests.
