# AI Decision Contract

Use only when AI participates in a domain flow. This file specializes the architectural AI boundary for domain behavior.

## Use case: [Name]

- AI role: `[ASSIST_EXTRACT_CLASSIFY_RECOMMEND_GENERATE_ORCHESTRATE]`
- Deterministic owner: `[COMPONENT]`
- Human role: `[ROLE_OR_NONE]`

## Input

- Structured fields: `[FIELDS]`
- Retrieved context: `[SOURCES]`
- Context excluded for privacy or safety: `[FIELDS]`

## Output

```json
{
  "result": "[VALUE]",
  "reason": "[SHORT_EXPLANATION]",
  "confidence": 0.0
}
```

Replace this example with a versioned schema. Reject or safely degrade on invalid output; do not parse critical behavior from free text.

## Constraints

- Permitted actions: `[ACTIONS]`
- Forbidden actions: `[ACTIONS]`
- Required deterministic checks: `[CHECKS]`
- Required human approval: `[CONDITIONS]`

## Evaluation cases

| Case | Expected behavior | Must never happen |
|---|---|---|
| `[CASE]` | `[EXPECTED]` | `[FORBIDDEN]` |
