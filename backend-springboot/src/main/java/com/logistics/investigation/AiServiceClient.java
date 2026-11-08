package com.logistics.investigation;

import com.logistics.investigation.dto.ai.AiInvestigationDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * HTTP Client connecting Spring Boot to the Python AI service (Backend 3).
 * Uses WebClient with non-blocking reactive calls and fault tolerance.
 */
@Service
public class AiServiceClient {

    private static final Logger log = LoggerFactory.getLogger(AiServiceClient.class);
    private static final Duration TIMEOUT = Duration.ofSeconds(10);

    private final WebClient webClient;

    public AiServiceClient(WebClient aiServiceWebClient) {
        this.webClient = aiServiceWebClient;
    }

    public ClassifyResponse classifyComplaint(String emailSubject, String complaintText) {
        try {
            ClassifyRequest req = ClassifyRequest.builder()
                    .emailSubject(emailSubject)
                    .complaintText(complaintText)
                    .build();

            return webClient.post()
                    .uri("/api/ai/classify-complaint")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(req)
                    .retrieve()
                    .bodyToMono(ClassifyResponse.class)
                    .timeout(TIMEOUT)
                    .block();
        } catch (Exception ex) {
            log.warn("AI Complaint Classification call failed: {}. Falling back to default.", ex.getMessage());
            return new ClassifyResponse("DELIVERY_DELAY", "MEDIUM", java.math.BigDecimal.valueOf(0.50), java.util.List.of(), java.util.List.of());
        }
    }

    public ExtractResponse extractIdentifiers(String text) {
        try {
            ExtractRequest req = ExtractRequest.builder()
                    .complaintText(text)
                    .build();

            return webClient.post()
                    .uri("/api/ai/extract-order")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(req)
                    .retrieve()
                    .bodyToMono(ExtractResponse.class)
                    .timeout(TIMEOUT)
                    .block();
        } catch (Exception ex) {
            log.warn("AI Identifier Extraction call failed: {}. Falling back.", ex.getMessage());
            return new ExtractResponse(null, null, "NOT_FOUND", java.util.List.of());
        }
    }

    public InvestigateResponse runInvestigation(InvestigateRequest request) {
        try {
            return webClient.post()
                    .uri("/api/ai/investigate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(InvestigateResponse.class)
                    .timeout(TIMEOUT)
                    .block();
        } catch (Exception ex) {
            log.error("AI Investigation Engine call failed: {}. Utilizing heuristic fallback.", ex.getMessage());
            InvestigateResponse fallback = new InvestigateResponse();
            fallback.setComplaintType("DELIVERY_DELAY");
            fallback.setUrgency("MEDIUM");
            fallback.setInvestigationSummary("Automated investigation fallback: The shipment is undergoing courier status review.");
            fallback.setPossibleCause("CARRIER_TRANSIT_DELAY");
            fallback.setConfidenceScore(java.math.BigDecimal.valueOf(0.60));
            fallback.setRecommendedAction("Contact assigned courier dispatcher for manual parcel tracking update.");
            fallback.setVerifiedFacts(java.util.List.of("Complaint logged in system."));
            fallback.setSupportingEvidence(java.util.List.of("Shipment held in transit."));
            return fallback;
        }
    }

    public GenerateResponseResult generateResponseDraft(GenerateResponseRequest request) {
        try {
            return webClient.post()
                    .uri("/api/ai/generate-response")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(GenerateResponseResult.class)
                    .timeout(TIMEOUT)
                    .block();
        } catch (Exception ex) {
            log.warn("AI Response Generation call failed: {}. Using standard template fallback.", ex.getMessage());
            GenerateResponseResult fallback = new GenerateResponseResult();
            fallback.setEmailSubject("Update regarding your order " + (request.getOrderNumber() != null ? request.getOrderNumber() : ""));
            fallback.setResponseText("Dear " + (request.getCustomerName() != null ? request.getCustomerName() : "Valued Customer")
                    + ",\n\nWe are actively investigating the status of your shipment. "
                    + "Our support desk will follow up shortly with a confirmed delivery update.\n\nWarm regards,\nQueryX Support Team");
            fallback.setTone("PROFESSIONAL_EMPATHETIC");
            fallback.setKeyPointsAddressed(java.util.List.of("Acknowledged customer inquiry."));
            return fallback;
        }
    }
}
