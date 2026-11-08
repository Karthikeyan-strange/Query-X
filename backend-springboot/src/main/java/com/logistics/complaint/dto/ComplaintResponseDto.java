package com.logistics.complaint.dto;

import com.logistics.complaint.Complaint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResponseDto {

    private UUID complaintId;
    private UUID customerId;
    private String customerName;
    private String customerEmail;
    private UUID orderId;
    private String orderNumber;
    private String emailSubject;
    private String emailBody;
    private String complaintType;
    private String urgency;
    private String extractedOrderId;
    private String status;
    private UUID assignedToId;
    private String assignedToName;
    private OffsetDateTime receivedAt;

    public static ComplaintResponseDto fromEntity(Complaint c) {
        return ComplaintResponseDto.builder()
                .complaintId(c.getComplaintId())
                .customerId(c.getCustomer().getCustomerId())
                .customerName(c.getCustomer().getName())
                .customerEmail(c.getCustomer().getEmail())
                .orderId(c.getOrder() != null ? c.getOrder().getOrderId() : null)
                .orderNumber(c.getOrder() != null ? c.getOrder().getOrderNumber() : c.getExtractedOrderId())
                .emailSubject(c.getEmailSubject())
                .emailBody(c.getEmailBody())
                .complaintType(c.getComplaintType())
                .urgency(c.getUrgency())
                .extractedOrderId(c.getExtractedOrderId())
                .status(c.getStatus())
                .assignedToId(c.getAssignedTo() != null ? c.getAssignedTo().getUserId() : null)
                .assignedToName(c.getAssignedTo() != null ? c.getAssignedTo().getName() : "Unassigned")
                .receivedAt(c.getReceivedAt())
                .build();
    }
}
