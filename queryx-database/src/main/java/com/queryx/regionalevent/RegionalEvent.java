package com.queryx.regionalevent;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Represents an external regional event (weather, disaster, infrastructure)
 * that may impact shipment delivery routes.
 * Maps to the {@code regional_events} table.
 */
@Entity
@Table(name = "regional_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegionalEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "event_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID eventId;

    @Column(name = "event_title", nullable = false, length = 500)
    private String eventTitle;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, columnDefinition = "regional_event_type")
    private RegionalEventType eventType;

    @Column(name = "description", nullable = true, columnDefinition = "TEXT")
    private String description;

    @Column(name = "severity", nullable = true, length = 50)
    private String severity;

    @Column(name = "location_name", nullable = false, length = 255)
    private String locationName;

    @Column(name = "latitude", nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = false, precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "affected_radius_km", nullable = true, precision = 8, scale = 2)
    private BigDecimal affectedRadiusKm;

    @Column(name = "source_name", nullable = true, length = 255)
    private String sourceName;

    @Column(name = "source_url", nullable = true, columnDefinition = "TEXT")
    private String sourceUrl;

    @Column(name = "start_time", nullable = false)
    private OffsetDateTime startTime;

    @Column(name = "end_time", nullable = true)
    private OffsetDateTime endTime;

    @Column(name = "detected_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime detectedAt = OffsetDateTime.now();
}
