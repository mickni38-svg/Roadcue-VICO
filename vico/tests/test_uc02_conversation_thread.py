"""UC-02 tests: samtalehistorik pr. thread_id via LangGraph checkpointer."""
import importlib
import uuid
from unittest.mock import AsyncMock, patch

import pytest
from langchain_core.messages import AIMessage, HumanMessage


@pytest.fixture
def mocked_agent():
    with patch("langchain_openai.ChatOpenAI") as chat_openai_cls:
        mock_model = AsyncMock()
        mock_model.ainvoke = AsyncMock(
            return_value=AIMessage(content="Mocket svar.", tool_calls=[])
        )
        mock_model.bind_tools = lambda _tools: mock_model
        chat_openai_cls.return_value = mock_model

        from app.graphs import vico_agent as vico_agent_module
        importlib.reload(vico_agent_module)
        yield vico_agent_module.vico_agent


def _human_contents(messages):
    return [m.content for m in messages if isinstance(m, HumanMessage)]


@pytest.mark.asyncio
async def test_samme_thread_deler_historik(mocked_agent):
    thread_id = str(uuid.uuid4())
    config = {
        "configurable": {"thread_id": thread_id},
        "recursion_limit": 10,
    }

    await mocked_agent.ainvoke(
        {"messages": [HumanMessage(content="Husk tallet 42.")]},
        config=config,
    )
    second = await mocked_agent.ainvoke(
        {"messages": [HumanMessage(content="Hvilket tal bad jeg dig huske?")]},
        config=config,
    )

    human_contents = _human_contents(second["messages"])
    assert "Husk tallet 42." in human_contents
    assert "Hvilket tal bad jeg dig huske?" in human_contents


@pytest.mark.asyncio
async def test_forskellige_threads_deler_ikke_historik(mocked_agent):
    thread_a = str(uuid.uuid4())
    thread_b = str(uuid.uuid4())

    await mocked_agent.ainvoke(
        {"messages": [HumanMessage(content="Hemmelig besked i tr\u00e5d A.")]},
        config={"configurable": {"thread_id": thread_a}, "recursion_limit": 10},
    )
    result_b = await mocked_agent.ainvoke(
        {"messages": [HumanMessage(content="Kun besked i tr\u00e5d B.")]},
        config={"configurable": {"thread_id": thread_b}, "recursion_limit": 10},
    )

    human_contents = _human_contents(result_b["messages"])
    assert "Kun besked i tr\u00e5d B." in human_contents
    assert "Hemmelig besked i tr\u00e5d A." not in human_contents
