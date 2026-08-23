# Review Workflow

## Prepare

1. Read the task, acceptance criteria and affected contracts.
2. Inspect the complete diff and any generated/migration output.
3. Read test results; do not assume passing status.

## Review by risk

| Priority | Questions |
|---|---|
| Critical | Can this expose data, bypass authorization, cause unsafe/destructive action or corrupt data? |
| High | Can it produce wrong business behavior, invalid state or incompatible public behavior? |
| Medium | Are failure, retry, concurrency, migration, performance or observability paths weak? |
| Low | Is the change unnecessarily complex, duplicated, unclear or poorly tested? |

## Report

Each finding contains:

- severity and short title;
- concrete evidence and affected location;
- user/system impact;
- recommended correction.

List findings first. Then list open questions, residual risk and validation gaps. A review is not a style rewrite unless style materially affects correctness or maintainability.
