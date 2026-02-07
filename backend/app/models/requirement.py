import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, JSON, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


class RequirementStatus(str, enum.Enum):
    """Requirement status enumeration."""
    clarifying = "clarifying"
    clarified = "clarified"
    in_progress = "in_progress"
    completed = "completed"


class Requirement(Base):
    """Requirement model for tracking product requirements."""

    __tablename__ = "requirements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    epic_id = Column(String(36), ForeignKey("epics.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    status = Column(SQLEnum(RequirementStatus), default=RequirementStatus.clarifying, nullable=False)
    checklist_state = Column(JSON, nullable=True)  # 6-item checklist progress
    conversation_count = Column(Integer, default=0, nullable=False)
    created_by = Column(String(36), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    epic = relationship("Epic", back_populates="requirements")
    tasks = relationship("Task", back_populates="requirement", cascade="all, delete-orphan")
    requirement_card = relationship("RequirementCard", back_populates="requirement", uselist=False, cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Requirement(id={self.id}, title='{self.title}', status='{self.status}')>"
