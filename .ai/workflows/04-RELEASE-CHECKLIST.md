# Release Checklist

Adapt this checklist to the project's deployment model.

## Readiness

- [ ] Accepted scope and release contents are known.
- [ ] Required quality gates passed.
- [ ] Security/privacy review is complete when required.
- [ ] Migrations are reviewed, backed up and reversible where practical.
- [ ] Configuration and secrets exist in the target environment.
- [ ] External dependency compatibility is verified.

## Operations

- [ ] Deployment and rollback steps are documented.
- [ ] Health checks, logs, metrics and alerts cover the change.
- [ ] Resource, latency and cost impact are acceptable.
- [ ] Support/owners know the release and failure symptoms.

## Verification

- [ ] Critical user flow has a post-deployment check.
- [ ] Data/state integrity is checked after deployment.
- [ ] Release result and incidents are recorded.
- [ ] Follow-up work has owners.
