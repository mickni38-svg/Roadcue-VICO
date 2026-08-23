# UC-25 – Oversæt en samtale mellem chauffører

**Fase:** Senere  
**Primær aktør:** Chauffør  
**Støtteaktør:** Community-chauffør  
**Mål:** Chauffører med forskellige sprog kan udveksle forståelige beskeder.

**Hovedflow**

1. Chaufføren formulerer en besked på sit eget sprog.
2. Systemet oversætter til modtagerens foretrukne sprog.
3. Modtageren hører eller læser oversættelsen.
4. Modtageren svarer på sit eget sprog.
5. Svaret oversættes tilbage.
6. VICO læser det oversatte svar op.

**Alternative flows**

- Brugeren kan bede om originalteksten.
- Usikre oversættelser markeres.
- Navne, stednavne og vejnumre bevares.

## Acceptkriterier

- [ ] Beskeder oversættes til modtagerens valgte sprog og tilbage til afsenderens valgte sprog.
- [ ] Originaltekst og oversættelse forbindes med samme besked-ID.
- [ ] Navne, stednavne, vejnumre, tider og måleenheder bevares korrekt.
- [ ] Usikker oversættelse markeres og kan vises sammen med originalteksten.
- [ ] Sikkerhedsstatus og kildeoplysninger ændres ikke under oversættelsen.
- [ ] En bruger kan anmode om originalteksten uden at sende en ny besked.

**Resultat**

- En flersproget udveksling er gennemført uden at ændre fakta eller sikkerhedsstatus.
