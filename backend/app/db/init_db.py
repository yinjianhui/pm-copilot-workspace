# Import all models to ensure they're registered with SQLAlchemy
from app.models import (
    User,
    Workspace,
    Epic,
    Requirement,
    Task,
    RequirementCard,
)
from app.db.base import Base, engine
from app.db.session import SessionLocal


def init_db() -> None:
    """
    Initialize database tables and create default admin user.
    """
    Base.metadata.create_all(bind=engine)

    # Create default admin user
    db = SessionLocal()
    try:
        # Check if admin user already exists
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin_user = User(
                username="admin",
                email="admin@example.com",
                full_name="Administrator",
                is_active=True,
                is_superuser=True
            )
            admin_user.set_password("admin123")
            db.add(admin_user)
            db.commit()
            print("Default admin user created successfully.")
            print("Username: admin")
            print("Email: admin@example.com")
            print("Password: admin123")
        else:
            print("Admin user already exists.")
    except Exception as e:
        db.rollback()
        print(f"Error creating admin user: {e}")
    finally:
        db.close()


def drop_db() -> None:
    """
    Drop all database tables.
    Use with caution in production!
    """
    Base.metadata.drop_all(bind=engine)
