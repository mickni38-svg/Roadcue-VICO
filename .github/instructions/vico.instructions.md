---
applyTo: "vico/**/*.py,vico/**/*.toml,vico/**/*.txt"
---

# Roadcue VICO instructions

Read these files before changing VICO code:

- `.ai/architecture/01-SOLUTION-ARCHITECTURE.md`
- `.ai/architecture/02-RUNTIME-AND-DATA-FLOW.md`
- `.ai/architecture/04-AI-BOUNDARY.md`
- `.ai/architecture/08-CODE-INVENTORY.md`

Python owns natural-language orchestration, conversation context, approved tool selection and response composition. Python may access Roadcue data only through typed C# API clients and approved LangChain tools.

Python, LangGraph and the LLM must not access SQL Server directly or duplicate C# authorization, business rules, geoqueries, movement calculations, distance calculations or arrival-time calculations.

Place general VICO behavior under `app/core/prompts`. Place domain-specific instructions and tools under `app/domains/<domain>`. Keep top-level orchestration in `app/graphs/vico_agent.py`.

VICO answers in Danish by default, keeps answers short and suitable for speech, states uncertainty and never invents Roadcue entities or current information.

Do not scaffold every planned domain in advance. Add a domain when an approved use case requires it.
