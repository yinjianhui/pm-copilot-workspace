"""
Schemas for Conversation API.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from app.models.conversation import ConversationStatus


class MessageBase(BaseModel):
    """Base message schema."""
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., min_length=1)


class MessageCreate(MessageBase):
    """Schema for creating a message."""
    metadata: Optional[Dict[str, Any]] = None


class MessageResponse(MessageBase):
    """Schema for message response."""
    id: str
    conversation_id: str
    token_count: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationBase(BaseModel):
    """Base conversation schema."""
    title: str = Field(..., min_length=1, max_length=255)
    model_provider: str = Field(default="deepseek", pattern="^(anthropic|openai|deepseek|glm)$")
    model_name: Optional[str] = None
    system_prompt: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class ConversationCreate(ConversationBase):
    """Schema for creating a conversation."""
    workspace_id: Optional[str] = None
    epic_id: Optional[str] = None
    requirement_id: Optional[str] = None
    created_by: str


class ConversationUpdate(BaseModel):
    """Schema for updating a conversation."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    status: Optional[ConversationStatus] = None
    system_prompt: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class ConversationResponse(ConversationBase):
    """Schema for conversation response."""
    id: str
    workspace_id: Optional[str] = None
    epic_id: Optional[str] = None
    requirement_id: Optional[str] = None
    status: ConversationStatus
    message_count: int
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationWithMessages(ConversationResponse):
    """Schema for conversation with messages."""
    messages: List[MessageResponse] = []


class ChatRequest(BaseModel):
    """Schema for chat request."""
    message: str = Field(..., min_length=1)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(None, gt=0)
    stream: bool = False


class ChatResponse(BaseModel):
    """Schema for chat response."""
    conversation_id: str
    message_id: str
    role: str
    content: str
    token_count: Optional[int] = None
    finish_reason: Optional[str] = None


class ChatStreamChunk(BaseModel):
    """Schema for streaming chat chunk."""
    conversation_id: str
    content: str
    done: bool = False


class ModelProviderInfo(BaseModel):
    """Schema for model provider info."""
    name: str
    display_name: str
    models: List[str]


class AvailableModelsResponse(BaseModel):
    """Schema for available models response."""
    providers: List[ModelProviderInfo]
