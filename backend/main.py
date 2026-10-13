import asyncio
import os
from decimal import Decimal, InvalidOperation
from typing import Any

import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import FastAPI, HTTPException
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="ShareWise API")

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

# Credentials come from the EC2 instance's IAM role (no keys in code).
TABLE_NAME = os.getenv("SEARCH_TABLE", "search_results_tbl")
AWS_REGION = os.getenv("AWS_REGION", "us-east-2")
_table = boto3.resource("dynamodb", region_name=AWS_REGION).Table(TABLE_NAME)


class StoredMessage(BaseModel):
    role: str  # "user" or "bot"
    text: str


class Article(BaseModel):
    id: str
    title: str
    article: str = ""
    chat: list[StoredMessage] = Field(default_factory=list)


class SearchResponse(BaseModel):
    results: list[Article]


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


def _to_article(item: dict[str, Any]) -> Article:
    search_id = item.get("search_id", "")
    if isinstance(search_id, Decimal) and search_id == search_id.to_integral_value():
        search_id = int(search_id)  # avoid "1.0"-style ids
    data = item.get("data") or {}
    # Stored chat entries look like {"user": "text"} or {"bot": "text"}.
    chat = [
        StoredMessage(role=role, text=str(text))
        for entry in item.get("chat") or []
        for role, text in entry.items()
        if role in ("user", "bot")
    ]
    return Article(
        id=str(search_id),
        title=str(data.get("title") or "Untitled"),
        article=str(data.get("article") or ""),
        chat=chat,
    )


def _fetch_all(method: Any, **kwargs: Any) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    while True:
        page = method(**kwargs)
        items.extend(page.get("Items", []))
        if "LastEvaluatedKey" not in page:
            return items
        kwargs["ExclusiveStartKey"] = page["LastEvaluatedKey"]


def _search_table(q: str) -> list[Article]:
    needle = q.strip()
    if needle:
        # q is treated as a search_id first (number partition key).
        try:
            search_id = Decimal(needle)
        except InvalidOperation:
            search_id = None
        if search_id is not None and search_id.is_finite():
            items = _fetch_all(_table.query, KeyConditionExpression=Key("search_id").eq(search_id))
            if items:
                return [_to_article(it) for it in items]

    articles = [_to_article(it) for it in _fetch_all(_table.scan)]
    if needle:
        lowered = needle.lower()
        articles = [
            a for a in articles if lowered in a.title.lower() or lowered in a.article.lower()
        ]
    return articles


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/search", response_model=SearchResponse)
async def search(q: str = "") -> SearchResponse:
    try:
        results = await run_in_threadpool(_search_table, q)
    except (ClientError, BotoCoreError) as e:
        raise HTTPException(status_code=502, detail=f"Database error: {e}") from e
    return SearchResponse(results=results)


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
