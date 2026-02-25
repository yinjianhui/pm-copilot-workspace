from fastapi import APIRouter
from app.api.v1 import workspaces, epics, requirements, health, conversations, prds, tasks

api_router = APIRouter()

# Health check endpoint
api_router.include_router(health.router, tags=["health"])

# Workspace endpoints
api_router.include_router(workspaces.router, prefix="/workspaces", tags=["workspaces"])

# Epic endpoints
api_router.include_router(epics.router, prefix="/epics", tags=["epics"])

# Requirement endpoints
api_router.include_router(requirements.router, prefix="/requirements", tags=["requirements"])

# Conversation endpoints
api_router.include_router(conversations.router, prefix="/conversations", tags=["conversations"])

# PRD endpoints
api_router.include_router(prds.router, prefix="/prds", tags=["prds"])

# Task endpoints
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
