# ADR-002: One authoritative source for each decision and state

- Date: `2026-08-23`
- Status: `Accepted`

## Context

When multiple layers independently calculate the same business outcome, their behavior eventually diverges. Users then see inconsistent UI, API responses, notifications or stored data.

## Decision

Each important business decision, derived value and state transition has one authoritative owner. Other components consume that result and may format it, but may not reimplement the rule.

Shared behavior is exposed through an explicit function, service, contract or event rather than copied predicates.

## Consequences

- Cross-channel behavior is consistent and easier to test.
- Ownership must be documented.
- Refactoring may require migrating several consumers together.

## Roadcue application

C# owns Roadcue data, authorization, calculations and durable business state. LangGraph owns conversational orchestration/checkpoints. VICO explains structured results but does not recalculate or persist a competing version of Roadcue truth.
