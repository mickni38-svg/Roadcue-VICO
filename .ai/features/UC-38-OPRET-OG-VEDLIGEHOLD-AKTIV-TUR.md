# UC-38 – Opret og vedligehold aktiv Trip

**Fase:** MVP  
**Prioritet:** Must Have  
**Primær aktør:** Roadcue Backend  
**Støtteaktører:** Chauffør, VICO  
**Mål:** Roadcue har én vedvarende domænemodel for chaufførens aktuelle tur, så destination, GPS-kontekst og senere intern rute ikke kun ligger i samtalehukommelsen.

## Forudsætninger

- Chaufføren er identificeret.
- UC-36 kan levere en aktiv destination.
- UC-37 kan levere chaufførens aktuelle position, når den er tilgængelig.

## Hovedflow – opret Trip

1. Chaufføren sætter en aktiv destination via UC-36.
2. Backend undersøger, om chaufføren allerede har en aktiv Trip.
3. Hvis der ikke findes en aktiv Trip, oprettes en ny.
4. Den validerede destination gemmes på Trip'en.
5. Aktuel GPS-position kan knyttes til Trip-konteksten, men positionshistorik behøver ikke gemmes som en del af denne use case.
6. Trip'en får en entydig status, fx `active`.
7. VICO og Roadcue-tools kan hente den aktive Trip via backend i stedet for at forsøge at rekonstruere turen fra chat-historikken.

## Hovedflow – vedligehold Trip

1. En ændring af aktiv destination opdaterer den aktive Trip.
2. En senere intern rute kan gemmes på eller refereres fra Trip'en via UC-35.
3. Når turen afsluttes eller annulleres, ændres status, så Trip'en ikke længere returneres som aktiv.
4. En ny tur opretter en ny Trip i stedet for at genbruge afsluttede turdata som aktuelle data.

## Foreslået minimumsmodel

- `id`
- `driverId`
- `threadId` hvis relevant for kobling til samtalekontekst
- aktiv destination
- `status`
- `startedAt`
- `updatedAt`
- `completedAt` / `cancelledAt` når relevant
- reference til aktiv intern rute, når UC-35 er implementeret

## Alternative flows

- Hvis chaufføren allerede har en aktiv Trip og sætter en ny destination, opdateres den eksisterende aktive Trip eller erstattes efter en eksplicit domæneregel; der må ikke opstå to aktive Trips utilsigtet.
- Hvis databasen ikke kan gemme ændringen, må VICO ikke bekræfte, at Trip/destination er opdateret.
- Hvis en afsluttet Trip hentes ved en fejl, må den ikke bruges som aktiv Route Context.
- Hvis `threadId` ændres, skal den aktive Trip stadig kunne findes ud fra den autoriserede chauffør; Trip må ikke være afhængig af én kortlivet LLM-session alene.

## Acceptkriterier

- [ ] En chauffør kan have en entydigt identificerbar aktiv Trip.
- [ ] Aktiv destination gemmes som domænedata på eller i relation til Trip'en.
- [ ] Trip'en kan hentes uden at læse eller fortolke samtalehistorikken.
- [ ] Afsluttede/annullerede Trips returneres ikke som aktive.
- [ ] Systemet undgår utilsigtet flere samtidige aktive Trips for samme chauffør, medmindre en senere forretningsregel eksplicit tillader det.
- [ ] Data fra én chaufførs Trip kan ikke anvendes i en anden chaufførs session.
- [ ] Databasefejl medfører ikke falsk bekræftelse fra VICO.
- [ ] Modellen kan senere udvides med intern route/polyline, ETA, distance og routing-metadata uden at ændre samtalemodellen.
- [ ] Tests anvender testdatabase/mocks og foretager ikke live OpenAI-kald.

## Resultat

- Roadcue har en vedvarende aktiv Trip, som fungerer som domænemæssig container for destination og senere Route Context.
