# UC-23 – Håndtér ventende beskeder

**Fase:** MVP  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren kan få overblik over og høre beskeder på et valgt tidspunkt.

**Hovedflow**

1. En besked modtages og gemmes med afsender, tidspunkt og status.
2. Beskeden placeres i kø frem for automatisk at blive afspillet.
3. VICO fortæller, hvor mange ulæste beskeder der findes, når det er relevant.
4. Chaufføren beder om næste besked, en bestemt afsender eller en kort opsummering.
5. VICO oplyser afsender og tidspunkt.
6. VICO læser den relevante besked eller opsummering.
7. Chaufføren kan pause, fortsætte, springe over, gentage eller gemme til senere.
8. Beskedens status opdateres.

**Alternative flows**

- Ikke-vigtige beskeder forbliver i kø.
- Kritiske Roadcue-oplysninger kan have højere prioritet end almindelige beskeder.

**Resultat**

- Beskeden er håndteret uden at kræve skærmbetjening eller unødvendig afbrydelse.
