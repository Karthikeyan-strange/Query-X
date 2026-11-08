"""
Pydantic Schemas for Customer Response Draft Generation.
"""

from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.complaint_schema import ComplaintType
from app.schemas.investigation_schema import PossibleCause


class ResponseTone(str, Enum):
    """Tone of voice applied in drafted customer communication."""
    PROFESSIONAL_EMPATHETIC = "PROFESSIONAL_EMPATHETIC"
    FORMAL = "FORMAL"
    URGENT_APOLOGETIC = "URGENT_APOLOGETIC"


class CustomerResponseRequest(BaseModel):
    """Payload to draft a professional customer response from investigation findings."""
    customer_name: Optional[str] = Field("Valued Customer", description="Customer full name")
    order_number: Optional[str] = Field("your order", description="Canonical order number")
    tracking_number: Optional[str] = Field("your shipment", description="Canonical tracking number")
    complaint_type: ComplaintType = Field(..., description="Classified complaint type")
    possible_cause: PossibleCause = Field(..., description="Root cause identified by investigation engine")
    investigation_summary: str = Field(..., description="Summary of investigation findings")
    recommended_action: str = Field(..., description="Actionable next steps formulated for support")
    carrier_name: Optional[str] = Field("our logistics courier partner", description="Assigned delivery carrier")
    disruption_event_type: Optional[str] = Field(None, description="Event type if regional disruption was identified")
    disruption_location: Optional[str] = Field(None, description="City/region affected by disruption")


class CustomerResponseDraft(BaseModel):
    """Structured customer communication draft ready for support agent review and dispatch."""
    email_subject: str = Field(..., description="Clear, professional email subject line")
    response_text: str = Field(..., description="Complete body text formatted in paragraphs")
    tone: ResponseTone = Field(default=ResponseTone.PROFESSIONAL_EMPATHETIC, description="Tone of the response")
    key_points_addressed: List[str] = Field(
        default_factory=list,
        description="Checklist of customer concerns and factual updates covered in the draft"
    )
