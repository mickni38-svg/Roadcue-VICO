"""UC-04 tests: håndtering af manglende eller usikker viden.

Tests bruger to strategier:
1. Prompt-indhold verificeres direkte på VICO_SYSTEM_PROMPT-konstanten.
2. Agent-adfærd verificeres ved at patche ChatOpenAI ved kilden
   (``langchain_openai.ChatOpenAI``) FØR ``importlib.reload`` køres,
   så modulet plukker mock'en op via ``from langchain_openai import ...``.
"""
import importlib
from unittest.mock import AsyncMock, patch

import pytest
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage


def _reload_agent_with_mocked_model(responses):
    """Patch ChatOpenAI ved kilden så reload plukker mocken op."""
    patcher = patch("langchain_openai.ChatOpenAI")
    mock_cls = patcher.start()

    mock_model = AsyncMock()
    mock_model.ainvoke = AsyncMock(side_effect=list(responses))
    mock_model.bind_tools = lambda _tools: mock_model
    mock_cls.return_value = mock_model

    from app.graphs import vico_agent as vico_agent_module
    importlib.reload(vico_agent_module)
    return vico_agent_module.vico_agent, mock_model, patcher


def test_prompt_indeholder_sikkerhedstaksonomi_og_bevaringsregel():
    """Systemprompten skal introducere taksonomi og bevaringsregel."""
    from app.core.prompts.vico_system_prompt import VICO_SYSTEM_PROMPT

    for keyword in ["bekræftet", "sandsynlig", "ubekræftet", "ukendt"]:
        assert keyword in VICO_SYSTEM_PROMPT, (
            f"Mangler taksonomi-nøgleord i systemprompt: {keyword}"
        )
    assert "bevare" in VICO_SYSTEM_PROMPT.lower(), (
        "Systemprompten mangler regel om at bevare sikkerhedsniveau"
    )
    assert "community" not in VICO_SYSTEM_PROMPT.lower(), (
        "Community må ikke nævnes før UC-16 er leveret"
    )


@pytest.mark.asyncio
async def test_svar_med_ubekraeftet_status_bevares_uaendret():
    """Et forceret "ubekræftet"-svar skal nå brugeren uændret gennem grafen."""
    fake = AIMessage(
        content=(
            "Det er ubekræftet, men jeg tror parkeringen ved havnen "
            "har ledige pladser."
        ),
        tool_calls=[],
    )
    agent, _mock, patcher = _reload_agent_with_mocked_model([fake])
    try:
        result = await agent.ainvoke(
            {"messages": [HumanMessage(content="Er der parkering ved havnen?")]},
            config={
                "configurable": {"thread_id": "test-uc04-ubekraeftet"},
                "recursion_limit": 10,
            },
        )
    finally:
        patcher.stop()

    final = result["messages"][-1]
    assert isinstance(final, AIMessage)
    assert "ubekræftet" in final.content.lower()


@pytest.mark.asyncio
async def test_tilbyder_praecisering_uden_at_kalde_tools():
    """Ved usikker viden tilbydes præcisering – uden tool-kald."""
    fake = AIMessage(
        content=(
            "Jeg har ikke tilstrækkelige oplysninger til at svare sikkert. "
            "Vil du præcisere, hvilken by du mener?"
        ),
        tool_calls=[],
    )
    agent, _mock, patcher = _reload_agent_with_mocked_model([fake])
    try:
        result = await agent.ainvoke(
            {"messages": [HumanMessage(content="Hvordan er vejret?")]},
            config={
                "configurable": {"thread_id": "test-uc04-praecisering"},
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
    final = messages[-1]
    assert isinstance(final, AIMessage)
    assert "?" in final.content


@pytest.mark.asyncio
async def test_afvisning_afslutter_uden_sideeffekt():
    """"Nej tak" må ikke udløse et tool-kald eller anden vedvarende handling."""
    tilbud = AIMessage(
        content="Jeg kan ikke svare sikkert. Vil du præcisere spørgsmålet?",
        tool_calls=[],
    )
    afslutning = AIMessage(
        content="Helt i orden. Sig til, hvis du får brug for noget andet.",
        tool_calls=[],
    )
    agent, _mock, patcher = _reload_agent_with_mocked_model(
        [tilbud, afslutning]
    )
    try:
        config = {
            "configurable": {"thread_id": "test-uc04-afvisning"},
            "recursion_limit": 10,
        }
        await agent.ainvoke(
            {"messages": [HumanMessage(content="Hvor er nærmeste ladestander?")]},
            config=config,
        )
        result = await agent.ainvoke(
            {"messages": [HumanMessage(content="Nej tak.")]},
            config=config,
        )
    finally:
        patcher.stop()

    messages = result["messages"]
    assert not any(isinstance(m, ToolMessage) for m in messages)
    for m in messages:
        if isinstance(m, AIMessage):
            assert not getattr(m, "tool_calls", None)
    final = messages[-1]
    assert isinstance(final, AIMessage)
    assert final.content
