# UC-06 – Besvare et vejr- og kontekstafhængigt spørgsmål

**Fase:** MVP  
**Prioritet:** Must Have  
**Primær aktør:** Chauffør  
**Støtteaktører:** Roadcue Backend, ekstern vejrtjeneste  
**Mål:** Chaufføren får aktuelle vejroplysninger for sin position eller for relevante områder længere fremme på den aktive interne rute.

## Trigger-eksempler

> “Hvordan er vejret her?”

> “Kommer der regn længere fremme?”

> “Hvordan bliver vejret den næste time på min rute?”

## Forudsætninger

- UC-05 kan levere en gyldig aktuel position.
- For ruteafhængige spørgsmål findes en aktiv destination og intern rute via UC-35.
- Roadcue har adgang til en godkendt vejrtjeneste gennem backend.

## Hovedflow

1. Chaufføren stiller et spørgsmål, der kræver aktuelle vejroplysninger.
2. VICO identificerer, om spørgsmålet gælder nuværende position, et konkret sted eller et område længere fremme på den aktive rute.
3. VICO henter den nødvendige GPS- og rutekontekst via Roadcue Backend.
4. Ved spørgsmål om forhold længere fremme udvælger backend relevante punkter eller segmenter på den aktive interne rute.
5. Backend kalder den godkendte vejrtjeneste med strukturerede koordinater og relevant tidspunkt/prognosehorisont.
6. Backend returnerer aktuelle eller forventede vejrdata samt datatidspunkt.
7. VICO opsummerer kun de forhold, der er relevante for chaufførens spørgsmål, fx regn, sne, vind, temperatur eller sigtbarhed.
8. VICO gør det tydeligt, når svaret er en prognose og ikke en observation.

## Alternative flows

- Hvis aktuel position mangler, beder VICO om et sted eller forklarer, at lokationsdata mangler.
- Hvis chaufføren spørger om “min rute”, men ingen aktiv destination/rute findes, beder VICO om destination eller oplyser, at en aktiv rute først skal etableres.
- Hvis den eksterne vejrtjeneste fejler, oplyser VICO, at aktuelle vejroplysninger ikke kan hentes.
- Hvis prognosen ikke dækker hele den relevante rute eller tidshorisont, oplyses begrænsningen.

## Acceptkriterier

- [ ] Aktuelle vejrsvar baseres på en ekstern vejrtjeneste eller anden godkendt aktuel datakilde og ikke på modelgæt.
- [ ] Positioner og tidspunkter sendes som strukturerede værdier.
- [ ] Ved ruteafhængige spørgsmål anvendes punkter/segmenter på den aktive interne rute og ikke blot en vilkårlig radius omkring chaufføren.
- [ ] Svaret angiver relevant sted/område og tidspunkt eller prognosehorisont.
- [ ] Observation og prognose skelnes tydeligt.
- [ ] Fejl hos vejrtjenesten må ikke resultere i opdigtede aktuelle data.
- [ ] Hvis der ikke findes en aktiv rute til et ruteafhængigt spørgsmål, må VICO ikke foregive at kende chaufførens kommende vejforløb.
- [ ] Et efterfølgende spørgsmål i samme tråd kan referere til det tidligere vejrsvar uden at miste den aktive rutekontekst.

## Resultat

- Chaufføren får et aktuelt og rute-relevant vejrsvar baseret på struktureret GPS-, rute- og vejrdata.
