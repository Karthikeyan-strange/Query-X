"""
Unit and integration tests for Health check and Root endpoints.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_health_endpoint():
    """Verifies that GET /health returns 200 OK and status UP."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "UP"
        assert "QueryX AI Intelligence Service" in data["service"]


@pytest.mark.asyncio
async def test_root_endpoint():
    """Verifies that GET / returns service information and docs links."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "UP"
        assert data["docs_url"] == "/docs"
