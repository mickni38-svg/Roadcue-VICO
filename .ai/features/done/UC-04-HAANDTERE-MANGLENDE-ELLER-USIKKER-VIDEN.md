# UC-04 – Håndtere manglende eller usikker viden

**Fase:** POC  
**Status:** Done  
**Primær aktør:** Chauffør  
**Mål:** VICO undgår at gætte og tilbyder en relevant næste handling.

**Hovedflow**

1. VICO konstaterer, at de tilgængelige data ikke giver et sikkert svar.
2. VICO fortæller kort, hvad der mangler eller er usikkert.
3. VICO markerer eventuelle oplysninger som ubekræftede, sandsynlige eller bekræftede.
4. VICO tilbyder en relevant næste mulighed, eksempelvis at præcisere spørgsmålet eller senere spørge communityet.
5. Chaufføren vælger, om flowet skal fortsætte.

**Eksempel**

> “Jeg har ikke nok sikre oplysninger endnu. Jeg kan spørge chaufførerne foran dig.”

**Alternative flows**

- Hvis chaufføren afviser, afsluttes flowet uden handling.
- Hvis chaufføren accepterer et community-spørgsmål, fortsætter flowet i UC-16.

## Acceptkriterier

- [ ] VICO fremstiller ikke manglende, gammel eller ubekræftet information som et sikkert faktum.
- [ ] Svaret angiver kort, hvilken oplysning der mangler eller er usikker.
- [ ] En modtaget sikkerhedsstatus bevares korrekt i VICO’s formulering.
- [ ] VICO tilbyder kun næste handlinger, som er tilgængelige og godkendte.
- [ ] Der oprettes ingen communityforespørgsel eller anden handling uden chaufførens accept.
- [ ] Afvisning eller annullering afslutter flowet uden sideeffekter.

**Resultat**

- VICO har ikke opfundet et svar, og chaufføren kender mulighederne.
