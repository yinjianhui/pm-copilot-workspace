from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.models.task import TaskStatus, TaskPriority


class TaskBase(BaseModel):
    """Base task schema."""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    status: TaskStatus = TaskStatus.todo
    priority: TaskPriority = TaskPriority.medium
    estimated_hours: Optional[float] = None


class TaskCreate(TaskBase):
    """Schema for creating a task."""
    requirement_id: str
    assignee_id: Optional[str] = None


class TaskUpdate(BaseModel):
    """Schema for updating a task."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    assignee_id: Optional[str] = None
    estimated_hours: Optional[float] = None


class TaskResponse(TaskBase):
    """Schema for task response."""
    id: str
    requirement_id: str
    priority: TaskPriority
    assignee_id: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
