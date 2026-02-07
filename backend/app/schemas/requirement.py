from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any
from app.models.requirement import RequirementStatus


class RequirementBase(BaseModel):
    """Base requirement schema."""
    title: str = Field(..., min_length=1, max_length=255)
    status: RequirementStatus = RequirementStatus.clarifying
    checklist_state: Optional[Dict[str, Any]] = None


class RequirementCreate(RequirementBase):
    """Schema for creating a requirement."""
    epic_id: str
    created_by: str


class RequirementUpdate(BaseModel):
    """Schema for updating a requirement."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    status: Optional[RequirementStatus] = None
    checklist_state: Optional[Dict[str, Any]] = None


class RequirementResponse(RequirementBase):
    """Schema for requirement response."""
    id: str
    epic_id: str
    conversation_count: int
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
