---
applyTo: "src/**/*.cs,src/**/*.csproj,tests/**/*.cs"
---

# Roadcue .NET instructions

- Følg [Roadcue router](../../.ai/00-ROUTER.md).
- Følg [Roadcue solution architecture](../../.ai/architecture/01-SOLUTION-ARCHITECTURE.md).
- Følg [Roadcue AI boundary](../../.ai/architecture/04-AI-BOUNDARY.md).
- Hold domæne- og applicationlogik ude af controllers.
- C# håndhæver autorisation, samtykke, SQL-adgang, forretningsregler og præcise beregninger.
- Eksterne providers skal ligge bag Roadcue-ejede interfaces og mappes til egne kontrakter.
- Brug async I/O og cancellation tokens, hvor den eksisterende kodebase understøtter det.
- Test regler og fejlflows på det laveste relevante lag.
- Tilføj integrationstest for API-kontrakter.
- Opret kun EF Core-migrationer ved en godkendt datamodelændring.