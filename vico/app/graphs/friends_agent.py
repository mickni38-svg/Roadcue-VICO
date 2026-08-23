from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition

from app.config import settings
from app.tools.get_driver_friends import get_driver_friends
from app.tools.get_drivers import get_drivers


tools = [
    get_drivers,
    get_driver_friends,
]


model = ChatOpenAI(
    model=settings.openai_model,
    api_key=settings.openai_api_key,
    temperature=0,
)

model_with_tools = model.bind_tools(tools)


SYSTEM_PROMPT = """
Du er VICO, Roadcues danske stemmeassistent.

Du hjælper chauffører med at finde deres venner.

Regler:
1. Svar altid på dansk.
2. Hvis brugeren oplyser sit navn, men ikke sit driverId,
   skal du først bruge get_drivers.
3. Find den chauffør, hvis navn matcher brugerens navn.
4. Brug derefter chaufførens id som driver_id i
   get_driver_friends.
5. Du må aldrig opfinde et driverId eller en ven.
6. Hvis ingen chauffør matcher navnet, skal du fortælle det.
7. Hvis flere chauffører har samme navn, skal du bede
   brugeren om flere oplysninger.
8. Svar kort og naturligt, så svaret senere kan læses højt.
"""


async def call_model(state: MessagesState):
    response = await model_with_tools.ainvoke(
        [
            SystemMessage(content=SYSTEM_PROMPT),
            *state["messages"],
        ]
    )

    return {
        "messages": [response]
    }


builder = StateGraph(MessagesState)

builder.add_node("assistant", call_model)
builder.add_node("tools", ToolNode(tools))

builder.add_edge(START, "assistant")

builder.add_conditional_edges(
    "assistant",
    tools_condition,
    {
        "tools": "tools",
        END: END,
    },
)

builder.add_edge("tools", "assistant")

friends_agent = builder.compile()