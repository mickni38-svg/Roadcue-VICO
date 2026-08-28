# UC-18 – Få relevante trafikoplysninger

**Fase:** MVP  
**Primær aktør:** Chauffør  
**Støtteaktører:** Roadcue Backend, ekstern trafiktjeneste  
**Mål:** Chaufføren får relevante trafikoplysninger uden at Roadcue bliver en navigationsapp.

**Hovedflow**

1. Chaufføren spørger til forhold foran sig eller ved et sted.
2. VICO henter position og retning.
3. Backend henter eksterne trafikdata og relevante community-observationer.
4. Backend filtrerer og sammenholder oplysningerne.
5. VICO skelner mellem officielle og ubekræftede oplysninger.
6. VICO opsummerer relevante ulykker, kø, lukkede spor, vejarbejde, vejproblemer eller vejrforhold.

**Alternative flows**

- Hvis kilderne er uenige, forklarer VICO det.
- Hvis chaufføren spørger, om en reaktion kan betale sig, kan en ekstern routingservice senere beregne et forslag.

## Acceptkriterier

- [ ] Trafikhændelser filtreres efter chaufførens position, retning og relevante vejstrækning.
- [ ] Officielle trafikdata og communityoplysninger bevarer hver sin kilde- og sikkerhedsstatus.
- [ ] Gamle eller geografisk irrelevante hændelser udelades.
- [ ] Svaret indeholder kun trafikforhold, der kan påvirke chaufførens aktuelle kontekst.
- [ ] Uenighed mellem kilder formidles uden at vælge en ubekræftet version som sikker.
- [ ] Roadcue giver rådgivende information og aktiverer ikke en alternativ rute uden flowet i UC-32.

**Resultat**

- Chaufføren har fået rådgivende trafikstatus, men Roadcue styrer ikke køretøjet eller leverer fuld navigation.
