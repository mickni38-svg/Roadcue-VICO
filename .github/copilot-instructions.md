# Roadcue Copilot Instructions

Before working on any non-trivial task:

1. Read `.ai/00-ROUTER.md`.
2. Read `.ai/01-CONTRACT.md`.
3. Read `.ai/PROJECT-CONTEXT.md`.
4. Identify the task type and select the correct workflow below.

## Workflow selection

- New feature or behavioral change:
  - Read `.ai/prompts/START-TASK.md`.
  - Follow `.ai/workflows/01-DEVELOPMENT-WORKFLOW.md`.
- Bug or unexpected behavior:
  - Read `.ai/prompts/BUGFIX.md`.
  - Trace the complete runtime flow before editing.
- Code review:
  - Read `.ai/prompts/REVIEW.md`.
  - Follow `.ai/workflows/03-REVIEW-WORKFLOW.md`.
  - Do not edit unless explicitly requested.
- Continue existing work:
  - Read `.ai/prompts/CONTINUE.md`.
  - Read the active task file and current repository diff.
- Refactoring:
  - Read `.ai/prompts/REFACTOR.md`.
  - Preserve observable behavior unless the task explicitly changes it.
- Documentation:
  - Read `.ai/prompts/DOCUMENT.md`.

## Context selection

Read only the architecture, domain, feature and ADR files relevant to the task. Use `.ai/00-ROUTER.md` to determine which files are required.

For a non-trivial change, create or update an active task under `.ai/tasks/` using `.ai/tasks/TEMPLATE.md`.

Before changing code:

1. Establish the requested observable outcome.
2. Inspect the existing implementation, tests and configuration.
3. Record verified facts, inferences and unknowns.
4. Update the task with impact analysis, implementation plan and validation plan.
5. Ask a focused question if an unknown could materially change the solution.

Do not implement from assumptions.

## Roadcue architecture boundaries

- .NET/C# owns business rules, authorization, SQL access, geoqueries, precise calculations and external-provider abstractions.
- Python/FastAPI owns VICO's AI and agent orchestration.
- LangChain provides approved tools and model integration.
- LangGraph owns conversational orchestration and workflow state.
- Python may access Roadcue data only through approved C# APIs.
- The LLM must never access SQL Server directly.
- The LLM must not invent drivers, IDs, friends, positions or current conditions.
- VICO must not duplicate deterministic C# calculations.
- General VICO instructions belong under `app/core/prompts`.
- Domain instructions belong under `app/domains/<domain>`.
- Top-level VICO orchestration belongs in `app/graphs/vico_agent.py`.

Implement the smallest complete change that satisfies the active task. Run the relevant tests and record exact validation results. Never claim that a check passed if it was not run.
