package com.logistics.investigation.dto;

import com.logistics.investigation.Investigation;
import com.logistics.investigation.InvestigationEvent;
import com.logistics.regionalevent.dto.RegionalEventDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvestigationDetailDto {

    private UUID investigationId;
    private UUID complaintId;
    private UUID shipmentId;
    private String trackingNumber;
    private String investigationStatus;
    private String aiSummary;
    private String finalDecision;
    private BigDecimal confidenceScore;
    private OffsetDateTime startedAt;
    private OffsetDateTime completedAt;
    private List<InvestigationEventDto> correlatedEvents;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InvestigationEventDto {
        private UUID id;
        private RegionalEventDto regionalEvent;
        private BigDecimal distanceKm;
        private Boolean timeOverlap;
        private BigDecimal relevanceScore;
        private String aiReasoning;
        private String impactStatus;

        public static InvestigationEventDto fromEntity(InvestigationEvent ie) {
            return InvestigationEventDto.builder()
                    .id(ie.getId())
                    .regionalEvent(RegionalEventDto.fromEntity(ie.getEvent()))
                    .distanceKm(ie.getDistanceKm())
                    .timeOverlap(ie.getTimeOverlap())
                    .relevanceScore(ie.getRelevanceScore())
                    .aiReasoning(ie.getAiReasoning())
                    .impactStatus(ie.getImpactStatus())
                    .build();
        }
    }

    public static InvestigationDetailDto fromEntity(Investigation inv, List<InvestigationEvent> events) {
        return InvestigationDetailDto.builder()
                .investigationId(inv.getInvestigationId())
                .complaintId(inv.getComplaint().getComplaintId())
                .shipmentId(inv.getShipment() != null ? inv.getShipment().getShipmentId() : null)
                .trackingNumber(inv.getShipment() != null ? inv.getShipment().getTrackingNumber() : null)
                .investigationStatus(inv.getInvestigationStatus())
                .aiSummary(inv.getAiSummary())
                .finalDecision(inv.getFinalDecision())
                .confidenceScore(inv.getConfidenceScore())
                .startedAt(inv.getStartedAt())
                .completedAt(inv.getCompletedAt())
                .correlatedEvents(events != null ? events.stream().map(InvestigationEventDto::fromEntity).collect(Collectors.toList()) : List.of())
                .build();
    }
}
