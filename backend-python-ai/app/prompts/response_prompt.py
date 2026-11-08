"""
Prompt templates and dynamic formatting utilities for Customer Response Generation.
Designed to be compatible with rule-based templating and optional LLM/Transformers generation.
"""

RESPONSE_TEMPLATES = {
    "REGIONAL_DISRUPTION": (
        "Dear {customer_name},\n\n"
        "Thank you for contacting QueryX Support regarding your order {order_number}.\n\n"
        "We sincerely apologize for the delay you have experienced with shipment {tracking_number}. "
        "Our logistics team conducted an investigation into your delivery route and identified that transport in "
        "the {location_name} region has been impacted by {event_type} conditions.\n\n"
        "To ensure the safety of courier personnel and the integrity of your package, transit vehicles were temporarily "
        "held at the regional distribution facility. As road conditions improve, courier operations are resuming in phases.\n\n"
        "Current Action & Next Steps:\n"
        "• Our dispatch desk has prioritized shipment {tracking_number} for the earliest dispatch window.\n"
        "• You will receive an automated SMS and email notification with an updated delivery estimate as soon as the package departs the facility.\n\n"
        "We deeply value your patience and understanding. Please do not hesitate to reply to this email if you need any additional assistance.\n\n"
        "Warm regards,\n"
        "QueryX Logistics Support Team\n"
        "support@queryx.in"
    ),
    "CARRIER_DELAY": (
        "Dear {customer_name},\n\n"
        "Thank you for reaching out to QueryX Support regarding your order {order_number}.\n\n"
        "We apologize for the delay in the delivery of your shipment {tracking_number}. "
        "According to our latest checkpoint scan, your parcel is currently in transit through our partner network ({carrier_name}). "
        "An operational transit delay occurred during hub sorting, which held up the scheduled departure.\n\n"
        "Current Action & Next Steps:\n"
        "• We have flagged your consignment as priority with {carrier_name} to expedite movement to your local delivery hub.\n"
        "• A courier executive will contact you prior to delivery for seamless doorstep handover.\n\n"
        "Thank you for your patience as we work to deliver your order swiftly.\n\n"
        "Warm regards,\n"
        "QueryX Logistics Support Team\n"
        "support@queryx.in"
    ),
    "DAMAGED_GOODS": (
        "Dear {customer_name},\n\n"
        "Thank you for contacting QueryX Support. We are truly sorry to learn that your order {order_number} "
        "(Shipment: {tracking_number}) arrived in a damaged condition.\n\n"
        "This falls well short of our service standards. We have logged an official damage inquiry with our carrier {carrier_name}.\n\n"
        "Resolution Options Available Immediately:\n"
        "1. Priority Replacement: We can dispatch a brand new replacement order at zero cost with expedited shipping.\n"
        "2. Immediate Full Refund: We can process a 100% refund to your original payment method within 2-3 business days.\n\n"
        "Please reply to this email letting us know your preference, and if possible, kindly share a photo of the damaged package. "
        "Our team will handle your request within 2 business hours.\n\n"
        "Sincerely,\n"
        "QueryX Customer Care Team\n"
        "support@queryx.in"
    ),
    "MISSING_PACKAGE": (
        "Dear {customer_name},\n\n"
        "Thank you for contacting QueryX Support regarding your order {order_number}.\n\n"
        "We understand your concern regarding shipment {tracking_number}. We treat missing package reports with highest urgency "
        "and have initiated a direct physical audit at the destination delivery station.\n\n"
        "Next Steps:\n"
        "• We are obtaining the digital Proof of Delivery (POD) and field coordinates from the assigned delivery driver.\n"
        "• If the package is not located and delivered within 24 hours, we will immediately initiate a priority replacement or full refund.\n\n"
        "We will follow up with you today with the delivery audit outcome.\n\n"
        "Warm regards,\n"
        "QueryX Logistics Support Team\n"
        "support@queryx.in"
    ),
    "GENERAL_INQUIRY": (
        "Dear {customer_name},\n\n"
        "Thank you for contacting QueryX Support regarding order {order_number}.\n\n"
        "{investigation_summary}\n\n"
        "Next Steps:\n"
        "• {recommended_action}\n\n"
        "If you have further questions or need immediate updates, please reply directly to this email.\n\n"
        "Warm regards,\n"
        "QueryX Support Team\n"
        "support@queryx.in"
    )
}
