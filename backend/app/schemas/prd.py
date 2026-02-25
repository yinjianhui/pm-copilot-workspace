"""
Schemas for PRD (Product Requirement Document) API.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from app.models.prd import PRDStatus


class PRDSection(BaseModel):
    """Schema for a PRD section."""
    title: str
    content: str
    order: int = 0


class PRDBase(BaseModel):
    """Base PRD schema."""
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    sections: Optional[List[PRDSection]] = None


class PRDCreate(PRDBase):
    """Schema for creating a PRD."""
    workspace_id: Optional[str] = None
    epic_id: Optional[str] = None
    requirement_id: Optional[str] = None
    model_provider: str = Field(default="deepseek", pattern="^(anthropic|openai|deepseek|glm)$")
    model_name: Optional[str] = None
    generation_metadata: Optional[Dict[str, Any]] = None
    created_by: str


class PRDUpdate(BaseModel):
    """Schema for updating a PRD."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    sections: Optional[List[PRDSection]] = None
    status: Optional[PRDStatus] = None


class PRDResponse(PRDBase):
    """Schema for PRD response."""
    id: str
    workspace_id: Optional[str] = None
    epic_id: Optional[str] = None
    requirement_id: Optional[str] = None
    status: PRDStatus
    version: int
    model_provider: str
    model_name: Optional[str] = None
    generation_metadata: Optional[Dict[str, Any]] = None
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PRDResponseWithVersions(PRDResponse):
    """Schema for PRD with version history."""
    versions: List['PRDVersionResponse'] = []


class PRDVersionResponse(BaseModel):
    """Schema for PRD version response."""
    id: str
    prd_id: str
    version: int
    content: str
    sections: Optional[List[PRDSection]] = None
    change_description: Optional[str] = None
    model_provider: Optional[str] = None
    model_name: Optional[str] = None
    created_by: str
    created_at: datetime

    class Config:
        from_attributes = True


class PRDGenerateRequest(BaseModel):
    """Schema for PRD generation request."""
    product_description: str = Field(..., min_length=10)
    context: Optional[str] = None
    title: Optional[str] = None
    model_provider: str = Field(default="deepseek", pattern="^(anthropic|openai|deepseek|glm)$")
    model_name: Optional[str] = None
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    workspace_id: Optional[str] = None
    epic_id: Optional[str] = None
    requirement_id: Optional[str] = None
    created_by: str


class PRDRefineRequest(BaseModel):
    """Schema for PRD section refinement request."""
    section_name: str = Field(..., min_length=1)
    feedback: str = Field(..., min_length=5)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)


class PRDRefineResponse(BaseModel):
    """Schema for PRD refinement response."""
    prd_id: str
    version: int
    section_name: str
    refined_content: str
    change_description: str


class PRDSectionRefineRequest(BaseModel):
    """Schema for refining a single PRD section."""
    content: str = Field(..., min_length=10)
    section_name: str = Field(..., min_length=1)
    feedback: str = Field(..., min_length=5)
    model_provider: str = Field(default="deepseek", pattern="^(anthropic|openai|deepseek|glm)$")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)


# Update forward references
PRDResponseWithVersions.model_rebuild()
