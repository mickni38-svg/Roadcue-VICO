# Continue – implementér godkendt task

Formålet er at implementere og validere en allerede godkendt plan.

## Adgangskrav

Fortsæt kun når:

- brugeren udtrykkeligt siger, at planen er godkendt;
- den aktive task findes og har status `Ready`;
- tasken linker til en eksisterende use case eller beskriver en entydig ikke-feature-opgave.

Hvis et krav mangler, stop uden kodeændringer og forklar præcist hvad der mangler.

## Fremgangsmåde

1. Læs `.ai/01-CONTRACT.md`, den aktive task, den linkede use case og kun relevante regler.
2. Kontrollér at kodebasens udgangspunkt stadig matcher taskens analyse.
3. Sæt taskens status til `In Progress`.
4. Implementér den mindste komplette godkendte plan i små trin.
5. Test efter relevante trin og ret fejl inden for det godkendte scope.
6. Opdatér taskens implementeringslog, afvigelser og korte valideringsresultater.
7. Sæt kun status til `Done`, når acceptkriterier og validering er opfyldt. Brug ellers `Blocked` eller behold `In Progress`.
8. Opdatér varig dokumentation kun når implementeringen ændrer den dokumenterede sandhed.

Nyt scope, en manglende sikkerhedsbeslutning eller en større arkitekturændring kræver stop og ny godkendelse.

