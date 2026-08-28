# UC-12 – Find chauffører ved fremtidig position og tid

**Fase:** Senere  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren finder personer, som forventes at være et bestemt sted omkring et tidspunkt.

**Trigger**

> “Er der nogen danskere på rasteplads 47 omkring klokken 20?”

**Hovedflow**

1. VICO udleder sted, tidspunkt og ønsket relation eller sproggruppe.
2. Backend beregner chaufførens forventede ankomst eller validerer det angivne tidspunkt.
3. Backend finder chauffører, som har tilladt at indgå i denne type søgning.
4. Backend sammenligner forventede positioner inden for en tidsmæssig tolerance.
5. VICO præsenterer matches som forventede og ikke sikre.

**Alternative flows**

- Hvis ingen har delt fremtidig tilgængelighed, gives intet match.
- Hvis prognosen er for usikker, forklarer VICO det.

## Acceptkriterier

- [ ] Sted, tidspunkt og ønsket relation eller gruppe udledes som separate kriterier.
- [ ] Forventede positioner og tidsvinduer beregnes deterministisk i backend.
- [ ] Kun chauffører, som har accepteret denne type fremtidig søgning, kan matches.
- [ ] Resultater præsenteres som forventede og inkluderer tidsvindue eller usikkerhed.
- [ ] Prognoser med for stor usikkerhed returneres ikke som konkrete fremtidige placeringer.
- [ ] Ingen match afslører ikke oplysninger om chauffører, som har fravalgt deling.

**Resultat**

- Chaufføren får mulige fremtidige matches med tydelig usikkerhed.
