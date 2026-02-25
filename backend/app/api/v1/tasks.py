"""
Task API endpoints for managing product development tasks.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_db
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.models.task import Task, TaskStatus, TaskPriority

router = APIRouter()


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task: TaskCreate,
    db: Session = Depends(get_current_db)
):
    """
    Create a new task.

    Args:
        task: Task creation data
        db: Database session

    Returns:
        TaskResponse: Created task
    """
    db_task = Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.get("/", response_model=List[TaskResponse])
async def list_tasks(
    requirement_id: Optional[str] = Query(None, description="Filter by requirement ID"),
    status_filter: Optional[TaskStatus] = Query(None, alias="status", description="Filter by status"),
    priority: Optional[TaskPriority] = Query(None, description="Filter by priority"),
    assignee_id: Optional[str] = Query(None, description="Filter by assignee ID"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    sort_by: Optional[str] = Query("created_at", description="Field to sort by"),
    sort_order: Optional[str] = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    db: Session = Depends(get_current_db)
):
    """
    List all tasks with optional filtering and sorting.

    Args:
        requirement_id: Optional requirement ID to filter by
        status_filter: Optional status to filter by
        priority: Optional priority to filter by
        assignee_id: Optional assignee ID to filter by
        skip: Number of records to skip
        limit: Maximum number of records to return
        sort_by: Field to sort by (created_at, updated_at, title, priority, status)
        sort_order: Sort order (asc or desc)
        db: Database session

    Returns:
        List[TaskResponse]: List of tasks
    """
    query = db.query(Task)

    # Apply filters
    if requirement_id:
        query = query.filter(Task.requirement_id == requirement_id)
    if status_filter:
        query = query.filter(Task.status == status_filter)
    if priority:
        query = query.filter(Task.priority == priority)
    if assignee_id:
        query = query.filter(Task.assignee_id == assignee_id)

    # Validate sort_by field
    valid_sort_fields = {"created_at", "updated_at", "title", "priority", "status"}
    if sort_by not in valid_sort_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid sort field. Must be one of: {', '.join(valid_sort_fields)}"
        )

    # Apply sorting
    sort_field = getattr(Task, sort_by)
    if sort_order == "asc":
        query = query.order_by(sort_field.asc())
    else:
        query = query.order_by(sort_field.desc())

    tasks = query.offset(skip).limit(limit).all()
    return tasks


@router.get("/requirements/{requirement_id}/tasks", response_model=List[TaskResponse])
async def list_requirement_tasks(
    requirement_id: str,
    status_filter: Optional[TaskStatus] = Query(None, alias="status", description="Filter by status"),
    priority: Optional[TaskPriority] = Query(None, description="Filter by priority"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    db: Session = Depends(get_current_db)
):
    """
    Get all tasks for a specific requirement.

    Args:
        requirement_id: Requirement ID
        status_filter: Optional status to filter by
        priority: Optional priority to filter by
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session

    Returns:
        List[TaskResponse]: List of tasks for the requirement
    """
    query = db.query(Task).filter(Task.requirement_id == requirement_id)

    if status_filter:
        query = query.filter(Task.status == status_filter)
    if priority:
        query = query.filter(Task.priority == priority)

    tasks = query.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()
    return tasks


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    db: Session = Depends(get_current_db)
):
    """
    Get a specific task by ID.

    Args:
        task_id: Task ID
        db: Database session

    Returns:
        TaskResponse: Task data

    Raises:
        HTTPException: If task not found
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    db: Session = Depends(get_current_db)
):
    """
    Update a task.

    Args:
        task_id: Task ID
        task_update: Task update data
        db: Database session

    Returns:
        TaskResponse: Updated task

    Raises:
        HTTPException: If task not found
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    for field, value in task_update.model_dump(exclude_unset=True).items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}/status", response_model=TaskResponse)
async def update_task_status(
    task_id: str,
    new_status: TaskStatus,
    db: Session = Depends(get_current_db)
):
    """
    Update the status of a task.

    Valid status transitions:
    - todo -> in_progress
    - in_progress -> done or blocked
    - blocked -> in_progress or cancelled
    - done -> todo (reopened)
    - cancelled -> todo (reopened)

    Args:
        task_id: Task ID
        new_status: New status value
        db: Database session

    Returns:
        TaskResponse: Updated task

    Raises:
        HTTPException: If task not found or status transition is invalid
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Define valid status transitions
    valid_transitions = {
        TaskStatus.todo: [TaskStatus.in_progress, TaskStatus.cancelled],
        TaskStatus.in_progress: [TaskStatus.done, TaskStatus.blocked, TaskStatus.todo],
        TaskStatus.blocked: [TaskStatus.in_progress, TaskStatus.cancelled],
        TaskStatus.done: [TaskStatus.todo],
        TaskStatus.cancelled: [TaskStatus.todo]
    }

    if new_status not in valid_transitions.get(task.status, []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status transition from '{task.status}' to '{new_status}'"
        )

    task.status = new_status
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    db: Session = Depends(get_current_db)
):
    """
    Delete a task.

    Args:
        task_id: Task ID
        db: Database session

    Raises:
        HTTPException: If task not found
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    db.delete(task)
    db.commit()
