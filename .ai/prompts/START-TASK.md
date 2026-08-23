# Start Task Prompt

```text
Read the repository assistant instructions, then .ai/00-ROUTER.md and the active task file.

Before editing:
1. Restate the requested observable outcome and scope.
2. Inspect the relevant implementation, tests, configuration and contracts.
3. Update the task's evidence, impact analysis, plan and validation plan.
4. Separate verified facts, inferences and unknowns.
5. Stop and ask a focused question if an unknown could materially change the solution.

Then implement the smallest complete change that meets the acceptance criteria.
Follow existing repository conventions unless the task explicitly changes them.
Run the relevant quality gates discovered in PROJECT-CONTEXT.md or the repository.
Update the task with changed files, exact validation results, deviations and residual risks.
Do not claim completion for checks that were not run.
```
