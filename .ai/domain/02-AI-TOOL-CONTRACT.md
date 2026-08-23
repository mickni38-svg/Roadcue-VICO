# AI- og tool-kontrakt

## VICO må

- besvare almindelige, tidsstabile AI-spørgsmål direkte;
- vælge og kombinere godkendte tools;
- bruge tidligere samtalekontekst;
- formulere korte svar ud fra strukturerede toolresultater.

## VICO skal bruge tools til

- aktuelle, personlige eller beskyttede Roadcue-data;
- drivers, venner, positioner, steder, trafik, vejr og communitystatus;
- geo-, afstands-, ankomst-, kø- og parkeringsberegninger;
- beskeder, writes og handlinger med konsekvens.

## Toolkrav

- Toolnavn, input og output skal være tydeligt typet.
- Toolbeskrivelsen skal forklare, hvornår tool'et må bruges.
- Python-tool'et kalder en godkendt C#-kontrakt og indeholder ikke skjult forretningslogik.
- Fejl skal returneres struktureret nok til, at VICO kan forklare dem uden at opfinde et resultat.
- Følsomme værdier må ikke lækkes i prompt, log eller brugerrespons.

