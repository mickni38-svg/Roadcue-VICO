# Roadcue – Løsningsdokumentation

> Målgruppe: en ny udvikler der aldrig har set Roadcue før.
> Læs denne fil først; den giver dig det store overblik og peger
> videre til de detaljerede specifikationer under [`.ai/`](../.ai/).

---

## Problemformulering

Roadcue er en app for **chauffører**, der vil holde styr på deres
egne oplysninger, deres **venner** (andre chauffører) og relevante
**lokationer** (fx mødesteder og stop). Brugeren sidder typisk bag
rattet og skal kunne få hjælp uden at røre telefonen.

Vi står derfor over for tre konkrete problemer:

1. **Data og forretningsregler er kritiske og skal kunne stole på.**
   Chauffører, venskaber og lokationer skal håndhæves ét sted med
   korrekt autorisation og præcise queries.
2. **Chauffører kan ikke tappe og swipe under kørsel.** De skal kunne
   få oplæst svar og stille spørgsmål med stemmen alene.
3. **Naturlig samtale kræver AI, men AI må aldrig hitte-på data.**
   VICO bruger en LLM (stor sprogmodel) som samtaleflade, men den
   må aldrig opfinde chauffører, venner eller lokationer – kun
   hente dem via godkendte C#-endpoints.

Løsningen er en tre-lags arkitektur, hvor **C# ejer sandheden**
(chauffører, venskaber, lokationer), **Python/VICO er samtalen**, og
**Angular er brugerens ansigt** mod begge dele.

---

## Arkitektur

### Overordnet diagram

```
 ┌────────────────────────┐   HTTPS   ┌──────────────────────┐
 │  Roadcue.Web (Angular) │──────────►│  Roadcue.Api (.NET)  │
 │  - UI                  │           │  - Controllers       │
 │  - VoiceComponent      │           │  - EF Core / SQL     │
 │  - AgentChatService    │           │  - Autorisation      │
 └───────────┬────────────┘           └──────────┬───────────┘
			 │ HTTPS                             ▲
			 │ (POST /agent/chat)                │ HTTPS
			 ▼                                   │  (kun tools)
 ┌────────────────────────┐                      │
 │  VICO (Python/FastAPI) │──────────────────────┘
 │  - LangGraph-agent     │
 │  - LLM (OpenAI)        │
 │  - Tools               │
 └────────────────────────┘
```

### Ansvarsfordeling (skarpe grænser)

| Lag | Ejer | Må IKKE |
|---|---|---|
| **Roadcue.Api** (C#) | SQL, EF Core, autorisation, forretningsregler, geoqueries og præcise beregninger på chauffører/venskaber/lokationer. | Kalde LLM'er direkte i request/response-flowet. |
| **VICO** (Python) | Samtaleflow, valg af tools, formulering af naturligt svar. | Tilgå SQL direkte, opfinde aktuelle Roadcue-data, gemme domænedata. |
| **Roadcue.Web** (Angular) | UI, stemmestyring, kald til API/VICO. | Indeholde forretningsregler eller duplikere agentlogik. |

Denne opdeling er ufravigelig – se `.github/copilot-instructions.md` og
`.ai/01-CONTRACT.md`.

### Løsningsstruktur i repo'et

```
Roadcue/
├─ Roadcue.slnx                     # Visual Studio solution
├─ src/
│  ├─ Roadcue.Api/                  # ASP.NET Core Web API (entry point)
│  ├─ Roadcue.Application/          # Use-cases, services, DTO'er
│  ├─ Roadcue.Domain/               # Entiteter, forretningsregler
│  ├─ Roadcue.Infrastructure/       # EF Core, DbContext, seed, integrationer
│  └─ Roadcue.Web/                  # Angular 20 frontend
├─ vico/
│  └─ app/                          # FastAPI + LangGraph-agent (Python)
│     ├─ main.py                    # HTTP-endpoints
│     ├─ graphs/vico_agent.py       # Agent-graf
│     ├─ tools/                     # Tools der kalder Roadcue.Api
│     └─ core/prompts/              # System-prompts
├─ .ai/                             # Autoritativ udviklingskontekst
│  ├─ 00-ROUTER.md                  # Hvilke .ai-filer skal læses hvornår
│  ├─ 01-CONTRACT.md                # Kontrakten mellem C#, Python og UI
│  ├─ features/                     # Godkendte use cases
│  └─ tasks/                        # Aktuelle implementeringstasks
├─ docs/                            # Denne dokumentation
└─ .github/workflows/               # CI/CD
```

### Backend (C#) – lagdeling

Roadcue følger en klassisk Clean Architecture-inspireret struktur:

- **Roadcue.Domain** – rene entiteter (`Driver`, `DriverLocation`,
  `Friendship`, `Place`) og domæneregler. Ingen afhængigheder til andet.
- **Roadcue.Application** – use-cases og services. Bruger domænet og
  definerer interfaces til infrastruktur.
- **Roadcue.Infrastructure** – EF Core `RoadcueDbContext`, seed-data
  og eksterne integrationer.
- **Roadcue.Api** – tynd værtsproces. Registrerer services,
  konfigurerer OpenAPI (Scalar), health-endpoint og controllere
  (fx `DriversController` med `/api/drivers` og
  `/api/drivers/{id}/friends`).

> Navnekonventioner følger den eksisterende kode: **Driver**,
> **Friendship**, **DriverLocation**, **Place**. Brug altid disse
> navne – ikke dokumentationsnavne fra ældre skitser.

### Frontend (Angular) – VoiceComponent

`src/Roadcue.Web/src/app/features/voice/` indeholder stemmedelen:

```
voice/
├─ voice.component.ts          # State-maskine + samtaleflow
├─ voice.component.html/scss
├─ voice-state.ts              # Konstanter (wake, end, timeouts)
├─ speech-recognition.adapter.ts   # Wrapper om Web Speech API (STT)
├─ speech-synthesis.adapter.ts     # Wrapper om Web Speech API (TTS)
├─ agent-chat.service.ts       # POST /agent/chat → VICO
└─ *.spec.ts                   # Karma/Jasmine tests med fakes
```

State-maskinen (én værdi ad gangen i et Angular `signal`):

| State | Betydning |
|---|---|
| `idle` | Netop startet – vent på første tap (kræves for iOS audio-unlock). |
| `waiting-wake` | Lytter, men gør intet før wake-ord (`VICO`, `VIGGO`, `VIGO`). |
| `listening` | "Varm" – enten lige efter wake eller mellem to ture i en aktiv samtale. |
| `processing` | Besked sendt til VICO, venter på svar. |
| `speaking` | Læser svaret op via TTS. |
| `error` | Mikrofonfejl eller lignende. |

Samtaletilstand: efter et svar bliver komponenten i `listening` i
**2½ minut** (`CONVERSATION_IDLE_MS = 150_000`). I dette vindue skal
brugeren *ikke* sige "VICO" igen. Efter timeout falder vi tilbage
til `waiting-wake`. Slut hver tur med `SKIFTER` (eller
engelsk-udtalte varianter `SKEEFTER`, `SKEFTER`, `SKIFTA`, `SKIPTER`,
`SKIPPER`).

### VICO (Python) – LangGraph-agent

VICO er en FastAPI-app med én LangGraph-agent bygget som en graf:

```
   START ─► assistant ─► (tools_condition)
						  │       │
						  ▼       └──► END
						tools
						  │
						  └──► assistant (tool-svar formuleres)
```

- **`assistant`-noden** kalder LLM'en (OpenAI) med systemprompt +
  chat-historik.
- **`tools`-noden** eksekverer det tool, LLM'en valgte, mod
  Roadcue.Api.
- **`MemorySaver`** checkpointer bevarer samtalen pr. `thread_id`,
  så flere spørgsmål i træk deler kontekst.

Tools ligger under `vico/app/tools/` (fx `get_drivers`,
`get_driver_friends`) og er de **eneste** kanaler VICO må bruge til
Roadcue-data.

---

## Teknologi

| Lag | Teknologi | Version | Hvorfor |
|---|---|---|---|
| Backend | ASP.NET Core Web API | **.NET 10** | Moderne minimal API + performance. |
| Database | SQL Server via EF Core | – | Transaktioner, referentiel integritet. |
| API docs | OpenAPI + **Scalar** | – | Læsevenlig API-reference i dev. |
| Frontend | **Angular 20** (standalone components, signals) | – | Reaktivt UI uden ekstra state-lib. |
| STT/TTS | **Web Speech API** (`da-DK`) | Browser | Ingen cloud-STT nødvendig. |
| Agent | **FastAPI** + **LangGraph** + **LangChain** | Python 3.13 | Standard-stack for tool-using agents. |
| LLM | **OpenAI** (via `langchain_openai`) | `gpt-*` | Konfigureres i `.env`. |
| Tests | xUnit (C#), Jasmine/Karma (Angular), **pytest** (Python) | – | Ét framework pr. sprog. |
| Container | Docker | – | Ensartet deploy for VICO. |
| CI/CD | **GitHub Actions** | – | Push til `master` → Azure. |
| Cloud | **Azure Container Registry** + **Azure Container Apps** | – | Skalerbar hosting af VICO. |
| Identitet i CI | **Microsoft Entra ID** (OIDC federated credential) | – | Ingen langtidshemmeligheder i GitHub. |

Alle URL'er i koden **skal være HTTPS** – både frontend, landing pages
og config.

---

## Code snippets – vigtig funktionalitet

### 1. Roadcue.Api – opstart (`Program.cs`)

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<RoadcueDbContext>(options =>
	options.UseSqlServer(
		builder.Configuration.GetConnectionString("Roadcue")));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
	app.MapOpenApi();
	app.MapScalarApiReference();     // /scalar/v1
}
else
{
	app.UseHttpsRedirection();
}

app.MapControllers();
app.MapGet("/health", () => Results.Ok("healthy"));

// Seed køres ved opstart – idempotent.
using (var scope = app.Services.CreateScope())
{
	var db = scope.ServiceProvider.GetRequiredService<RoadcueDbContext>();
	await RoadcueSeed.SeedAsync(db);
}

app.Run();
```

### 2. VICO – `/agent/chat` (`vico/app/main.py`)

```python
@app.post("/agent/chat")
@app.post("/api/agent/chat")
async def ask_vico_agent(request: ChatRequest):
	# Genbrug klientens thread_id, ellers lav et nyt.
	thread_id = request.thread_id or str(uuid.uuid4())

	result = await vico_agent.ainvoke(
		{"messages": [HumanMessage(content=request.message)]},
		config={
			"configurable": {"thread_id": thread_id},
			"recursion_limit": 10,
		},
	)

	final_message = result["messages"][-1]
	if not isinstance(final_message, AIMessage):
		raise HTTPException(500, "Agenten afsluttede uden et AI-svar.")

	return {"answer": final_message.content, "thread_id": thread_id}
```

### 3. VICO – agent-grafen (`vico/app/graphs/vico_agent.py`)

```python
model_with_tools = ChatOpenAI(
	model=settings.openai_model,
	api_key=settings.openai_api_key,
	temperature=0,
).bind_tools([get_drivers, get_driver_friends])

async def call_model(state: MessagesState):
	response = await model_with_tools.ainvoke(
		[SystemMessage(content=SYSTEM_PROMPT), *state["messages"]]
	)
	return {"messages": [response]}

builder = StateGraph(MessagesState)
builder.add_node("assistant", call_model)
builder.add_node("tools", ToolNode([get_drivers, get_driver_friends]))
builder.add_edge(START, "assistant")
builder.add_conditional_edges("assistant", tools_condition,
							  {"tools": "tools", END: END})
builder.add_edge("tools", "assistant")

# checkpointer=MemorySaver() → historik pr. thread_id.
vico_agent = builder.compile(checkpointer=MemorySaver())
```

### 4. Angular – wake-ord, "Ja"-kvittering og slut-ord

```ts
// voice-state.ts
export const WAKE_WORDS = ['VICO', 'VIGGO', 'VIGO'] as const;
export const END_WORDS  = [
  'SKIFTER', 'SKEEFTER', 'SKEFTER', 'SKIFTA', 'SKIPTER', 'SKIPPER',
] as const;
export const CONVERSATION_IDLE_MS = 150_000; // 2½ minut
export const WAKE_ACK = 'Ja';
```

```ts
// voice.component.ts (uddrag)
private handleTranscript(transcript: string, isFinal: boolean): void {
  if (this.busy) return;

  if (isFinal) {
	this.finalizedText = (this.finalizedText + ' ' + transcript).trim();
	this.interimText = '';
  } else {
	this.interimText = transcript.trim();
  }

  const upper = (this.finalizedText + ' ' + this.interimText).trim().toUpperCase();
  const wake  = findFirstWordIndex(upper, WAKE_WORDS);

  if (!this.capturing) {
	if (wake === -1) return;             // Kræv wake-ord første gang.
	this.capturing = true;
	this.state.set('listening');
	this.acknowledgeWake();               // Sig "Ja" (fire-and-forget).
	this.clearConversationTimer();
  }

  const bodyUpper = upper.slice(wake !== -1 ? wake.after : 0);
  const end = findFirstWordIndex(bodyUpper, END_WORDS);
  if (end === -1) return;                 // Vent på SKIFTER.

  // ... udtræk besked, kald AgentChatService.sendMessage(...)
}
```

Efter et svar bliver komponenten "varm":

```ts
this.capturing = true;
this.state.set('listening');
this.armConversationTimer();   // 2½ min før wake-ord kræves igen
```

### 5. Frontend → VICO (`AgentChatService`)

```ts
sendMessage(message: string): Promise<AgentChatResponse> {
  return firstValueFrom(this.http.post<AgentChatResponse>(
	AGENT_CHAT_ENDPOINT,
	{ message, thread_id: this.threadId ?? null },
  )).then(res => { this.threadId = res.thread_id; return res; });
}
```

`thread_id` gemmes klient-side og sendes med hver besked, så VICO's
`MemorySaver` genkender samtalen.

---

## Vigtige opsætninger i Azure

VICO deployes til Azure via workflowet
[`.github/workflows/azure-vico.yml`](../.github/workflows/azure-vico.yml).

### Ressourcer

| Ressource | Rolle |
|---|---|
| **Azure Container Registry (ACR)** | Gemmer `roadcue-vico:<sha>`-images. |
| **Azure Container Apps** | Kører VICO-containeren med HTTPS-ingress. |
| **Azure Resource Group** | Samler ovenstående. |
| **Microsoft Entra App (OIDC)** | Federated credential til GitHub Actions – ingen client secret. |
| **Azure environment `azure-production`** | GitHub-environment der styrer godkendelser + variabler. |

### GitHub Actions – secrets og variables

| Type | Navn | Formål |
|---|---|---|
| Secret | `AZURE_CLIENT_ID` | App-registrationens client id (federated). |
| Secret | `AZURE_TENANT_ID` | Entra ID tenant. |
| Secret | `AZURE_SUBSCRIPTION_ID` | Målsubscription. |
| Variable | `AZURE_CONTAINER_REGISTRY_NAME` | ACR-navn (uden `.azurecr.io`). |
| Variable | `AZURE_RESOURCE_GROUP` | Ressourcegruppen med Container App. |
| Variable | `AZURE_VICO_APP_NAME` | Navn på Container App. |
| Variable | `ROADCUE_API_BASE_URL` | HTTPS-URL til Roadcue.Api som VICO's tools kalder. |

### Deploy-flow

1. Push til `master` som rører `vico/**` eller workflow-filen.
2. `build-test`-job: kører `pytest` og bygger + smoke-tester
   containeren med `curl /health`.
3. `deploy`-job (kun ved push, ikke PR):
   - `azure/login@v2` med OIDC.
   - `az acr login` + `docker build` + `docker push`.
   - `az containerapp update --image ... --set-env-vars
	 ROADCUE_API_BASE_URL=...` → rolling update.

### Krav til Container App'en

- **HTTPS ingress** aktiveret (regel: ingen HTTP-URL'er i koden).
- **CORS** tillader Roadcue-frontendens origin.
- **Managed identity** eller `AcrPull`-rolle til ACR.
- **Health probe** peger på `/health` – ellers rulles et defekt image ud.
- Miljøvariabler: mindst `OPENAI_API_KEY` (secret) og
  `ROADCUE_API_BASE_URL`.

### Roadcue.Api hosting (kort)

Roadcue.Api er endnu ikke i det viste workflow, men følger samme
mønster:

- Containeriseres via [`src/Roadcue.Api/Dockerfile`](../src/Roadcue.Api/Dockerfile).
- Bør deployes til **Azure App Service** eller **Azure Container
  Apps** med HTTPS-only.
- `ConnectionStrings:Roadcue` sættes som app setting og peger på
  **Azure SQL** (ikke lokal database).
- Aldrig `appsettings.json` → simulation. Live Saxo Bank endpoints
  altid.

---

## Sådan kører du løsningen lokalt

1. **Backend**
   ```powershell
   dotnet run --project src/Roadcue.Api
   # → https://localhost:xxxx, /scalar/v1 for API-doc
   ```
2. **VICO**
   ```powershell
   cd vico
   .\.venv\Scripts\Activate.ps1
   $env:OPENAI_API_KEY = "sk-..."
   $env:ROADCUE_API_BASE_URL = "https://localhost:xxxx"
   uvicorn app.main:app --reload
   ```
3. **Frontend**
   ```powershell
   cd src/Roadcue.Web
   npm install
   npm start
   ```
4. Åbn appen, tryk på VICO-knappen, sig **"VICO"** → hør **"Ja"** →
   sig fx **"vis mig chaufførerne skifter"**.

---

## Test-strategi (opsummering)

| Lag | Værktøj | Hvad testes |
|---|---|---|
| C# domain/application | xUnit | Forretningsregler, beregninger. |
| C# API | xUnit + `WebApplicationFactory` | Endpoints, autorisation. |
| Angular voice | Jasmine/Karma (fake STT/TTS-adaptere) | Wake-word-flow, samtaletilstand, SKIFTER-varianter. |
| VICO agent | pytest | Tool-routing, prompt-adfærd, thread-persistens. |
| CI | GitHub Actions | Kører alle ovenstående + Docker smoke-test af VICO. |

---

## Videre læsning i repo'et

- [`.ai/00-ROUTER.md`](../.ai/00-ROUTER.md) – hvornår du skal læse hvilken kontekstfil.
- [`.ai/01-CONTRACT.md`](../.ai/01-CONTRACT.md) – den bindende kontrakt mellem C#, Python og UI.
- [`.ai/features/voice/`](../.ai/features/voice/) – use cases for stemmestyring
  (UC-26 … UC-29).
- [`.github/copilot-instructions.md`](../.github/copilot-instructions.md) –
  Copilot-regler, navnekonventioner og obligatoriske praksisser.
