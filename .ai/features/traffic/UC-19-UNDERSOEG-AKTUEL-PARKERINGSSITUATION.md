# UC-19 – Undersøg aktuel parkeringssituation

**Fase:** MVP/Senere  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren får den bedst tilgængelige status for parkering ved et valgt sted.

**Hovedflow**

1. Chaufføren spørger til parkering ved et identificeret sted.
2. Backend henter registrerede parkeringsfaciliteter.
3. Backend henter nyere community-observationer.
4. VICO oplyser tidspunkt og sikkerhedsstatus for oplysningerne.
5. Hvis status ikke er tilstrækkelig, tilbyder VICO at inkludere UC-16 og spørge chauffører på stedet.

**Alternative flows**

- Hvis ingen aktuelle oplysninger findes, siger VICO det.
- VICO lover aldrig, at en plads stadig er ledig ved ankomst.

**Resultat**

- Chaufføren får aktuel parkeringsviden eller et tilbud om at spørge stedet.
