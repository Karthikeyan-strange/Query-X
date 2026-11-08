"""
Unit and Integration Tests for Customer Response Generation (Module 5).
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.schemas.complaint_schema import ComplaintType
from app.schemas.investigation_schema import PossibleCause
from app.schemas.response_schema import (
    ResponseTone,
    CustomerResponseRequest
)
from app.services.response_service import response_service


class TestResponseService:
    """Direct unit tests on ResponseService."""

    def test_generate_regional_disruption_response(self):
        req = CustomerResponseRequest(
            customer_name="Karthik Rajan",
            order_number="QX-2024-00001",
            tracking_number="QXT-CH-20240301-001",
            complaint_type=ComplaintType.DELIVERY_DELAY,
            possible_cause=PossibleCause.POSSIBLE_REGIONAL_DISRUPTION,
            investigation_summary="Shipment held up at Trichy due to regional flash floods.",
            recommended_action="Verify road clearance and notify customer.",
            carrier_name="ExpressLogistics",
            disruption_event_type="FLOOD",
            disruption_location="Trichy"
        )

        draft = response_service.generate_response(req)
        assert "QX-2024-00001" in draft.email_subject
        assert "Dear Karthik Rajan" in draft.response_text
        assert "Trichy" in draft.response_text
        assert "FLOOD" in draft.response_text
        assert draft.tone == ResponseTone.PROFESSIONAL_EMPATHETIC
        assert len(draft.key_points_addressed) >= 2

    def test_generate_damaged_goods_response(self):
        req = CustomerResponseRequest(
            customer_name="Meenakshi Sundaram",
            order_number="QX-2024-00002",
            tracking_number="QXT-CB-20240305-001",
            complaint_type=ComplaintType.DAMAGED_GOODS,
            possible_cause=PossibleCause.PACKAGE_DAMAGED_IN_TRANSIT,
            investigation_summary="Parcel arrived broken.",
            recommended_action="Offer replacement or full refund."
        )

        draft = response_service.generate_response(req)
        assert "QX-2024-00002" in draft.email_subject
        assert "Priority Replacement" in draft.response_text
        assert "Immediate Full Refund" in draft.response_text
        assert draft.tone == ResponseTone.URGENT_APOLOGETIC

    def test_generate_missing_package_response(self):
        req = CustomerResponseRequest(
            customer_name="Ravi Kumar",
            order_number="QX-2024-00003",
            tracking_number="QXT-CH-20240308-005",
            complaint_type=ComplaintType.MISSING_PACKAGE,
            possible_cause=PossibleCause.PACKAGE_LOST_OR_UNTRACEABLE,
            investigation_summary="Package marked delivered but not received.",
            recommended_action="Obtain POD and field coordinates."
        )

        draft = response_service.generate_response(req)
        assert "Proof of Delivery" in draft.response_text
        assert draft.tone == ResponseTone.URGENT_APOLOGETIC


class TestResponseAPI:
    """Integration test for /api/ai/generate-response endpoint."""

    @pytest.mark.asyncio
    async def test_api_generate_response_endpoint(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            payload = {
                "customer_name": "Karthik Rajan",
                "order_number": "QX-2024-00001",
                "tracking_number": "QXT-CH-20240301-001",
                "complaint_type": "DELIVERY_DELAY",
                "possible_cause": "POSSIBLE_REGIONAL_DISRUPTION",
                "investigation_summary": "Shipment delayed near Trichy due to flood.",
                "recommended_action": "Prioritize dispatch and update delivery ETA.",
                "carrier_name": "ExpressLogistics",
                "disruption_event_type": "FLOOD",
                "disruption_location": "Trichy"
            }
            response = await client.post("/api/ai/generate-response", json=payload)
            assert response.status_code == 200
            data = response.json()
            assert "QX-2024-00001" in data["email_subject"]
            assert "Dear Karthik Rajan" in data["response_text"]
            assert data["tone"] == "PROFESSIONAL_EMPATHETIC"
            assert isinstance(data["key_points_addressed"], list)
