# UC-20 – Detektér et muligt trafikproblem automatisk

**Fase:** Vision  
**Primær aktør:** Baggrundsprocessor  
**Støtteaktør:** Community-chauffør  
**Mål:** Roadcue bruger anonymiserede GPS- og hastighedssignaler til at opdage mulige hændelser.

**Hovedflow**

1. Systemet modtager GPS- og hastighedsdata med samtykke.
2. En deterministisk service registrerer et fælles og markant hastighedsfald.
3. Signalet knyttes til et område, retning og tidspunkt.
4. Systemet opretter en ubekræftet hændelseskandidat.
5. Systemet sammenholder kandidaten med eksterne og eksisterende data.
6. Systemet kan starte et målrettet community-spørgsmål.

**Alternative flows**

- Hvis signalet ikke kan bekræftes, udløber kandidaten.
- Brugere uden samtykke indgår ikke i datagrundlaget.

## Acceptkriterier

- [ ] Kun GPS- og hastighedsdata med gyldigt samtykke indgår i detektionsgrundlaget.
- [ ] Detektion kræver et konfigureret minimum af relevante signaler og et målbart hastighedsfald.
- [ ] Signaler grupperes efter geografisk område, retning og tidsvindue.
- [ ] En detektion oprettes som hændelseskandidat og ikke som en bekræftet hændelse.
- [ ] En kandidat kan sammenholdes med eksterne data uden at afsløre individuelle chaufførers rå spor.
- [ ] Ubekræftede kandidater udløber efter en fastsat gyldighedsperiode.
- [ ] Gentagne signaler for samme forhold opdaterer kandidaten frem for at skabe ukontrollerede dubletter.

**Resultat**

- Et muligt trafikproblem er registreret uden at blive præsenteret som et sikkert faktum.
