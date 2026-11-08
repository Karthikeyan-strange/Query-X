package com.logistics.investigation;

import com.logistics.complaint.Complaint;
import com.logistics.complaint.ComplaintRepository;
import com.logistics.exception.ResourceNotFoundException;
import com.logistics.investigation.dto.InvestigationDetailDto;
import com.logistics.investigation.dto.ai.AiInvestigationDtos.*;
import com.logistics.order.Order;
import com.logistics.order.OrderRepository;
import com.logistics.regionalevent.RegionalEvent;
import com.logistics.regionalevent.RegionalEventRepository;
import com.logistics.response.Response;
import com.logistics.response.ResponseRepository;
import com.logistics.shipment.Shipment;
import com.logistics.shipment.ShipmentRepository;
import com.logistics.tracking.TrackingEvent;
import com.logistics.tracking.TrackingEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Orchestrates end-to-end investigation workflows combining Spring Boot persistence
 * with Python AI analysis services.
 */
@Service
public class InvestigationService {

    private static final Logger log = LoggerFactory.getLogger(InvestigationService.class);

    private final InvestigationRepository investigationRepository;
    private final InvestigationEventRepository investigationEventRepository;
    private final ComplaintRepository complaintRepository;
    private final OrderRepository orderRepository;
    private final ShipmentRepository shipmentRepository;
    private final TrackingEventRepository trackingEventRepository;
    private final RegionalEventRepository regionalEventRepository;
    private final ResponseRepository responseRepository;
    private final AiServiceClient aiServiceClient;

    public InvestigationService(
            InvestigationRepository investigationRepository,
            InvestigationEventRepository investigationEventRepository,
            ComplaintRepository complaintRepository,
            OrderRepository orderRepository,
            ShipmentRepository shipmentRepository,
            TrackingEventRepository trackingEventRepository,
            RegionalEventRepository regionalEventRepository,
            ResponseRepository responseRepository,
            AiServiceClient aiServiceClient) {
        this.investigationRepository = investigationRepository;
        this.investigationEventRepository = investigationEventRepository;
        this.complaintRepository = complaintRepository;
        this.orderRepository = orderRepository;
        this.shipmentRepository = shipmentRepository;
        this.trackingEventRepository = trackingEventRepository;
        this.regionalEventRepository = regionalEventRepository;
        this.responseRepository = responseRepository;
        this.aiServiceClient = aiServiceClient;
    }

    @Transactional
    public InvestigationDetailDto triggerInvestigation(UUID complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));

        log.info("Triggering AI Investigation for Complaint ID: {}", complaintId);

        // 1. Resolve Order & Shipment
        Order order = complaint.getOrder();
        if (order == null && complaint.getEmailBody() != null) {
            ExtractResponse extractRes = aiServiceClient.extractIdentifiers(complaint.getEmailBody());
            if (extractRes != null && extractRes.getOrderNumber() != null) {
                Optional<Order> orderOpt = orderRepository.findByOrderNumber(extractRes.getOrderNumber());
                if (orderOpt.isPresent()) {
                    order = orderOpt.get();
                    complaint.setOrder(order);
                    complaint.setExtractedOrderId(order.getOrderNumber());
                }
            }
        }

        Shipment shipment = null;
        List<TrackingEvent> trackingEvents = new ArrayList<>();
        if (order != null) {
            List<Shipment> shipments = shipmentRepository.findByOrder(order);
            if (!shipments.isEmpty()) {
                shipment = shipments.get(0);
                trackingEvents = trackingEventRepository.findByShipment_ShipmentIdOrderByEventTimeAsc(shipment.getShipmentId());
            }
        }

        // 2. Load Regional Events
        List<RegionalEvent> regionalEvents = regionalEventRepository.findAll();

        // 3. Assemble AI Investigate Request
        InvestigateRequest.InvestigateRequestBuilder reqBuilder = InvestigateRequest.builder()
                .emailSubject(complaint.getEmailSubject() != null ? complaint.getEmailSubject() : "Delivery inquiry")
                .complaintText(complaint.getEmailBody() != null ? complaint.getEmailBody() : "");

        if (order != null) {
            reqBuilder.order(OrderInput.builder()
                    .orderNumber(order.getOrderNumber())
                    .customerName(complaint.getCustomer() != null ? complaint.getCustomer().getName() : null)
                    .orderStatus(order.getOrderStatus())
                    .promisedDeliveryDate(shipment != null ? shipment.getEstimatedDelivery() : null)
                    .build());
        }

        if (shipment != null) {
            reqBuilder.shipment(ShipmentInput.builder()
                    .shipmentId(shipment.getShipmentId().toString())
                    .trackingNumber(shipment.getTrackingNumber())
                    .status(shipment.getCurrentStatus())
                    .carrierName(shipment.getCourierName())
                    .originHub(shipment.getWarehouse() != null ? shipment.getWarehouse().getWarehouseName() : null)
                    .destinationHub(shipment.getLastLocation())
                    .currentLatitude(shipment.getLastLatitude())
                    .currentLongitude(shipment.getLastLongitude())
                    .build());
        }

        reqBuilder.trackingEvents(trackingEvents.stream().map(te -> TrackingCheckpointInput.builder()
                .eventTime(te.getEventTime())
                .locationName(te.getLocationName())
                .eventType(te.getStatus())
                .description(te.getEventDescription())
                .latitude(te.getLatitude())
                .longitude(te.getLongitude())
                .build()).collect(Collectors.toList()));

        reqBuilder.regionalEvents(regionalEvents.stream().map(re -> RegionalEventInput.builder()
                .eventId(re.getEventId().toString())
                .eventType(re.getEventType().name())
                .title(re.getEventTitle())
                .locationName(re.getLocationName())
                .latitude(re.getLatitude())
                .longitude(re.getLongitude())
                .affectedRadiusKm(re.getAffectedRadiusKm())
                .severity(re.getSeverity())
                .startTime(re.getStartTime())
                .endTime(re.getEndTime())
                .build()).collect(Collectors.toList()));

        // 4. Call Python AI Backend
        InvestigateResponse aiResponse = aiServiceClient.runInvestigation(reqBuilder.build());

        // 5. Persist Investigation
        Investigation investigation = Investigation.builder()
                .complaint(complaint)
                .shipment(shipment)
                .investigationStatus("COMPLETED")
                .aiSummary(aiResponse.getInvestigationSummary())
                .finalDecision(aiResponse.getPossibleCause())
                .confidenceScore(aiResponse.getConfidenceScore())
                .startedAt(OffsetDateTime.now())
                .completedAt(OffsetDateTime.now())
                .build();

        Investigation savedInvestigation = investigationRepository.save(investigation);

        // 6. Persist Correlated Event (if identified)
        List<InvestigationEvent> savedEvents = new ArrayList<>();
        if (aiResponse.getCorrelatedDisruption() != null && aiResponse.getCorrelatedDisruption().getEventId() != null) {
            try {
                UUID matchedEventId = UUID.fromString(aiResponse.getCorrelatedDisruption().getEventId());
                Optional<RegionalEvent> regEventOpt = regionalEventRepository.findById(matchedEventId);
                if (regEventOpt.isPresent()) {
                    InvestigationEvent invEvent = InvestigationEvent.builder()
                            .investigation(savedInvestigation)
                            .event(regEventOpt.get())
                            .distanceKm(aiResponse.getCorrelatedDisruption().getDistanceKm())
                            .timeOverlap(aiResponse.getCorrelatedDisruption().getTimeOverlap())
                            .relevanceScore(aiResponse.getCorrelatedDisruption().getRelevanceScore())
                            .aiReasoning(aiResponse.getCorrelatedDisruption().getReasoning())
                            .impactStatus(aiResponse.getCorrelatedDisruption().getImpactStatus())
                            .build();

                    savedEvents.add(investigationEventRepository.save(invEvent));
                }
            } catch (IllegalArgumentException e) {
                log.warn("Correlated event ID was not a valid UUID: {}", aiResponse.getCorrelatedDisruption().getEventId());
            }
        }

        // 7. Generate Response Draft via Python AI
        String customerName = complaint.getCustomer() != null ? complaint.getCustomer().getName() : "Customer";
        String orderNum = order != null ? order.getOrderNumber() : complaint.getExtractedOrderId();
        String trackingNum = shipment != null ? shipment.getTrackingNumber() : null;

        GenerateResponseRequest genReq = GenerateResponseRequest.builder()
                .customerName(customerName)
                .orderNumber(orderNum)
                .trackingNumber(trackingNum)
                .complaintType(aiResponse.getComplaintType())
                .possibleCause(aiResponse.getPossibleCause())
                .investigationSummary(aiResponse.getInvestigationSummary())
                .recommendedAction(aiResponse.getRecommendedAction())
                .carrierName(shipment != null ? shipment.getCourierName() : null)
                .disruptionEventType(aiResponse.getCorrelatedDisruption() != null ? aiResponse.getCorrelatedDisruption().getEventType() : null)
                .disruptionLocation(aiResponse.getCorrelatedDisruption() != null ? shipment != null ? shipment.getLastLocation() : null : null)
                .build();

        GenerateResponseResult draftResult = aiServiceClient.generateResponseDraft(genReq);

        // 8. Persist Draft Response
        Response responseEntity = Response.builder()
                .complaint(complaint)
                .investigation(savedInvestigation)
                .responseType("AI_GENERATED")
                .subject(draftResult.getEmailSubject())
                .responseBody(draftResult.getResponseText())
                .approvalStatus("DRAFT")
                .build();

        responseRepository.save(responseEntity);

        // 9. Update Complaint Status
        complaint.setStatus("INVESTIGATING");
        complaintRepository.save(complaint);

        return InvestigationDetailDto.fromEntity(savedInvestigation, savedEvents);
    }
}
