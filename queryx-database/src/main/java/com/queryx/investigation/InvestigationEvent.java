package com.queryx.investigation;

import com.queryx.regionalevent.RegionalEvent;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Join entity linking {@link Investigation} and {@link RegionalEvent} with
 * additional analytical columns (distance, time overlap, relevance score, etc.).
 *
 * <p>Mapped as a proper {@code @Entity} rather than a {@code @ManyToMany} shortcut
 * because it carries extra domain-specific columns beyond the two foreign keys.</p>
 *
 * Maps to the {@code investigation_events} table.
 */
@Entity
@Table(
    name = "investigation_events",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_investigation_events",
        columnNames = {"investigation_id", "event_id"}
    )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvestigationEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "investigation_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_investigation_events_investigation"))
    private Investigation investigation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_investigation_events_regional_event"))
    private RegionalEvent event;

    /**
     * Distance in kilometres between the shipment's last known location
     * and the regional event's epicentre.
     */
    @Column(name = "distance_km", nullable = true, precision = 8, scale = 2)
    private BigDecimal distanceKm;

    /**
     * Whether the regional event's time window overlaps with the shipment delay period.
     */
    @Column(name = "time_overlap", nullable = true)
    private Boolean timeOverlap;

    /**
     * AI-computed relevance score indicating how likely this event caused the delay.
     * Range: [0.0000, 1.0000].
     */
    @Column(name = "relevance_score", nullable = true, precision = 5, scale = 4)
    private BigDecimal relevanceScore;

    /**
     * Natural-language AI reasoning explaining the relevance score.
     */
    @Column(name = "ai_reasoning", nullable = true, columnDefinition = "TEXT")
    private String aiReasoning;

    /**
     * Impact classification (e.g. PRIMARY_CAUSE, CONTRIBUTING_FACTOR, NOT_RELEVANT).
     */
    @Column(name = "impact_status", nullable = true, length = 100)
    private String impactStatus;
}
