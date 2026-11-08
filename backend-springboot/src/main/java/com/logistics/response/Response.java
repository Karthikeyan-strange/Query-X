package com.logistics.response;

import com.logistics.complaint.Complaint;
import com.logistics.investigation.Investigation;
import com.logistics.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Represents a response sent (or drafted) to a customer as a result of a complaint investigation.
 * Maps to the {@code responses} table.
 *
 * <p>Note: The class is named {@code Response} but {@code "response"} conflicts with common
 * web-layer naming; the table is explicitly mapped to {@code "responses"}.</p>
 */
@Entity
@Table(name = "responses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Response {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "response_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID responseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_responses_complaint"))
    private Complaint complaint;

    /**
     * The investigation that produced this response. May be null for
     * standalone or administrative responses.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "investigation_id", nullable = true,
                foreignKey = @ForeignKey(name = "fk_responses_investigation"))
    private Investigation investigation;

    /**
     * Origin of the response content:
     * {@code AI_GENERATED}, {@code HUMAN_VERIFIED}, or {@code FOLLOW_UP}.
     */
    @Column(name = "response_type", nullable = false, length = 50)
    private String responseType;

    @Column(name = "subject", nullable = false, length = 500)
    private String subject;

    @Column(name = "response_body", nullable = false, columnDefinition = "TEXT")
    private String responseBody;

    /**
     * Lifecycle status: {@code DRAFT}, {@code APPROVED}, {@code SENT}, {@code REJECTED}.
     */
    @Column(name = "approval_status", nullable = false, length = 50)
    @Builder.Default
    private String approvalStatus = "DRAFT";

    /**
     * The user who authored or approved this response. Nullable for AI-only responses.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = true,
                foreignKey = @ForeignKey(name = "fk_responses_created_by"))
    private User createdBy;

    @Column(name = "sent_at", nullable = true)
    private OffsetDateTime sentAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
