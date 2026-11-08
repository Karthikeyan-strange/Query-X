package com.queryx.complaint;

import com.queryx.customer.Customer;
import com.queryx.order.Order;
import com.queryx.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Represents a customer complaint received via email or other channels.
 * Maps to the {@code complaints} table.
 */
@Entity
@Table(name = "complaints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "complaint_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID complaintId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_complaints_customer"))
    private Customer customer;

    /**
     * The order linked to this complaint. May be null if the customer
     * did not specify or the order could not be determined.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = true,
                foreignKey = @ForeignKey(name = "fk_complaints_order"))
    private Order order;

    @Column(name = "email_subject", nullable = false, length = 500)
    private String emailSubject;

    @Column(name = "email_body", nullable = false, columnDefinition = "TEXT")
    private String emailBody;

    @Column(name = "complaint_type", nullable = true, length = 100)
    private String complaintType;

    @Column(name = "urgency", nullable = true, length = 50)
    private String urgency;

    /**
     * Order reference extracted by AI from the email body.
     */
    @Column(name = "extracted_order_id", nullable = true, length = 100)
    private String extractedOrderId;

    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private String status = "RECEIVED";

    /**
     * The support user to whom this complaint is currently assigned.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to", nullable = true,
                foreignKey = @ForeignKey(name = "fk_complaints_assigned_to"))
    private User assignedTo;

    @Column(name = "received_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime receivedAt = OffsetDateTime.now();
}
