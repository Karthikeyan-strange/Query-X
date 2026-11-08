"""
Pydantic Schemas for AI Investigation Engine.
"""

from enum import Enum
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.complaint_schema import ComplaintType, UrgencyLevel
from app.schemas.event_schema import RegionalEventInput, CorrelatedEventResult


class PossibleCause(str, Enum):
    """Categorized root causes derived by the AI investigation reasoning engine."""
    REGIONAL_DISRUPTION_CONFIRMED = "REGIONAL_DISRUPTION_CONFIRMED"
    POSSIBLE_REGIONAL_DISRUPTION = "POSSIBLE_REGIONAL_DISRUPTION"
    CARRIER_TRANSIT_DELAY = "CARRIER_TRANSIT_DELAY"
    PACKAGE_DAMAGED_IN_TRANSIT = "PACKAGE_DAMAGED_IN_TRANSIT"
    PACKAGE_LOST_OR_UNTRACEABLE = "PACKAGE_LOST_OR_UNTRACEABLE"
    WRONG_DELIVERY_ADDRESS = "WRONG_DELIVERY_ADDRESS"
    OPERATIONAL_BACKLOG = "OPERATIONAL_BACKLOG"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"
    OTHER = "OTHER"


class TrackingCheckpoint(BaseModel):
    """Checkpoint entry from shipment tracking history."""
    event_time: datetime
    location_name: Optional[str] = None
    event_type: str  # e.g. PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELAYED, EXCEPTION, DELIVERED
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ShipmentContext(BaseModel):
    """Shipment domain data passed from Spring Boot."""
    shipment_id: Optional[str] = None
    tracking_number: str
    status: str  # PENDING, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, DELAYED, EXCEPTION, CANCELLED
    carrier_name: Optional[str] = None
    origin_hub: Optional[str] = None
    destination_hub: Optional[str] = None
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    last_checkpoint_time: Optional[datetime] = None


class OrderContext(BaseModel):
    """Order domain data passed from Spring Boot."""
    order_number: str
    customer_name: Optional[str] = None
    order_status: Optional[str] = None
    promised_delivery_date: Optional[datetime] = None


class InvestigationRequest(BaseModel):
    """Complete payload for AI investigation analysis."""
    email_subject: str = Field(..., description="Subject line of complaint")
    complaint_text: str = Field(..., description="Full text of complaint")
    order: Optional[OrderContext] = Field(None, description="Order details if identified")
    shipment: Optional[ShipmentContext] = Field(None, description="Shipment tracking details if identified")
    tracking_events: List[TrackingCheckpoint] = Field(
        default_factory=list,
        description="Chronological tracking checkpoint events"
    )
    regional_events: List[RegionalEventInput] = Field(
        default_factory=list,
        description="Regional events near the shipment route"
    )


class InvestigationResponse(BaseModel):
    """Synthesized investigation findings, evidence, and recommendations."""
    complaint_type: ComplaintType
    urgency: UrgencyLevel
    investigation_summary: str = Field(..., description="Cohesive human-readable investigation summary")
    possible_cause: PossibleCause = Field(..., description="Primary identified exception root cause")
    supporting_evidence: List[str] = Field(
        default_factory=list,
        description="Grounded, verifiable factual evidence points extracted from shipment and event data"
    )
    verified_facts: List[str] = Field(
        default_factory=list,
        description="Empirical, un-inferred facts (timestamps, status codes, coordinates)"
    )
    inferred_conclusions: List[str] = Field(
        default_factory=list,
        description="Reasoned inferences drawn by correlating tracking disruptions with external factors"
    )
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Overall investigation confidence score")
    recommended_action: str = Field(..., description="Actionable recommendation for logistics support agent")
    correlated_disruption: Optional[CorrelatedEventResult] = Field(
        None,
        description="Highest correlated regional event if applicable"
    )
