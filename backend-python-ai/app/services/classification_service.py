"""
Complaint Classification and Urgency Detection Service.
Uses weighted rule-based keyword signals and NLP heuristics.
Modularly structured to allow drop-in replacement with fine-tuned ML models in the future.
"""

from typing import Dict, List, Tuple
from app.schemas.complaint_schema import (
    ComplaintType,
    UrgencyLevel,
    ComplaintClassifyResponse
)
from app.utils.text_utils import clean_text


class ClassificationService:
    """
    Analyzes customer complaints to determine category and operational urgency.
    """

    # Category signal dictionaries with relative evidence weights
    CATEGORY_SIGNALS: Dict[ComplaintType, Dict[str, float]] = {
        ComplaintType.DELIVERY_DELAY: {
            "delayed": 1.0,
            "delay": 1.0,
            "late": 0.8,
            "not delivered yet": 1.0,
            "haven't received": 0.8,
            "have not received": 0.8,
            "still waiting": 0.9,
            "where is my order": 0.8,
            "holding up": 0.6,
            "overdue": 1.0,
            "postponed": 0.8,
            "stuck in transit": 1.0,
            "slow delivery": 0.7,
        },
        ComplaintType.DAMAGED_GOODS: {
            "damaged": 1.2,
            "damage": 1.0,
            "broken": 1.2,
            "cracked": 1.0,
            "torn": 0.9,
            "water damage": 1.2,
            "leaking": 1.0,
            "box smashed": 1.1,
            "smashed": 1.0,
            "defective condition": 1.0,
            "ruined": 0.9,
        },
        ComplaintType.MISSING_PACKAGE: {
            "lost": 1.0,
            "missing": 1.0,
            "never arrived": 1.1,
            "marked delivered but not received": 1.4,
            "says delivered but not here": 1.4,
            "did not receive package": 1.0,
            "package stolen": 1.2,
            "untraceable": 0.9,
        },
        ComplaintType.WRONG_DELIVERY: {
            "wrong item": 1.2,
            "wrong address": 1.2,
            "delivered to someone else": 1.3,
            "delivered to wrong": 1.2,
            "incorrect item": 1.0,
            "not what i ordered": 1.1,
            "different address": 0.9,
        },
        ComplaintType.DELIVERY_NOT_UPDATED: {
            "tracking not updated": 1.2,
            "no update": 1.0,
            "tracking stuck": 1.1,
            "no tracking scan": 1.0,
            "not moving": 0.9,
            "status unchanged": 1.0,
            "has not moved": 1.0,
        },
    }

    # Urgency indicators and their respective priority weights
    URGENCY_SIGNALS: Dict[str, Tuple[UrgencyLevel, float]] = {
        "emergency": (UrgencyLevel.CRITICAL, 1.5),
        "medical": (UrgencyLevel.CRITICAL, 1.5),
        "medicine": (UrgencyLevel.CRITICAL, 1.5),
        "hospital": (UrgencyLevel.CRITICAL, 1.4),
        "urgent": (UrgencyLevel.HIGH, 1.0),
        "immediately": (UrgencyLevel.HIGH, 1.0),
        "asap": (UrgencyLevel.HIGH, 0.9),
        "crucial": (UrgencyLevel.HIGH, 0.9),
        "important": (UrgencyLevel.HIGH, 0.8),
        "today itself": (UrgencyLevel.HIGH, 1.0),
        "before tomorrow": (UrgencyLevel.HIGH, 1.0),
        "frustrated": (UrgencyLevel.MEDIUM, 0.6),
        "waiting for days": (UrgencyLevel.MEDIUM, 0.7),
    }

    def classify(self, email_subject: str, complaint_text: str) -> ComplaintClassifyResponse:
        """
        Main classification workflow:
        1. Cleans text.
        2. Scores each complaint category using weighted phrase/token matching.
        3. Evaluates language signals for urgency.
        4. Calculates a grounded confidence score in range [0.0, 1.0].
        """
        combined_text = clean_text(f"{email_subject} {complaint_text}")

        # 1. Category evaluation
        category_scores: Dict[ComplaintType, float] = {cat: 0.0 for cat in ComplaintType}
        matched_signals_per_cat: Dict[ComplaintType, List[str]] = {cat: [] for cat in ComplaintType}

        for category, signals in self.CATEGORY_SIGNALS.items():
            for phrase, weight in signals.items():
                if phrase in combined_text:
                    category_scores[category] += weight
                    matched_signals_per_cat[category].append(phrase)

        # Determine highest scoring category
        best_category = ComplaintType.OTHER
        max_score = 0.0

        for category, score in category_scores.items():
            if score > max_score:
                max_score = score
                best_category = category

        # 2. Confidence score calculation (bounded between 0.50 and 0.96 for rule-based)
        if max_score == 0.0:
            confidence = 0.50
            matched_signals = []
        else:
            # Score scaling: each matched signal increases confidence asymptotically towards 0.95
            confidence = round(min(0.95, 0.65 + (max_score * 0.1)), 2)
            matched_signals = matched_signals_per_cat[best_category]

        # 3. Urgency evaluation
        detected_urgency = UrgencyLevel.MEDIUM
        detected_urgency_signals: List[str] = []

        # Check for critical keywords
        for signal, (urgency_level, _) in self.URGENCY_SIGNALS.items():
            if signal in combined_text:
                detected_urgency_signals.append(signal)
                if urgency_level == UrgencyLevel.CRITICAL:
                    detected_urgency = UrgencyLevel.CRITICAL
                elif urgency_level == UrgencyLevel.HIGH and detected_urgency != UrgencyLevel.CRITICAL:
                    detected_urgency = UrgencyLevel.HIGH

        # Default fallback rules:
        # - Missing package or damaged goods default to at least HIGH if customer reports it
        if detected_urgency == UrgencyLevel.MEDIUM:
            if best_category in [ComplaintType.MISSING_PACKAGE, ComplaintType.DAMAGED_GOODS]:
                detected_urgency = UrgencyLevel.HIGH
            elif best_category == ComplaintType.OTHER:
                detected_urgency = UrgencyLevel.LOW

        return ComplaintClassifyResponse(
            complaint_type=best_category,
            urgency=detected_urgency,
            confidence_score=confidence,
            matched_signals=matched_signals,
            urgency_signals=detected_urgency_signals
        )


# Singleton instance for dependency injection
classification_service = ClassificationService()
