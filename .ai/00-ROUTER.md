# Context Router

This is the first workflow file an AI assistant reads. GitHub Copilot enters through `.github/copilot-instructions.md`, which routes the current request here. The purpose is to load enough context without loading the entire documentation set.

## Always read

1. `.ai/01-CONTRACT.md`
2. `.ai/PROJECT-CONTEXT.md`
3. the active task file in `.ai/tasks/`
4. repository-level assistant instructions, if present

## Then read by task type

| Task | Required context |
|---|---|
| New feature | relevant feature specification, architecture flow, domain rules, task template |
| Bug fix | affected flow, state contract, tests, `prompts/BUGFIX.md` |
| API or integration | solution architecture, runtime flow, persistence if relevant |
| Data or persistence | persistence, state contract, compatibility requirements |
| UI, output or notification | output contract, runtime flow, accessibility requirements |
| AI behavior | AI boundary, AI contract, structured output schema, failure policy |
| Refactor | component responsibilities, code inventory, relevant ADRs |
| Review | contract, task, affected specifications, `prompts/REVIEW.md` |
| Continue work | task status, current diff, validation results, `prompts/CONTINUE.md` |

## Read decisions selectively

Read an ADR when the task touches the decision it governs. Accepted ADRs are binding until superseded.

## Before editing

The assistant must be able to state:

- the requested outcome;
- the evidence for current behavior;
- the files and flows likely affected;
- the relevant contracts and constraints;
- the validation method;
- any unresolved question that could materially change the solution.

If these cannot be stated, continue analysis or ask a focused question. Do not guess.

## After editing

Update the active task with changed files, validation, residual risks and follow-up work. Update architecture, feature, domain or decision documentation only when its durable truth changed.
