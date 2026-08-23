# UC-10 – Find chaufførens venner

**Fase:** POC/MVP  
**Primær aktør:** Chauffør  
**Støtteaktør:** Roadcue Backend  
**Mål:** Chaufføren får oplyst relevante venner uden at VICO opfinder personer eller relationer.

**Hovedflow**

1. VICO modtager chaufførens autoriserede `driverId`.
2. VICO kalder `GetDriverFriends`.
3. Roadcue Backend returnerer chaufførens venner.
4. VICO filtrerer eller opsummerer efter spørgsmålet.
5. VICO præsenterer resultatet kort.

**Eksempler**

- “Hvem er mine venner?”
- “Er Peter en af mine venner?”

**Alternative flows**

- I POC kan VICO først bruge `GetDrivers` til at finde en simuleret bruger.
- Hvis flere personer har samme navn, beder VICO om præcisering.

**Resultat**

- Chaufføren har fået korrekte oplysninger om egne relationer.
