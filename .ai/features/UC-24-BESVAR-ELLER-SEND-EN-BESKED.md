# UC-24 – Besvar eller send en besked

**Fase:** MVP  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren sender en besked gennem et kontrolleret og bekræftet flow.

**Hovedflow**

1. Chaufføren vælger modtager og dikterer eller skriver beskeden.
2. VICO gengiver modtager og indhold.
3. Chaufføren bekræfter afsendelsen.
4. Backend kontrollerer rettigheder og sender beskeden.
5. Backend bekræfter succes.
6. Først derefter fortæller VICO, at beskeden er sendt.

**Alternative flows**

- Chaufføren retter eller annullerer beskeden.
- Ved tvetydig modtager beder VICO om præcisering.
- Ved fejl forbliver beskeden usendt eller får tydelig fejlstatus.

## Acceptkriterier

- [ ] Modtager og beskedindhold gengives før afsendelse.
- [ ] Beskeden sendes kun efter chaufførens udtrykkelige bekræftelse.
- [ ] En tvetydig modtager skal afklares før bekræftelse.
- [ ] Backend kontrollerer afsenderens rettigheder og den valgte modtager.
- [ ] VICO siger først ‘sendt’, når backend har bekræftet succes.
- [ ] Retries eller dobbelte bekræftelser sender ikke samme besked mere end én gang.
- [ ] Fejl efterlader beskeden med en tydelig ikke-sendt eller fejlstatus.

**Resultat**

- Beskeden er sendt præcis én gang eller tydeligt markeret som ikke sendt.
