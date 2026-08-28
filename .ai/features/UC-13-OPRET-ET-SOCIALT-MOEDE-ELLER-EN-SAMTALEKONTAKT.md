# UC-13 – Opret et socialt møde eller en samtalekontakt

**Fase:** Senere  
**Primær aktør:** Chauffør  
**Støtteaktør:** Community-chauffør  
**Mål:** Chauffører kan etablere frivillig kontakt uden at Roadcue bliver et socialt medie.

**Trigger-eksempler**

- “Er der nogen, der vil spise omkring klokken 19?”
- “Er der nogen, der har lyst til at snakke?”

**Hovedflow**

1. VICO udleder formål, tidsrum og eventuelt sted.
2. Chaufføren bekræfter forespørgslen.
3. Backend finder relevante og tilgængelige modtagere.
4. Modtagerne kan acceptere, afvise eller ignorere.
5. Kontakt etableres kun efter accept fra begge parter.
6. Kun nødvendige kontaktoplysninger deles.

**Alternative flows**

- Forespørgslen udløber automatisk.
- Chaufføren kan annullere den.
- Hvis ingen accepterer, fortæller VICO det uden gentagne afbrydelser.

## Acceptkriterier

- [ ] Formål, tidsrum og eventuelt sted læses tilbage før forespørgslen sendes.
- [ ] Ingen forespørgsel sendes uden afsenderens bekræftelse.
- [ ] Kun berettigede og relevante modtagere udvælges af backend.
- [ ] Kontaktoplysninger deles først, når begge parter har accepteret.
- [ ] Afvisning eller manglende svar afslører ingen yderligere oplysninger om modtageren.
- [ ] Forespørgslen kan annulleres og udløber automatisk uden efterfølgende kontakt.
- [ ] Samme accepterede forespørgsel opretter ikke dublerede kontakter.

**Resultat**

- En frivillig kontakt er etableret eller afsluttet uden match.
