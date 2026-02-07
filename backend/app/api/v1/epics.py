from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_db
from app.schemas.epic import EpicCreate, EpicUpdate, EpicResponse
from app.models.epic import Epic

router = APIRouter()


@router.post("/", response_model=EpicResponse)
async def create_epic(
    epic: EpicCreate,
    db: Session = Depends(get_current_db)
):
    """
    Create a new epic.

    Args:
        epic: Epic creation data
        db: Database session

    Returns:
        EpicResponse: Created epic
    """
    db_epic = Epic(**epic.model_dump())
    db.add(db_epic)
    db.commit()
    db.refresh(db_epic)
    return db_epic


@router.get("/", response_model=List[EpicResponse])
async def list_epics(
    workspace_id: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_current_db)
):
    """
    List all epics, optionally filtered by workspace.

    Args:
        workspace_id: Optional workspace ID to filter by
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session

    Returns:
        List[EpicResponse]: List of epics
    """
    query = db.query(Epic)
    if workspace_id:
        query = query.filter(Epic.workspace_id == workspace_id)

    epics = query.offset(skip).limit(limit).all()
    return epics


@router.get("/{epic_id}", response_model=EpicResponse)
async def get_epic(
    epic_id: str,
    db: Session = Depends(get_current_db)
):
    """
    Get a specific epic by ID.

    Args:
        epic_id: Epic ID
        db: Database session

    Returns:
        EpicResponse: Epic data

    Raises:
        HTTPException: If epic not found
    """
    epic = db.query(Epic).filter(Epic.id == epic_id).first()
    if not epic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Epic not found"
        )
    return epic


@router.put("/{epic_id}", response_model=EpicResponse)
async def update_epic(
    epic_id: str,
    epic_update: EpicUpdate,
    db: Session = Depends(get_current_db)
):
    """
    Update an epic.

    Args:
        epic_id: Epic ID
        epic_update: Epic update data
        db: Database session

    Returns:
        EpicResponse: Updated epic

    Raises:
        HTTPException: If epic not found
    """
    epic = db.query(Epic).filter(Epic.id == epic_id).first()
    if not epic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Epic not found"
        )

    for field, value in epic_update.model_dump(exclude_unset=True).items():
        setattr(epic, field, value)

    db.commit()
    db.refresh(epic)
    return epic


@router.delete("/{epic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_epic(
    epic_id: str,
    db: Session = Depends(get_current_db)
):
    """
    Delete an epic.

    Args:
        epic_id: Epic ID
        db: Database session

    Raises:
        HTTPException: If epic not found
    """
    epic = db.query(Epic).filter(Epic.id == epic_id).first()
    if not epic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Epic not found"
        )

    db.delete(epic)
    db.commit()
