# SUC-06 – Beregn og formidl troværdighed

- Backend beregner sikkerhedsstatus ud fra kilder, alder, antal bekræftelser og modstridende oplysninger.
- VICO modtager status som strukturerede data.
- VICO formulerer status uden at ændre den beregnede betydning.
- Ubefæstede oplysninger præsenteres aldrig som sikre fakta.

## Acceptkriterier

- [ ] Backend beregner sikkerhedsstatus deterministisk ud fra dokumenterede inputfaktorer.
- [ ] Statusresultatet indeholder mindst kategori, beregningstidspunkt og relevant grundlag.
- [ ] Flere bekræftelser, alder og modstridende oplysninger påvirker status efter fastlagte regler.
- [ ] VICO modtager status som strukturerede data og må ikke opgradere dens betydning.
- [ ] Ubekræftede eller modstridende oplysninger præsenteres ikke som sikre fakta.
- [ ] Samme input og regelversion giver samme sikkerhedsstatus.
