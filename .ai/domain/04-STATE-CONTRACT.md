# State Contract

## State object: [Name]

- Owner: `[COMPONENT]`
- Identity: `[KEY]`
- Persistence: `[STORE_OR_EPHEMERAL]`

| Field/state | Meaning | Valid source | Consumers |
|---|---|---|---|
| `[NAME]` | `[MEANING]` | `[SOURCE]` | `[CONSUMERS]` |

## Transition rules

- `[FROM]` -> `[TO]` when `[EVENT_AND_GUARD]`.
- Forbidden transition: `[FROM]` -> `[TO]`.

## Concurrency and recovery

- Duplicate commands/events: `[BEHAVIOR]`
- Concurrent updates: `[BEHAVIOR]`
- Stale data: `[BEHAVIOR]`
- Resume after failure: `[BEHAVIOR]`

## Derived values

List derived values and their single authoritative calculation. Consumers must not introduce alternative formulas.
