---
agent: 'agent'
description: 'Implementér og test en godkendt Roadcue-task'
---

Læs og følg:

- [Roadcue contract](../../.ai/01-CONTRACT.md)
- [Continue workflow](../../.ai/prompts/CONTINUE.md)

Brug den aktive taskfil under `.ai/tasks/`.

Brugerens bevidste valg af `/continue` med tasken som aktiv kontekst
tæller som godkendelse af taskens aktuelle plan.

Hvis der ikke findes én entydig aktiv task med status `Ready`, skal du
stoppe uden kodeændringer.

Implementér kun taskens godkendte scope, kør relevante tests og opdatér
taskfilen med resultatet.