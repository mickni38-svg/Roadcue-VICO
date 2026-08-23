"""Tests for UC-01 - naturlig AI-samtale."""

import importlib
from unittest.mock import AsyncMock, patch

import pytest
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage


def _build_mocked_agent(fake_response):
    patcher = patch("app.graphs.vico_agent.ChatOpenAI")
    chat_openai_cls = patcher.start()

    mock_model = AsyncMock()
    mock_model.ainvoke = AsyncMock(return_value=fake_response)
    mock_model.bind_tools = lambda _tools: mock_model
    chat_openai_cls.return_value = mock_model

    from app.graphs import vico_agent as vico_agent_module
    importlib.reload(vico_agent_module)
    return vico_agent_module.vico_agent, patcher


@pytest.fixture
def agent_with_direct_answer():
    fake = AIMessage(content="Kort dansk svar.", tool_calls=[])
    agent, patcher = _build_mocked_agent(fake)
    yield agent
    patcher.stop()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "user_message",
    [
        "Hvad betyder Umleitung?",
        "Fortael en vittighed.",
        "Oversaet god morgen til tysk.",
        "Quiz mig i tysk.",
        "Fortael mig noget interessant.",
    ],
)
async def test_generelt_spoergsmaal_besvares_uden_tool_kald(
    agent_with_direct_answer, user_message
):
    result = await agent_with_direct_answer.ainvoke(
        {"messages": [HumanMessage(content=user_message)]},
        config={
            "configurable": {"thread_id": "test-uc01-generic"},
            "recursion_limit": 10,
        },
    )
    messages = result["messages"]
    final_message = messages[-1]
    assert isinstance(final_message, AIMessage)
    assert final_message.content
    assert not any(isinstance(m, ToolMessage) for m in messages)
    assert not getattr(final_message, "tool_calls", None)


@pytest.mark.asyncio
async def test_afviser_ikke_almindeligt_ai_spoergsmaal():
    fake = AIMessage(content="Berlin er Tysklands hovedstad.", tool_calls=[])
    agent, patcher = _build_mocked_agent(fake)
    try:
        result = await agent.ainvoke(
            {"messages": [HumanMessage(content="Fortael om Berlin.")]},
            config={
                "configurable": {"thread_id": "test-uc01-berlin"},
                "recursion_limit": 10,
            },
        )
    finally:
        patcher.stop()

    final = result["messages"][-1]
    assert isinstance(final, AIMessage)
    content_lower = final.content.lower()
    forbudte = [
        "kan ikke besvare",
        "har ikke adgang",
        "har ikke et tool",
        "mangler et tool",
        "ikke muligt at svare",
    ]
    for fragment in forbudte:
        assert fragment not in content_lower


@pytest.mark.asyncio
async def test_personlige_data_besvares_ikke_som_modelviden():
    # UC-01 kriterium #5: personlige/aktuelle data maa ikke besvares som
    # fri modelviden. Godkendt adfaerd er enten et tool_call ELLER et
    # afklarende spoergsmaal - ikke en opdigtet position.
    #
    # Denne test rammer den rigtige LLM (mocken virker ikke efter importlib.reload).
    # Skipper hvis der ikke er en OPENAI_API_KEY, saa CI uden noegle ikke fejler.
    import os
    if not os.getenv("OPENAI_API_KEY"):
        pytest.skip("Kraever OPENAI_API_KEY for at teste rigtig agent-routing.")

    from app.graphs.vico_agent import vico_agent

    result = await vico_agent.ainvoke(
        {"messages": [HumanMessage(content="Hvor er Peter lige nu?")]},
        config={
            "configurable": {"thread_id": "test-uc01-peter"},
            "recursion_limit": 5,
        },
    )

    messages = result["messages"]
    final = messages[-1]
    assert isinstance(final, AIMessage)

    forsoegt_tool_kald = any(
        (isinstance(m, AIMessage) and getattr(m, "tool_calls", None))
        or isinstance(m, ToolMessage)
        for m in messages
    )
    beder_om_afklaring = "?" in final.content

    assert forsoegt_tool_kald or beder_om_afklaring, (
        "UC-01 kriterium #5: agenten skal enten kalde et tool eller bede om "
        f"afklaring - maa ikke opdigte et svar. Faktisk svar: {final.content!r}"
    )
