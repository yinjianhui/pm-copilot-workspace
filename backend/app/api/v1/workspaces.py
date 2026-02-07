from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_db
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate, WorkspaceResponse
from app.models.workspace import Workspace

router = APIRouter()


@router.post("/", response_model=WorkspaceResponse)
async def create_workspace(
    workspace: WorkspaceCreate,
    db: Session = Depends(get_current_db)
):
    """
    Create a new workspace.

    Args:
        workspace: Workspace creation data
        db: Database session

    Returns:
        WorkspaceResponse: Created workspace
    """
    db_workspace = Workspace(**workspace.model_dump())
    db.add(db_workspace)
    db.commit()
    db.refresh(db_workspace)
    return db_workspace


@router.get("/", response_model=List[WorkspaceResponse])
async def list_workspaces(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_current_db)
):
    """
    List all workspaces.

    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session

    Returns:
        List[WorkspaceResponse]: List of workspaces
    """
    workspaces = db.query(Workspace).offset(skip).limit(limit).all()
    return workspaces


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
async def get_workspace(
    workspace_id: str,
    db: Session = Depends(get_current_db)
):
    """
    Get a specific workspace by ID.

    Args:
        workspace_id: Workspace ID
        db: Database session

    Returns:
        WorkspaceResponse: Workspace data

    Raises:
        HTTPException: If workspace not found
    """
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    return workspace


@router.put("/{workspace_id}", response_model=WorkspaceResponse)
async def update_workspace(
    workspace_id: str,
    workspace_update: WorkspaceUpdate,
    db: Session = Depends(get_current_db)
):
    """
    Update a workspace.

    Args:
        workspace_id: Workspace ID
        workspace_update: Workspace update data
        db: Database session

    Returns:
        WorkspaceResponse: Updated workspace

    Raises:
        HTTPException: If workspace not found
    """
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )

    for field, value in workspace_update.model_dump(exclude_unset=True).items():
        setattr(workspace, field, value)

    db.commit()
    db.refresh(workspace)
    return workspace


@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workspace(
    workspace_id: str,
    db: Session = Depends(get_current_db)
):
    """
    Delete a workspace.

    Args:
        workspace_id: Workspace ID
        db: Database session

    Raises:
        HTTPException: If workspace not found
    """
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )

    db.delete(workspace)
    db.commit()
