"""UC-03 tests: automatisk valg af datakilder og tools.

Tests bruger mock af ChatOpenAI så vi kan verificere agent-routing
uden reelle LLM-kald. Real HTTP undgås ved at monkeypatche
RoadcueApiClient-metoderne.
"""
import importlib
from unittest.mock import AsyncMock, patch

import httpx
import pytest
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage


def _reload_agent_with_mocked_model(responses):
    """Patch ChatOpenAI så model.ainvoke returnerer ``responses`` i rækkefølge.

    Returnerer (agent, patcher). Kalderen skal stoppe patcheren i finally.
    """
    patcher = patch("app.graphs.vico_agent.ChatOpenAI")
    chat_openai_cls = patcher.start()

    mock_model = AsyncMock()
    mock_model.ainvoke = AsyncMock(side_effect=list(responses))
    mock_model.bind_tools = lambda _tools: mock_model
    chat_openai_cls.return_value = mock_model

    from app.graphs import vico_agent as vico_agent_module
    importlib.reload(vico_agent_module)
    return vico_agent_module.vico_agent, patcher


def _tool_call(name: str, args: dict, call_id: str) -> dict:
    return {"name": name, "args": args, "id": call_id, "type": "tool_call"}


@pytest.mark.asyncio
async def test_generelt_spoergsmaal_bruger_ikke_tools():
    """Tidsstabilt generelt spørgsmål må ikke udløse tool-kald."""
    fake = AIMessage(content="En time har 60 minutter.", tool_calls=[])
    agent, patcher = _reload_agent_with_mocked_model([fake])
    try:
        result = await agent.ainvoke(
            {"messages": [HumanMessage(
                content="Hvor mange minutter er der i en time?"
            )]},
            config={
                "configurable": {"thread_id": "test-uc03-generel"},
                "recursion_limit": 10,
            },
        )
    finally:
        patcher.stop()

    messages = result["messages"]
    assert not any(isinstance(m, ToolMessage) for m in messages)
    for m in messages:
        if isinstance(m, AIMessage):
            assert not getattr(m, "tool_calls", None)


@pytest.mark.asyncio
async def test_personligt_roadcue_spoergsmaal_bruger_chained_tools(monkeypatch):
    """Personligt spørgsmål skal kæde get_drivers → get_driver_friends."""
    # Fake Roadcue-API så tools returnerer deterministiske data.
    from app.clients.roadcue_api_client import RoadcueApiClient

    async def fake_get_drivers(self):
        return [{"id": "d-1", "name": "Peter"}]

    async def fake_get_driver_friends(self, driver_id):
        assert driver_id == "d-1"
        return [{"id": "f-1", "name": "Mette"}]

    monkeypatch.setattr(RoadcueApiClient, "get_drivers", fake_get_drivers)
    monkeypatch.setattr(
        RoadcueApiClient, "get_driver_friends", fake_get_driver_friends
    )

    responses = [
        AIMessage(
            content="",
            tool_calls=[_tool_call("get_drivers", {}, "call-1")],
        ),
        AIMessage(
            content="",
            tool_calls=[
                _tool_call(
                    "get_driver_friends", {"driver_id": "d-1"}, "call-2"
                )
            ],
        ),
        AIMessage(
            content="Ifølge Roadcue er din ven Mette tilgængelig.",
            tool_calls=[],
        ),
    ]
    agent, patcher = _reload_agent_with_mocked_model(responses)
    try:
        result = await agent.ainvoke(
            {"messages": [HumanMessage(
                content="Hvem er mine venner? Jeg hedder Peter."
            )]},
            config={
                "configurable": {"thread_id": "test-uc03-chained"},
                "recursion_limit": 10,
            },
        )
    finally:
        patcher.stop()

    tool_messages = [
        m for m in result["messages"] if isinstance(m, ToolMessage)
    ]
    tool_names = [m.name for m in tool_messages]
    assert "get_drivers" in tool_names
    assert "get_driver_friends" in tool_names
    # Chaining: get_drivers før get_driver_friends
    assert tool_names.index("get_drivers") < tool_names.index(
        "get_driver_friends"
    )

    final = result["messages"][-1]
    assert isinstance(final, AIMessage)
    assert "roadcue" in final.content.lower()


@pytest.mark.asyncio
async def test_toolfejl_returnerer_struktureret_fejl_uden_opdigtning(
    monkeypatch,
):
    """httpx-fejl i tool skal blive til {"error", "detail"} – ikke exception."""
    from app.clients.roadcue_api_client import RoadcueApiClient
    from app.tools.get_drivers import get_drivers

    async def kaster_netvaerksfejl(self):
        raise httpx.ConnectError("simuleret netværksfejl")

    monkeypatch.setattr(RoadcueApiClient, "get_drivers", kaster_netvaerksfejl)

    resultat = await get_drivers.ainvoke({})

    assert isinstance(resultat, dict)
    assert resultat.get("error") == "drivers_utilgaengelige"
    assert "detail" in resultat
    # Må ikke indeholde opdigtede chauffør-navne
    assert "name" not in resultat


@pytest.mark.asyncio
async def test_manglende_input_giver_afklaringsspoergsmaal():
    """Uden navn skal agenten spørge – ikke gætte et driverId."""
    fake = AIMessage(
        content="Hvad hedder du? Så kan jeg slå dine venner op.",
        tool_calls=[],
    )
    agent, patcher = _reload_agent_with_mocked_model([fake])
    try:
        result = await agent.ainvoke(
            {"messages": [HumanMessage(content="Hvem er mine venner?")]},
            config={
                "configurable": {"thread_id": "test-uc03-afklaring"},
                "recursion_limit": 10,
            },
        )
    finally:
        patcher.stop()

    messages = result["messages"]
    assert not any(isinstance(m, ToolMessage) for m in messages)
    final = messages[-1]
    assert isinstance(final, AIMessage)
    assert not getattr(final, "tool_calls", None)
    assert "?" in final.content
