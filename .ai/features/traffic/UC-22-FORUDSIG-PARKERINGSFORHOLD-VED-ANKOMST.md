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

**Resultat**

- Chaufføren har fået en prognose, som kan indgå i egen beslutning.
