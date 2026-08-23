# UC-26 – Betjen VICO med stemmen

**Fase:** MVP efter tekst-POC  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren kan bruge Roadcues kernefunktioner uden at være afhængig af skærmen.

**Hovedflow**

1. Chaufføren aktiverer VICO.
2. Tale konverteres til tekst.
3. VICO gennemfører den relevante use case.
4. Svaret konverteres til tale.
5. Chaufføren kan afbryde, stoppe, gentage eller fortsætte.

**Alternative flows**

- Ved lav talegenkendelsessikkerhed beder VICO om gentagelse.
- Handlinger med konsekvens læses tilbage og bekræftes.
- Brugeren kan altid anvende tekst eller manuel betjening som alternativ.

## Acceptkriterier

- [ ] Chaufføren kan starte en understøttet kerne-use-case med naturligt talesprog.
- [ ] Den genkendte tekst indgår i samme autoriserede samtaletråd som tekstinput.
- [ ] Lav talegenkendelsessikkerhed udløser gentagelse eller bekræftelse frem for gæt.
- [ ] VICO’s svar kan oplæses og kan afbrydes, stoppes eller gentages.
- [ ] Handlinger med konsekvens læses tilbage og bekræftes før udførelse.
- [ ] Tekst- og manuel betjening forbliver tilgængelig som alternativ.
- [ ] Voice-laget ændrer ikke den underliggende use cases autorisations- eller sikkerhedsregler.

**Resultat**

- Use casen er gennemført voice-first uden faste kommandoer.
