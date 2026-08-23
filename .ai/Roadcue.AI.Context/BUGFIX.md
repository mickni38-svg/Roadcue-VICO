# Bugfix – diagnose og plan

Analysér fejlen uden at implementere en rettelse.

1. Reproducer eller afgræns fejlen med konkrete observationer.
2. Inspicér relevante logs, tests, kode, kontrakter og konfiguration.
3. Adskil symptom, sandsynlig årsag og bekræftet rodårsag.
4. Opret/opdatér en task fra `TASK-TEMPLATE.md` med minimal rettelse, regressionstest og risici.
5. Sæt tasken til `Ready`, når rodårsag og plan er tilstrækkeligt bekræftet.
6. Stop før kodeændringer og bed om godkendelse efter samme regel som `/start-task`.

Hvis fejlen ikke kan reproduceres, dokumentér de manglende beviser og næste diagnostiske skridt; gæt ikke.

