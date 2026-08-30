# UC-36 – Sæt aktiv destination

**Fase:** MVP  
**Status:** Done  
**Prioritet:** Must Have  
**Primær aktør:** Chauffør  
**Støtteaktører:** VICO, Roadcue Backend, geocoding-/lokationstjeneste  
**Mål:** Chaufføren kan angive en destination, som Roadcue gemmer som den aktive destination for den aktuelle tur.

## Trigger-eksempler

> “Jeg skal til Hamburg.”

> “Sæt Hamburg havn som min destination.”

> “Vi kører til München.”

## Forudsætninger

- Chaufføren er identificeret via Roadcues eksisterende bruger-/sessionkontekst.
- Roadcue kan oversætte et destinationsnavn eller en adresse til en entydig lokation med koordinater.

## Hovedflow

1. Chaufføren fortæller VICO, hvor turen går hen.
2. VICO identificerer, at udsagnet skal ændre den aktive destination og ikke blot er et generelt spørgsmål om stedet.
3. Backend forsøger at opløse destinationen til en struktureret lokation med navn, koordinater og eventuelt adresse eller provider-id.
4. Hvis destinationen er entydig, gemmer Roadcue den som aktiv destination for chaufførens aktuelle tur.
5. Hvis der endnu ikke findes en aktiv tur, kan backend oprette eller klargøre den via UC-38.
6. VICO bekræfter kort den aktive destination.
7. Den aktive destination kan herefter genbruges af routing- og route-context-funktioner uden at chaufføren skal gentage den.

## Alternative flows

- Hvis destinationen er tvetydig, beder VICO om den mindst mulige præcisering, fx by, land eller konkret adresse.
- Hvis chaufføren spørger “Hvor langt er der til Hamburg?” uden at angive, at Hamburg er destinationen, må Roadcue ikke automatisk ændre den aktive destination.
- Hvis chaufføren angiver en ny destination under en aktiv tur, erstattes den tidligere destination først, når den nye destination er valideret.
- Hvis lokationstjenesten fejler, bevares den eksisterende aktive destination uændret.
- Hvis chaufføren annullerer turen, fjernes eller inaktiveres destinationen gennem den aktive Trip-livscyklus.

## Datakrav

Den aktive destination skal mindst kunne repræsenteres med:

- `destinationName`
- `latitude`
- `longitude`
- eventuelt `address`
- eventuelt `providerPlaceId`
- tidspunkt for seneste ændring

## Acceptkriterier

- [ ] VICO kan skelne mellem at tale om et sted og at sætte et sted som aktiv destination.
- [ ] En entydig destination gemmes struktureret med koordinater og ikke kun som fri tekst.
- [ ] En tvetydig destination medfører et afklarende spørgsmål før den gemmes.
- [ ] En ny destination erstatter ikke den eksisterende, hvis opslag/validering fejler.
- [ ] Den aktive destination knyttes til den korrekte chauffør og aktive tur.
- [ ] Efterfølgende funktioner kan hente destinationen uden at udlede den igen fra samtalehistorikken.
- [ ] Destinationen er vedvarende domænedata og må ikke kun ligge i LLM-/LangGraph-samtalememory.
- [ ] Tests mocker geocoding/lokationstjenesten og foretager ikke live kald til eksterne tjenester eller OpenAI.

## Resultat

- Roadcue har en valideret, struktureret og vedvarende aktiv destination, som senere use cases kan anvende.
