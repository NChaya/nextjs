import asyncio

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="ShareWise API")


class HistoryItem(BaseModel):
    role: str  # "user" or "assistant"
    text: str


class ChatRequest(BaseModel):
    message: str = ""
    files: list[str] = Field(default_factory=list)
    title: str = ""
    history: list[HistoryItem] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    # Dummy reply. Replace this with a real model call later.
    await asyncio.sleep(1)
    return ChatResponse(
        reply=(
            "Thank you for your input. The AI Judge has reviewed your argument "
            "and will weigh it against the evidence. This is a placeholder reply "
            "from the Python backend."
        )
    )
