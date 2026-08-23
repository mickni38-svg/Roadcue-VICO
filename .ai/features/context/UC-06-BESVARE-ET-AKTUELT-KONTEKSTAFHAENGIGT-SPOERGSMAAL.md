# UC-06 – Besvare et aktuelt kontekstafhængigt spørgsmål

**Fase:** MVP  
**Primær aktør:** Chauffør  
**Støtteaktører:** Roadcue Backend, ekstern datatjeneste  
**Mål:** Chaufføren får et korrekt svar, som kræver tid, position eller eksterne data.

**Hovedflow**

1. Chaufføren stiller eksempelvis spørgsmålet “Hvornår går solen ned?” eller “Hvordan er vejret her?”.
2. VICO konstaterer, at almindelig modelviden ikke er tilstrækkelig.
3. VICO henter den tilladte position og det aktuelle tidspunkt.
4. VICO kalder den relevante C#-service.
5. C#-servicen kalder om nødvendigt en ekstern leverandør.
6. VICO formulerer det beregnede eller hentede resultat.

**Alternative flows**

- Hvis position ikke er tilgængelig, beder VICO om en by eller et område.
- Hvis den eksterne tjeneste fejler, oplyser VICO, at aktuelle data ikke kan hentes.

**Resultat**

- Chaufføren får et aktuelt og kontekstbaseret svar uden at VICO gætter.
