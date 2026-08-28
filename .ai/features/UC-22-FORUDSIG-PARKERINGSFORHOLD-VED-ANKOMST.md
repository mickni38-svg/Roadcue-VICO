# UC-22 – Forudsig parkeringsforhold ved ankomst

**Fase:** Vision  
**Primær aktør:** Chauffør  
**Mål:** VICO giver et sandsynlighedsbaseret estimat for parkering på ankomsttidspunktet.

**Hovedflow**

1. Chaufføren vælger et sted eller beder VICO finde et.
2. Backend beregner forventet ankomsttid.
3. Backend kombinerer historiske data, aktuelle observationer og relevante signaler.
4. Backend beregner en sandsynlighed eller kvalitativ vurdering.
5. VICO præsenterer estimatet med tydelig usikkerhed.

**Alternative flows**

- Hvis der ikke findes nok data, siger VICO det og kan tilbyde UC-16.
- VICO lover aldrig, at en plads er tilgængelig.

## Acceptkriterier

- [ ] Forventet ankomsttid beregnes deterministisk for det valgte sted.
- [ ] Prognosen anvender kun valide historiske data, aktuelle observationer og dokumenterede signaler.
- [ ] Resultatet indeholder beregningstidspunkt og en sandsynlighed eller entydig kvalitativ vurdering.
- [ ] VICO skelner tydeligt mellem aktuel observeret status og prognosen ved ankomst.
- [ ] Utilstrækkeligt datagrundlag resulterer i ‘ukendt’ frem for en opdigtet sandsynlighed.
- [ ] VICO garanterer aldrig, at en parkeringsplads er ledig ved ankomst.

**Resultat**

- Chaufføren har fået en prognose, som kan indgå i egen beslutning.
