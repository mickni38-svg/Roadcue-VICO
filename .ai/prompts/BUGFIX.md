# Bug Fix Prompt

```text
Read .ai/00-ROUTER.md, the active task and documentation for the affected flow.

Reproduce or establish the failure from evidence before editing.
Trace the flow end to end: trigger, input, validation, decision, state, side effect, persistence and output.
Identify the root cause and explain why it produces the symptom.
Check whether the same cause affects other consumers.

Implement the narrowest complete root-cause fix.
Add or update a regression test that fails before the fix and passes after it where practical.
Do not hide errors, weaken validation or special-case only the visible example.

Run relevant tests and quality gates. Record exact commands, results and remaining uncertainty in the task.
```
