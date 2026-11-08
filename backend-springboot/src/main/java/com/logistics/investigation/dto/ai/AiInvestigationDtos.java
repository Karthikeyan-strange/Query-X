package com.logistics.investigation.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public class AiInvestigationDtos {

    // --- Classification ---
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClassifyRequest {
        @JsonProperty("email_subject")
        private String emailSubject;
        @JsonProperty("complaint_text")
        private String complaintText;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClassifyResponse {
        @JsonProperty("complaint_type")
        private String complaintType;
        private String urgency;
        @JsonProperty("confidence_score")
        private BigDecimal confidenceScore;
        @JsonProperty("matched_signals")
        private List<String> matchedSignals;
        @JsonProperty("urgency_signals")
        private List<String> urgencySignals;
    }

    // --- Extraction ---
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExtractRequest {
        @JsonProperty("complaint_text")
        private String complaintText;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExtractResponse {
        @JsonProperty("order_number")
        private String orderNumber;
        @JsonProperty("tracking_number")
        private String trackingNumber;
        @JsonProperty("extraction_status")
        private String extractionStatus;
        @JsonProperty("raw_candidates")
        private List<String> rawCandidates;
    }

    // --- Investigation ---
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrackingCheckpointInput {
        @JsonProperty("event_time")
        private OffsetDateTime eventTime;
        @JsonProperty("location_name")
        private String locationName;
        @JsonProperty("event_type")
        private String eventType;
        private String description;
        private BigDecimal latitude;
        private BigDecimal longitude;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShipmentInput {
        @JsonProperty("shipment_id")
        private String shipmentId;
        @JsonProperty("tracking_number")
        private String trackingNumber;
        private String status;
        @JsonProperty("carrier_name")
        private String carrierName;
        @JsonProperty("origin_hub")
        private String originHub;
        @JsonProperty("destination_hub")
        private String destinationHub;
        @JsonProperty("current_latitude")
        private BigDecimal currentLatitude;
        @JsonProperty("current_longitude")
        private BigDecimal currentLongitude;
        @JsonProperty("last_checkpoint_time")
        private OffsetDateTime lastCheckpointTime;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderInput {
        @JsonProperty("order_number")
        private String orderNumber;
        @JsonProperty("customer_name")
        private String customerName;
        @JsonProperty("order_status")
        private String orderStatus;
        @JsonProperty("promised_delivery_date")
        private OffsetDateTime promisedDeliveryDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegionalEventInput {
        @JsonProperty("event_id")
        private String eventId;
        @JsonProperty("event_type")
        private String eventType;
        private String title;
        @JsonProperty("location_name")
        private String locationName;
        private BigDecimal latitude;
        private BigDecimal longitude;
        @JsonProperty("affected_radius_km")
        private BigDecimal affectedRadiusKm;
        private String severity;
        @JsonProperty("start_time")
        private OffsetDateTime startTime;
        @JsonProperty("end_time")
        private OffsetDateTime endTime;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvestigateRequest {
        @JsonProperty("email_subject")
        private String emailSubject;
        @JsonProperty("complaint_text")
        private String complaintText;
        private OrderInput order;
        private ShipmentInput shipment;
        @JsonProperty("tracking_events")
        private List<TrackingCheckpointInput> trackingEvents;
        @JsonProperty("regional_events")
        private List<RegionalEventInput> regionalEvents;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CorrelatedEventResult {
        @JsonProperty("event_id")
        private String eventId;
        @JsonProperty("event_type")
        private String eventType;
        @JsonProperty("distance_km")
        private BigDecimal distanceKm;
        @JsonProperty("inside_radius")
        private Boolean insideRadius;
        @JsonProperty("time_overlap")
        private Boolean timeOverlap;
        @JsonProperty("relevance_score")
        private BigDecimal relevanceScore;
        @JsonProperty("impact_status")
        private String impactStatus;
        private String reasoning;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvestigateResponse {
        @JsonProperty("complaint_type")
        private String complaintType;
        private String urgency;
        @JsonProperty("investigation_summary")
        private String investigationSummary;
        @JsonProperty("possible_cause")
        private String possibleCause;
        @JsonProperty("supporting_evidence")
        private List<String> supportingEvidence;
        @JsonProperty("verified_facts")
        private List<String> verifiedFacts;
        @JsonProperty("inferred_conclusions")
        private List<String> inferredConclusions;
        @JsonProperty("confidence_score")
        private BigDecimal confidenceScore;
        @JsonProperty("recommended_action")
        private String recommendedAction;
        @JsonProperty("correlated_disruption")
        private CorrelatedEventResult correlatedDisruption;
    }

    // --- Response Draft Generation ---
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GenerateResponseRequest {
        @JsonProperty("customer_name")
        private String customerName;
        @JsonProperty("order_number")
        private String orderNumber;
        @JsonProperty("tracking_number")
        private String trackingNumber;
        @JsonProperty("complaint_type")
        private String complaintType;
        @JsonProperty("possible_cause")
        private String possibleCause;
        @JsonProperty("investigation_summary")
        private String investigationSummary;
        @JsonProperty("recommended_action")
        private String recommendedAction;
        @JsonProperty("carrier_name")
        private String carrierName;
        @JsonProperty("disruption_event_type")
        private String disruptionEventType;
        @JsonProperty("disruption_location")
        private String disruptionLocation;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GenerateResponseResult {
        @JsonProperty("email_subject")
        private String emailSubject;
        @JsonProperty("response_text")
        private String responseText;
        private String tone;
        @JsonProperty("key_points_addressed")
        private List<String> keyPointsAddressed;
    }
}
