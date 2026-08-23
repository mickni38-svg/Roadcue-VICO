# UC-33 – Fortæl om en vens bevægelsesstatus

**Fase:** MVP  
**Prioritet:** Must Have  
**Primær aktør:** Chauffør  
**Støtteaktør:** Roadcue Backend  
**Mål:** Chaufføren kan få at vide, om en ven kører eller sandsynligvis holder stille, når vennen har givet tilladelse til lokationsdeling.

**Trigger**

> “Hvor er Peter, og holder han stille?”

**Hovedflow**

1. VICO identificerer den ønskede ven.
2. Backend kontrollerer, at vennen har tilladt lokationsdeling med chaufføren.
3. Backend analyserer flere GPS-målinger, hastighed og tidspunktet for seneste opdatering.
4. Backend beregner bevægelsesstatus deterministisk.
5. Backend undersøger, om positionen matcher et kendt sted som en rasteplads eller et truck stop.
6. VICO formulerer resultatet med tidspunkt og passende usikkerhed.

**Eksempel**

> “Peter har holdt stille ved Autohof Soltau i cirka 18 minutter. Hans position blev senest opdateret for to minutter siden.”

**Alternative flows**

- Hvis vennen ikke deler sin position, afslører VICO ingen lokationsoplysninger.
- Hvis GPS-opdateringen er gammel, oplyser VICO, at status ikke længere er sikker.
- Hvis bevægelsesstatus ikke kan bestemmes, siger VICO det frem for at gætte.

## Acceptkriterier

- [ ] Vennens delingstilladelse kontrolleres før position eller bevægelsesstatus beregnes.
- [ ] Bevægelsesstatus beregnes i backend ud fra flere målinger og ikke af LLM’en.
- [ ] Svaret indeholder tidspunktet for den seneste anvendte positionsopdatering.
- [ ] Et kendt sted nævnes kun, når backendens geografiske match opfylder den fastsatte tolerance.
- [ ] Gamle eller utilstrækkelige målinger resulterer i en usikker eller ukendt status.
- [ ] Manglende deling afslører hverken position, stilstandstid eller indirekte lokationsoplysninger.

**Resultat**

- Chaufføren får en autoriseret og deterministisk beregnet bevægelsesstatus.
