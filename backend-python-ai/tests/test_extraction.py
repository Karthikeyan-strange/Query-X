"""
Unit and Integration Tests for Order & Tracking Identifier Extraction (Module 2).
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.schemas.extraction_schema import ExtractionStatus
from app.services.extraction_service import extraction_service


class TestExtractionService:
    """Direct unit tests on ExtractionService."""

    def test_extract_both_identifiers_success(self):
        text = "My order QX-2024-00001 has not arrived. Please check tracking number QXT-CH-20240301-001."
        res = extraction_service.extract(text)
        assert res.extraction_status == ExtractionStatus.SUCCESS
        assert res.order_number == "QX-2024-00001"
        assert res.tracking_number == "QXT-CH-20240301-001"
        assert len(res.raw_candidates) == 2

    def test_extract_order_only_partial(self):
        text = "I placed order QX-2024-00002 last week and have not received any shipping notice yet."
        res = extraction_service.extract(text)
        assert res.extraction_status == ExtractionStatus.PARTIAL
        assert res.order_number == "QX-2024-00002"
        assert res.tracking_number is None

    def test_extract_tracking_only_partial(self):
        text = "Please check the current location of parcel QXT-CB-20240305-001."
        res = extraction_service.extract(text)
        assert res.extraction_status == ExtractionStatus.PARTIAL
        assert res.order_number is None
        assert res.tracking_number == "QXT-CB-20240305-001"

    def test_extract_none_found(self):
        text = "I am writing to inquire if you deliver to Coimbatore on public holidays."
        res = extraction_service.extract(text)
        assert res.extraction_status == ExtractionStatus.NOT_FOUND
        assert res.order_number is None
        assert res.tracking_number is None
        assert res.raw_candidates == []

    def test_extract_lowercase_and_punctuation(self):
        text = "Check (order: qx-2024-00001) with track #qxt-ch-20240301-001."
        res = extraction_service.extract(text)
        assert res.extraction_status == ExtractionStatus.SUCCESS
        assert res.order_number == "QX-2024-00001"
        assert res.tracking_number == "QXT-CH-20240301-001"

    def test_extract_legacy_patterns(self):
        text = "Tracking ID is LGC-TN-90218471 and order is TN-12345678."
        res = extraction_service.extract(text)
        assert res.extraction_status == ExtractionStatus.SUCCESS
        assert res.order_number == "TN-12345678"
        assert res.tracking_number == "LGC-TN-90218471"


class TestExtractionAPI:
    """Integration tests on /api/ai/extract-order endpoint."""

    @pytest.mark.asyncio
    async def test_api_extract_endpoint_success(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            payload = {
                "complaint_text": "Order QX-2024-00001 is delayed. Courier tracking number is QXT-CH-20240301-001."
            }
            response = await client.post("/api/ai/extract-order", json=payload)
            assert response.status_code == 200
            data = response.json()
            assert data["order_number"] == "QX-2024-00001"
            assert data["tracking_number"] == "QXT-CH-20240301-001"
            assert data["extraction_status"] == "SUCCESS"

    @pytest.mark.asyncio
    async def test_api_extract_endpoint_not_found(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            payload = {
                "complaint_text": "I do not have my order number with me right now."
            }
            response = await client.post("/api/ai/extract-order", json=payload)
            assert response.status_code == 200
            data = response.json()
            assert data["order_number"] is None
            assert data["tracking_number"] is None
            assert data["extraction_status"] == "NOT_FOUND"
