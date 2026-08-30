from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.checkpoint.memory import MemorySaver
from app.config import settings
from app.core.prompts.vico_system_prompt import VICO_SYSTEM_PROMPT
from app.domains.friends.instructions import FRIENDS_INSTRUCTIONS
from app.domains.destinations.instructions import DESTINATION_INSTRUCTIONS
from app.tools.get_driver_friends import get_driver_friends
from app.tools.get_drivers import get_drivers
from app.tools.set_active_destination import set_active_destination
from app.tools.get_active_trip import get_active_trip

tools = [get_drivers, get_driver_friends, set_active_destination, get_active_trip]

model = ChatOpenAI(model=settings.openai_model, api_key=settings.openai_api_key, temperature=0)
model_with_tools = model.bind_tools(tools)
SYSTEM_PROMPT = "\n\n".join([VICO_SYSTEM_PROMPT, FRIENDS_INSTRUCTIONS, DESTINATION_INSTRUCTIONS])

async def call_model(state: MessagesState):
    response = await model_with_tools.ainvoke([SystemMessage(content=SYSTEM_PROMPT), *state["messages"]])
    return {"messages": [response]}

builder = StateGraph(MessagesState)
builder.add_node("assistant", call_model)
builder.add_node("tools", ToolNode(tools))
builder.add_edge(START, "assistant")
builder.add_conditional_edges("assistant", tools_condition, {"tools": "tools", END: END})
builder.add_edge("tools", "assistant")
vico_agent = builder.compile(checkpointer=MemorySaver())
