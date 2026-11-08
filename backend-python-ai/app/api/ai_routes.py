"""
QueryX AI Intelligence Routes.
Exposes stateless endpoints for complaint classification, extraction,
event correlation, investigation reasoning, and response generation.
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas.complaint_schema import (
    ComplaintClassifyRequest,
    ComplaintClassifyResponse
)
from app.schemas.extraction_schema import (
    OrderExtractionRequest,
    OrderExtractionResponse
)
from app.schemas.event_schema import (
    EventCorrelationRequest,
    EventCorrelationResponse
)
from app.schemas.investigation_schema import (
    InvestigationRequest,
    InvestigationResponse
)
from app.schemas.response_schema import (
    CustomerResponseRequest,
    CustomerResponseDraft
)
from app.services.classification_service import classification_service
from app.services.extraction_service import extraction_service
from app.services.event_correlation_service import event_correlation_service
from app.services.investigation_service import investigation_service
from app.services.response_service import response_service

router = APIRouter(
    prefix="/api/ai",
    tags=["AI Intelligence Services"]
)


@router.post(
    "/classify-complaint",
    response_model=ComplaintClassifyResponse,
    status_code=status.HTTP_200_OK,
    summary="Classify Complaint & Detect Urgency",
    description=(
        "Analyzes email subject and complaint body text to classify the delivery exception "
        "type (e.g. DELIVERY_DELAY, DAMAGED_GOODS, MISSING_PACKAGE) and gauge customer urgency."
    )
)
async def classify_complaint(request: ComplaintClassifyRequest) -> ComplaintClassifyResponse:
    """
    Classifies a customer complaint text and detects urgency level.
    """
    try:
        return classification_service.classify(
            email_subject=request.email_subject,
            complaint_text=request.complaint_text
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Classification processing failed: {str(exc)}"
        )


@router.post(
    "/extract-order",
    response_model=OrderExtractionResponse,
    status_code=status.HTTP_200_OK,
    summary="Extract Order & Tracking Numbers",
    description=(
        "Scans unstructured complaint text to detect, normalize, and extract valid "
        "QueryX Order numbers (e.g. QX-2024-00001) and Tracking IDs (e.g. QXT-CH-20240301-001)."
    )
)
async def extract_order_identifiers(request: OrderExtractionRequest) -> OrderExtractionResponse:
    """
    Extracts canonical order and tracking numbers from customer text.
    """
    try:
        return extraction_service.extract(text=request.complaint_text)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Identifier extraction failed: {str(exc)}"
        )


@router.post(
    "/correlate-events",
    response_model=EventCorrelationResponse,
    status_code=status.HTTP_200_OK,
    summary="Correlate Regional Events with Shipment",
    description=(
        "Evaluates shipment checkpoint location and timestamp against active or past regional events "
        "using Haversine spherical distance, radius coverage, time window overlap, and severity weighting."
    )
)
async def correlate_regional_events(request: EventCorrelationRequest) -> EventCorrelationResponse:
    """
    Correlates shipment tracking state with regional events.
    """
    try:
        return event_correlation_service.correlate_events(
            shipment=request.shipment,
            regional_events=request.regional_events
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Regional event correlation failed: {str(exc)}"
        )


@router.post(
    "/investigate",
    response_model=InvestigationResponse,
    status_code=status.HTTP_200_OK,
    summary="Run AI Delivery Exception Investigation",
    description=(
        "Synthesizes complaint classification, shipment status, checkpoint timeline, "
        "and regional disruption correlation into a comprehensive investigation dossier "
        "with verified facts, inferred root cause, and actionable recommendations."
    )
)
async def run_investigation(request: InvestigationRequest) -> InvestigationResponse:
    """
    Executes AI investigation reasoning for a delivery exception.
    """
    try:
        return investigation_service.investigate(request=request)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Investigation reasoning failed: {str(exc)}"
        )


@router.post(
    "/generate-response",
    response_model=CustomerResponseDraft,
    status_code=status.HTTP_200_OK,
    summary="Generate Professional Customer Response Draft",
    description=(
        "Drafts an empathetic, professional customer response email tailored to "
        "the investigation findings, root cause, and recommended logistics resolution."
    )
)
async def generate_customer_response(request: CustomerResponseRequest) -> CustomerResponseDraft:
    """
    Generates a customer response draft based on investigation findings.
    """
    try:
        return response_service.generate_response(request=request)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Response draft generation failed: {str(exc)}"
        )




