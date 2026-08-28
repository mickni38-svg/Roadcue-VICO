# SUC-05 – Gem en fleksibel observation

- Fritekst gemmes uden en databasekolonne for hver mulig observationstype.
- Position, tidspunkt, retning, kilde, sikkerhedsstatus og gyldighed gemmes struktureret.
- Semantisk repræsentation kan tilføjes senere.
- Autorisation og geografisk relevans udføres fortsat deterministisk.

## Acceptkriterier

- [ ] Observationens originale fritekst bevares uændret som kildegrundlag.
- [ ] Position, tidspunkt, retning, kilde, sikkerhedsstatus og gyldighed gemmes struktureret.
- [ ] Nye observationstyper kan gemmes uden en ny databasekolonne for hver type.
- [ ] Autorisation og geografisk relevans håndhæves på strukturerede felter.
- [ ] En senere semantisk repræsentation kan genskabes uden at ændre originalteksten.
- [ ] Udløbne eller ugyldige observationer kan filtreres deterministisk.

