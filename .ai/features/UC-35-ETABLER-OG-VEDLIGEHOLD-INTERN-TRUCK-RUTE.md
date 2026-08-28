# UC-35 – Etabler og vedligehold VICO's interne truck-rute

**Fase:** MVP  
**Prioritet:** Must Have  
**Primær aktør:** Chauffør  
**Støtteaktører:** VICO, Roadcue Backend, ekstern truck-routingservice  
**Mål:** Roadcue etablerer og vedligeholder en intern forventet truck-rute, som VICO kan bruge som Route Context uden at erstatte chaufførens egen GPS/navigation.

## Implementeringsrækkefølge

UC-35 er en sammensat use case og bør først implementeres, når følgende fundament findes:

1. **UC-36 – Sæt aktiv destination**
2. **UC-37 – Registrer chaufførens aktuelle GPS-position**
3. **UC-38 – Opret og vedligehold aktiv Trip**
4. **UC-39 – Beregn truck-rute mellem to punkter**
5. **UC-35 – Etabler og vedligehold intern truck-rute**

## Trigger

UC-35 aktiveres, når chaufføren har en aktiv Trip med destination og Roadcue har en brugbar GPS-position, eller når den eksisterende interne rute skal genberegnes.

## Forudsætninger

- **UC-36 er implementeret:** Roadcue har en valideret og struktureret aktiv destination.
- **UC-37 er implementeret:** Roadcue kan hente chaufførens aktuelle, validerede GPS-position.
- **UC-38 er implementeret:** destination og Route Context kan knyttes til en vedvarende aktiv Trip.
- **UC-39 er implementeret:** Roadcue kan beregne en truck-rute fra et startpunkt til destinationen via en godkendt routingservice.
- Chaufføren er identificeret, og Trip/data tilhører den korrekte chauffør.

## Hovedflow – etabler intern rute

1. Roadcue registrerer, at en aktiv Trip har en valideret destination.
2. Backend henter chaufførens aktuelle GPS-position via UC-37.
3. Backend kalder UC-39 med aktuel position som start og Trip'ens aktive destination som mål.
4. UC-39 returnerer Roadcues leverandøruafhængige route-resultat.
5. Backend gemmer den interne rute og routing-metadata på eller i relation til den aktive Trip.
6. Ruten markeres som den aktuelle forventede rute for Roadcue.
7. Efterfølgende GPS-, sted-, vejr- og trafikfunktioner kan bruge denne rute som Route Context.
8. VICO behøver ikke fortælle chaufføren turn-by-turn instruktioner, og Roadcue forsøger ikke at erstatte chaufførens egen GPS.

## Hovedflow – følg og vedligehold ruten

1. Roadcue modtager nye GPS-positioner via UC-37.
2. Backend beregner deterministisk chaufførens afstand til den aktuelle interne rute.
3. Så længe positionen ligger inden for den konfigurerede tolerance, bevares ruten.
4. En enkelt eller kortvarig afvigelse registreres ikke automatisk som et ruteskift.
5. Hvis positionen vedvarende ligger uden for tolerancen, markeres den interne rute som muligvis forældet.
6. Backend kalder UC-39 igen med den seneste gyldige GPS-position som nyt startpunkt og samme aktive destination.
7. Når en ny gyldig rute er modtaget, erstatter den den tidligere interne rute på den aktive Trip.
8. Alle efterfølgende Route Context-funktioner bruger den nye rute.

## Vigtigt domæneprincip

Roadcue forsøger ikke at afgøre, hvorfor chaufføren har forladt den forventede rute. Chaufførens egen GPS kan eksempelvis have valgt en anden vej på grund af trafik, vejarbejde eller lokale forhold. Roadcue tilpasser blot sin interne forventning til den observerede kørsel.

## Route Context bør mindst indeholde

- `tripId`
- aktiv destination
- aktuel intern route geometry/polyline
- distance
- estimeret varighed
- routingprofil/provider
- `calculatedAt`
- seneste vurdering af route match/deviation

## Alternative flows

- Hvis der ikke findes en tilstrækkeligt aktuel GPS-position, oprettes/genberegnes ingen rute, før en gyldig position er tilgængelig.
- Hvis UC-39 fejler, må den nye rute ikke markeres som gyldig.
- Hvis en gammel rute stadig findes efter en mislykket genberegning, skal den kunne markeres som stale/usikker og må ikke præsenteres som sikkert aktuel.
- Hvis GPS-data har lav nøjagtighed, kan tærsklen for route-deviation vurderes mere konservativt.
- Hvis chaufføren ændrer destination via UC-36, skal næste route-beregning bruge den nye destination.
- Hvis Trip'en afsluttes via UC-38, ophører den interne rute med at være aktiv.

## Acceptkriterier

- [ ] UC-35 kræver UC-36, UC-37, UC-38 og UC-39 som eksplicitte prerequisites.
- [ ] En intern rute etableres ud fra aktiv GPS-position og aktiv destination.
- [ ] Den interne rute gemmes som vedvarende domænedata knyttet til den aktive Trip.
- [ ] Ruten genbruges som Route Context og rekonstrueres ikke fra samtalehistorik for hvert spørgsmål.
- [ ] Afstand fra aktuel GPS-position til den interne rute beregnes deterministisk uden LLM-gæt.
- [ ] En konfigurerbar tolerance anvendes, så almindelig GPS-støj ikke udløser rerouting.
- [ ] Ruten genberegnes først ved en vedvarende/reel afvigelse efter en dokumenteret regel.
- [ ] Genberegning anvender aktuel GPS-position og samme aktive destination.
- [ ] Roadcue behøver ikke kende årsagen til ruteafvigelsen for at tilpasse sin interne rute.
- [ ] En ny rute erstatter først den gamle, når routingservicen har returneret et gyldigt resultat.
- [ ] Efter genberegning bruger Nearby Places, Weather og Traffic-funktioner den nye Route Context.
- [ ] Roadcue må ikke påstå, at chaufførens eksterne GPS/navigation er ændret.
- [ ] Route Context fra én chauffør kan ikke lække til en anden chauffør.
- [ ] Tests mocker GPS-, database- og routingafhængigheder og foretager ingen live OpenAI- eller routingprovider-kald.

## Resultat

- VICO har en vedvarende, selvkorrigerende intern truck-rute, der følger chaufførens faktiske kørsel godt nok til at understøtte intelligente Route Context-features uden at Roadcue bliver en navigationsapp.
