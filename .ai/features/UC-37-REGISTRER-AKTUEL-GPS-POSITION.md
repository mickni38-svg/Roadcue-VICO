# UC-37 – Registrer chaufførens aktuelle GPS-position

**Fase:** MVP  
**Prioritet:** Must Have  
**Primær aktør:** Chaufførens enhed  
**Støtteaktører:** Angular-klient, Roadcue Backend, VICO  
**Mål:** Roadcue modtager en aktuel GPS-position og gør den tilgængelig som sikker kørselskontekst for den korrekte chauffør.

## Forudsætninger

- Chaufføren er identificeret.
- Brugeren har givet nødvendigt samtykke/tilladelse til lokation.
- Klienten kan læse GPS-position fra enheden eller anvende kontrollerede simulerede GPS-data i test/POC.

## Hovedflow

1. Klienten modtager en GPS-position fra enhedens lokationsfunktion.
2. Klienten sender positionsdata til Roadcue Backend sammen med den autoriserede chauffør-/sessionkontekst.
3. Backend validerer koordinater, tidspunkt og eventuel nøjagtighed.
4. Backend registrerer positionen som chaufførens senest kendte position.
5. Hvis retning og hastighed er tilgængelige, kan disse registreres sammen med positionen.
6. VICO og autoriserede tools kan hente den senest gyldige position uden at bede chaufføren oplyse, hvor vedkommende befinder sig.
7. Senere use cases kan anvende positionen til routing, steder, vejr, trafik og kontrol af afvigelse fra intern rute.

## Minimumsdata

- `driverId`
- `latitude`
- `longitude`
- `recordedAt`
- eventuelt `accuracyMeters`
- eventuelt `speed`
- eventuelt `heading`

## Alternative flows

- Hvis lokationstilladelse mangler, gemmes eller anvendes ingen GPS-position.
- Hvis positionen er for gammel til den konkrete funktion, behandles den som stale, og funktionen må bede om/opnå en nyere position.
- Hvis koordinater er ugyldige, afvises opdateringen.
- Hvis GPS-nøjagtigheden er utilstrækkelig, kan positionen gemmes med lavere kvalitetsstatus, men må ikke uden videre bruges til præcis route-deviation-detektion.
- Hvis GPS midlertidigt mangler, må Roadcue ikke opfinde eller fremskrive en position som sikker fakta.

## Acceptkriterier

- [ ] Backend kan modtage og validere latitude/longitude og tidspunkt.
- [ ] Positionen knyttes til den autoriserede chauffør og ikke til et `driverId` leveret ukontrolleret i brugerens prompt.
- [ ] Position anvendes kun, når nødvendigt lokationssamtykke findes.
- [ ] Senest gyldige position kan hentes af andre Roadcue-funktioner.
- [ ] Funktionen kan afgøre, om en position er for gammel til at være aktuel.
- [ ] GPS-nøjagtighed kan indgå i vurderingen af, om data er egnet til præcis rutesammenligning.
- [ ] Manglende GPS-data håndteres eksplicit og må ikke erstattes af LLM-gæt.
- [ ] POC/test kan anvende simulerede koordinater.
- [ ] Frontend- og backendtests mocker GPS-data og foretager ikke live OpenAI-kald.

## Resultat

- Roadcue har en aktuel og valideret GPS-position, der kan anvendes som fælles lokationskontekst.
