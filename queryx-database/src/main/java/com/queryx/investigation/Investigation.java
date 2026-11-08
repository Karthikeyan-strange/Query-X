package com.queryx.investigation;

import com.queryx.complaint.Complaint;
import com.queryx.shipment.Shipment;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Represents an AI-driven or human-guided investigation into a customer complaint.
 * Maps to the {@code investigations} table.
 */
@Entity
@Table(name = "investigations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Investigation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "investigation_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID investigationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_investigations_complaint"))
    private Complaint complaint;

    /**
     * The shipment being investigated. May be null if no shipment could be identified.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = true,
                foreignKey = @ForeignKey(name = "fk_investigations_shipment"))
    private Shipment shipment;

    @Column(name = "investigation_status", nullable = false, length = 50)
    @Builder.Default
    private String investigationStatus = "PENDING";

    /**
     * AI-generated narrative summary of the investigation findings.
     */
    @Column(name = "ai_summary", nullable = true, columnDefinition = "TEXT")
    private String aiSummary;

    /**
     * Final human-verified or AI decision (e.g. FORCE_MAJEURE_DELAY, COURIER_FAULT_DAMAGE).
     */
    @Column(name = "final_decision", nullable = true, length = 255)
    private String finalDecision;

    /**
     * AI confidence score for the final decision. Range: [0.0000, 1.0000].
     */
    @Column(name = "confidence_score", nullable = true, precision = 5, scale = 4)
    private BigDecimal confidenceScore;

    @Column(name = "started_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime startedAt = OffsetDateTime.now();

    @Column(name = "completed_at", nullable = true)
    private OffsetDateTime completedAt;
}
