# Copilot Prompt Usage Guide

The complete prompt definitions in `.ai/prompts` are the authoritative workflows. The short files in `.github/prompts` expose them as Copilot Chat `/commands`. They do not replace the task file or project contracts.

| Situation | Copilot command | Authoritative workflow |
|---|---|---|
| Begin a planned change | `/start-task` | `.ai/prompts/START-TASK.md` |
| Diagnose and repair a defect | `/bugfix` | `.ai/prompts/BUGFIX.md` |
| Inspect a change without editing | `/review` | `.ai/prompts/REVIEW.md` |
| Resume after a pause or new session | `/continue` | `.ai/prompts/CONTINUE.md` |
| Restructure while preserving behavior | `/refactor` | `.ai/prompts/REFACTOR.md` |
| Reconcile documentation with reality | `/document` | `.ai/prompts/DOCUMENT.md` |

## Recommended invocation

```text
/start-task Implement the outcome described in .ai/tasks/YYYY-MM-DD-task-name.md
```

Add the concrete user outcome after that sentence. The assistant should discover project commands and conventions from the repository and `PROJECT-CONTEXT.md`, not from generic examples.

## When to create a task

Create a task for changes that span files, alter behavior, touch data or public contracts, carry meaningful risk, or may continue across sessions. A truly isolated low-risk edit can use the fast path in the development workflow.

## When to stop and ask

Ask a focused question when competing interpretations change public behavior, data, security, cost, architecture or scope. Do not ask about details that can be safely established from repository evidence.
