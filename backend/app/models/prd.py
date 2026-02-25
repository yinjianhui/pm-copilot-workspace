"""
PRD (Product Requirement Document) model for storing generated PRDs.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Integer, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


class PRDStatus(str, enum.Enum):
    """PRD status enumeration."""
    draft = "draft"
    in_review = "in_review"
    approved = "approved"
    archived = "archived"


class PRDDocument(Base):
    """
    PRD Document model for storing generated Product Requirement Documents.
    """

    __tablename__ = "prd_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=True, index=True)
    epic_id = Column(String(36), ForeignKey("epics.id"), nullable=True, index=True)
    requirement_id = Column(String(36), ForeignKey("requirements.id"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    status = Column(SQLEnum(PRDStatus), default=PRDStatus.draft, nullable=False)
    content = Column(Text, nullable=False)  # Full PRD content in markdown
    sections = Column(JSON, nullable=True)  # Structured sections data
    version = Column(Integer, default=1, nullable=False)
    model_provider = Column(String(50), nullable=False)  # anthropic, openai, deepseek, glm
    model_name = Column(String(100), nullable=True)
    generation_metadata = Column(JSON, nullable=True)  # temperature, prompt, etc.
    created_by = Column(String(36), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    versions = relationship("PRDVersion", back_populates="prd", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<PRDDocument(id={self.id}, title='{self.title}', status='{self.status}', version={self.version})>"


class PRDVersion(Base):
    """
    PRD Version model for tracking document history.
    """

    __tablename__ = "prd_versions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    prd_id = Column(String(36), ForeignKey("prd_documents.id"), nullable=False, index=True)
    version = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    sections = Column(JSON, nullable=True)
    change_description = Column(Text, nullable=True)
    model_provider = Column(String(50), nullable=True)
    model_name = Column(String(100), nullable=True)
    generation_metadata = Column(JSON, nullable=True)
    created_by = Column(String(36), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    prd = relationship("PRDDocument", back_populates="versions")

    def __repr__(self) -> str:
        return f"<PRDVersion(id={self.id}, prd_id={self.prd_id}, version={self.version})>"
