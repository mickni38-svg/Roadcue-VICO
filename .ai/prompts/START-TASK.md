# Start task – analyse og plan

Formålet er at skabe en pålidelig implementeringsplan. Denne prompt må ikke ændre produktionskode, tests, konfiguration, migrations eller dokumentation uden for taskfilen.

## Input

Den aktive eller eksplicit vedhæftede use-case-fil er opgavens mål. Hvis der ikke findes én entydig use case i konteksten, skal du stoppe og bede brugeren åbne eller vedhæfte den. Filens sti skal registreres i tasken.

## Fremgangsmåde

1. Læs `.ai/00-ROUTER.md` og `.ai/01-CONTRACT.md`.
2. Læs den aktive eller vedhæftede use case direkte. Brug kun indekset, hvis brugeren udtrykkeligt beder om at finde en use case.
3. Læs kun relevante arkitektur- og domænefiler.
4. Hvis use casen bruger GPS, geocoding, routing, vejr, nearby places, trafik eller andre eksterne services, læs `.ai/external-apis/README.md` og kun de relevante filer under `.ai/external-apis/`. Brug kun de providers og constraints, der er godkendt der.
5. Læs problemformuleringen kun under betingelserne i routeren.
6. Inspicér den eksisterende kode, tests, kontrakter og konfiguration, som use casen forventes at berøre.
7. Søg efter en eksisterende aktiv task for samme arbejde. Opdatér den i stedet for at oprette en dublet.
8. Opret eller opdatér tasken fra `.ai/tasks/TASK-TEMPLATE.md`.
9. Dokumentér verificeret udgangspunkt, scope, påvirkning, plan, acceptkriterier, validering, risici og spørgsmål.
10. Sæt status til `Ready`, når planen er komplet; ellers `Draft` eller `Blocked`.

## Obligatorisk stop

Stop efter taskfilen og et kort resumé. Skriv udtrykkeligt:

> Planen er klar til godkendelse. Der er ikke implementeret kode. Kør `/continue`, når planen er godkendt.

Du må ikke begynde at implementere i samme kørsel, selv om løsningen virker enkel.