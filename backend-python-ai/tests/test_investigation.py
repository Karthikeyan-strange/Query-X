"""
Unit and Integration Tests for AI Investigation Engine (Module 4).
"""

from datetime import datetime
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.schemas.complaint_schema import ComplaintType
from app.schemas.event_schema import RegionalEventType, EventSeverity, RegionalEventInput
from app.schemas.investigation_schema import (
    PossibleCause,
    OrderContext,
    ShipmentContext,
    TrackingCheckpoint,
    InvestigationRequest
)
from app.services.investigation_service import investigation_service


class TestInvestigationService:
    """Direct unit tests on InvestigationService."""

    def test_investigate_flood_delayed_shipment(self):
        # Realistic QueryX sample data scenario: Order QX-2024-00001 delayed in Trichy due to floods
        request = InvestigationRequest(
            email_subject="My order has not been delivered - URGENT",
            complaint_text="My order QX-2024-00001 is delayed. It has been stuck at Trichy since yesterday.",
            order=OrderContext(
                order_number="QX-2024-00001",
                customer_name="Karthik Rajan",
                order_status="PROCESSING"
            ),
            shipment=ShipmentContext(
                shipment_id="sh-001",
                tracking_number="QXT-CH-20240301-001",
                status="DELAYED",
                carrier_name="ExpressLogistics",
                origin_hub="Chennai Central Hub",
                destination_hub="Madurai South Hub",
                current_latitude=10.7905,
                current_longitude=78.7047,
                last_checkpoint_time=datetime(2026, 11, 7, 10, 0, 0)
            ),
            tracking_events=[
                TrackingCheckpoint(
                    event_time=datetime(2026, 11, 6, 8, 0, 0),
                    location_name="Chennai Central Hub",
                    event_type="PICKED_UP",
                    latitude=13.0827,
                    longitude=80.2707
                ),
                TrackingCheckpoint(
                    event_time=datetime(2026, 11, 7, 10, 0, 0),
                    location_name="Trichy Transit Hub",
                    event_type="DELAYED",
                    description="Shipment held due to adverse road conditions",
                    latitude=10.7905,
                    longitude=78.7047
                )
            ],
            regional_events=[
                RegionalEventInput(
                    event_id="EVT-TRICHY-FLOOD",
                    event_type=RegionalEventType.FLOOD,
                    title="Flash Floods in Trichy Riverbed",
                    location_name="Tiruchirappalli",
                    latitude=10.7950,
                    longitude=78.7080,
                    affected_radius_km=25.0,
                    severity=EventSeverity.HIGH,
                    start_time=datetime(2026, 11, 7, 4, 0, 0),
                    end_time=datetime(2026, 11, 7, 22, 0, 0)
                )
            ]
        )

        res = investigation_service.investigate(request)
        assert res.complaint_type == ComplaintType.DELIVERY_DELAY
        assert res.possible_cause == PossibleCause.POSSIBLE_REGIONAL_DISRUPTION
        assert res.confidence_score >= 0.80
        assert len(res.verified_facts) >= 2
        assert len(res.supporting_evidence) >= 2
        assert res.correlated_disruption is not None
        assert res.correlated_disruption.inside_radius is True
        assert "FLOOD" in res.investigation_summary

    def test_investigate_damaged_goods_complaint(self):
        request = InvestigationRequest(
            email_subject="Package arrived broken",
            complaint_text="The parcel was delivered today but the box was smashed and the internal item is ruined.",
            shipment=ShipmentContext(
                tracking_number="QXT-CB-20240305-001",
                status="DELIVERED",
                carrier_name="SpeedFast",
                origin_hub="Coimbatore Hub",
                destination_hub="Salem Hub"
            )
        )

        res = investigation_service.investigate(request)
        assert res.complaint_type == ComplaintType.DAMAGED_GOODS
        assert res.possible_cause == PossibleCause.PACKAGE_DAMAGED_IN_TRANSIT
        assert "damage inspection" in res.recommended_action.lower()

    def test_investigate_missing_shipment_context(self):
        request = InvestigationRequest(
            email_subject="Where is my order?",
            complaint_text="I haven't received anything yet. Please check.",
            shipment=None
        )

        res = investigation_service.investigate(request)
        assert res.possible_cause == PossibleCause.INSUFFICIENT_DATA
        assert res.confidence_score <= 0.50
        assert "Contact customer" in res.recommended_action


class TestInvestigationAPI:
    """Integration test for /api/ai/investigate endpoint."""

    @pytest.mark.asyncio
    async def test_api_investigate_endpoint(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            payload = {
                "email_subject": "My order has not been delivered",
                "complaint_text": "My order QX-2024-00001 is delayed. I have not received it yet.",
                "shipment": {
                    "tracking_number": "QXT-CH-20240301-001",
                    "status": "DELAYED",
                    "carrier_name": "ExpressLogistics"
                },
                "tracking_events": [],
                "regional_events": []
            }
            response = await client.post("/api/ai/investigate", json=payload)
            assert response.status_code == 200
            data = response.json()
            assert data["complaint_type"] == "DELIVERY_DELAY"
            assert data["possible_cause"] == "CARRIER_TRANSIT_DELAY"
            assert isinstance(data["verified_facts"], list)
            assert isinstance(data["supporting_evidence"], list)
