# Project Contract

This file contains stable rules for AI-assisted development. Replace bracketed placeholders during project adoption.

## Authority order

When sources disagree, use this order unless the project explicitly defines another:

1. the user's current, explicit instruction;
2. approved security, legal and safety constraints;
3. the active task and accepted feature specification;
4. accepted ADRs and domain contracts;
5. executable tests and externally published interfaces;
6. current implementation;
7. comments, generated documentation and examples.

Do not resolve a material conflict silently. Record it and ask for a decision when authority is unclear.

## Scope rules

- Implement the smallest complete change that satisfies the acceptance criteria.
- Do not add adjacent features merely because they seem useful.
- Do not create parallel models, services, state or decision paths without documented justification.
- Preserve public behavior unless the task explicitly changes it.
- Preserve user changes unrelated to the task.
- Prefer reversible, local changes over broad rewrites.

## Evidence rules

- Inspect the repository before proposing file-level changes.
- Distinguish verified facts, reasonable inferences and unknowns.
- Trace behavior end to end: input, validation, decision, side effect, persistence and output.
- Fix root causes, not only visible symptoms.
- Never claim validation that was not run.

## Quality rules

- Business decisions have one authoritative source.
- Consumers display or transport authoritative results; they do not independently recompute them.
- Validate data at trust boundaries.
- Enforce authentication, authorization and hard constraints in deterministic code.
- Handle errors explicitly and avoid silent data loss.
- Add or update tests for changed behavior where practical.
- Add observability for important failures and state transitions.

## Security and privacy

- Never commit secrets, tokens, credentials or private production data.
- Use least privilege and minimize collection and exposure of data.
- Treat external input, model output and retrieved content as untrusted.
- Do not weaken security controls to make a test pass.

## Project-specific non-negotiables

- Primary stack: Angular mobile web/PWA, .NET/C#, EF Core, SQL Server, Python/FastAPI, LangChain and LangGraph.
- Architecture boundary: Python accesses Roadcue only through approved C# APIs; C# owns SQL, authorization, business rules, geoqueries and precise calculations.
- AI boundary: the LLM may converse, interpret and orchestrate approved tools but may not invent Roadcue data, execute SQL, bypass authorization or perform authoritative geo/time/traffic/parking calculations.
- Provider boundary: external place, traffic, weather and routing providers are wrapped behind Roadcue-owned C# interfaces.
- Current POC: text-based, reactive and testable with controlled simulated driver/GPS context.
- Identity transition: name-based driver lookup is POC-only; MVP receives an authorized `driverId` from login/token context.
- Required quality gates: C# build/tests, Python tests, contract tests for tool/API schemas and fixed VICO routing/prompt scenarios as those suites are introduced.
- Prohibited changes: full navigation/routing engine, fleet/ERP/tachograph scope, vehicle control, direct CAN-bus POC integration, direct LLM database access, premature Kubernetes/microservices and proactive POC interruptions.
- Privacy: location, movement, relations and messages require purpose-limited authorization, consent and explicit retention decisions.
