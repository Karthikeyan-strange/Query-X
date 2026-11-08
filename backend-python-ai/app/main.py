"""
QueryX Python AI Backend Application Entry Point.
FastAPI Application initialization, CORS middleware, and route mounting.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.health import router as health_router
from app.api.ai_routes import router as ai_router

app = FastAPI(
    title=settings.app_name,
    description=(
        "QueryX Regional AI-Powered Delivery Exception Investigation and Customer Response System. "
        "Provides stateless intelligence services including Complaint Classification, Order Extraction, "
        "Regional Disruption Correlation, Investigation Reasoning, and Customer Response Generation."
    ),
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(health_router)
app.include_router(ai_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
