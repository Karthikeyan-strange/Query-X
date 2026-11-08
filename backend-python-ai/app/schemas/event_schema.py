"""
Pydantic Schemas for Regional Event Correlation & Geo-Spatial Impact Analysis.
"""

from enum import Enum
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class RegionalEventType(str, Enum):
    """Regional disruption event categories matching the database schema."""
    WEATHER = "WEATHER"
    FLOOD = "FLOOD"
    CYCLONE = "CYCLONE"
    ROAD_CLOSURE = "ROAD_CLOSURE"
    TRANSPORT_STRIKE = "TRANSPORT_STRIKE"
    POLITICAL_DISTURBANCE = "POLITICAL_DISTURBANCE"
    LANDSLIDE = "LANDSLIDE"
    OTHER = "OTHER"


class EventSeverity(str, Enum):
    """Severity classification of regional events."""
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class ImpactStatus(str, Enum):
    """Categorized degree of potential impact on the delivery route."""
    HIGH_PROBABILITY_IMPACT = "HIGH_PROBABILITY_IMPACT"
    POSSIBLE_IMPACT = "POSSIBLE_IMPACT"
    MINIMAL_IMPACT = "MINIMAL_IMPACT"
    NO_IMPACT = "NO_IMPACT"


class ShipmentLocationInput(BaseModel):
    """Shipment point-in-time coordinates and checkpoint timestamp."""
    latitude: Optional[float] = Field(None, description="Shipment checkpoint latitude")
    longitude: Optional[float] = Field(None, description="Shipment checkpoint longitude")
    event_time: Optional[datetime] = Field(None, description="Timestamp of the shipment checkpoint or delay")
    location_name: Optional[str] = Field(None, description="Optional name of the shipment checkpoint city/hub")


class RegionalEventInput(BaseModel):
    """Regional event information supplied by Spring Boot."""
    event_id: str = Field(..., description="Unique event identifier or UUID")
    event_type: RegionalEventType = Field(..., description="Type of regional event")
    title: Optional[str] = Field(None, description="Brief event title or headline")
    location_name: Optional[str] = Field(None, description="City or district where the event occurred")
    latitude: Optional[float] = Field(None, description="Event center latitude")
    longitude: Optional[float] = Field(None, description="Event center longitude")
    affected_radius_km: float = Field(..., gt=0.0, description="Radius in kilometers affected by the event")
    severity: EventSeverity = Field(default=EventSeverity.MEDIUM, description="Event severity rating")
    start_time: datetime = Field(..., description="Event start timestamp")
    end_time: Optional[datetime] = Field(None, description="Event end timestamp (null if ongoing)")


class CorrelatedEventResult(BaseModel):
    """Detailed correlation finding for a single regional event."""
    event_id: str = Field(..., description="Referenced event identifier")
    event_type: RegionalEventType = Field(..., description="Type of the regional disruption")
    distance_km: Optional[float] = Field(None, description="Distance from shipment point to event center in km")
    inside_radius: bool = Field(..., description="True if distance <= affected_radius_km")
    time_overlap: bool = Field(..., description="True if shipment timestamp falls within event active window")
    relevance_score: float = Field(..., ge=0.0, le=1.0, description="Computed relevance score (0.0 to 1.0)")
    impact_status: ImpactStatus = Field(..., description="Inferred impact classification")
    reasoning: str = Field(..., description="Explainable factual breakdown of how the correlation was determined")


class EventCorrelationRequest(BaseModel):
    """Request payload to correlate shipment status with nearby regional events."""
    shipment: ShipmentLocationInput = Field(..., description="Shipment checkpoint location and time")
    regional_events: List[RegionalEventInput] = Field(
        default_factory=list,
        description="List of active or historical regional events to evaluate"
    )


class EventCorrelationResponse(BaseModel):
    """Response containing evaluated correlation findings sorted by relevance score descending."""
    shipment_evaluated: ShipmentLocationInput
    total_events_evaluated: int
    correlated_events: List[CorrelatedEventResult]
    top_correlated_event: Optional[CorrelatedEventResult] = None
