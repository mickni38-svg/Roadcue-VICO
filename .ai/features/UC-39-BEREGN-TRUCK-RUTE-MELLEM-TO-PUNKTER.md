# UC-39 – Beregn truck-rute mellem to punkter

**Fase:** MVP  
**Prioritet:** Must Have  
**Primær aktør:** Roadcue Backend  
**Støtteaktører:** Ekstern truck-routingservice  
**Mål:** Roadcue kan deterministisk beregne en lastbilegnet rute fra et startpunkt til en destination uden at fungere som chaufførens navigationsapp.

## Forudsætninger

- Et gyldigt startpunkt med koordinater er kendt, typisk fra UC-37.
- En valideret destination med koordinater er kendt via UC-36.
- Roadcue har adgang til en godkendt routingservice.

## Hovedflow

1. Backend modtager et startpunkt og en destination som strukturerede koordinater.
2. Backend henter de tilgængelige køretøjs-/truck-parametre.
3. Backend omsætter Roadcues køretøjsdata til routingproviderens strukturerede request-format.
4. Backend kalder routingservicen.
5. Routingservicen returnerer en eller flere ruter.
6. Backend vælger den relevante standardrute efter en dokumenteret regel, fx providerens anbefalede truck-rute.
7. Backend omsætter svaret til Roadcues leverandøruafhængige route-model.
8. Resultatet returneres til den kaldende use case, fx UC-35.
9. Denne use case aktiverer ikke navigation, viser ikke et kort og giver ikke selv turn-by-turn-instruktioner.

## Minimumsresultat

Roadcues interne route-resultat bør mindst kunne indeholde:

- route geometry/polyline eller tilsvarende segmentrepræsentation
- samlet distance
- forventet varighed
- start- og destinationskoordinater
- beregningstidspunkt
- anvendt routingprofil/provider
- tilgængelige relevante route-metadata

## Truck-parametre kan omfatte

- højde
- bredde
- længde
- totalvægt
- akselvægt
- traileroplysninger
- farligt gods
- andre restriktioner understøttet af routingprovideren

## Alternative flows

- Hvis truck-parametre ikke findes endnu, kan en dokumenteret standardprofil anvendes, men svaret skal kunne markeres med den begrænsning.
- Hvis routingservicen ikke finder en gyldig truck-rute, returneres en kontrolleret fejl; LLM'en må ikke konstruere en rute selv.
- Hvis provideren er utilgængelig eller svarer med timeout, returneres fejlen til den kaldende use case.
- Hvis en provider senere udskiftes, bør Roadcues øvrige use cases fortsat kunne arbejde mod samme interne route-kontrakt.

## Acceptkriterier

- [ ] Routing udføres af en deterministisk routingservice og ikke af sprogmodellen.
- [ ] Start og destination sendes som strukturerede koordinater.
- [ ] Tilgængelige truck-parametre sendes struktureret til routingservicen.
- [ ] Providerens svar mappes til en Roadcue-ejet, leverandøruafhængig route-model.
- [ ] Route-resultatet indeholder mindst geometri, distance og forventet varighed.
- [ ] Fejl/timeout returnerer en eksplicit fejl og må ikke resultere i en opdigtet rute.
- [ ] Funktionen ændrer ikke chaufførens eksterne GPS/navigation.
- [ ] Funktionen kan kaldes igen med et nyt startpunkt og samme destination, så UC-35 senere kan genberegne intern rute.
- [ ] Tests mocker routingprovideren og foretager ingen live provider- eller OpenAI-kald.

## Resultat

- Roadcue kan beregne en genanvendelig intern truck-rute mellem to punkter via en leverandøruafhængig kontrakt.
