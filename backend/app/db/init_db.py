# Import all models to ensure they're registered with SQLAlchemy
from app.models import (
    Workspace,
    Epic,
    Requirement,
    Task,
    RequirementCard,
)
from app.db.base import Base, engine


def init_db() -> None:
    """
    Initialize database tables.
    """
    Base.metadata.create_all(bind=engine)


def drop_db() -> None:
    """
    Drop all database tables.
    Use with caution in production!
    """
    Base.metadata.drop_all(bind=engine)
