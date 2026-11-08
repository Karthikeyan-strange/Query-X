"""
Pydantic Schemas for Order and Tracking Number Extraction.
"""

from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


class ExtractionStatus(str, Enum):
    """Status indicating identifier extraction outcome."""
    SUCCESS = "SUCCESS"
    PARTIAL = "PARTIAL"
    NOT_FOUND = "NOT_FOUND"


class OrderExtractionRequest(BaseModel):
    """Request payload for extracting order or tracking numbers from unstructured text."""
    complaint_text: str = Field(
        ...,
        description="Customer complaint or email text containing possible order/tracking identifiers",
        examples=["My order QX-2024-00001 has not arrived. Please check tracking number QXT-CH-20240301-001."]
    )


class OrderExtractionResponse(BaseModel):
    """Structured response containing extracted identifiers."""
    order_number: Optional[str] = Field(
        None,
        description="Extracted canonical order number (e.g. QX-2024-00001), or null if not found"
    )
    tracking_number: Optional[str] = Field(
        None,
        description="Extracted canonical shipment tracking number (e.g. QXT-CH-20240301-001), or null if not found"
    )
    extraction_status: ExtractionStatus = Field(
        ...,
        description="SUCCESS if both found, PARTIAL if one found, NOT_FOUND if neither found"
    )
    raw_candidates: List[str] = Field(
        default_factory=list,
        description="All identifier candidates matched during regex scanning"
    )
