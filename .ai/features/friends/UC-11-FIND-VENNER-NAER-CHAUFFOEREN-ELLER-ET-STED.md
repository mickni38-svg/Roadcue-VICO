# UC-11 – Find venner nær chaufføren eller et sted

**Fase:** MVP  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren finder venner, som har delt en relevant position.

**Trigger-eksempler**

- “Er der nogen, jeg kender i nærheden?”
- “Er der nogen, jeg kender på næste rasteplads?”

**Hovedflow**

1. VICO identificerer søgeområdet fra chaufførens position eller samtalekonteksten.
2. VICO henter chaufførens venner.
3. Backend finder venner, som har givet tilladelse til lokationsdeling.
4. Backend udfører den geografiske beregning.
5. VICO præsenterer kun autoriserede matches.

**Alternative flows**

- Venner uden aktiv deling vises ikke som placeret.
- Hvis ingen matches findes, siger VICO det uden at afsløre skjulte positioner.

**Resultat**

- Chaufføren får en privatlivssikker liste over relevante venner.
