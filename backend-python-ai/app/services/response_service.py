"""
Customer Response Generation Service.
Generates empathetic, professionally drafted customer responses grounded
strictly in investigation findings and logistics facts.
"""

from typing import List
from app.schemas.complaint_schema import ComplaintType
from app.schemas.investigation_schema import PossibleCause
from app.schemas.response_schema import (
    ResponseTone,
    CustomerResponseRequest,
    CustomerResponseDraft
)
from app.prompts.response_prompt import RESPONSE_TEMPLATES


class ResponseService:
    """
    Generates structured, professional email response drafts for support agents.
    """

    def generate_response(self, request: CustomerResponseRequest) -> CustomerResponseDraft:
        """
        Selects an appropriate response framework based on root cause, applies personalized
        parameters, and verifies key points addressed.
        """
        cust_name = request.customer_name or "Valued Customer"
        order_num = request.order_number or "your order"
        tracking_num = request.tracking_number or "your shipment"
        carrier = request.carrier_name or "our logistics courier partner"
        disruption_event = request.disruption_event_type or "regional weather"
        disruption_loc = request.disruption_location or "the transit"

        key_points: List[str] = []

        if request.possible_cause in [
            PossibleCause.POSSIBLE_REGIONAL_DISRUPTION,
            PossibleCause.REGIONAL_DISRUPTION_CONFIRMED
        ]:
            subject = f"Delivery Update: QueryX Order {order_num} - Regional Route Update"
            template = RESPONSE_TEMPLATES["REGIONAL_DISRUPTION"]
            response_text = template.format(
                customer_name=cust_name,
                order_number=order_num,
                tracking_number=tracking_num,
                location_name=disruption_loc,
                event_type=disruption_event
            )
            key_points = [
                f"Acknowledged delivery delay for order {order_num}",
                f"Explained {disruption_event} conditions affecting transit through {disruption_loc}",
                "Outlined priority dispatch actions and automated notification protocol"
            ]
            tone = ResponseTone.PROFESSIONAL_EMPATHETIC

        elif request.possible_cause == PossibleCause.PACKAGE_DAMAGED_IN_TRANSIT:
            subject = f"QueryX Resolution: Your Order {order_num} - Immediate Assistance"
            template = RESPONSE_TEMPLATES["DAMAGED_GOODS"]
            response_text = template.format(
                customer_name=cust_name,
                order_number=order_num,
                tracking_number=tracking_num,
                carrier_name=carrier
            )
            key_points = [
                f"Apologized for damaged condition of package {tracking_num}",
                "Confirmed damage inquiry logged with carrier",
                "Offered choice between priority replacement or 100% full refund"
            ]
            tone = ResponseTone.URGENT_APOLOGETIC

        elif request.possible_cause == PossibleCause.PACKAGE_LOST_OR_UNTRACEABLE:
            subject = f"Urgent Update: QueryX Order {order_num} Status Review"
            template = RESPONSE_TEMPLATES["MISSING_PACKAGE"]
            response_text = template.format(
                customer_name=cust_name,
                order_number=order_num,
                tracking_number=tracking_num
            )
            key_points = [
                f"Confirmed physical audit underway at destination station for {tracking_num}",
                "Committed to 24-hour resolution with refund/replacement guarantee"
            ]
            tone = ResponseTone.URGENT_APOLOGETIC

        elif request.possible_cause == PossibleCause.CARRIER_TRANSIT_DELAY:
            subject = f"QueryX Delivery Update: Order {order_num}"
            template = RESPONSE_TEMPLATES["CARRIER_DELAY"]
            response_text = template.format(
                customer_name=cust_name,
                order_number=order_num,
                tracking_number=tracking_num,
                carrier_name=carrier
            )
            key_points = [
                f"Clarified carrier transit status with partner {carrier}",
                "Notified carrier dispatch to expedite movement and provide doorstep handover"
            ]
            tone = ResponseTone.PROFESSIONAL_EMPATHETIC

        else:
            subject = f"QueryX Support: Regarding Your Order {order_num}"
            template = RESPONSE_TEMPLATES["GENERAL_INQUIRY"]
            response_text = template.format(
                customer_name=cust_name,
                order_number=order_num,
                investigation_summary=request.investigation_summary,
                recommended_action=request.recommended_action
            )
            key_points = [
                f"Provided investigation summary for order {order_num}",
                f"Outlined recommended action steps: {request.recommended_action}"
            ]
            tone = ResponseTone.FORMAL

        return CustomerResponseDraft(
            email_subject=subject,
            response_text=response_text,
            tone=tone,
            key_points_addressed=key_points
        )


# Singleton instance for dependency injection
response_service = ResponseService()
