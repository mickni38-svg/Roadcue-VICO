# ADR-001: Explicit authority boundary for probabilistic AI

- Date: `2026-08-23`
- Status: `Accepted`

## Context

Model output is probabilistic, may be malformed and can be influenced by untrusted content. Different product flows may permit different degrees of AI autonomy.

## Decision

Every AI-enabled flow must declare:

- what the model may propose or decide;
- which deterministic checks remain authoritative;
- whether human approval is required;
- a structured output contract;
- timeout, invalid-output and unavailable-provider behavior;
- evaluation and observability requirements.

AI output cannot bypass authentication, authorization, safety, legal, financial or data-integrity constraints.

## Consequences

- AI can be used broadly without making its authority ambiguous.
- Some integrations require schemas, validation and fallback code.
- High-impact flows may remain slower because approval is required.

## Roadcue application

VICO may converse, interpret requests, select approved tools and summarize results. C# remains authoritative for SQL, authorization, business rules, geo/time calculations, external-provider policies and consequential operations. The LLM never controls the vehicle.
