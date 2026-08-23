# Decision and Validation Contract

Use this document for decisions shared by several consumers.

## Decision: [Name]

- Owner: `[COMPONENT]`
- Input model: `[TYPE_OR_SCHEMA]`
- Validation order: `[ORDER]`
- Hard constraints: `[CONSTRAINTS]`
- Advisory factors: `[FACTORS]`
- Result model: `[TYPE_OR_SCHEMA]`
- Reason codes: `[CODES]`
- Failure behavior: `[BEHAVIOR]`

## Canonical result

The result is computed once by the authoritative owner. UI, APIs, jobs, notifications and persistence consume the same result or a lossless representation of it.

## Validation boundary

| Boundary | Validation | Failure response |
|---|---|---|
| `[BOUNDARY]` | `[RULES]` | `[RESPONSE]` |

## Compatibility

- Versioning: `[POLICY]`
- Unknown fields/values: `[BEHAVIOR]`
- Default behavior: `[BEHAVIOR]`
