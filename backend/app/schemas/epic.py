from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.models.epic import EpicStatus, EpicPriority


class EpicBase(BaseModel):
    """Base epic schema."""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: EpicStatus = EpicStatus.draft
    priority: EpicPriority = EpicPriority.medium


class EpicCreate(EpicBase):
    """Schema for creating an epic."""
    workspace_id: str
    created_by: str


class EpicUpdate(BaseModel):
    """Schema for updating an epic."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[EpicStatus] = None
    priority: Optional[EpicPriority] = None


class EpicResponse(EpicBase):
    """Schema for epic response."""
    id: str
    workspace_id: str
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
