# UC-11 – Find venner nær chaufføren eller et sted

**Fase:** MVP  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren finder venner, som har delt en relevant position.

**Trigger-eksempler**

- “Er der nogen, jeg kender i nærheden?”
- “Er der nogen, jeg kender på næste rasteplads?”

**Hovedflow**

1. VICO identificerer søgeområdet fra chaufførens position eller samtalekonteksten.
2. VICO henter chaufførens venner.
3. Backend finder venner, som har givet tilladelse til lokationsdeling.
4. Backend udfører den geografiske beregning.
5. VICO præsenterer kun autoriserede matches.

**Alternative flows**

- Venner uden aktiv deling vises ikke som placeret.
- Hvis ingen matches findes, siger VICO det uden at afsløre skjulte positioner.

## Acceptkriterier

- [ ] Søgeområdet identificeres entydigt fra aktuel position eller samtalens valgte sted.
- [ ] Den geografiske nærhedsberegning udføres deterministisk i backend.
- [ ] Kun venner med gyldig lokationsdeling og tilstrækkeligt aktuelle positioner returneres.
- [ ] Venner uden tilladelse eller aktuel position afsløres ikke indirekte.
- [ ] Resultatet angiver det anvendte sted eller område og relevant tidsstempel.
- [ ] Et tomt resultat formidles uden at antyde, hvor skjulte venner befinder sig.

**Resultat**

- Chaufføren får en privatlivssikker liste over relevante venner.
