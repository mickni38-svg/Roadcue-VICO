Start a Roadcue task – analysis and plan only

This command starts phase 1 of a Roadcue implementation task. Phase 1 ends after analysis and planning. Implementation requires explicit approval in a later /continue command.

Read first:

Context router

Project contract

Roadcue context

START-TASK workflow

The requested use case or feature specification

Relevant architecture, domain and accepted decision files selected by the router

Use the current user request as the requested observable outcome.

Phase 1 – mandatory analysis

Locate and read the requested use case or feature file.

Inspect the existing implementation, tests, configuration and contracts.

Determine what is already implemented and must not be recreated.

Trace the relevant end-to-end flow and ownership boundaries.

Separate verified facts, reasonable inferences and unknowns.

Identify conflicts, missing decisions or questions that could materially change the solution.

Active task

Find the active task under .ai/tasks/. If none exists for this outcome, create one from .ai/tasks/TEMPLATE.md using:

YYYY-MM-DD-implement-UC-XX-short-title.md

Update the task with:

requested outcome and value;

in-scope and out-of-scope behavior;

acceptance criteria from the use case and relevant cross-cutting requirements;

repository evidence and current behavior;

verified facts, inferences and unknowns;

affected inputs, decisions, state, persistence, outputs and consumers;

security, privacy and compatibility impact;

the smallest complete implementation plan;

automated, manual and regression validation plans;

dependencies, risks and unresolved questions.

Set the task status to Ready only when the evidence, scope, acceptance criteria and plan are sufficient. Otherwise set it to Blocked and state the exact missing decision.

Mandatory stop condition

During this command you may create or update only the active task file and related planning documentation when strictly necessary.

Do not:

edit application or test code;

change configuration, dependencies, schemas or migrations;

create implementation files;

run destructive commands;

start implementing any plan item;

treat an inference as an accepted requirement.

The instruction in .ai/prompts/START-TASK.md to proceed with implementation is intentionally deferred for this invocation. Do not execute that implementation phase yet.

Finish by presenting:

what is already implemented;

the proposed implementation plan;

the planned validation;

unresolved questions or risks;

the path and status of the active task.

Then stop and wait for explicit user approval. Implementation may begin only after the user invokes /continue and states that the plan is approved.