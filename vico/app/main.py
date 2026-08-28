# FastAPI er et asynkront Python web-framework – svarer til ASP.NET Core Minimal API.
# HTTPException bruges til at returnere fejl med HTTP-statuskoder.
import uuid

import httpx
from fastapi import FastAPI, HTTPException, Request, Response
# Meddelelses-typer: AIMessage = svar fra modellen, HumanMessage = brugerens input
from langchain_core.messages import AIMessage, HumanMessage

# Den kompilerede LangGraph-agent
from app.graphs.vico_agent import vico_agent
# Pydantic-model der validerer request-body på POST-endpoints
from app.models.chat_request import ChatRequest
from app.config import settings
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
@app.post("/api/agent/chat")
async def ask_vico_agent(request: ChatRequest):
    try:
        # Genbrug klientens thread_id hvis det er sat, ellers generér et nyt.
        # thread_id styrer hvilken samtalehistorik LangGraph-checkpointeren læser/skriver.
        thread_id = request.thread_id or str(uuid.uuid4())

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
                "configurable": {"thread_id": thread_id},
                "recursion_limit": 10,
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
            "answer": final_message.content,
            "thread_id": thread_id,
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


# TTS-proxy: Static Web Apps videresender /api/* til VICO. VICO ejer
# ikke Azure Speech-nøglen – kun Roadcue.Api gør. Denne route er en
# tynd forwarder der sender body videre til Roadcue.Api og returnerer
# MP3-lyden uændret. Samme sti virker lokalt (via ng proxy → VICO) og
# i prod (via SWA → VICO).
@app.post("/api/speech/tts")
@app.post("/speech/tts")
async def proxy_speech_tts(request: Request) -> Response:
    body = await request.body()
    target = f"{settings.roadcue_api_base_url.rstrip('/')}/api/speech/tts"
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            upstream = await client.post(
                target,
                content=body,
                headers={"Content-Type": request.headers.get(
                    "Content-Type", "application/json"
                )},
            )
    except httpx.HTTPError as error:
        raise HTTPException(
            status_code=502,
            detail=f"speech_upstream_unreachable: {type(error).__name__}",
        ) from error

    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        media_type=upstream.headers.get("Content-Type", "application/octet-stream"),
    )
