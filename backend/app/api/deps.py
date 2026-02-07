from typing import Generator
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db


def get_current_db(db: Session = Depends(get_db)) -> Session:
    """
    Get current database session.

    Args:
        db: Database session from dependency

    Returns:
        Session: Database session

    Raises:
        HTTPException: If database session is not available
    """
    try:
        return db
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection error: {str(e)}"
        )
