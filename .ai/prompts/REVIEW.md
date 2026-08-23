# Review Prompt

```text
Perform a read-only review first. Read .ai/00-ROUTER.md, the active task, relevant contracts and the complete diff.

Review in risk order:
1. security, privacy, destructive behavior and data corruption;
2. incorrect business behavior or authorization;
3. contract, compatibility and state inconsistencies;
4. concurrency, persistence, retries and failure handling;
5. architecture and duplicated sources of truth;
6. test gaps, observability and operational risks;
7. maintainability and clarity.

For each finding provide severity, evidence, impact and a concrete remediation.
Distinguish blockers from optional improvements.
Do not invent findings to fill a list. If no material issue is found, say so and state residual risks or unvalidated areas.
Do not edit unless explicitly asked to fix the findings.
```
