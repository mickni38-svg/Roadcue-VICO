# UC-07 – Find næste relevante sted

**Fase:** MVP  
**Primær aktør:** Chauffør  
**Støtteaktører:** Roadcue Backend, ekstern stedtjeneste  
**Mål:** Chaufføren finder et sted foran sig, som matcher et eller flere behov.

**Trigger**

> “Hvor langt er der til næste sted, hvor jeg kan tanke og spise?”

**Hovedflow**

1. VICO udleder de ønskede faciliteter og eventuel tidshorisont.
2. VICO henter chaufførens position og retning.
3. VICO kalder `FindNextTruckStop` eller tilsvarende Roadcue-tool.
4. C#-servicen henter relevante steder fra en ekstern datakilde.
5. C#-servicen filtrerer på retning og faciliteter.
6. C#-servicen beregner afstand og forventet ankomsttid.
7. VICO præsenterer det bedste match og de relevante faciliteter.

**Faciliteter kan omfatte**

- mad,
- tank,
- toilet,
- bad,
- parkering,
- og relevante sikkerhedsoplysninger.

**Alternative flows**

- Hvis intet sted matcher alle krav, tilbyder VICO det nærmeste relevante alternativ.
- Hvis steddata er ufuldstændige, siger VICO præcist, hvilke faciliteter der ikke kan bekræftes.

**Resultat**

- Et relevant sted, afstand, forventet tid og bekræftede faciliteter er fundet.
