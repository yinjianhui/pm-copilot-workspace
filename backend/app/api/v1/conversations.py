"""
Conversation API endpoints for AI chat functionality.
"""

import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.session import get_db
from app.models.conversation import Conversation, ConversationMessage, ConversationStatus
from app.models.workspace import Workspace
from app.models.epic import Epic
from app.models.requirement import Requirement
from app.schemas.conversation import (
    ConversationCreate, ConversationUpdate, ConversationResponse,
    ConversationWithMessages, ChatRequest, ChatResponse, ChatStreamChunk,
    AvailableModelsResponse, ModelProviderInfo, MessageCreate, MessageResponse
)
from app.services.ai import (
    ConversationService, ModelProvider, ModelConfig,
    create_conversation_service
)

router = APIRouter()


@router.get("/models", response_model=AvailableModelsResponse)
async def get_available_models():
    """
    Get available AI models and providers.

    Returns a list of supported providers and their available models.
    """
    providers = []

    # Anthropic
    if ModelConfig.ANTHROPIC_MODELS:
        providers.append(ModelProviderInfo(
            name="anthropic",
            display_name="Anthropic Claude",
            models=list(ModelConfig.ANTHROPIC_MODELS.keys())
        ))

    # OpenAI
    if ModelConfig.OPENAI_MODELS:
        providers.append(ModelProviderInfo(
            name="openai",
            display_name="OpenAI",
            models=list(ModelConfig.OPENAI_MODELS.keys())
        ))

    # DeepSeek
    if ModelConfig.DEEPSEEK_MODELS:
        providers.append(ModelProviderInfo(
            name="deepseek",
            display_name="DeepSeek",
            models=list(ModelConfig.DEEPSEEK_MODELS.keys())
        ))

    # GLM (Zhipu AI)
    if ModelConfig.GLM_MODELS:
        providers.append(ModelProviderInfo(
            name="glm",
            display_name="GLM (智谱清言)",
            models=list(ModelConfig.GLM_MODELS.keys())
        ))

    return AvailableModelsResponse(providers=providers)


@router.post("/", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    conversation_data: ConversationCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new conversation.

    - **title**: Conversation title
    - **model_provider**: AI provider (anthropic, openai, deepseek, glm)
    - **model_name**: Specific model to use (optional, uses provider default)
    - **system_prompt**: Custom system prompt (optional)
    - **workspace_id**: Optional workspace ID to link the conversation
    - **epic_id**: Optional epic ID to link the conversation
    - **requirement_id**: Optional requirement ID to link the conversation
    """
    # Verify related entities exist if provided
    if conversation_data.workspace_id:
        workspace = db.query(Workspace).filter(
            Workspace.id == conversation_data.workspace_id
        ).first()
        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found"
            )

    if conversation_data.epic_id:
        epic = db.query(Epic).filter(Epic.id == conversation_data.epic_id).first()
        if not epic:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Epic not found"
            )

    if conversation_data.requirement_id:
        requirement = db.query(Requirement).filter(
            Requirement.id == conversation_data.requirement_id
        ).first()
        if not requirement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Requirement not found"
            )

    # Create conversation
    conversation = Conversation(
        id=str(uuid.uuid4()),
        title=conversation_data.title,
        model_provider=conversation_data.model_provider,
        model_name=conversation_data.model_name,
        system_prompt=conversation_data.system_prompt,
        workspace_id=conversation_data.workspace_id,
        epic_id=conversation_data.epic_id,
        requirement_id=conversation_data.requirement_id,
        metadata=conversation_data.metadata,
        created_by=conversation_data.created_by,
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


@router.get("/", response_model=List[ConversationResponse])
async def list_conversations(
    skip: int = 0,
    limit: int = 50,
    status: Optional[ConversationStatus] = None,
    workspace_id: Optional[str] = None,
    epic_id: Optional[str] = None,
    requirement_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List conversations with optional filtering.

    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    - **status**: Filter by conversation status
    - **workspace_id**: Filter by workspace ID
    - **epic_id**: Filter by epic ID
    - **requirement_id**: Filter by requirement ID
    """
    query = db.query(Conversation)

    if status:
        query = query.filter(Conversation.status == status)
    if workspace_id:
        query = query.filter(Conversation.workspace_id == workspace_id)
    if epic_id:
        query = query.filter(Conversation.epic_id == epic_id)
    if requirement_id:
        query = query.filter(Conversation.requirement_id == requirement_id)

    conversations = query.order_by(desc(Conversation.updated_at)).offset(skip).limit(limit).all()
    return conversations


@router.get("/{conversation_id}", response_model=ConversationWithMessages)
async def get_conversation(
    conversation_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a conversation by ID with all messages.
    """
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    return conversation


@router.patch("/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: str,
    conversation_data: ConversationUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a conversation.

    - **title**: New conversation title
    - **status**: New conversation status
    - **system_prompt**: New system prompt
    - **metadata**: Updated metadata
    """
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # Update fields
    update_data = conversation_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(conversation, field, value)

    db.commit()
    db.refresh(conversation)

    return conversation


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db)
):
    """
    Delete a conversation (soft delete by setting status to deleted).
    """
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    conversation.status = ConversationStatus.deleted
    db.commit()

    return None


@router.post("/{conversation_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def add_message(
    conversation_id: str,
    message_data: MessageCreate,
    db: Session = Depends(get_db)
):
    """
    Add a message to a conversation (without AI response).

    Use this to manually add messages to the conversation history.
    """
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    message = ConversationMessage(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        role=message_data.role,
        content=message_data.content,
        metadata=message_data.metadata,
    )

    db.add(message)
    conversation.message_count += 1
    db.commit()
    db.refresh(message)

    return message


@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    conversation_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all messages in a conversation.
    """
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    messages = db.query(ConversationMessage).filter(
        ConversationMessage.conversation_id == conversation_id
    ).order_by(ConversationMessage.created_at).offset(skip).limit(limit).all()

    return messages


@router.post("/{conversation_id}/chat", response_model=ChatResponse)
async def chat(
    conversation_id: str,
    chat_request: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    Send a message and get AI response.

    - **message**: User message to send
    - **temperature**: Sampling temperature (0-2, default 0.7)
    - **max_tokens**: Maximum tokens to generate
    - **stream**: Whether to stream the response (not yet implemented)

    The user message and AI response are both saved to the conversation.
    """
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # Create conversation service
    conv_service = create_conversation_service(
        provider=conversation.model_provider,
        model=conversation.model_name,
        system_prompt=conversation.system_prompt,
    )

    # Load existing conversation history
    existing_messages = db.query(ConversationMessage).filter(
        ConversationMessage.conversation_id == conversation_id
    ).order_by(ConversationMessage.created_at).all()

    for msg in existing_messages:
        conv_service.add_message(msg.role, msg.content)

    # Send message and get response
    try:
        response_text = await conv_service.send_message(
            message=chat_request.message,
            temperature=chat_request.temperature,
            max_tokens=chat_request.max_tokens,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )

    # Save user message
    user_message = ConversationMessage(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        role="user",
        content=chat_request.message,
        metadata={"temperature": chat_request.temperature},
    )
    db.add(user_message)

    # Save assistant message
    assistant_message = ConversationMessage(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        role="assistant",
        content=response_text,
        metadata={
            "temperature": chat_request.temperature,
            "max_tokens": chat_request.max_tokens,
            "model": conversation.model_name,
            "provider": conversation.model_provider,
        },
    )
    db.add(assistant_message)

    conversation.message_count += 2
    db.commit()
    db.refresh(assistant_message)

    return ChatResponse(
        conversation_id=conversation_id,
        message_id=assistant_message.id,
        role=assistant_message.role,
        content=assistant_message.content,
        token_count=assistant_message.token_count,
    )


@router.delete("/{conversation_id}/messages", status_code=status.HTTP_204_NO_CONTENT)
async def clear_messages(
    conversation_id: str,
    db: Session = Depends(get_db)
):
    """
    Clear all messages in a conversation.
    """
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # Delete all messages
    db.query(ConversationMessage).filter(
        ConversationMessage.conversation_id == conversation_id
    ).delete()

    conversation.message_count = 0
    db.commit()

    return None
