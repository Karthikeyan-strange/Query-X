"""
Order and Tracking Identifier Extraction Service.
Uses robust regex patterns and text normalization to detect order and tracking numbers.
"""

import re
from typing import Optional, List, Tuple
from app.schemas.extraction_schema import (
    ExtractionStatus,
    OrderExtractionResponse
)


class ExtractionService:
    """
    Extracts canonical QueryX order IDs and shipment tracking numbers from unstructured customer complaints.
    """

    # Configurable regex patterns for order numbers
    # Uses negative lookbehind to ensure hyphens from prefixes like LGC- do not trigger false boundary matches
    ORDER_PATTERNS = [
        re.compile(r"(?<![A-Za-z0-9-])(QX-\d{4}-\d{5})\b", re.IGNORECASE),
        re.compile(r"(?<![A-Za-z0-9-])(TN-\d{8})\b", re.IGNORECASE),
    ]

    # Configurable regex patterns for tracking numbers
    TRACKING_PATTERNS = [
        re.compile(r"(?<![A-Za-z0-9-])(QXT-[A-Z]{2,4}-\d{8}-\d{3,4})\b", re.IGNORECASE),
        re.compile(r"(?<![A-Za-z0-9-])(LGC-TN-\d{8})\b", re.IGNORECASE),
    ]

    def extract(self, text: str) -> OrderExtractionResponse:
        """
        Scans input text for known order and tracking identifier formats.
        Normalizes matched identifiers to uppercase.
        """
        if not text:
            return OrderExtractionResponse(
                order_number=None,
                tracking_number=None,
                extraction_status=ExtractionStatus.NOT_FOUND,
                raw_candidates=[]
            )

        candidates: List[str] = []
        found_order: Optional[str] = None
        found_tracking: Optional[str] = None

        # 1. Scan for tracking numbers first (since they are more specific, e.g. QXT-...)
        for pattern in self.TRACKING_PATTERNS:
            matches = pattern.findall(text)
            for m in matches:
                normalized = m.upper().strip()
                candidates.append(normalized)
                if not found_tracking:
                    found_tracking = normalized

        # 2. Scan for order numbers
        for pattern in self.ORDER_PATTERNS:
            matches = pattern.findall(text)
            for m in matches:
                normalized = m.upper().strip()
                candidates.append(normalized)
                if not found_order:
                    found_order = normalized

        # 3. Determine overall extraction status
        if found_order and found_tracking:
            status = ExtractionStatus.SUCCESS
        elif found_order or found_tracking:
            status = ExtractionStatus.PARTIAL
        else:
            status = ExtractionStatus.NOT_FOUND

        return OrderExtractionResponse(
            order_number=found_order,
            tracking_number=found_tracking,
            extraction_status=status,
            raw_candidates=list(dict.fromkeys(candidates))  # remove duplicates preserving order
        )


# Singleton instance for dependency injection
extraction_service = ExtractionService()
