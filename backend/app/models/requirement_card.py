import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, JSON, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


class CardPriority(str, enum.Enum):
    """Requirement card priority enumeration."""
    p0 = "p0"  # Critical
    p1 = "p1"  # High
    p2 = "p2"  # Medium
    p3 = "p3"  # Low


class RequirementCard(Base):
    """
    RequirementCard model - semi-structured schema for consolidating requirements.

    This model combines fixed fields with flexible JSON storage for company-specific customization.
    """

    __tablename__ = "requirement_cards"

    # Primary fields
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    requirement_id = Column(String(36), ForeignKey("requirements.id"), nullable=False, unique=True, index=True)
    version = Column(Integer, default=1, nullable=False)

    # Fixed fields - core requirement information
    title = Column(String(500), nullable=False)
    background = Column(Text, nullable=True)
    user_stories = Column(JSON, nullable=True)  # List of user stories
    acceptance_criteria = Column(JSON, nullable=True)  # List of acceptance criteria
    business_value = Column(Text, nullable=True)
    priority = Column(SQLEnum(CardPriority), default=CardPriority.p2, nullable=False)
    dependencies = Column(JSON, nullable=True)  # List of dependency references
    risks = Column(JSON, nullable=True)  # List of identified risks

    # Flexible fields - allow company-specific customization
    notes = Column(JSON, nullable=True)  # Free-form notes dictionary
    custom_fields = Column(JSON, nullable=True)  # Company-specific fields
    tags = Column(JSON, nullable=True)  # List of tags for categorization

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    requirement = relationship("Requirement", back_populates="requirement_card")

    def __repr__(self) -> str:
        return f"<RequirementCard(id={self.id}, title='{self.title}', version={self.version})>"

    def increment_version(self) -> None:
        """Increment the version number."""
        self.version += 1
