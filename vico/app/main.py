# FastAPI er et asynkront Python web-framework – svarer til ASP.NET Core Minimal API.
# HTTPException bruges til at returnere fejl med HTTP-statuskoder.
from fastapi import FastAPI, HTTPException
# Meddelelses-typer: AIMessage = svar fra modellen, HumanMessage = brugerens input
from langchain_core.messages import AIMessage, HumanMessage

# Den kompilerede LangGraph-agent
from app.graphs.vico_agent import vico_agent
# Pydantic-model der validerer request-body på POST-endpoints
from app.models.chat_request import ChatRequest
from fastapi import FastAPI

# Tools importeres direkte her for at kunne tilbyde test-endpoints
from app.tools.get_driver_friends import get_driver_friends
from app.tools.get_drivers import get_drivers


# FastAPI-appinstansen – svarer til WebApplication.CreateBuilder().Build() i .NET.
app = FastAPI(
    title="Roadcue VICO",
    version="0.1.0",
)


# Simpelt liveness-check endpoint – bruges typisk af load balancers og container-orkestratorer.
@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


# Udviklings-endpoint: kalder get_drivers-tool direkte uden om agenten.
# Nyttigt til at verificere at API-forbindelsen til Roadcue virker.
@app.get("/test-tools/drivers")
async def test_get_drivers():
    return await get_drivers.ainvoke({})


# Udviklings-endpoint: henter venner for en specifik chauffør direkte.
# {driver_id} i URL-stien mappes automatisk til funktionsparameteren.
@app.get("/test-tools/driver-friends/{driver_id}")
async def test_get_driver_friends(driver_id: str):
    return await get_driver_friends.ainvoke(
        {"driver_id": driver_id}
    )

# Hoved-endpoint: modtager en bruger-besked og returnerer agentens svar.
@app.post("/agent/chat")
async def ask_vico_agent(request: ChatRequest):
    try:
        # Kald agenten med brugerens besked pakket som en HumanMessage.
        # ainvoke er den asynkrone version af invoke – svarer til await i C#.
        # recursion_limit forhindrer uendelige tool-kald-løkker.
        result = await vico_agent.ainvoke(
            {
                "messages": [
                    HumanMessage(content=request.message)
                ]
            },
            config={
                "recursion_limit": 10
            },
        )

        # [-1] henter det sidste element i listen – agentens afsluttende svar.
        final_message = result["messages"][-1]

        # Sikkerhedstjek: det sidste svar skal altid være fra AI-modellen.
        # isinstance svarer til 'is'-operatoren / pattern matching i C#.
        if not isinstance(final_message, AIMessage):
            raise HTTPException(
                status_code=500,
                detail="Agenten afsluttede uden et AI-svar.",
            )

        return {
            "answer": final_message.content
        }

    except HTTPException:
        # HTTPException genudkastes uændret så statuskoden bevares.
        raise

    except Exception as error:
        # Alle andre fejl pakkes ind i en 500-fejl med fejltype og besked.
        # f-string med {type(error).__name__} giver fx "ValueError: ..."
        raise HTTPException(
            status_code=500,
            detail=f"{type(error).__name__}: {error}",
        ) from error