"""
PRD (Product Requirement Document) API endpoints.
"""

import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.session import get_db
from app.models.prd import PRDDocument, PRDVersion, PRDStatus
from app.models.workspace import Workspace
from app.models.epic import Epic
from app.models.requirement import Requirement
from app.schemas.prd import (
    PRDCreate, PRDUpdate, PRDResponse, PRDResponseWithVersions,
    PRDVersionResponse, PRDGenerateRequest, PRDRefineRequest, PRDRefineResponse,
    PRDSectionRefineRequest
)
from app.services.ai import PRDGenerationService, create_prd_service

router = APIRouter()


@router.post("/generate", response_model=PRDResponse, status_code=status.HTTP_201_CREATED)
async def generate_prd(
    request: PRDGenerateRequest,
    db: Session = Depends(get_db)
):
    """
    Generate a PRD using AI.

    - **product_description**: Description of the product/feature
    - **context**: Additional context (target users, market, etc.)
    - **title**: PRD title (optional, will be generated if not provided)
    - **model_provider**: AI provider to use (anthropic, openai, deepseek, glm)
    - **model_name**: Specific model to use (optional)
    - **temperature**: Sampling temperature (0-2)
    - **workspace_id**: Optional workspace to link the PRD
    - **epic_id**: Optional epic to link the PRD
    - **requirement_id**: Optional requirement to link the PRD
    - **created_by**: User ID who is creating the PRD
    """
    # Verify related entities exist if provided
    if request.workspace_id:
        workspace = db.query(Workspace).filter(
            Workspace.id == request.workspace_id
        ).first()
        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found"
            )

    if request.epic_id:
        epic = db.query(Epic).filter(Epic.id == request.epic_id).first()
        if not epic:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Epic not found"
            )

    if request.requirement_id:
        requirement = db.query(Requirement).filter(
            Requirement.id == request.requirement_id
        ).first()
        if not requirement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Requirement not found"
            )

    # Generate PRD using AI service
    try:
        prd_service = create_prd_service(
            provider=request.model_provider,
            model=request.model_name,
        )

        prd_content = await prd_service.generate_prd(
            product_description=request.product_description,
            context=request.context,
            temperature=request.temperature,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )

    # Extract title if not provided
    title = request.title
    if not title:
        # Use first line or generate a title from content
        lines = prd_content.split('\n')
        for line in lines:
            line = line.strip()
            if line and not line.startswith('#'):
                title = line[:100]
                break
        if not title:
            title = "Generated PRD"

    # Create PRD document
    prd = PRDDocument(
        id=str(uuid.uuid4()),
        title=title,
        content=prd_content,
        workspace_id=request.workspace_id,
        epic_id=request.epic_id,
        requirement_id=request.requirement_id,
        model_provider=request.model_provider,
        model_name=request.model_name,
        generation_metadata={
            "temperature": request.temperature,
            "context_provided": request.context is not None,
        },
        created_by=request.created_by,
    )

    db.add(prd)
    db.commit()
    db.refresh(prd)

    return prd


@router.post("/refine-section", response_model=PRDRefineResponse)
async def refine_prd_section(
    request: PRDSectionRefineRequest,
    db: Session = Depends(get_db)
):
    """
    Refine a specific section of a PRD using AI.

    - **content**: Current PRD content
    - **section_name**: Name of the section to refine
    - **feedback**: Feedback on how to improve the section
    - **model_provider**: AI provider to use
    - **temperature**: Sampling temperature
    """
    try:
        prd_service = create_prd_service(provider=request.model_provider)

        refined_content = await prd_service.refine_prd_section(
            prd_content=request.content,
            section_name=request.section_name,
            feedback=request.feedback,
            temperature=request.temperature,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )

    return PRDRefineResponse(
        prd_id="",
        version=1,
        section_name=request.section_name,
        refined_content=refined_content,
        change_description=f"Refined based on feedback: {request.feedback[:100]}...",
    )


@router.post("/", response_model=PRDResponse, status_code=status.HTTP_201_CREATED)
async def create_prd(
    prd_data: PRDCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new PRD document manually (without AI generation).

    Use this to create a PRD from pre-existing content.
    """
    # Verify related entities exist if provided
    if prd_data.workspace_id:
        workspace = db.query(Workspace).filter(
            Workspace.id == prd_data.workspace_id
        ).first()
        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found"
            )

    if prd_data.epic_id:
        epic = db.query(Epic).filter(Epic.id == prd_data.epic_id).first()
        if not epic:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Epic not found"
            )

    if prd_data.requirement_id:
        requirement = db.query(Requirement).filter(
            Requirement.id == prd_data.requirement_id
        ).first()
        if not requirement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Requirement not found"
            )

    # Create PRD document
    prd = PRDDocument(
        id=str(uuid.uuid4()),
        title=prd_data.title,
        content=prd_data.content,
        sections=prd_data.sections,
        workspace_id=prd_data.workspace_id,
        epic_id=prd_data.epic_id,
        requirement_id=prd_data.requirement_id,
        model_provider=prd_data.model_provider,
        model_name=prd_data.model_name,
        generation_metadata=prd_data.generation_metadata,
        created_by=prd_data.created_by,
    )

    db.add(prd)
    db.commit()
    db.refresh(prd)

    return prd


@router.get("/", response_model=List[PRDResponse])
async def list_prds(
    skip: int = 0,
    limit: int = 50,
    status: Optional[PRDStatus] = None,
    workspace_id: Optional[str] = None,
    epic_id: Optional[str] = None,
    requirement_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List PRD documents with optional filtering.

    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    - **status**: Filter by PRD status
    - **workspace_id**: Filter by workspace ID
    - **epic_id**: Filter by epic ID
    - **requirement_id**: Filter by requirement ID
    """
    query = db.query(PRDDocument)

    if status:
        query = query.filter(PRDDocument.status == status)
    if workspace_id:
        query = query.filter(PRDDocument.workspace_id == workspace_id)
    if epic_id:
        query = query.filter(PRDDocument.epic_id == epic_id)
    if requirement_id:
        query = query.filter(PRDDocument.requirement_id == requirement_id)

    prds = query.order_by(desc(PRDDocument.updated_at)).offset(skip).limit(limit).all()
    return prds


@router.get("/{prd_id}", response_model=PRDResponseWithVersions)
async def get_prd(
    prd_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a PRD document by ID with version history.
    """
    prd = db.query(PRDDocument).filter(PRDDocument.id == prd_id).first()
    if not prd:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PRD not found"
        )

    return prd


@router.patch("/{prd_id}", response_model=PRDResponse)
async def update_prd(
    prd_id: str,
    prd_data: PRDUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a PRD document.

    Creates a new version when content is updated.
    """
    prd = db.query(PRDDocument).filter(PRDDocument.id == prd_id).first()
    if not prd:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PRD not found"
        )

    # Check if content is being updated
    new_content = prd_data.content
    new_sections = prd_data.sections

    if new_content is not None or new_sections is not None:
        # Create version snapshot
        old_version = PRDVersion(
            id=str(uuid.uuid4()),
            prd_id=prd_id,
            version=prd.version,
            content=prd.content,
            sections=prd.sections,
            model_provider=prd.model_provider,
            model_name=prd.model_name,
            generation_metadata=prd.generation_metadata,
            created_by=prd.created_by,
        )
        db.add(old_version)

        # Update version
        prd.version += 1

    # Update fields
    update_data = prd_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(prd, field, value)

    db.commit()
    db.refresh(prd)

    return prd


@router.delete("/{prd_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prd(
    prd_id: str,
    db: Session = Depends(get_db)
):
    """
    Delete a PRD document.
    """
    prd = db.query(PRDDocument).filter(PRDDocument.id == prd_id).first()
    if not prd:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PRD not found"
        )

    db.delete(prd)
    db.commit()

    return None


@router.post("/{prd_id}/refine", response_model=PRDResponse)
async def refine_prd(
    prd_id: str,
    request: PRDRefineRequest,
    db: Session = Depends(get_db)
):
    """
    Refine a section of an existing PRD.

    Creates a new version with the refined content.

    - **section_name**: Name of the section to refine
    - **feedback**: Feedback on how to improve the section
    - **temperature**: Sampling temperature
    """
    prd = db.query(PRDDocument).filter(PRDDocument.id == prd_id).first()
    if not prd:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PRD not found"
        )

    # Create version snapshot
    old_version = PRDVersion(
        id=str(uuid.uuid4()),
        prd_id=prd_id,
        version=prd.version,
        content=prd.content,
        sections=prd.sections,
        change_description=f"Before refining '{request.section_name}' section",
        model_provider=prd.model_provider,
        model_name=prd.model_name,
        created_by=prd.created_by,
    )
    db.add(old_version)

    # Refine using AI service
    try:
        prd_service = create_prd_service(
            provider=prd.model_provider,
            model=prd.model_name,
        )

        refined_section = await prd_service.refine_prd_section(
            prd_content=prd.content,
            section_name=request.section_name,
            feedback=request.feedback,
            temperature=request.temperature,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )

    # Update PRD with refined content
    # Note: In a production system, you'd want to parse and replace the specific section
    # For now, we'll prepend the refined section with a note
    prd.content = f"""# Refinement for "{request.section_name}" section

{refined_section}

---

# Original PRD

{prd.content}
"""

    prd.version += 1
    db.commit()
    db.refresh(prd)

    return prd


@router.get("/{prd_id}/versions", response_model=List[PRDVersionResponse])
async def get_prd_versions(
    prd_id: str,
    db: Session = Depends(get_db)
):
    """
    Get version history for a PRD.
    """
    prd = db.query(PRDDocument).filter(PRDDocument.id == prd_id).first()
    if not prd:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PRD not found"
        )

    versions = db.query(PRDVersion).filter(
        PRDVersion.prd_id == prd_id
    ).order_by(desc(PRDVersion.version)).all()

    return versions
