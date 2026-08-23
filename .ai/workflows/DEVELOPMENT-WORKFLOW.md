# Roadcue development workflow

## Feature eller use case

1. Angiv den konkrete use-case-sti i `/start-task`.
2. Copilot analyserer kode og opretter en task; ingen implementering.
3. Gennemgå scope, plan, acceptkriterier, tests og risici i tasken.
4. Godkend eksplicit eller bed om en revideret plan.
5. Kør `/continue` med den aktive task.
6. Copilot implementerer, tester og opdaterer tasken.
7. Review ændringerne og commit først derefter.

## Bug og refaktorering

Brug `/bugfix` eller `/refactor` til analyse og plan. Implementér fortsat kun med `/continue` efter godkendelse.

## Ændret scope

Hvis nyt scope opdages under implementering:

1. stop den aktive implementering;
2. opdatér tasken med fundet;
3. revidér planen;
4. indhent ny godkendelse;
5. fortsæt derefter.

