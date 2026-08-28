# UC-09 – Hent detaljer og community-status for et sted

**Fase:** MVP/Senere  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren får både officielle steddata og relevante nyere observationer.

**Trigger**

> “Er der noget, jeg bør vide om den rasteplads?”

**Hovedflow**

1. VICO identificerer stedet fra samtalen eller brugerens formulering.
2. VICO henter registrerede faciliteter gennem Roadcue Backend.
3. VICO henter aktive community-observationer for stedet.
4. Backend filtrerer observationer efter placering, alder og gyldighed.
5. VICO skelner mellem officielle data og community-oplysninger.
6. VICO opsummerer kun det relevante.

**Alternative flows**

- Hvis stedet er tvetydigt, beder VICO om præcisering.
- Hvis der ikke findes aktuelle observationer, siger VICO det.
- VICO kan senere tilbyde at starte UC-14.

## Acceptkriterier

- [ ] Stedet identificeres entydigt fra samtalekontekst eller chaufførens formulering.
- [ ] Officielle steddata og communityobservationer præsenteres som forskellige kildetyper.
- [ ] Kun observationer, der består backendens filtre for sted, alder og gyldighed, anvendes.
- [ ] Svaret indeholder tidspunkt eller alder for aktuelle communityoplysninger.
- [ ] Modstridende observationer opsummeres som usikre og ikke som én sikker status.
- [ ] Hvis der ikke findes aktuelle observationer, oplyses det eksplicit.

**Resultat**

- Chaufføren har en samlet, kildeopdelt status for stedet.
