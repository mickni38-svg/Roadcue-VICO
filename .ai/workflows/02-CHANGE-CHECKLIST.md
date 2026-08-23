# Change Checklist

## Scope and evidence

- [ ] Outcome and acceptance criteria are clear.
- [ ] Relevant code, tests and contracts were inspected.
- [ ] Facts, inferences and unknowns are distinguished.
- [ ] Unrelated user changes are preserved.

## Design and implementation

- [ ] The change uses the authoritative decision/state owner.
- [ ] No competing implementation or duplicated rule was introduced.
- [ ] Inputs and model/external outputs are validated.
- [ ] Authentication and authorization remain enforced.
- [ ] Errors, timeouts, retries and cancellation are appropriate.
- [ ] Concurrency and idempotency were considered where relevant.
- [ ] Secrets and sensitive data are protected.

## Data and compatibility

- [ ] Existing data remains readable or has a migration path.
- [ ] Public interfaces are compatible or intentionally versioned.
- [ ] Defaults, nullability and unknown values are handled.
- [ ] Destructive behavior is explicit, scoped and recoverable where practical.

## Validation

- [ ] Changed behavior has appropriate tests.
- [ ] Failure and boundary cases were checked.
- [ ] Relevant build, test, lint and type checks passed.
- [ ] Manual validation was performed where automation is insufficient.
- [ ] Skipped checks and reasons are recorded.

## Handoff

- [ ] The complete diff was reviewed.
- [ ] Observability and operational impact were considered.
- [ ] Task record and durable documentation are current.
- [ ] Residual risks and follow-up work are explicit.
