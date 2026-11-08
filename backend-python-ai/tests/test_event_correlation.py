"""
Unit and Integration Tests for Regional Event Correlation & Geo-Spatial Impact (Module 3).
"""

from datetime import datetime
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.utils.geo_utils import calculate_haversine_distance
from app.schemas.event_schema import (
    RegionalEventType,
    EventSeverity,
    ImpactStatus,
    ShipmentLocationInput,
    RegionalEventInput
)
from app.services.event_correlation_service import event_correlation_service


class TestGeoUtils:
    """Tests for Haversine distance formula."""

    def test_haversine_same_point(self):
        dist = calculate_haversine_distance(13.0827, 80.2707, 13.0827, 80.2707)
        assert dist == 0.0

    def test_haversine_chennai_to_trichy(self):
        # Chennai: 13.0827, 80.2707; Trichy: 10.7905, 78.7047 (~300 - 325 km)
        dist = calculate_haversine_distance(13.0827, 80.2707, 10.7905, 78.7047)
        assert dist is not None
        assert 300.0 < dist < 330.0

    def test_haversine_missing_coords(self):
        assert calculate_haversine_distance(None, 80.0, 13.0, 80.0) is None
        assert calculate_haversine_distance(13.0, None, 13.0, 80.0) is None


class TestEventCorrelationService:
    """Direct unit tests on EventCorrelationService."""

    def test_correlate_direct_hit_flood(self):
        # Shipment in Trichy delayed during flood
        shipment = ShipmentLocationInput(
            latitude=10.7905,
            longitude=78.7047,
            event_time=datetime(2026, 11, 7, 10, 0, 0),
            location_name="Trichy Hub"
        )
        event = RegionalEventInput(
            event_id="EVT-TRICHY-FLOOD",
            event_type=RegionalEventType.FLOOD,
            title="Severe Flash Floods in Trichy Riverbed",
            location_name="Tiruchirappalli",
            latitude=10.7950,
            longitude=78.7080,
            affected_radius_km=25.0,
            severity=EventSeverity.HIGH,
            start_time=datetime(2026, 11, 7, 6, 0, 0),
            end_time=datetime(2026, 11, 7, 20, 0, 0)
        )

        res = event_correlation_service.correlate_events(shipment, [event])
        assert res.total_events_evaluated == 1
        top = res.top_correlated_event
        assert top is not None
        assert top.inside_radius is True
        assert top.time_overlap is True
        assert top.relevance_score >= 0.75
        assert top.impact_status == ImpactStatus.HIGH_PROBABILITY_IMPACT
        assert "affected radius" in top.reasoning

    def test_correlate_outside_radius(self):
        # Shipment in Chennai, event in Coimbatore (~500 km away)
        shipment = ShipmentLocationInput(
            latitude=13.0827,
            longitude=80.2707,
            event_time=datetime(2026, 11, 7, 10, 0, 0),
            location_name="Chennai Hub"
        )
        event = RegionalEventInput(
            event_id="EVT-CBE-ROAD",
            event_type=RegionalEventType.ROAD_CLOSURE,
            title="Highway Maintenance",
            location_name="Coimbatore",
            latitude=11.0168,
            longitude=76.9558,
            affected_radius_km=15.0,
            severity=EventSeverity.LOW,
            start_time=datetime(2026, 11, 7, 6, 0, 0),
            end_time=datetime(2026, 11, 7, 20, 0, 0)
        )

        res = event_correlation_service.correlate_events(shipment, [event])
        top = res.top_correlated_event
        assert top is not None
        assert top.inside_radius is False
        assert top.distance_km > 400.0
        assert top.relevance_score < 0.30
        assert top.impact_status in [ImpactStatus.MINIMAL_IMPACT, ImpactStatus.NO_IMPACT]

    def test_correlate_outside_time_window(self):
        # Event happened 3 days before shipment arrived
        shipment = ShipmentLocationInput(
            latitude=10.7905,
            longitude=78.7047,
            event_time=datetime(2026, 11, 10, 10, 0, 0)
        )
        event = RegionalEventInput(
            event_id="EVT-PAST-WEATHER",
            event_type=RegionalEventType.WEATHER,
            title="Heavy Rain",
            latitude=10.7905,
            longitude=78.7047,
            affected_radius_km=20.0,
            severity=EventSeverity.MEDIUM,
            start_time=datetime(2026, 11, 5, 0, 0, 0),
            end_time=datetime(2026, 11, 6, 0, 0, 0)
        )

        res = event_correlation_service.correlate_events(shipment, [event])
        top = res.top_correlated_event
        assert top is not None
        assert top.inside_radius is True
        assert top.time_overlap is False
        assert top.relevance_score < 0.50


class TestEventCorrelationAPI:
    """Integration test for /api/ai/correlate-events endpoint."""

    @pytest.mark.asyncio
    async def test_api_correlate_endpoint(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            payload = {
                "shipment": {
                    "latitude": 13.0827,
                    "longitude": 80.2707,
                    "event_time": "2026-11-07T10:00:00"
                },
                "regional_events": [
                    {
                        "event_id": "event-001",
                        "event_type": "FLOOD",
                        "location_name": "Chennai Basin",
                        "latitude": 13.0900,
                        "longitude": 80.2800,
                        "affected_radius_km": 20.0,
                        "severity": "HIGH",
                        "start_time": "2026-11-07T08:00:00",
                        "end_time": "2026-11-07T18:00:00"
                    }
                ]
            }
            response = await client.post("/api/ai/correlate-events", json=payload)
            assert response.status_code == 200
            data = response.json()
            assert data["total_events_evaluated"] == 1
            assert len(data["correlated_events"]) == 1
            corr = data["correlated_events"][0]
            assert corr["event_id"] == "event-001"
            assert corr["inside_radius"] is True
            assert corr["time_overlap"] is True
            assert corr["relevance_score"] >= 0.70
