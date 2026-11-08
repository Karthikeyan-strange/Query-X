"""
Health Check and Service Info Routes.
"""

from fastapi import APIRouter
from app.config import settings

router = APIRouter(tags=["Health & System"])


@router.get(
    "/health",
    summary="Health Check",
    description="Returns the operational status of the QueryX Python AI service."
)
async def health_check():
    """
    Health check endpoint for container orchestrators, Spring Boot WebClient, and monitoring.
    """
    return {
        "status": "UP",
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.app_env
    }


@router.get(
    "/",
    summary="Service Information",
    description="Returns general metadata and welcome message for QueryX AI backend."
)
async def root():
    """
    Root endpoint returning service identity and documentation link.
    """
    return {
        "message": "Welcome to QueryX Regional AI-Powered Delivery Exception Investigation Service",
        "status": "UP",
        "version": settings.app_version,
        "docs_url": "/docs",
        "health_check": "/health"
    }
