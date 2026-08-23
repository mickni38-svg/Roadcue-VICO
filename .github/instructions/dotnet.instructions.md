---
applyTo: "src/**/*.cs,src/**/*.csproj,tests/**/*.cs"
---

# Roadcue .NET instructions

- Følg `.ai/architecture/` og relevante regler i `.ai/domain/`.
- Hold domæne- og applicationlogik ude af controllers.
- C# håndhæver autorisation, samtykke, SQL-adgang, forretningsregler og præcise beregninger.
- Eksterne providers skal bag Roadcue-ejede interfaces og mappes til egne kontrakter.
- Brug async I/O og cancellation tokens, hvor den eksisterende kodebase understøtter det.
- Test regler og fejlflows på det laveste relevante lag; tilføj integrationstest for API-kontrakter.
- Opret kun EF Core-migrationer ved en godkendt datamodelændring.

