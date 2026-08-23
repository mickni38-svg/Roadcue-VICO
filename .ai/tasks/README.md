# Implementeringstasks

En task dokumenterer ét konkret implementeringsdelta. Den erstatter ikke den linkede use case.

## Status

- `Draft`: analysen er ikke færdig.
- `Ready`: planen er klar til brugerens godkendelse.
- `In Progress`: brugeren har godkendt planen, og implementering er startet.
- `Blocked`: et konkret forhold forhindrer fortsættelse.
- `Done`: acceptkriterier og validering er opfyldt.

## Regler

- Brug filnavnet `TASK-YYYY-MM-DD-KORT-TITEL.md`.
- Hav højst én aktiv task for det samme implementeringsarbejde.
- Link til use casen i stedet for at kopiere den.
- `/start-task` må højst sætte status til `Ready`.
- Kun `/continue` efter udtrykkelig godkendelse må sætte `In Progress`.
- Flyt færdige tasks til `tasks/archive/`, når mappen oprettes. Læs dem ikke rutinemæssigt.

