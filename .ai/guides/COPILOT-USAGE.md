# Brug Copilot med Roadcue-flowet

## Analysér en use case

1. Åbn den konkrete use-case-fil i Visual Studio, eller vedhæft den med `+` i Copilot Chat.
2. Sørg for, at use casen er det aktive dokument.
3. Vælg `/start-task`.

Prompten starter med det samme. Derfor skal use casen være aktiv eller vedhæftet, før kommandoen vælges. Copilot må nu kun analysere repositoryet og oprette/opdatere tasken.

## Godkend og implementér

Læs taskfilen. Når den er korrekt:

1. Åbn taskfilen som aktivt dokument, eller vedhæft den med `+`.
2. Vælg `/continue`.

Det bevidste valg af `/continue` med den aktive task tæller som godkendelse af taskens aktuelle plan.

## Andre kommandoer

- `/bugfix`: find rodårsag og lav plan; implementerer ikke.
- `/refactor`: lav en adfærdsbevarende plan; implementerer ikke.
- `/review`: read-only review.
- `/document`: opdatér verificeret dokumentation, ikke produktionskode.

## Spar tokens

- Åbn eller vedhæft altid den præcise use-case- eller taskfil.
- Vedhæft ikke hele kataloget.
- Bed ikke Copilot om at “læse alt”.
- Genbrug den aktive task gennem analyse, implementering og review.
- Start en ny chat ved ny task, men fortsæt samme chat mens én task er aktiv.
