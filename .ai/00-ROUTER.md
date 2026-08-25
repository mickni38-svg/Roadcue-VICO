# Roadcue context router

Brug denne fil til at vælge mindst mulig nødvendig kontekst. Læs ikke hele `.ai/` automatisk.

## Altid

1. Læs `.ai/01-CONTRACT.md`.
2. Identificér opgavetypen fra brugerens kommando.
3. Følg den relevante prompt i `.ai/prompts/`.
4. Inspicér den aktuelle kode, før du antager, at dokumentationen matcher repositoryet.

## Opgaveruter

| Opgave | Læs |
|---|---|
| Ny use case eller ændring af use case | `features/README.md`, `features/USE-CASE-TEMPLATE.md` og kun relevante katalogfiler |
| Implementér en kendt use case | Den angivne use case, relevante arkitekturfiler, relevante domæneregler og den aktive task |
| Fortsæt en godkendt task | Kun aktiv task, linket use case, berørte regler og de faktiske kodefiler |
| Bug | `prompts/BUGFIX.md`, berørt kode/test og kun relevante regler |
| Refaktorering | `prompts/REFACTOR.md`, berørt kode/test og relevante arkitekturgrænser |
| Review | `prompts/REVIEW.md`, ændringerne, tests og relevante regler |
| Dokumentation | `prompts/DOCUMENT.md` og de kilder dokumentet beskriver |
| Arkitekturændring | Relevante arkitekturfiler, accepterede ADR'er og `ADR-TEMPLATE.md` |
| Frontend / Angular (`src/Roadcue.Web`) | `ARCHITECTURE-FRONTEND.md` + berørt feature-mappe under `src/app/features/` |

## Problemformulering og kravspecifikation

`docs/Roadcue-Problemformulering-og-Kravspecifikation.md` læses kun når:

- en opgave er uklar eller ikke dækket af en godkendt use case;
- scope, produktmål eller afgrænsning skal vurderes;
- en ny use case eller større arkitekturændring foreslås.

Den læses ikke rutinemæssigt ved implementering af en entydig, godkendt use case.

## Kontekstbudget

- Når en præcis use-case-sti er angivet, må hele kataloget eller indekset ikke læses først.
- Læs kun de arkitekturfiler og domæneregler, der påvirkes.
- Læs ikke afsluttede tasks, medmindre den aktive task linker til dem.
- Kopiér ikke hele use casen ind i tasken; link til den og dokumentér kun implementeringsdeltaet.
- Brug korte testsammendrag i tasken, ikke komplette logs.
- Udvid konteksten én fil ad gangen, når et konkret spørgsmål kræver det.

