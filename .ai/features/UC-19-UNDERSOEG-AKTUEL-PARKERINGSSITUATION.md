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

## Acceptkriterier

- [ ] Det valgte parkeringssted identificeres entydigt.
- [ ] Registrerede faciliteter og aktuelle belægningsobservationer præsenteres som forskellige oplysninger.
- [ ] Communitystatus inkluderer tidspunkt, alder og sikkerhedsstatus.
- [ ] Manglende aktuelle oplysninger beskrives som ukendt og ikke som ledigt eller fuldt.
- [ ] VICO lover ikke en ledig plads ved chaufførens ankomst.
- [ ] Et tilbud om Ask the Road opretter ikke et spørgsmål uden chaufførens accept.

**Resultat**

- Chaufføren får aktuel parkeringsviden eller et tilbud om at spørge stedet.
