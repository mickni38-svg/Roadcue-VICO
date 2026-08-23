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

    # Valgfrit trådnavn så klienten kan fortsætte en tidligere samtale.
    # Er den None, genereres et nyt UUID i /agent/chat og returneres i svaret.
    thread_id: str | None = Field(
        default=None,
        examples=["c1f0a2b4-8e5d-4a2f-9b1c-1234567890ab"],
    )