# SUC-03 – Autorisér et tool-kald

- Brugeridentiteten kommer fra en betroet kontekst.
- Backend kontrollerer adgang til data og handling.
- VICO kan ikke tilsidesætte autorisationen.
- Afviste handlinger returneres uden følsomme oplysninger.

## Acceptkriterier

- [ ] Brugeridentitet modtages fra betroet request context og kan ikke vælges frit af modellen.
- [ ] Backend kontrollerer både ressourceadgang og den ønskede handling.
- [ ] Et uautoriseret kald udfører ingen læse- eller skrivehandling.
- [ ] Afviste svar afslører ikke beskyttede data eller årsager, som kan misbruges.
- [ ] Autorisation logges med nødvendig sporbarhed uden at gemme unødvendige følsomme data.

