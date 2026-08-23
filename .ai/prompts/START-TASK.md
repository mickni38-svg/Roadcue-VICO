# Start task – analyse og plan

Formålet er at skabe en pålidelig implementeringsplan. Denne prompt må ikke ændre produktionskode, tests, konfiguration, migrations eller dokumentation uden for taskfilen.

## Input

Brugeren skal angive en use-case-sti eller beskrive opgaven præcist. Hvis en fil er åben eller vedhæftet, må den bruges som input, men dens sti skal registreres.

## Fremgangsmåde

1. Læs `.ai/00-ROUTER.md` og `.ai/01-CONTRACT.md`.
2. Læs den angivne use case direkte. Brug kun indekset, hvis stien/ID'et ikke er kendt.
3. Læs kun relevante arkitektur- og domænefiler.
4. Læs problemformuleringen kun under betingelserne i routeren.
5. Inspicér den eksisterende kode, tests, kontrakter og konfiguration, som use casen forventes at berøre.
6. Søg efter en eksisterende aktiv task for samme arbejde. Opdatér den i stedet for at oprette en dublet.
7. Opret eller opdatér tasken fra `.ai/tasks/TASK-TEMPLATE.md`.
8. Dokumentér verificeret udgangspunkt, scope, påvirkning, plan, acceptkriterier, validering, risici og spørgsmål.
9. Sæt status til `Ready`, når planen er komplet; ellers `Draft` eller `Blocked`.

## Obligatorisk stop

Stop efter taskfilen og et kort resumé. Skriv udtrykkeligt:

> Planen er klar til godkendelse. Der er ikke implementeret kode. Kør `/continue`, når planen er godkendt.

Du må ikke begynde at implementere i samme kørsel, selv om løsningen virker enkel.

