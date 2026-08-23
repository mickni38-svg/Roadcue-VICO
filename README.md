# Roadcue AI-Assisted Development Workflow

This is the Roadcue-configured edition of the reusable AI development workflow.

The method remains general: route context, establish evidence, plan, implement, validate, review and document. The architecture is deliberately Roadcue-specific because architecture must describe the actual system rather than a universal template.

## Roadcue baseline

- Angular mobile web/PWA is the user interface.
- .NET/C# is the main platform and owns business logic, authorization, SQL access, geoqueries and precise calculations.
- SQL Server stores Roadcue's structured data.
- Python/FastAPI exposes the VICO AI and agent layer.
- LangChain provides model integration and approved tools.
- LangGraph owns conversational orchestration, state and later resumable flows.
- Python accesses Roadcue data only through approved C# APIs.
- External place, traffic, weather and routing providers are hidden behind C# interfaces.

## Current implementation baseline

The current POC has working C# API/Scalar and FastAPI/Swagger integration. VICO can hold general AI conversation, select approved tools and use `get_drivers` and `get_driver_friends` to call the C# API. The prototype may resolve a simulated driver by name; the MVP must receive an authorized `driverId` from login/token context.

## Start here

1. Extract the ZIP directly into the Roadcue repository root.
2. Keep both `.ai` and `.github` under source control.
3. Copilot automatically receives `.github/copilot-instructions.md`.
4. The instruction file routes Copilot to `.ai/00-ROUTER.md`, the project contract and the correct development workflow.
5. Use `/start-task`, `/bugfix`, `/review`, `/continue`, `/refactor` or `/document` when you want to select a workflow explicitly in Copilot Chat.

## Directory responsibilities

- `.github/copilot-instructions.md`: automatic repository-wide entry point.
- `.github/instructions/`: automatic path-specific .NET and VICO instructions.
- `.github/prompts/`: short Copilot `/commands`.
- `.ai/prompts/`: complete authoritative workflow definitions.
- `.ai/tasks/`: current task state, evidence, plan and validation results.
- `.ai/architecture/`: Roadcue-specific architecture and ownership boundaries.

Do not copy the full workflow text into `.github/prompts`. The files there link to `.ai/prompts`, which remains the single source of truth.

General VICO behavior belongs under `app/core/prompts`. Domain-specific instructions belong inside `app/domains/<domain>`. VICO orchestration belongs in `app/graphs/vico_agent.py`.
