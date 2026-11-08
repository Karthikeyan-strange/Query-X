"""
Unit and Integration Tests for Complaint Classification & Urgency Detection (Module 1).
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.schemas.complaint_schema import ComplaintType, UrgencyLevel
from app.services.classification_service import classification_service


class TestClassificationService:
    """Direct unit tests on ClassificationService."""

    def test_classify_delivery_delay(self):
        subject = "My order has not been delivered"
        text = "My order QX-2024-00001 is delayed. I have not received it yet and still waiting."
        res = classification_service.classify(subject, text)
        assert res.complaint_type == ComplaintType.DELIVERY_DELAY
        assert res.confidence_score >= 0.70
        assert "delayed" in res.matched_signals or "not delivered yet" in res.matched_signals

    def test_classify_damaged_goods(self):
        subject = "Package received in broken condition"
        text = "The parcel arrived today but the box was smashed and the internal item is broken and cracked."
        res = classification_service.classify(subject, text)
        assert res.complaint_type == ComplaintType.DAMAGED_GOODS
        assert res.urgency in [UrgencyLevel.HIGH, UrgencyLevel.CRITICAL]
        assert "broken" in res.matched_signals or "smashed" in res.matched_signals

    def test_classify_missing_package(self):
        subject = "Where is my parcel?"
        text = "The courier app says marked delivered but not received. My package is missing and never arrived."
        res = classification_service.classify(subject, text)
        assert res.complaint_type == ComplaintType.MISSING_PACKAGE
        assert res.urgency == UrgencyLevel.HIGH

    def test_classify_wrong_delivery(self):
        subject = "Incorrect parcel delivered"
        text = "I received a wrong item delivered to my doorstep. This is completely not what I ordered."
        res = classification_service.classify(subject, text)
        assert res.complaint_type == ComplaintType.WRONG_DELIVERY

    def test_classify_tracking_not_updated(self):
        subject = "Tracking stuck for 3 days"
        text = "There has been no update on my parcel. Tracking stuck at sorting facility and has not moved."
        res = classification_service.classify(subject, text)
        assert res.complaint_type == ComplaintType.DELIVERY_NOT_UPDATED

    def test_classify_critical_urgency_medical(self):
        subject = "URGENT: Life saving medicine package delayed"
        text = "This shipment contains critical medical supplies for emergency hospital surgery. Need it immediately!"
        res = classification_service.classify(subject, text)
        assert res.urgency == UrgencyLevel.CRITICAL
        assert "medical" in res.urgency_signals or "emergency" in res.urgency_signals

    def test_classify_ambiguous_defaults_to_other(self):
        subject = "General question"
        text = "Can you please tell me your business operating hours on Saturdays?"
        res = classification_service.classify(subject, text)
        assert res.complaint_type == ComplaintType.OTHER
        assert res.urgency == UrgencyLevel.LOW
        assert res.confidence_score == 0.50


class TestClassificationAPI:
    """Integration tests on /api/ai/classify-complaint endpoint."""

    @pytest.mark.asyncio
    async def test_api_classify_endpoint_success(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            payload = {
                "email_subject": "My order has not been delivered",
                "complaint_text": "My order QX-2024-00001 is delayed. I have not received it yet."
            }
            response = await client.post("/api/ai/classify-complaint", json=payload)
            assert response.status_code == 200
            data = response.json()
            assert data["complaint_type"] == "DELIVERY_DELAY"
            assert "urgency" in data
            assert data["confidence_score"] > 0.6
            assert isinstance(data["matched_signals"], list)

    @pytest.mark.asyncio
    async def test_api_classify_validation_error(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Missing complaint_text
            payload = {
                "email_subject": "Incomplete complaint"
            }
            response = await client.post("/api/ai/classify-complaint", json=payload)
            assert response.status_code == 422
