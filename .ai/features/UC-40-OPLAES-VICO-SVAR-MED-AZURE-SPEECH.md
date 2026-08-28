# UC-40 – OPLÆS VICO-SVAR MED AZURE SPEECH

## Formål

VICO skal kunne oplæse sine svar med en fast, naturlig dansk stemme via Azure AI Speech i stedet for kun at benytte browserens standardoplæsning.

Formålet er at gøre VICO mere egnet til brug under kørsel, hvor chaufføren primært skal kunne høre svaret uden at se på skærmen.

## Primær aktør

Chauffør

## Forudsætninger

- VICO kan allerede modtage et spørgsmål og returnere et tekstsvar.
- Angular-klienten kan afspille lyd.
- Azure AI Speech er konfigureret som godkendt Text-to-Speech-provider.
- Implementeringen følger `.ai/external-apis/TEXT-TO-SPEECH.md`.
- Azure Speech credentials findes kun i backend-konfiguration/environment variables.
- Automatiserede tests må ikke kalde Azure Speech live.

## Trigger

VICO har genereret et svar, som skal formidles til chaufføren med tale.

## Hovedforløb

1. Chaufføren stiller et spørgsmål til VICO.
2. VICO behandler spørgsmålet og genererer et tekstsvar.
3. Angular-klienten modtager VICO-svaret.
4. Den tekst, der skal oplæses, sendes til Roadcues backend Speech Service.
5. Roadcues backend kalder Azure AI Speech Text-to-Speech.
6. Azure AI Speech genererer dansk tale.
7. Backend returnerer lyddata til Angular-klienten.
8. Angular-klienten afspiller VICO-svaret.
9. VICO viser visuelt, at den taler, mens lyden afspilles.
10. Når afspilningen er afsluttet, går VICO tilbage til normal/lyttende tilstand.

## Dansk stemme

VICO skal som udgangspunkt benytte en fast dansk Azure Speech-stemme.

Godkendte stemmer defineres i:

`.ai/external-apis/TEXT-TO-SPEECH.md`

Use casen må ikke hardcode provider-specifikke credentials eller tekniske secrets.

## Spoken response

Hvis backend returnerer både et almindeligt tekstsvar og et særskilt `spoken_answer`, skal `spoken_answer` benyttes til tale.

Eksempel:

```json
{
  "answer": "Der ligger tre rastepladser på din forventede rute inden for de næste 40 kilometer. Den nærmeste ligger 18 kilometer fremme og har både toilet, restaurant og tankstation.",
  "spoken_answer": "Der er en rasteplads 18 kilometer fremme med toilet, restaurant og tankstation."
}
```

Hvis `spoken_answer` ikke findes, oplæses det almindelige `answer`.

Formålet er, at VICO senere kan give kortere og mere kørselsegnede mundtlige svar end de svar, der vises på skærmen.

## Alternativt forløb – Azure Speech er midlertidigt utilgængelig

1. Roadcue forsøger at generere tale via Azure Speech.
2. Azure Speech returnerer fejl eller timeout.
3. Tekstsvaret skal stadig vises i Angular.
4. Fejlen må ikke medføre, at hele VICO-samtalen fejler.
5. Systemet logger fejlen uden at logge credentials eller secrets.
6. Browserbaseret fallback-TTS kan benyttes, hvis dette er aktiveret i Roadcues konfiguration.

## Alternativt forløb – lydafspilning fejler

1. Azure Speech har genereret lyd korrekt.
2. Browseren kan ikke afspille lydfilen/streamen.
3. Tekstsvaret forbliver synligt.
4. VICO forlader speaking-state.
5. Fejlen håndteres uden at bryde samtaleforløbet.

## Scope

Use casen omfatter:

- generering af dansk tale fra VICO-svar;
- backend-integration til Azure AI Speech;
- afspilning af genereret tale i Angular;
- VICO speaking-state under afspilning;
- mulighed for `spoken_answer`;
- robust fejlhåndtering;
- test med mocks.

## Ikke i scope

Denne use case omfatter ikke:

- speech-to-text;
- ændring af eksisterende talegenkendelse;
- voice cloning;
- oprettelse af en fotorealistisk avatar;
- lip sync eller avanceret mundanimation;
- oversættelse mellem sprog;
- live Azure Speech-kald fra automatiserede tests.

## Tekniske constraints

- Implementeringen skal følge `.ai/external-apis/TEXT-TO-SPEECH.md`.
- Azure AI Speech skal kaldes fra Roadcue backend og ikke direkte fra Angular med permanente credentials.
- Azure credentials må aldrig hardcodes.
- Secrets skal læses fra konfiguration/environment variables.
- Ekstern Azure-integration skal ligge bag en Roadcue abstraction/service.
- Domæne- og VICO-logik må ikke være direkte afhængig af Azure SDK/API.
- Automatiserede tests skal mocke Roadcues Speech Service/Azure-integration.
- Automatiserede tests må ikke generere betalt/live Azure Speech-trafik.

## Forslag til abstraktion

Eksempel:

```text
VICO / Agent response
        |
        v
SpeechOutputService
        |
        v
AzureSpeechService
        |
        v
Azure AI Speech
```

Angular skal kun kende Roadcues eget backend-interface og ikke Azure-credentials.

## Acceptance Criteria

### AC1 – Dansk Azure-stemme

**Given** VICO har genereret et tekstsvar  
**When** svaret skal oplæses  
**Then** genereres talen via Azure AI Speech  
**And** talen afspilles på dansk.

### AC2 – Fast VICO-stemme

**Given** Roadcue har en konfigureret VICO-stemme  
**When** flere VICO-svar oplæses  
**Then** anvendes den samme konfigurerede stemme konsekvent.

### AC3 – Credentials kun i backend

**Given** Azure Speech kræver credentials  
**When** Angular anmoder om tale  
**Then** må Angular ikke modtage eller indeholde permanente Azure Speech credentials.

### AC4 – Spoken answer prioriteres

**Given** VICO-svaret indeholder `spoken_answer`  
**When** svaret oplæses  
**Then** anvendes `spoken_answer` frem for det fulde `answer`.

### AC5 – Fallback til answer

**Given** VICO-svaret ikke indeholder `spoken_answer`  
**When** svaret oplæses  
**Then** anvendes det almindelige `answer`.

### AC6 – Speaking-state

**Given** lydafspilning er startet  
**When** VICO taler  
**Then** UI'et viser VICO i speaking-state  
**And** speaking-state afsluttes, når lyden stopper eller fejler.

### AC7 – Azure-fejl bryder ikke samtalen

**Given** Azure Speech ikke kan generere lyd  
**When** et VICO-svar skal oplæses  
**Then** vises tekstsvaret fortsat  
**And** samtalen må ikke fejle som helhed.

### AC8 – Ingen live Azure-kald i tests

**Given** automatiserede tests køres  
**When** TTS-funktionaliteten testes  
**Then** Azure Speech-integrationen mockes  
**And** der foretages ingen live requests til Azure AI Speech.

## Afhængigheder

- Eksisterende VICO chat-flow.
- Angular audio playback.
- `.ai/external-apis/TEXT-TO-SPEECH.md`.
- Azure AI Speech resource/configuration.

## Efterfølgende muligheder

Når denne use case er implementeret, kan senere use cases bygge videre med eksempelvis:

- valg af VICO-stemme;
- forskellige stemmestile til information og advarsler;
- streaming af tale for hurtigere respons;
- mere avanceret speaking-animation;
- viseme-baseret lip sync;
- VICO-avatar/person.
