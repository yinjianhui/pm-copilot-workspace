import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


class EpicStatus(str, enum.Enum):
    """Epic status enumeration."""
    draft = "draft"
    active = "active"
    completed = "completed"
    archived = "archived"


class EpicPriority(str, enum.Enum):
    """Epic priority enumeration."""
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class Epic(Base):
    """Epic model for grouping related requirements."""

    __tablename__ = "epics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(SQLEnum(EpicStatus), default=EpicStatus.draft, nullable=False)
    priority = Column(SQLEnum(EpicPriority), default=EpicPriority.medium, nullable=False)
    created_by = Column(String(36), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    workspace = relationship("Workspace", back_populates="epics")
    requirements = relationship("Requirement", back_populates="epic", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Epic(id={self.id}, title='{self.title}', status='{self.status}')>"
