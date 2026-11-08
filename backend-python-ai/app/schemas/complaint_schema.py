"""
Pydantic Schemas for Complaint Classification & Urgency Detection.
"""

from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


class ComplaintType(str, Enum):
    """Categorized complaint categories matching the database & frontend specifications."""
    DELIVERY_DELAY = "DELIVERY_DELAY"
    DAMAGED_GOODS = "DAMAGED_GOODS"
    MISSING_PACKAGE = "MISSING_PACKAGE"
    WRONG_DELIVERY = "WRONG_DELIVERY"
    DELIVERY_NOT_UPDATED = "DELIVERY_NOT_UPDATED"
    OTHER = "OTHER"


class UrgencyLevel(str, Enum):
    """Urgency level detected from customer sentiment and language."""
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class ComplaintClassifyRequest(BaseModel):
    """Request payload for complaint classification."""
    email_subject: str = Field(
        ...,
        description="Subject line of the customer complaint email",
        examples=["My order has not been delivered"]
    )
    complaint_text: str = Field(
        ...,
        description="Full body or message of the customer complaint",
        examples=["My order QX-2024-00001 is delayed. I have not received it yet."]
    )


class ComplaintClassifyResponse(BaseModel):
    """Structured response from the complaint classification service."""
    complaint_type: ComplaintType = Field(
        ...,
        description="Classified complaint category"
    )
    urgency: UrgencyLevel = Field(
        ...,
        description="Assessed urgency level"
    )
    confidence_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score based on keyword evidence density (0.0 to 1.0)"
    )
    matched_signals: List[str] = Field(
        default_factory=list,
        description="List of detected keywords/signals that informed the classification"
    )
    urgency_signals: List[str] = Field(
        default_factory=list,
        description="Keywords indicating urgency (e.g., 'urgent', 'medical', 'immediate')"
    )
