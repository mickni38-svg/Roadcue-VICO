# UC-32 – Håndtér en forhindring og skift den aktive rute

**Fase:** MVP  
**Prioritet:** Must Have  
**Primær aktør:** Chauffør  
**Støtteaktører:** Roadcue Backend, ekstern trafik-, routing- og navigationstjeneste  
**Mål:** Chaufføren kan få undersøgt og aktivere en alternativ rute, når en relevant forhindring opdages.

**Forudsætninger**

- Roadcue har chaufførens aktuelle position, retning og aktive rutekontekst.
- Den aktuelle rute leveres af en ekstern navigationstjeneste.

**Hovedflow**

1. Roadcue modtager information om en forhindring fra en ekstern kilde eller en aktuel community-melding.
2. Backend vurderer deterministisk, om hændelsen er relevant for chaufførens aktive rute.
3. Backend beder en ekstern routingservice beregne et alternativ.
4. Routingservicen returnerer forskelle i afstand og forventet tid.
5. VICO forklarer forhindringen, datakildens sikkerhed og forskellen mellem ruterne.
6. VICO spørger chaufføren, om den alternative rute skal aktiveres.
7. Chaufføren accepterer.
8. Roadcue sender den valgte rute til navigationstjenesten.
9. VICO bekræfter først ændringen, når navigationstjenesten har accepteret den.

**Eksempel**

> “To chauffører har meldt et lukket spor 24 kilometer foran dig. En alternativ rute er 18 kilometer længere, men forventes at spare cirka 22 minutter. Skal jeg skifte?”

**Alternative flows**

- Chaufføren afviser, og den eksisterende rute bevares.
- Hvis hændelsen er ubekræftet, fremgår usikkerheden tydeligt.
- Hvis routingservicen ikke kan beregne et alternativ, ændres ruten ikke.
- Hvis navigationstjenesten afviser ændringen, må VICO ikke sige, at ruten er skiftet.

## Acceptkriterier

- [ ] Backend verificerer, at forhindringen er relevant for chaufførens aktive rute og retning.
- [ ] Kilde, alder og sikkerhedsstatus for forhindringen indgår i VICO’s forklaring.
- [ ] Alternativets afstands- og tidsforskel kommer fra en godkendt routingservice.
- [ ] VICO læser konsekvenserne af ruteskiftet tilbage og kræver chaufførens accept.
- [ ] Der sendes ingen ruteændring til navigationstjenesten ved afvisning eller manglende svar.
- [ ] VICO bekræfter først ruteskiftet efter navigationstjenestens succesfulde svar.
- [ ] Fejl eller timeout bevarer den eksisterende rute og formidles tydeligt.
- [ ] Gentagne retries må ikke aktivere samme ruteændring flere gange.

**Resultat**

- Den eksterne navigation har enten aktiveret den godkendte rute, eller den oprindelige rute er bevaret.
