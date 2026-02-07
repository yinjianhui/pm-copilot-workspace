from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_db
from app.schemas.requirement import RequirementCreate, RequirementUpdate, RequirementResponse
from app.models.requirement import Requirement

router = APIRouter()


@router.post("/", response_model=RequirementResponse)
async def create_requirement(
    requirement: RequirementCreate,
    db: Session = Depends(get_current_db)
):
    """
    Create a new requirement.

    Args:
        requirement: Requirement creation data
        db: Database session

    Returns:
        RequirementResponse: Created requirement
    """
    db_requirement = Requirement(**requirement.model_dump())
    db.add(db_requirement)
    db.commit()
    db.refresh(db_requirement)
    return db_requirement


@router.get("/", response_model=List[RequirementResponse])
async def list_requirements(
    epic_id: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_current_db)
):
    """
    List all requirements, optionally filtered by epic.

    Args:
        epic_id: Optional epic ID to filter by
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session

    Returns:
        List[RequirementResponse]: List of requirements
    """
    query = db.query(Requirement)
    if epic_id:
        query = query.filter(Requirement.epic_id == epic_id)

    requirements = query.offset(skip).limit(limit).all()
    return requirements


@router.get("/{requirement_id}", response_model=RequirementResponse)
async def get_requirement(
    requirement_id: str,
    db: Session = Depends(get_current_db)
):
    """
    Get a specific requirement by ID.

    Args:
        requirement_id: Requirement ID
        db: Database session

    Returns:
        RequirementResponse: Requirement data

    Raises:
        HTTPException: If requirement not found
    """
    requirement = db.query(Requirement).filter(Requirement.id == requirement_id).first()
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requirement not found"
        )
    return requirement


@router.put("/{requirement_id}", response_model=RequirementResponse)
async def update_requirement(
    requirement_id: str,
    requirement_update: RequirementUpdate,
    db: Session = Depends(get_current_db)
):
    """
    Update a requirement.

    Args:
        requirement_id: Requirement ID
        requirement_update: Requirement update data
        db: Database session

    Returns:
        RequirementResponse: Updated requirement

    Raises:
        HTTPException: If requirement not found
    """
    requirement = db.query(Requirement).filter(Requirement.id == requirement_id).first()
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requirement not found"
        )

    for field, value in requirement_update.model_dump(exclude_unset=True).items():
        setattr(requirement, field, value)

    db.commit()
    db.refresh(requirement)
    return requirement


@router.delete("/{requirement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_requirement(
    requirement_id: str,
    db: Session = Depends(get_current_db)
):
    """
    Delete a requirement.

    Args:
        requirement_id: Requirement ID
        db: Database session

    Raises:
        HTTPException: If requirement not found
    """
    requirement = db.query(Requirement).filter(Requirement.id == requirement_id).first()
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requirement not found"
        )

    db.delete(requirement)
    db.commit()
