"""
Regional Disruption Event Correlation Service.
Calculates geographic proximity via Haversine distance, temporal overlap,
severity weighting, and explainable correlation reasoning.
"""

from datetime import datetime, timedelta
from typing import List, Optional, Tuple
from app.schemas.event_schema import (
    RegionalEventType,
    EventSeverity,
    ImpactStatus,
    ShipmentLocationInput,
    RegionalEventInput,
    CorrelatedEventResult,
    EventCorrelationResponse
)
from app.utils.geo_utils import calculate_haversine_distance


class EventCorrelationService:
    """
    Correlates shipment checkpoint positions and delay events against regional incidents.
    """

    SEVERITY_WEIGHTS = {
        EventSeverity.CRITICAL: 1.0,
        EventSeverity.HIGH: 0.85,
        EventSeverity.MEDIUM: 0.65,
        EventSeverity.LOW: 0.40,
    }

    def correlate_events(
        self,
        shipment: ShipmentLocationInput,
        regional_events: List[RegionalEventInput]
    ) -> EventCorrelationResponse:
        """
        Evaluates each regional event against the shipment's coordinates and event timestamp.
        Returns correlated events sorted by relevance score descending.
        """
        results: List[CorrelatedEventResult] = []

        for event in regional_events:
            result = self._evaluate_single_event(shipment, event)
            results.append(result)

        # Sort by relevance score descending
        results.sort(key=lambda r: r.relevance_score, reverse=True)

        top_event = results[0] if results else None

        return EventCorrelationResponse(
            shipment_evaluated=shipment,
            total_events_evaluated=len(regional_events),
            correlated_events=results,
            top_correlated_event=top_event
        )

    def _evaluate_single_event(
        self,
        shipment: ShipmentLocationInput,
        event: RegionalEventInput
    ) -> CorrelatedEventResult:
        """
        Evaluates distance, radius inclusion, time window overlap, and calculates explainable score.
        """
        # 1. Geographic distance
        distance_km = calculate_haversine_distance(
            shipment.latitude,
            shipment.longitude,
            event.latitude,
            event.longitude
        )

        inside_radius = False
        geo_proximity_ratio = 0.0

        if distance_km is not None and event.affected_radius_km > 0:
            inside_radius = distance_km <= event.affected_radius_km
            if inside_radius:
                # Proximity factor: 1.0 at center, descending to 0.50 at boundary
                geo_proximity_ratio = 1.0 - (0.5 * (distance_km / event.affected_radius_km))
            else:
                # Distance outside radius decays towards 0
                excess = distance_km - event.affected_radius_km
                geo_proximity_ratio = max(0.0, 0.4 - (0.4 * (excess / event.affected_radius_km)))
        elif shipment.location_name and event.location_name:
            # Fallback text comparison if coordinates are absent
            if shipment.location_name.strip().lower() in event.location_name.strip().lower() or \
               event.location_name.strip().lower() in shipment.location_name.strip().lower():
                inside_radius = True
                geo_proximity_ratio = 0.70

        # 2. Temporal overlap
        time_overlap = False
        time_factor = 0.0

        if shipment.event_time:
            # Support ongoing events where end_time is None (assumes active)
            # Add a 6-hour buffer after event end for lingering infrastructure disruptions (e.g. waterlogging, debris)
            buffer = timedelta(hours=6)
            start_window = event.start_time
            end_window = (event.end_time + buffer) if event.end_time else (datetime.max)

            # Strip or match timezone naive/aware
            s_time = shipment.event_time.replace(tzinfo=None) if shipment.event_time.tzinfo else shipment.event_time
            e_start = start_window.replace(tzinfo=None) if start_window.tzinfo else start_window
            e_end = end_window.replace(tzinfo=None) if end_window.tzinfo else end_window

            if e_start <= s_time <= e_end:
                time_overlap = True
                time_factor = 1.0
            else:
                # Check proximity in time (within 24 hours)
                diff = min(abs((s_time - e_start).total_seconds()), abs((s_time - e_end).total_seconds()))
                hours_diff = diff / 3600.0
                if hours_diff <= 24.0:
                    time_factor = max(0.0, 0.5 - (0.5 * (hours_diff / 24.0)))

        # 3. Severity weighting
        sev_weight = self.SEVERITY_WEIGHTS.get(event.severity, 0.5)

        # 4. Relevance score calculation
        # Formula:
        # If inside radius AND time overlap:
        #   relevance = (0.45 * geo_proximity_ratio) + (0.35 * time_factor) + (0.20 * sev_weight)
        # If one matches:
        #   relevance = scaled down
        if inside_radius and time_overlap:
            raw_score = (0.45 * geo_proximity_ratio) + (0.35 * time_factor) + (0.20 * sev_weight)
        elif inside_radius and not time_overlap:
            raw_score = (0.35 * geo_proximity_ratio) + (0.15 * time_factor) + (0.10 * sev_weight)
        elif not inside_radius and time_overlap:
            raw_score = (0.20 * geo_proximity_ratio) + (0.25 * time_factor) + (0.10 * sev_weight)
        else:
            raw_score = 0.05 * geo_proximity_ratio

        relevance_score = round(max(0.0, min(0.95, raw_score)), 2)

        # 5. Determine impact classification
        if relevance_score >= 0.70:
            impact_status = ImpactStatus.HIGH_PROBABILITY_IMPACT
        elif relevance_score >= 0.40:
            impact_status = ImpactStatus.POSSIBLE_IMPACT
        elif relevance_score >= 0.15:
            impact_status = ImpactStatus.MINIMAL_IMPACT
        else:
            impact_status = ImpactStatus.NO_IMPACT

        # 6. Generate explainable reasoning
        reasoning_parts = []
        if distance_km is not None:
            if inside_radius:
                reasoning_parts.append(
                    f"Shipment location is {distance_km} km from the event center, within the {event.affected_radius_km} km affected radius."
                )
            else:
                reasoning_parts.append(
                    f"Shipment location is {distance_km} km away, which is outside the {event.affected_radius_km} km affected perimeter."
                )
        else:
            reasoning_parts.append("Coordinates unavailable; estimated via regional location name matching.")

        if time_overlap:
            reasoning_parts.append(
                f"Shipment event timeline directly coincides with the active duration of the {event.event_type.value} incident."
            )
        else:
            reasoning_parts.append("Shipment checkpoint timestamp falls outside the primary active event window.")

        reasoning_parts.append(
            f"Event severity is rated as {event.severity.value}. "
            f"Resulting impact assessed as {impact_status.value} with confidence score {relevance_score}."
        )

        reasoning = " ".join(reasoning_parts)

        return CorrelatedEventResult(
            event_id=event.event_id,
            event_type=event.event_type,
            distance_km=distance_km,
            inside_radius=inside_radius,
            time_overlap=time_overlap,
            relevance_score=relevance_score,
            impact_status=impact_status,
            reasoning=reasoning
        )


# Singleton instance for dependency injection
event_correlation_service = EventCorrelationService()
