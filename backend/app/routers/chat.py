from fastapi import APIRouter, HTTPException
from app.schemas.requests import ChatRequest
from app.services.nova_client import nova

router = APIRouter()

@router.post("/chat")
async def chat(request: ChatRequest):
    """
    Conversational endpoint powered by Amazon Nova.
    Pass the full message history + optionally the previous prediction result
    as `context`. Nova will answer in full awareness of what was diagnosed.
    """
    if not request.messages:
        raise HTTPException(status_code=400, detail="messages cannot be empty.")

    formatted = [
        {"role": m.role, "content": [{"text": m.content}]}
        for m in request.messages
    ]

    response_text = await nova.chat(formatted, context=request.context)

    return {
        "response": response_text,
        "powered_by": "Amazon Nova Lite via AWS Bedrock",
        "message_count": len(request.messages),
    }
