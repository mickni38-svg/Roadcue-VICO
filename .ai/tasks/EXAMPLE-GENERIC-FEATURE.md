# Task: Export a filtered report

- Date: `2026-01-15`
- Status: `Ready`
- Owner: `Example only`
- Related feature: `.ai/features/report-export.md`
- Related decisions: `None`

## Requested outcome

An authorized user can export the currently filtered report as a UTF-8 CSV file.

## Why it matters

Users need to process selected report data outside the application without manually copying it.

## Scope

### In scope

- Reuse the report's existing filters and authorization.
- Export the visible columns with stable headers.
- Return an explicit error when export cannot be generated.

### Out of scope

- Scheduled exports.
- New filtering behavior.
- Spreadsheet-specific formatting.

## Acceptance criteria

- [ ] The export contains only rows the user is authorized to view.
- [ ] Active filters produce the same row set in screen and export.
- [ ] Values requiring CSV escaping are valid.
- [ ] Empty results produce a valid file with headers.
- [ ] Existing report behavior remains unchanged.

## Evidence and current behavior

- Reproduction or example: `To be completed from repository evidence.`
- Relevant files/components: `Unknown until repository analysis.`
- Existing tests: `Unknown until repository analysis.`
- Verified facts: `Only the requested outcome and criteria above.`
- Inferences: `The existing filtered query may be reusable.`
- Unknowns: `Framework, endpoint shape, dataset size and export limits.`

## Impact analysis

Complete before implementation. In particular, verify authorization ownership, memory limits, formula injection risk, encoding and public API compatibility.

## Implementation plan

1. Inspect the report flow, authorization and tests.
2. Update this task with evidence and a repository-specific plan.
3. Implement the smallest end-to-end export path.
4. Add tests for authorization, filters, escaping and empty results.
5. Run discovered quality gates and record exact results.

## Validation plan

- Automated: `Discover from repository; do not assume a command.`
- Manual: `Export normal, empty and escaped-value examples.`
- Regression: `Compare report and export row identity for the same filters.`

## Implementation record

Not started.

## Validation results

Not run.

## Residual risks and follow-up

- Large exports may require streaming or limits; decide from product and repository constraints.
