package com.queryx.regionalevent;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link RegionalEvent} entities.
 */
@Repository
public interface RegionalEventRepository extends JpaRepository<RegionalEvent, UUID> {

    /**
     * Finds all regional events of the given type (e.g. FLOOD, CYCLONE).
     *
     * @param eventType the {@link RegionalEventType} to filter by
     * @return list of matching regional events
     */
    List<RegionalEvent> findByEventType(RegionalEventType eventType);

    /**
     * Finds all regional events with the given severity level.
     *
     * @param severity the severity string (e.g. "LOW", "MEDIUM", "HIGH", "CRITICAL")
     * @return list of matching regional events
     */
    List<RegionalEvent> findBySeverity(String severity);

    /**
     * Finds all regional events whose start time falls within the given range.
     * Useful for correlating events with shipment delay windows.
     *
     * @param startFrom the lower bound (inclusive) of the start time range
     * @param startTo   the upper bound (inclusive) of the start time range
     * @return list of regional events within the time range
     */
    List<RegionalEvent> findByStartTimeBetween(OffsetDateTime startFrom, OffsetDateTime startTo);

    /**
     * Finds all regional events whose location name contains the given substring,
     * ignoring case. Useful for region-based search (e.g. "Chennai", "Tamil Nadu").
     *
     * @param locationName the substring to search within location names
     * @return list of matching regional events
     */
    List<RegionalEvent> findByLocationNameContainingIgnoreCase(String locationName);
}
