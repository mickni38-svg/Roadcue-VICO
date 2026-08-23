# UC-31 – Modtag rådgivning fra Driving Coach

**Fase:** Senere  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren får kort, valgfri og rådgivende information ud fra tilgængelige data.

**Hovedflow**

1. Driving Coach er aktiveret på et valgt niveau.
2. Backend registrerer et relevant, ikke-autonomt rådgivningssignal.
3. VICO formulerer et kort råd og forklarer grundlaget.
4. Chaufføren vælger selv, om rådet følges.
5. Brugeren kan dæmpe eller slå rådstypen fra.

**Eksempel**

> “Trafikken foran bremser ofte. Overvej at holde lidt ekstra afstand.”

**Alternative flows**

- Ved utilstrækkelige data gives intet skråsikkert råd.
- Driving Coach kan slås helt fra.

## Acceptkriterier

- [ ] Driving Coach giver kun råd, når funktionen og den relevante rådstype er aktiveret.
- [ ] Rådet bygger på et struktureret backend-signal og ikke på en fri LLM-gætning.
- [ ] VICO formulerer rådet kort og angiver det relevante grundlag.
- [ ] Utilstrækkelige eller usikre data resulterer i intet råd eller et tydeligt forbehold.
- [ ] Rådet er formuleret som valgfri rådgivning og aldrig som udført køretøjskontrol.
- [ ] Dæmpning eller deaktivering forhindrer efterfølgende råd af den valgte type.

**Resultat**

- Chaufføren har fået valgfri rådgivning; VICO har ikke styret køretøjet.
