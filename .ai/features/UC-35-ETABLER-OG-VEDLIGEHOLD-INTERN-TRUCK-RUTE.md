# UC-35 – Etabler og vedligehold VICO's interne truck-rute

**Fase:** MVP  
**Prioritet:** Must Have  
**Primær aktør:** Chauffør  
**Støtteaktører:** VICO, Roadcue Backend, ekstern truck-routingservice  
**Mål:** Når chaufførens destination er kendt og aktiv, beregner og gemmer Roadcue en intern truck-rute, som bruges som kontekst for GPS-, sted-, vejr- og trafikfunktioner uden at erstatte chaufførens egen GPS/navigation.

## Trigger-eksempler

> “Jeg skal til Hamburg.”

> “Sæt Hamburg som min destination.”

## Forudsætninger

- Chaufføren er identificeret.
- Chaufførens aktuelle GPS-position er tilgængelig via UC-05 eller kan erstattes af et eksplicit startsted.
- Roadcue har adgang til en godkendt routingservice, der kan beregne en egnet rute for lastbil eller relevant køretøjstype.

## Hovedflow – etabler aktiv rute

1. Chaufføren angiver eller bekræfter en destination.
2. VICO identificerer destinationen og sikrer, at den er entydig nok til routing.
3. Roadcue markerer destinationen som aktiv for chaufførens aktuelle tur.
4. Backend henter chaufførens aktuelle position og relevante køretøjsdata, hvis de findes.
5. Backend kalder en godkendt truck-routingservice.
6. Routingservicen beregner en forventet rute til destinationen under hensyntagen til de tilgængelige truck-parametre.
7. Backend gemmer den aktive interne rute og nødvendige metadata i databasen.
8. Den interne rute knyttes til den aktive tur og chauffør.
9. VICO kan herefter bruge ruten som kontekst for spørgsmål om steder, vejr, trafik og forventede forhold længere fremme.
10. Roadcue sender ikke turn-by-turn instruktioner til chaufførens eksterne GPS og viser ikke et navigationskort som en del af dette flow.

## Minimumsdata for aktiv tur/rute

- `driverId`
- aktiv destination med navn/id og koordinater
- rutens geometri/polyline eller tilsvarende segmentdata
- rutens samlede distance
- estimeret varighed
- tidspunkt for beregning
- routing-/køretøjsprofil
- status for turen

## Truck-parametre kan omfatte

- højde,
- bredde,
- længde,
- totalvægt,
- akselvægt,
- trailer,
- farligt gods,
- og andre begrænsninger som understøttes af den valgte routingservice.

## Hovedflow – vedligehold intern rute

1. UC-05 modtager nye GPS-positioner under kørslen.
2. Backend sammenligner chaufførens position med den aktive interne rute.
3. Så længe chaufføren befinder sig inden for den konfigurerede tolerance, bevares ruten.
4. Hvis chaufføren vedvarende afviger fra ruten, antager Roadcue ikke årsagen til afvigelsen.
5. Backend beregner i stedet en ny intern rute fra den aktuelle position til den samme aktive destination.
6. Den nye rute erstatter den tidligere interne rute for den aktive tur.
7. Efterfølgende sted-, vejr- og trafikforespørgsler bruger den opdaterede rute.

## Alternative flows

- Hvis destinationen er tvetydig, beder VICO om en kort præcisering før ruten aktiveres.
- Hvis chaufføren blot spørger “Hvor langt er der til Hamburg?” uden at gøre Hamburg til sin destination, behøver Roadcue ikke oprette en aktiv tur.
- Hvis truck-parametre mangler, anvendes en dokumenteret standardprofil eller routing uden de manglende begrænsninger, og begrænsningen registreres.
- Hvis routingservicen fejler, gemmes destinationen eventuelt som ønsket destination, men ingen aktiv rute markeres som gyldig.
- Hvis GPS-positionen kortvarigt afviger på grund af støj, parallelvej eller dårlig satellitdækning, genberegnes ruten ikke straks.
- Chaufførens egen GPS må gerne vælge en anden rute end VICO. Roadcue tilpasser sin interne rute, når positionsdata viser en vedvarende afvigelse.

## Acceptkriterier

- [ ] En intern rute beregnes, når en destination bliver aktiv, og ikke først når et senere tool tilfældigvis får brug for den.
- [ ] Den aktive interne rute gemmes i databasen og kan genbruges på tværs af samtaler/tool-kald for den aktive tur.
- [ ] Routing foretages af en godkendt routingservice eller anden deterministisk routingkomponent og ikke af sprogmodellen.
- [ ] Tilgængelige truck-parametre sendes struktureret til routingservicen.
- [ ] Den interne rute er klart adskilt fra chaufførens eksterne GPS/navigation.
- [ ] Roadcue må ikke påstå at have ændret den eksterne GPS-rute.
- [ ] Backend kan sammenligne aktuelle GPS-positioner med den aktive rute.
- [ ] En vedvarende afvigelse kan udløse genberegning fra aktuel position til samme destination.
- [ ] Kortvarig GPS-støj må ikke udløse ukontrollerede genberegninger.
- [ ] Efter genberegning anvender efterfølgende GPS-, sted-, vejr- og trafikfunktioner den nye interne rute.
- [ ] Hvis routing fejler, må en gammel eller manglende rute ikke præsenteres som aktuel og gyldig.
- [ ] Aktiv rute og destination tilhører den korrekte chauffør/tur og må ikke lække mellem brugere.

## Resultat

- VICO har en vedvarende og selvkorrigerende intern truck-rute, der fungerer som fælles Route Context for Roadcues intelligente features uden at Roadcue bliver en navigationsapp.
