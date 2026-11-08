"""
AI Investigation Engine Service.
Synthesizes complaint classification, shipment telemetry, chronological checkpoints,
and correlated regional disruptions into verifiable findings and operational recommendations.
"""

from typing import List, Optional
from datetime import datetime
from app.schemas.complaint_schema import ComplaintType, UrgencyLevel
from app.schemas.event_schema import (
    ShipmentLocationInput,
    ImpactStatus,
    CorrelatedEventResult
)
from app.schemas.investigation_schema import (
    PossibleCause,
    InvestigationRequest,
    InvestigationResponse
)
from app.services.classification_service import classification_service
from app.services.event_correlation_service import event_correlation_service


class InvestigationService:
    """
    Synthesizes delivery exception facts and regional intelligence into explainable investigation dossiers.
    """

    def investigate(self, request: InvestigationRequest) -> InvestigationResponse:
        """
        Executes end-to-end investigation workflow:
        1. Classifies complaint language and urgency.
        2. Gathers empirical facts from order, shipment, and checkpoints.
        3. Correlates shipment delay with regional events.
        4. Synthesizes verified facts vs inferred conclusions.
        5. Formulates actionable logistics recommendations.
        """
        # 1. Classify complaint
        classification = classification_service.classify(
            email_subject=request.email_subject,
            complaint_text=request.complaint_text
        )

        verified_facts: List[str] = []
        inferred_conclusions: List[str] = []
        supporting_evidence: List[str] = []

        # 2. Check for missing shipment or order context
        if not request.shipment:
            verified_facts.append("No active shipment record was supplied or linked to this investigation.")
            return InvestigationResponse(
                complaint_type=classification.complaint_type,
                urgency=classification.urgency,
                investigation_summary=(
                    "Investigation is pending carrier information. The complaint mentions delivery concerns, "
                    "but no confirmed shipment or tracking record could be verified in the system."
                ),
                possible_cause=PossibleCause.INSUFFICIENT_DATA,
                supporting_evidence=["Missing shipment tracking telemetry."],
                verified_facts=verified_facts,
                inferred_conclusions=["Order or tracking number may be invalid, pending creation, or missing from database."],
                confidence_score=0.40,
                recommended_action="Contact customer to verify valid order number and confirm order fulfillment status.",
                correlated_disruption=None
            )

        shipment = request.shipment
        verified_facts.append(f"Shipment {shipment.tracking_number} current status is '{shipment.status}'.")

        if shipment.carrier_name:
            verified_facts.append(f"Assigned carrier is {shipment.carrier_name}.")
        if shipment.origin_hub and shipment.destination_hub:
            verified_facts.append(f"Shipment transit lane: {shipment.origin_hub} -> {shipment.destination_hub}.")

        # 3. Check chronological tracking events
        last_checkpoint = request.tracking_events[-1] if request.tracking_events else None
        if last_checkpoint:
            checkpoint_desc = (
                f"Last recorded scan at '{last_checkpoint.location_name or 'Transit Hub'}' "
                f"with status '{last_checkpoint.event_type}' at {last_checkpoint.event_time.strftime('%Y-%m-%d %H:%M')}."
            )
            verified_facts.append(checkpoint_desc)

        # 4. Correlate regional events
        # Determine shipment coordinates to test: prefer last checkpoint coordinates if available, else shipment current
        eval_lat = (last_checkpoint.latitude if last_checkpoint and last_checkpoint.latitude is not None
                    else shipment.current_latitude)
        eval_lon = (last_checkpoint.longitude if last_checkpoint and last_checkpoint.longitude is not None
                    else shipment.current_longitude)
        eval_time = (last_checkpoint.event_time if last_checkpoint
                     else shipment.last_checkpoint_time or datetime.now())
        eval_loc_name = (last_checkpoint.location_name if last_checkpoint
                         else shipment.destination_hub or shipment.origin_hub)

        shipment_loc = ShipmentLocationInput(
            latitude=eval_lat,
            longitude=eval_lon,
            event_time=eval_time,
            location_name=eval_loc_name
        )

        top_correlated: Optional[CorrelatedEventResult] = None
        if request.regional_events:
            correlation_resp = event_correlation_service.correlate_events(
                shipment=shipment_loc,
                regional_events=request.regional_events
            )
            top_correlated = correlation_resp.top_correlated_event

        # 5. Synthesize root cause and evidence
        possible_cause = PossibleCause.OTHER
        summary = ""
        action = ""
        confidence = 0.70

        # Case A: Strong regional disruption detected
        if top_correlated and top_correlated.relevance_score >= 0.70:
            possible_cause = PossibleCause.POSSIBLE_REGIONAL_DISRUPTION
            confidence = round(min(0.95, 0.75 + (top_correlated.relevance_score * 0.15)), 2)

            evidence_str = (
                f"Shipment was scanned near {eval_loc_name or 'route'} during active "
                f"{top_correlated.event_type.value} incident ({top_correlated.distance_km} km distance, "
                f"relevance {top_correlated.relevance_score})."
            )
            supporting_evidence.append(f"Shipment status is {shipment.status}.")
            supporting_evidence.append(evidence_str)

            inferred_conclusions.append(
                f"Shipment transit delay is likely attributable to local {top_correlated.event_type.value} conditions "
                f"affecting surface transport corridors."
            )

            summary = (
                f"The shipment {shipment.tracking_number} experienced an in-transit delay. "
                f"A verified regional disruption ({top_correlated.event_type.value}) was identified "
                f"overlapping the shipment location and checkpoint timeline. "
                f"Local ground transport delays were reported in the affected perimeter."
            )

            action = (
                f"Notify courier dispatch ({shipment.carrier_name or 'carrier'}) to verify route clearance around "
                f"{eval_loc_name or 'the affected hub'} and transmit an updated delivery ETA to the customer."
            )

        # Case B: Damaged goods complaint
        elif classification.complaint_type == ComplaintType.DAMAGED_GOODS:
            possible_cause = PossibleCause.PACKAGE_DAMAGED_IN_TRANSIT
            confidence = 0.85
            supporting_evidence.append(f"Customer reported damaged package condition.")
            supporting_evidence.append(f"Last recorded scan was at {eval_loc_name or 'hub'}.")
            inferred_conclusions.append("Package physical integrity compromised during transit handling.")
            summary = (
                f"The customer reported that parcel {shipment.tracking_number} arrived in damaged condition. "
                f"Physical package integrity was compromised during carrier transit."
            )
            action = (
                "Initiate courier damage inspection protocol, request photo evidence from customer, "
                "and approve expedited free replacement or full refund."
            )

        # Case C: Wrong delivery complaint
        elif classification.complaint_type == ComplaintType.WRONG_DELIVERY:
            possible_cause = PossibleCause.WRONG_DELIVERY_ADDRESS
            confidence = 0.82
            supporting_evidence.append("Customer reports recipient or parcel mismatch.")
            inferred_conclusions.append("Misrouting or parcel label swap occurred at final distribution hub.")
            summary = (
                f"Customer reported receiving an incorrect parcel or delivery to wrong address for {shipment.tracking_number}."
            )
            action = "Escalate to last-mile delivery executive to retrieve incorrect parcel and re-route correct order."

        # Case D: Missing package
        elif classification.complaint_type == ComplaintType.MISSING_PACKAGE:
            possible_cause = PossibleCause.PACKAGE_LOST_OR_UNTRACEABLE
            confidence = 0.80
            supporting_evidence.append(f"Customer reports package marked delivered or untraceable.")
            inferred_conclusions.append("Courier scanning discrepancy or misplacement at destination hub.")
            summary = (
                f"Shipment {shipment.tracking_number} is reported missing or unreceived by customer."
            )
            action = "Request courier proof-of-delivery (POD) signature and verify delivery coordinates with field driver."

        # Case E: Standard carrier delay (no regional disruption found)
        elif shipment.status in ["DELAYED", "IN_TRANSIT"] or classification.complaint_type == ComplaintType.DELIVERY_DELAY:
            possible_cause = PossibleCause.CARRIER_TRANSIT_DELAY
            confidence = 0.75
            supporting_evidence.append(f"Shipment status is '{shipment.status}'.")
            if last_checkpoint:
                supporting_evidence.append(f"Shipment held at {last_checkpoint.location_name or 'transit hub'}.")
            inferred_conclusions.append("Delay appears operational or carrier backlog without external weather cause.")
            summary = (
                f"Shipment {shipment.tracking_number} is delayed in transit. "
                f"No major environmental disruptions were correlated along the route."
            )
            action = f"Contact {shipment.carrier_name or 'the carrier'} to prioritize movement out of {eval_loc_name or 'current hub'}."

        else:
            possible_cause = PossibleCause.OPERATIONAL_BACKLOG
            confidence = 0.65
            supporting_evidence.append(f"Shipment status: {shipment.status}")
            summary = f"Shipment {shipment.tracking_number} status review completed. Operational backlog observed."
            action = "Monitor next checkpoint scan and update customer within 24 hours."

        return InvestigationResponse(
            complaint_type=classification.complaint_type,
            urgency=classification.urgency,
            investigation_summary=summary,
            possible_cause=possible_cause,
            supporting_evidence=supporting_evidence,
            verified_facts=verified_facts,
            inferred_conclusions=inferred_conclusions,
            confidence_score=confidence,
            recommended_action=action,
            correlated_disruption=top_correlated
        )


# Singleton instance for dependency injection
investigation_service = InvestigationService()
