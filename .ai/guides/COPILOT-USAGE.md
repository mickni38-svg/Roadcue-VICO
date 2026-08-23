# Brug Copilot med Roadcue-flowet

## Analysér en use case

Kør:

```text
/start-task
```

Angiv derefter eksempelvis:

```text
Implementér .ai/features/conversation/UC-01-FOERE-EN-NATURLIG-AI-SAMTALE.md
```

Copilot må nu kun analysere repositoryet og oprette/opdatere tasken. Åbn gerne use-case-filen, men stien i prompten er det entydige input.

## Godkend og implementér

Læs taskfilen. Når den er korrekt, kør:

```text
/continue
```

Angiv:

```text
Planen er godkendt. Implementér .ai/tasks/TASK-YYYY-MM-DD-KORT-TITEL.md
```

## Andre kommandoer

- `/bugfix`: find rodårsag og lav plan; implementerer ikke.
- `/refactor`: lav en adfærdsbevarende plan; implementerer ikke.
- `/review`: read-only review.
- `/document`: opdatér verificeret dokumentation, ikke produktionskode.

## Spar tokens

- Angiv altid præcis use-case- eller tasksti.
- Vedhæft ikke hele kataloget.
- Bed ikke Copilot om at “læse alt”.
- Genbrug den aktive task gennem analyse, implementering og review.
- Start en ny chat ved ny task, men fortsæt samme chat mens én task er aktiv.

