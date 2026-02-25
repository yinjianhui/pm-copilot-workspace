import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


class TaskStatus(str, enum.Enum):
    """Task status enumeration."""
    todo = "todo"
    in_progress = "in_progress"
    done = "done"
    blocked = "blocked"
    cancelled = "cancelled"


class TaskPriority(str, enum.Enum):
    """Task priority enumeration."""
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class Task(Base):
    """Task model for breaking down requirements into actionable items."""

    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    requirement_id = Column(String(36), ForeignKey("requirements.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    status = Column(SQLEnum(TaskStatus), default=TaskStatus.todo, nullable=False)
    priority = Column(SQLEnum(TaskPriority), default=TaskPriority.medium, nullable=False)
    assignee_id = Column(String(36), nullable=True)
    estimated_hours = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    requirement = relationship("Requirement", back_populates="tasks")

    def __repr__(self) -> str:
        return f"<Task(id={self.id}, title='{self.title}', status='{self.status}')>"
