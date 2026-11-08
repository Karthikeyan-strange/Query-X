package com.logistics.response.dto;

import com.logistics.response.Response;
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
public class ResponseDto {

    private UUID responseId;
    private UUID complaintId;
    private UUID investigationId;
    private String responseType;
    private String subject;
    private String responseBody;
    private String approvalStatus;
    private UUID createdById;
    private String createdByName;
    private OffsetDateTime sentAt;
    private OffsetDateTime createdAt;

    public static ResponseDto fromEntity(Response r) {
        return ResponseDto.builder()
                .responseId(r.getResponseId())
                .complaintId(r.getComplaint().getComplaintId())
                .investigationId(r.getInvestigation() != null ? r.getInvestigation().getInvestigationId() : null)
                .responseType(r.getResponseType())
                .subject(r.getSubject())
                .responseBody(r.getResponseBody())
                .approvalStatus(r.getApprovalStatus())
                .createdById(r.getCreatedBy() != null ? r.getCreatedBy().getUserId() : null)
                .createdByName(r.getCreatedBy() != null ? r.getCreatedBy().getName() : "System / AI")
                .sentAt(r.getSentAt())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
