# LangChain: meddelelses-typer til chat-historik og systeminstruktioner
from langchain_core.messages import SystemMessage
# LangChain-integration til OpenAI's chat-modeller (GPT-4 osv.)
from langchain_openai import ChatOpenAI
# LangGraph: bygger den tilstandsbaserede agent-graf
# END/START = start- og slutpunkter i grafen
# MessagesState = indbygget tilstandstype der holder chat-historikken som en liste
# StateGraph = selve graf-bygger-klassen
from langgraph.graph import END, START, MessagesState, StateGraph
# ToolNode = en færdiglavet node der eksekverer tools
# tools_condition = en færdiglavet betingelse der afgør om agenten skal kalde et tool
from langgraph.prebuilt import ToolNode, tools_condition
# MemorySaver = in-memory checkpointer der gemmer samtalens state pr. thread_id.
# Kræves for at LangGraph kan genbruge historik mellem requests i samme tråd.
from langgraph.checkpoint.memory import MemorySaver

# App-konfiguration: henter model-navn og API-nøgle fra .env
from app.config import settings
# Den overordnede VICO-prompt: definerer agentens identitet og generelle adfærd
from app.core.prompts.vico_system_prompt import VICO_SYSTEM_PROMPT
# Domæne-specifikke instruktioner for Friends-funktionaliteten
from app.domains.friends.instructions import FRIENDS_INSTRUCTIONS
from app.domains.destinations.instructions import DESTINATION_INSTRUCTIONS
from app.tools.get_driver_friends import get_driver_friends
from app.tools.get_drivers import get_drivers
from app.tools.set_active_destination import set_active_destination


tools = [
    get_drivers,
    get_driver_friends,
    set_active_destination,
]


# Initialisér OpenAI-modellen med indstillinger fra .env.
# temperature=0 giver deterministiske svar – ingen kreativ variation.
model = ChatOpenAI(
    model=settings.openai_model,
    api_key=settings.openai_api_key,
    temperature=0,
)

# Bind tools til modellen, så den ved hvilke funktioner den må kalde.
# Svarende til at registrere function-signaturer i OpenAI's function-calling API.
model_with_tools = model.bind_tools(tools)


# Sammensæt den endelige systemprompt af to dele adskilt af dobbelt linjeskift:
# 1. VICO_SYSTEM_PROMPT – generel identitet og adfærd
# 2. FRIENDS_INSTRUCTIONS – domæne-regler for Friends-opslag
# Denne opdeling gør det nemt at tilføje flere domæner senere.
SYSTEM_PROMPT = "\n\n".join(
    [
        VICO_SYSTEM_PROMPT,
        FRIENDS_INSTRUCTIONS,
        DESTINATION_INSTRUCTIONS,
    ]
)


# "assistant"-noden i grafen.
# Kaldes hver gang agenten skal generere et svar.
# async/await bruges fordi LangChain's ainvoke er ikke-blokerende (asynkron).
async def call_model(state: MessagesState):
    # Kald modellen med systemprompt + hele chat-historikken.
    # *state["messages"] er Python-syntaks for at udpakke en liste inline
    # – svarende til spread-operatoren (...) i C# eller JavaScript.
    response = await model_with_tools.ainvoke(
        [
            SystemMessage(content=SYSTEM_PROMPT),
            *state["messages"],
        ]
    )

    # Returnér modellens svar som en ny besked i historikken.
    # LangGraph tilføjer den automatisk til state["messages"].
    return {
        "messages": [response]
    }


# Byg agent-grafen. MessagesState er tilstandstypen der flyder igennem grafen.
builder = StateGraph(MessagesState)

# Tilføj de to noder:
# "assistant" – kalder LLM-modellen
# "tools"     – eksekverer det tool som modellen valgte at kalde
builder.add_node("assistant", call_model)
builder.add_node("tools", ToolNode(tools))

# Grafen starter altid i "assistant"-noden.
builder.add_edge(START, "assistant")

# Efter "assistant" afgør tools_condition hvad der sker:
# – Hvis modellen valgte et tool-kald  → gå til "tools"-noden
# – Hvis modellen svarede direkte       → afslut grafen (END)
builder.add_conditional_edges(
    "assistant",
    tools_condition,
    {
        "tools": "tools",
        END: END,
    },
)

# Efter et tool er kørt, sendes resultatet tilbage til "assistant",
# så modellen kan formulere det endelige svar til brugeren.
builder.add_edge("tools", "assistant")

# Kompilér grafen til en færdig agent der kan kaldes med .ainvoke().
# checkpointer=MemorySaver() giver pr. thread_id-persistens af MessagesState
# på tværs af requests (in-memory; nulstilles ved process-restart).
vico_agent = builder.compile(checkpointer=MemorySaver())
