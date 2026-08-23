# Roadcue AI development context

Denne mappe er den autoritative udviklingskontekst for Roadcue. Den er skrevet til GitHub Copilot/Claude og mennesker, der arbejder i repositoryet.

Start altid i `00-ROUTER.md`. Læs derefter kun de filer, som routeren kræver for den konkrete opgave.

## Hovedregel

- `.ai/features/` beskriver varig produktadfærd.
- `.ai/tasks/` beskriver ét konkret stykke implementeringsarbejde.
- `.ai/architecture/` beskriver Roadcues tekniske grænser.
- `.ai/decisions/` indeholder accepterede arkitekturbeslutninger.
- `.ai/prompts/` beskriver udviklingskommandoernes adfærd.
- `.github/` er kun Copilots indgang til disse regler og må ikke være en konkurrerende sandhedskilde.

Den almindelige rækkefølge er:

1. `/start-task <sti til use case>` analyserer og laver en plan.
2. Copilot stopper uden at implementere.
3. Brugeren godkender planen.
4. `/continue` implementerer og validerer den godkendte plan.

