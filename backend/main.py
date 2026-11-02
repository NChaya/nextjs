import asyncio
import base64
import binascii
import os
import re
import time
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

import boto3
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


MAX_FILES_BYTES = 250_000  # DynamoDB items are capped at 400 KB in total


class PublishFile(BaseModel):
    name: str = Field(max_length=255)
    content_type: str = Field(max_length=100)
    data: str  # base64, without the "data:...;base64," prefix


class PublishRequest(BaseModel):
    user_name: str = Field(min_length=1, max_length=100)
    content: str = Field(min_length=1, max_length=50_000)
    files: list[PublishFile] = Field(default_factory=list, max_length=10)


class PublishResponse(BaseModel):
    id: str
    title: str


def _title_from(content: str) -> str:
    first_line = next((ln.strip() for ln in content.splitlines() if ln.strip()), "")
    return first_line[:80] or "Untitled"


def _publish(req: PublishRequest) -> PublishResponse:
    total = 0
    for f in req.files:
        try:
            total += len(base64.b64decode(f.data, validate=True))
        except binascii.Error as e:
            raise HTTPException(
                status_code=422, detail=f"{f.name} is not valid base64."
            ) from e
    if total > MAX_FILES_BYTES:
        raise HTTPException(
            status_code=413, detail="Files are too large (max 250 KB in total)."
        )

    title = _title_from(req.content)
    search_id = time.time_ns() // 1000  # microseconds since epoch, numeric
    item: dict[str, Any] = {
        "search_id": search_id,
        "data": {
            "title": title,
            "article": req.content,
            "author": req.user_name.strip(),
            "published_at": datetime.now(timezone.utc).isoformat(),
        },
        "chat": [],
    }
    if req.files:
        item["data"]["files"] = [f.model_dump() for f in req.files]

    try:
        _table.put_item(Item=item, ConditionExpression="attribute_not_exists(search_id)")
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise HTTPException(status_code=409, detail="Please try again.") from e
        raise
    return PublishResponse(id=str(search_id), title=title)


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


def _score(query_words: list[str], title: str) -> int:
    """How many query words appear in the title (whole or partial word)."""
    lowered = title.lower()
    return sum(1 for w in query_words if w in lowered)


def _search_table(q: str) -> list[Article]:
    articles = [_to_article(it) for it in _fetch_all(_table.scan)]
    query_words = re.sub(r"[^\w\s]", "", q.lower()).split()
    if not query_words:
        return articles

    scored = [(_score(query_words, a.title), a) for a in articles]
    # Best match first; Python's sort is stable, so ties keep table order.
    scored.sort(key=lambda pair: pair[0], reverse=True)
    return [a for score, a in scored if score > 0]


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


@app.post("/api/publish", response_model=PublishResponse, status_code=201)
async def publish(req: PublishRequest) -> PublishResponse:
    try:
        return await run_in_threadpool(_publish, req)
    except (ClientError, BotoCoreError) as e:
        raise HTTPException(status_code=502, detail=f"Database error: {e}") from e


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
