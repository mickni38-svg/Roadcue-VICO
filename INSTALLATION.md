# Installér den nye Roadcue AI-struktur

Denne pakke er en komplet erstatning for den nuværende `.ai`-mappe. Bland ikke gamle workflowfiler ind i den nye struktur.

## Før du erstatter

Lav en midlertidig backup af:

- den nuværende `.ai`-mappe;
- aktive taskfiler, som endnu ikke er afsluttet;
- eventuelle projektspecifikke Copilot-filer, du selv har tilføjet.

## Erstat

1. Erstat hele Roadcues nuværende `.ai`-mappe med pakkens `.ai`-mappe.
2. Kopiér pakkens `.github/copilot-instructions.md` til repositoryets `.github/`.
3. Erstat `.github/instructions/` og `.github/prompts/` med mapperne fra pakken.
4. Behold andre eksisterende `.github`-mapper, eksempelvis `workflows/`.
5. Flyt kun stadig relevante aktive taskfiler ind i den nye `.ai/tasks/`; flyt ikke gamle prompts eller templates tilbage.

## Kontrollér

- `.ai/00-ROUTER.md` findes.
- `.github/prompts/start-task.prompt.md` findes.
- Der findes 33 `UC-`-filer og 6 `SUC-`-filer under `.ai/features/`.
- Den gamle `01-CATALOG-CONTEXT.md` og `02-RELATIONS-ROADMAP-AND-ACCEPTANCE.md` findes ikke.
- Der findes ikke en anden `START-TASK`-regel, som tillader implementering før `/continue`.

## Første brug

Åbn denne use case som aktivt dokument:

```text
.ai/features/conversation/UC-01-FOERE-EN-NATURLIG-AI-SAMTALE.md
```

Vælg derefter `/start-task`. Når taskplanen er korrekt, åbn den oprettede task som aktivt dokument og vælg `/continue`.
