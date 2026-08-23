# Pydantic er Pythons svar på DataAnnotations + model binding i .NET.
# BaseModel giver automatisk JSON-parsing, validering og serialisering.
from pydantic import BaseModel, Field


# Request-modellen for POST /agent/chat.
# FastAPI bruger denne klasse til automatisk at validere og parse request-body.
class ChatRequest(BaseModel):
    # Field tilføjer valideringsregler og metadata til feltet.
    # min_length=1 afviser tomme beskeder med HTTP 422 Unprocessable Entity.
    # examples vises i den auto-genererede Swagger/OpenAPI-dokumentation.
    message: str = Field(
        min_length=1,
        examples=[
            "Jeg hedder Michael. Hvem er mine venner?"
        ],
    )