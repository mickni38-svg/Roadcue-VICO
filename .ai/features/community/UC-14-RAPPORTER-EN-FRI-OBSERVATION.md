# UC-14 – Rapportér en fri observation

**Fase:** MVP  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren rapporterer en hændelse naturligt uden at udfylde en kategoriformular.

**Trigger-eksempler**

- “Der er en væltet lastbil her. To spor er lukket.”
- “Toilettet er lukket.”
- “Der er kun tre pladser tilbage.”
- “Der ligger noget i højre spor.”

**Hovedflow**

1. Chaufføren beskriver observationen frit.
2. VICO udtrækker det faktiske observationsindhold.
3. Backend tilføjer position, vej/område, retning og tidspunkt.
4. Observationen gemmes som fritekst med fleksible metadata.
5. VICO læser fortolkningen tilbage.
6. Chaufføren bekræfter eller retter observationen.
7. Backend publicerer observationen som ubekræftet.

**Alternative flows**

- Hvis position eller vej ikke kan bestemmes, beder VICO om den nødvendige præcisering.
- Chaufføren kan annullere før publicering.

**Resultat**

- En kontekstberiget observation er gemt med tydelig sikkerhedsstatus.
