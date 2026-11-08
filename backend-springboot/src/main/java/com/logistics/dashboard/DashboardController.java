package com.logistics.dashboard;

import com.logistics.complaint.ComplaintRepository;
import com.logistics.dashboard.dto.DashboardStatsDto;
import com.logistics.investigation.InvestigationRepository;
import com.logistics.regionalevent.RegionalEventRepository;
import com.logistics.shipment.ShipmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Dashboard Controller.
 * Supplies aggregate KPI metrics for the Logistics Core operations dashboard.
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final ComplaintRepository complaintRepository;
    private final InvestigationRepository investigationRepository;
    private final RegionalEventRepository regionalEventRepository;
    private final ShipmentRepository shipmentRepository;

    public DashboardController(
            ComplaintRepository complaintRepository,
            InvestigationRepository investigationRepository,
            RegionalEventRepository regionalEventRepository,
            ShipmentRepository shipmentRepository) {
        this.complaintRepository = complaintRepository;
        this.investigationRepository = investigationRepository;
        this.regionalEventRepository = regionalEventRepository;
        this.shipmentRepository = shipmentRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        long totalComplaints = complaintRepository.count();
        long activeComplaints = complaintRepository.findByStatusIn(List.of("RECEIVED", "PROCESSING", "INVESTIGATING")).size();
        long escalatedCases = complaintRepository.findByStatus("ESCALATED").size();
        long completedInvestigations = investigationRepository.findByInvestigationStatus("COMPLETED").size();
        long activeRegionalEvents = regionalEventRepository.count();
        long inTransitShipments = shipmentRepository.findByCurrentStatus("IN_TRANSIT").size();

        DashboardStatsDto stats = DashboardStatsDto.builder()
                .totalComplaints(totalComplaints)
                .activeComplaints(activeComplaints)
                .escalatedCases(escalatedCases)
                .completedInvestigations(completedInvestigations)
                .activeRegionalEvents(activeRegionalEvents)
                .totalShipmentsInTransit(inTransitShipments)
                .build();

        return ResponseEntity.ok(stats);
    }
}
