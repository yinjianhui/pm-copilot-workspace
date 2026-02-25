"""
Conversation model for storing AI chat conversations and messages.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Integer, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


class ConversationStatus(str, enum.Enum):
    """Conversation status enumeration."""
    active = "active"
    archived = "archived"
    deleted = "deleted"


class Conversation(Base):
    """
    Conversation model for tracking AI chat sessions.
    """

    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=True, index=True)
    epic_id = Column(String(36), ForeignKey("epics.id"), nullable=True, index=True)
    requirement_id = Column(String(36), ForeignKey("requirements.id"), nullable=True, index=True)
    title = Column(String(255), nullable=False, default="New Conversation")
    status = Column(SQLEnum(ConversationStatus), default=ConversationStatus.active, nullable=False)
    model_provider = Column(String(50), nullable=False, default="deepseek")  # anthropic, openai, deepseek, glm
    model_name = Column(String(100), nullable=True)
    system_prompt = Column(Text, nullable=True)
    metadata = Column(JSON, nullable=True)
    message_count = Column(Integer, default=0, nullable=False)
    created_by = Column(String(36), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    messages = relationship("ConversationMessage", back_populates="conversation", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Conversation(id={self.id}, title='{self.title}', provider='{self.model_provider}')>"


class ConversationMessage(Base):
    """
    Message model for storing individual messages in a conversation.
    """

    __tablename__ = "conversation_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    token_count = Column(Integer, nullable=True)
    metadata = Column(JSON, nullable=True)  # model, temperature, finish_reason, etc.
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")

    def __repr__(self) -> str:
        return f"<ConversationMessage(id={self.id}, role='{self.role}', conversation_id={self.conversation_id})>"
