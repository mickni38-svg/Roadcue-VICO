# UC-08 – Find et sted med flere datakrav

**Fase:** MVP/Senere  
**Primær aktør:** Chauffør  
**Mål:** VICO kombinerer steddata, beregninger, venner og community-viden i ét svar.

**Trigger**

> “Find et sted, hvor jeg kan tanke, spise og måske møde nogen, jeg kender.”

**Hovedflow**

1. VICO opdeler ønsket i faciliteter, placering og relationer.
2. VICO inkluderer UC-07 for at finde relevante steder.
3. VICO inkluderer UC-10 for at finde venner ved kandidaterne.
4. Senere inkluderer VICO UC-15 for at hente relevante observationer.
5. VICO sammenligner de samlede resultater.
6. VICO giver ét kort svar med det bedste match og tydelige forbehold.

**Alternative flows**

- Hvis ingen venner deler position, præsenteres kun stedresultatet.
- Hvis community-oplysninger er ubekræftede, fremgår det eksplicit.

## Acceptkriterier

- [ ] VICO udleder og bevarer hvert selvstændigt krav i chaufførens samlede forespørgsel.
- [ ] Sted-, facilitets-, venne- og eventuelle communityresultater kobles til samme stedskandidat.
- [ ] Venner uden gyldig positionstilladelse indgår ikke i resultatet.
- [ ] Manglende data fra én kilde forhindrer ikke et delvist svar fra de øvrige kilder.
- [ ] Delvise matches og ubekræftede oplysninger markeres tydeligt.
- [ ] VICO returnerer ét prioriteret og kort svar frem for separate rå toolresultater.

**Resultat**

- Chaufføren får et samlet forslag baseret på flere kontrollerede datakilder.
