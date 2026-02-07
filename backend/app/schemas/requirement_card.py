from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from app.models.requirement_card import CardPriority


class RequirementCardBase(BaseModel):
    """Base requirement card schema."""
    title: str = Field(..., min_length=1, max_length=500)
    background: Optional[str] = None
    user_stories: Optional[List[str]] = None
    acceptance_criteria: Optional[List[str]] = None
    business_value: Optional[str] = None
    priority: CardPriority = CardPriority.p2
    dependencies: Optional[List[str]] = None
    risks: Optional[List[str]] = None
    notes: Optional[Dict[str, Any]] = None
    custom_fields: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None


class RequirementCardCreate(RequirementCardBase):
    """Schema for creating a requirement card."""
    requirement_id: str


class RequirementCardUpdate(BaseModel):
    """Schema for updating a requirement card."""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    background: Optional[str] = None
    user_stories: Optional[List[str]] = None
    acceptance_criteria: Optional[List[str]] = None
    business_value: Optional[str] = None
    priority: Optional[CardPriority] = None
    dependencies: Optional[List[str]] = None
    risks: Optional[List[str]] = None
    notes: Optional[Dict[str, Any]] = None
    custom_fields: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None


class RequirementCardResponse(RequirementCardBase):
    """Schema for requirement card response."""
    id: str
    requirement_id: str
    version: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
