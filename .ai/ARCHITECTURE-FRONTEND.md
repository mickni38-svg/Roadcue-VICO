# Roadcue Frontend Architecture (Angular)

Status: aktiv
Scope: `src/Roadcue.Web`

Denne fil er autoritativ for arkitektur og mappe-konventioner i Angular-projektet.
Læs den før du tilføjer komponenter, services eller features.

## 1. Mappestruktur

```
src/Roadcue.Web/src/app/
├── app.ts                      # Root component
├── app.config.ts               # Providers, DI-bindings
├── app.routes.ts               # Router-konfiguration
├── core/                       # Singletons: interceptors, guards, cross-cutting services
├── shared/                     # Genbrugelige, tilstandsløse komponenter/pipes/direktiver
└── features/
	└── <feature>/              # Feature-modul (fx voice, planning, dashboard)
		├── <feature>.component.ts
		├── <feature>.component.html
		├── <feature>.component.scss
		├── <feature>.component.spec.ts
		├── *.service.ts        # Kun brugt af featuren
		└── *.adapter.ts        # Ports/adapters til browser-API'er
```

Regler:

- Én feature pr. mappe under `features/`. Feature-lokale services, adapters, state
  og typer skal ligge inde i feature-mappen. Ingen delt "services/"-mappe.
- Services der bruges på tværs af features flyttes til `core/`. Genbrugelige UI-dele
  til `shared/`.
- Root-niveauet (`app.ts`, `app.config.ts`, `app.routes.ts`) må ikke indeholde
  forretningslogik — kun sammensætning.

## 2. Komponenter — ingen inline HTML/CSS

Komponenter SKAL bruge eksterne template- og style-filer:

```ts
@Component({
  selector: 'app-voice',
  templateUrl: './voice.component.html',
  styleUrl: './voice.component.scss',
})
```

Ikke tilladt:

- `template: \`<div>...</div>\`` (inline HTML)
- `styles: [\` ... \`]` eller `styles: ['...']` (inline CSS/SCSS)

Undtagelse: rene wrapper-komponenter der kun renderer én selector uden markup
(fx `<app-voice />`) må bruge inline `template` for at undgå tomme filer. Der må
stadig ikke være inline `styles`.

Begrundelse: eksterne filer giver bedre editor-support (Angular Language Service,
Prettier, SCSS-linting), lettere diffs, korrekt syntax highlighting og gør det
muligt at style-linte og teste templates uafhængigt af TypeScript.

## 3. Naming

- Filer: `kebab-case`, suffix beskriver rollen: `.component.ts`, `.service.ts`,
  `.adapter.ts`, `.pipe.ts`, `.directive.ts`, `.guard.ts`, `.spec.ts`.
- Klasser: `PascalCase` med samme suffix (`VoiceComponent`, `AgentChatService`).
- Selectors: `app-` prefix (`app-voice`).
- BEM til CSS-klasser (`.voice`, `.voice__emoji`, `.voice__emoji--active`).

## 4. Change detection & state

- Alle komponenter bruger `ChangeDetectionStrategy.OnPush`.
- Foretrukket state-primitiv: `signal()` / `computed()` fra `@angular/core`.
- Async I/O isoleres i services eller adaptere — ikke i komponenter direkte.

## 5. Ports & adapters til browser-API'er

Browser-API'er (SpeechRecognition, SpeechSynthesis, Geolocation, MediaDevices osv.)
skal wrappes bag et interface + `InjectionToken`, så de kan fakes i tests.
Se `features/voice/speech-recognition.adapter.ts` som referenceimplementering.

## 6. Backend-kald

- Al HTTP går gennem `HttpClient` (aldrig `fetch` direkte).
- Endpoints defineres som `InjectionToken<string>` konstanter i den service der
  bruger dem (se `AGENT_CHAT_ENDPOINT`), så de kan overrides i tests og miljøer.
- Al kommunikation med Roadcue's C#-API skal bruge HTTPS (jf. `.github/copilot-instructions.md`).

## 7. Tests

- Hver komponent og service har en tilhørende `.spec.ts` i samme mappe.
- Brug `TestBed` + fakes for adapters. HTTP mockes via `provideHttpClientTesting`.
