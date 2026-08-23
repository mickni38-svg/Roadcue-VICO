"""UC-02 tests: samtalehistorik pr. thread_id via LangGraph checkpointer."""
import uuid

import pytest
from langchain_core.messages import HumanMessage

from app.graphs.vico_agent import vico_agent


def _human_contents(messages):
    return [m.content for m in messages if isinstance(m, HumanMessage)]


@pytest.mark.asyncio
async def test_samme_thread_deler_historik():
    thread_id = str(uuid.uuid4())
    config = {
        "configurable": {"thread_id": thread_id},
        "recursion_limit": 10,
    }

    await vico_agent.ainvoke(
        {"messages": [HumanMessage(content="Husk tallet 42.")]},
        config=config,
    )
    second = await vico_agent.ainvoke(
        {"messages": [HumanMessage(content="Hvilket tal bad jeg dig huske?")]},
        config=config,
    )

    human_contents = _human_contents(second["messages"])
    assert "Husk tallet 42." in human_contents
    assert "Hvilket tal bad jeg dig huske?" in human_contents


@pytest.mark.asyncio
async def test_forskellige_threads_deler_ikke_historik():
    thread_a = str(uuid.uuid4())
    thread_b = str(uuid.uuid4())

    await vico_agent.ainvoke(
        {"messages": [HumanMessage(content="Hemmelig besked i tr\u00e5d A.")]},
        config={"configurable": {"thread_id": thread_a}, "recursion_limit": 10},
    )
    result_b = await vico_agent.ainvoke(
        {"messages": [HumanMessage(content="Kun besked i tr\u00e5d B.")]},
        config={"configurable": {"thread_id": thread_b}, "recursion_limit": 10},
    )

    human_contents = _human_contents(result_b["messages"])
    assert "Kun besked i tr\u00e5d B." in human_contents
    assert "Hemmelig besked i tr\u00e5d A." not in human_contents
