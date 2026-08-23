---
applyTo: "src/**/*.cs,src/**/*.csproj,src/**/*.json"
---

# Roadcue .NET instructions

Read these files before changing C# code:

- `.ai/architecture/01-SOLUTION-ARCHITECTURE.md`
- `.ai/architecture/03-COMPONENT-RESPONSIBILITIES.md`
- `.ai/architecture/07-PERSISTENCE.md`

.NET/C# owns Roadcue business logic, authentication and authorization, SQL access, EF Core, geoqueries, precise calculations and external-provider interfaces.

Do not move those responsibilities into Python, prompts, Angular or the LLM. Expose small purpose-specific API contracts for approved VICO tools. Apply authorization before data crosses the C# API boundary.

Follow the existing Roadcue solution layering:

- `Roadcue.Api`: transport and composition.
- `Roadcue.Application`: use cases and application orchestration.
- `Roadcue.Domain`: domain behavior and invariants.
- `Roadcue.Infrastructure`: EF Core, SQL Server and external adapters.

Verify actual project conventions before choosing a layer or namespace. Do not create parallel DTOs, services or decision paths without evidence that the existing structure cannot own the responsibility.
