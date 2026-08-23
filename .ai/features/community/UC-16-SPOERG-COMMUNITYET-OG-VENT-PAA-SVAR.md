# UC-16 – Spørg communityet og vent på svar

**Fase:** Senere  
**Primær aktør:** Chauffør  
**Støtteaktører:** Community-chauffører, baggrundsprocessor  
**Mål:** VICO kan hente ny viden fra relevante chauffører, når eksisterende data ikke er nok.

**Hovedflow**

1. VICO konstaterer, at der mangler et sikkert svar.
2. VICO foreslår at spørge relevante chauffører.
3. Chaufføren accepterer.
4. Backend udvælger modtagere efter position, retning, tidspunkt, relation og tilladelser.
5. LangGraph opretter et ventende flow med et stabilt ID og timeout.
6. Modtagerne kan svare eller ignorere.
7. Flowet gemmer svarene og kan fortsætte efter en servicegenstart.
8. Når der er tilstrækkelige svar eller timeout, genoptages flowet.
9. UC-17 opsummerer svarene.
10. VICO vender tilbage til chaufføren med resultatet.

**Alternative flows**

- Chaufføren kan annullere det ventende spørgsmål.
- Chaufføren kan spørge efter status.
- Hvis ingen svarer, fortæller VICO det.
- For gamle svar bruges ikke som aktuelle oplysninger.

**Resultat**

- Et asynkront community-spørgsmål er afsluttet, annulleret eller udløbet.
