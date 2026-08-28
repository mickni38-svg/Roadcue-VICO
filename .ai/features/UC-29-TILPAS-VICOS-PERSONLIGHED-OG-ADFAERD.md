# UC-29 – Tilpas VICO’s personlighed og adfærd

**Fase:** MVP/Senere  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren bestemmer, hvordan og hvor meget VICO kommunikerer.

**Hovedflow**

1. Chaufføren åbner indstillinger eller beder VICO ændre en præference.
2. Brugeren vælger eksempelvis:
   - svarlængde,
   - oplæsningshastighed,
   - sprog,
   - humor,
   - snakkelyst,
   - proaktivitet,
   - Driving Coach-niveau,
   - tilladte afbrydelseskategorier.
3. VICO læser ændringen tilbage ved stemmebetjening.
4. Chaufføren bekræfter relevante ændringer.
5. Indstillingen gemmes på brugerprofilen.

**Alternative flows**

- Brugeren kan aktivere stille tilstand.
- Personlighedsindstillinger kan aldrig tilsidesætte sikkerhed, autorisation eller sandhedskrav.

## Acceptkriterier

- [ ] Hver understøttet præference kan læses, ændres og gendannes for den autoriserede bruger.
- [ ] Ved stemmebetjening læses ændringen tilbage før lagring, når den har væsentlig effekt.
- [ ] Gemte præferencer anvendes i efterfølgende samtaler for samme bruger.
- [ ] En brugers præferencer påvirker ikke andre brugere.
- [ ] Stille tilstand og afbrydelseskategorier respekteres af relevante meddelelsesflows.
- [ ] Personlighedsindstillinger kan ikke tilsidesætte sandhed, autorisation, samtykke eller sikkerhed.
- [ ] En ugyldig eller ikke-understøttet værdi afvises med en forståelig forklaring.

**Resultat**

- VICO kommunikerer efter brugerens præferencer inden for faste sikkerhedsrammer.
