# UC-05 – Etablere chaufførens sikre GPS- og rutekontekst

**Fase:** POC/MVP  
**Prioritet:** Must Have  
**Primær aktør:** Chauffør  
**Støtteaktører:** Roadcue Backend, enhedens GPS  
**Mål:** VICO har en autoriseret og opdateret lokationskontekst, så andre funktioner kan bruge chaufførens aktuelle position og aktive interne rute uden at Roadcue fungerer som navigationsapp.

## Forudsætninger

- I POC kan chauffør og GPS-data være simuleret.
- I MVP er chaufføren autentificeret.
- Chaufføren har givet nødvendigt samtykke til lokationsdata.
- En destination kan være sat, men er ikke et krav for at registrere den aktuelle GPS-position.

## Hovedflow

1. Roadcue identificerer chaufføren gennem login eller token.
2. Roadcue modtager chaufførens aktuelle GPS-position fra klienten/enheden.
3. Backend knytter position, tidspunkt og eventuelt retning/hastighed til den autoriserede chauffør.
4. Hvis chaufføren har en aktiv destination, henter Roadcue den aktive interne rute.
5. Backend beregner deterministisk, hvor chaufføren befinder sig i forhold til den interne rute.
6. Hvis positionen ligger inden for den konfigurerede rutetolerance, bevares den aktive rute.
7. Hvis positionen vedvarende afviger fra ruten, markeres rutekonteksten som forældet og UC-35 aktiveres for at beregne en ny intern rute fra den aktuelle position til den eksisterende destination.
8. Den opdaterede GPS- og rutekontekst stilles til rådighed for VICO og relevante tools.
9. VICO bruger kendt og gyldig lokationskontekst uden at bede chaufføren om oplysninger, som systemet allerede har.

## Alternative flows

- Hvis lokationssamtykke mangler, anvendes GPS-positionen ikke.
- Hvis GPS-positionen er for gammel eller har utilstrækkelig kvalitet, markeres den som ugyldig og anvendes ikke til rutebaserede svar.
- Hvis der ikke findes en aktiv destination, gemmes/benyttes den aktuelle position uden aktiv rutekontekst.
- Hvis chaufføren kortvarigt afviger fra ruten, må systemet ikke genberegne på baggrund af én enkelt støjende GPS-måling.
- Hvis en ny intern rute ikke kan beregnes, bevares destinationen, mens rutekonteksten markeres som utilgængelig.

## Acceptkriterier

- [ ] Chaufføridentiteten kommer i MVP fra en betroet login-/tokenkontekst og ikke fra brugerens prompt.
- [ ] GPS-data knyttes til korrekt chauffør og indeholder minimum position og timestamp.
- [ ] Position anvendes kun med nødvendigt lokationssamtykke.
- [ ] Forældede eller ugyldige GPS-data må ikke præsenteres som aktuelle.
- [ ] Backend kan beregne chaufførens afstand til den aktive interne rute deterministisk.
- [ ] En konfigurerbar tolerance og/eller tidsperiode anvendes, før chaufføren betragtes som værende uden for ruten.
- [ ] En vedvarende afvigelse kan udløse genberegning af den interne rute uden at ændre chaufførens eksterne GPS/navigation.
- [ ] VICO beder ikke om position, som allerede er tilgængelig og gyldig.
- [ ] Lokations- og rutekontekst fra én chauffør kan ikke anvendes i en anden chaufførs session.
- [ ] POC-brugere og simulerede GPS-data er tydeligt markeret som simulerede.

## Resultat

- VICO har en sikker og opdateret GPS- og rutekontekst, som kan genbruges af sted-, vejr-, routing- og trafikfunktioner.
