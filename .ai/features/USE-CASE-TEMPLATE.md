<!--
Sådan bruges skabelonen:

1. Kopiér filen til den relevante domænemappe under `.ai/features/`.
2. Omdøb kopien til `UC-XX-KORT-TITEL.md`.
3. Erstat alle værdier i kantede parenteser.
4. Fjern valgfrie felter og afsnit, som ikke er relevante.
5. Tilføj use casen i `.ai/features/00-USE-CASE-INDEX.md`.
6. Opdatér `.ai/features/02-RELATIONS-ROADMAP-AND-ACCEPTANCE.md`, hvis use casen ændrer relationer eller implementeringsrækkefølge.
7. Behold denne skabelon uændret til den næste use case.

Nummerér aldrig eksisterende use cases om. Brug det næste ledige stabile ID.
En use case beskriver varig funktionalitet. Det konkrete implementeringsarbejde beskrives i en separat fil under `.ai/tasks/`.
-->

UC-XX – [Kort og handlingsorienteret titel]

Fase: [POC / POC/MVP / MVP / MVP/Senere / Senere / Vision]
Prioritet: [Must Have / Nice to Have / Senere / Vision]
Primær aktør: [Chauffør / VICO / Baggrundsprocessor / anden aktør]
Støtteaktører: [Roadcue Backend, ekstern datatjeneste, community-chauffør eller andre – fjern feltet, hvis ingen]
Mål: [Beskriv den værdi eller det resultat, aktøren skal opnå.]

Forudsætninger

[Nødvendig bruger-, system- eller datakontekst findes.]

[Nødvendige tilladelser, integrationer eller services er tilgængelige.]

[Fjern afsnittet, hvis use casen ikke har egentlige forudsætninger.]

Trigger

“[Et realistisk eksempel på, hvad chaufføren siger eller gør.]”

Hovedflow

[Aktøren starter use casen.]

[VICO fortolker intention og relevant samtalekontekst.]

[VICO vælger om nødvendigt et godkendt tool.]

[Roadcue Backend autoriserer og udfører regler, opslag eller præcise beregninger.]

[En ekstern service eller communityet anvendes kun, hvis use casen kræver det.]

[VICO kombinerer de strukturerede resultater.]

[Chaufføren modtager et kort og forståeligt resultat.]

Eksempel

“[Eksempel på VICO’s forventede svar – fjern afsnittet, hvis det ikke tilfører noget.]”

Alternative flows

Hvis [oplysning mangler eller er tvetydig], beder VICO om præcisering uden at gætte.

Hvis [brugeren ikke er autoriseret], afslører Roadcue ingen beskyttede oplysninger.

Hvis [tool eller ekstern service fejler], forklarer VICO fejlen kort og udfører ikke en uautoriseret alternativ handling.

Hvis [informationen er gammel, ubekræftet eller usikker], formidler VICO kilden, alderen og usikkerheden.

Hvis use casen udfører en handling med konsekvens, læser VICO handlingen tilbage og kræver bekræftelse før udførelse.

[Tilføj use case-specifikke alternative flows og fjern irrelevante standardpunkter.]

Resultat

[Beskriv den observerbare sluttilstand eller den værdi, chaufføren har modtaget.]

[Beskriv om nødvendigt, hvad der med sikkerhed ikke er sket.]

Kontrol før use casen godkendes

Use casen samler et sammenhængende brugerforløb og er ikke blot ét enkelt krav.

Fase og prioritet stemmer med Roadcues roadmap.

Hovedflowet beskriver resultatet uden at låse unødvendige implementeringsdetaljer.

Alternative flows omfatter manglende data, tvetydighed, autorisation og relevante servicefejl.

VICO opfinder ikke Roadcue-data eller aktuelle oplysninger.

C# ejer SQL, autorisation, forretningsregler, geoqueries og præcise beregninger.

Python/LangGraph ejer samtale- og agentorkestrering og bruger kun godkendte C#-tools.

Handlinger med konsekvens kræver bekræftelse og må først meldes gennemført efter svar fra backend.

Use casen er tilføjet i 00-USE-CASE-INDEX.md.

En separat task oprettes, når implementeringen skal begynde.