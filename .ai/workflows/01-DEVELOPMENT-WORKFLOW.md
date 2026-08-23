# Development Workflow

## 1. Understand

- Translate the request into an observable outcome.
- Establish scope, acceptance criteria and exclusions.
- Resolve material ambiguity before implementation.

## 2. Gather evidence

- Inspect relevant code, tests, configuration, schemas and documentation.
- Reproduce current behavior when fixing a defect.
- Map the end-to-end flow and ownership boundaries.
- Separate facts, inferences and unknowns.

## 3. Plan

- Write the smallest complete sequence of changes.
- Include compatibility, data, security and failure behavior.
- Define automated and manual validation before editing.
- Record the plan in the active task.

## 4. Implement

- Follow existing conventions and authoritative contracts.
- Keep one source of truth for decisions and state.
- Validate at trust boundaries and make failures explicit.
- Avoid unrelated cleanup unless required for correctness.

## 5. Validate

- Run the narrowest relevant checks first, then broader gates.
- Test happy paths, boundaries and failure paths.
- Verify public contracts, migrations and operational behavior when affected.
- Record exact commands and results.

## 6. Review

- Review the complete diff against the task and contracts.
- Look for security, correctness, state, compatibility, concurrency and test gaps.
- Confirm no obsolete or competing path remains.

## 7. Document and hand off

- Update the task implementation record and status.
- Update durable documentation only when its truth changed.
- State what changed, what was validated and what remains uncertain.

## Fast path for trivial changes

A typo or similarly isolated, low-risk change may use a shortened cycle, but it still requires scope confirmation, repository inspection, safe editing and honest validation.
