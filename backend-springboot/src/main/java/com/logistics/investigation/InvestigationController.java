package com.logistics.investigation;

import com.logistics.exception.ResourceNotFoundException;
import com.logistics.investigation.dto.InvestigationDetailDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controller for AI-Powered Delivery Exception Investigations.
 */
@RestController
@RequestMapping("/api/investigations")
public class InvestigationController {

    private final InvestigationRepository investigationRepository;
    private final InvestigationEventRepository investigationEventRepository;
    private final InvestigationService investigationService;

    public InvestigationController(
            InvestigationRepository investigationRepository,
            InvestigationEventRepository investigationEventRepository,
            InvestigationService investigationService) {
        this.investigationRepository = investigationRepository;
        this.investigationEventRepository = investigationEventRepository;
        this.investigationService = investigationService;
    }

    @GetMapping
    public ResponseEntity<List<InvestigationDetailDto>> getAllInvestigations(
            @RequestParam(required = false) String status) {
        List<Investigation> investigations;
        if (status != null && !status.isBlank()) {
            investigations = investigationRepository.findByInvestigationStatus(status);
        } else {
            investigations = investigationRepository.findAll();
        }

        List<InvestigationDetailDto> dtos = investigations.stream().map(inv -> {
            List<InvestigationEvent> events = investigationEventRepository.findByInvestigation_InvestigationId(inv.getInvestigationId());
            return InvestigationDetailDto.fromEntity(inv, events);
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvestigationDetailDto> getInvestigationById(@PathVariable UUID id) {
        Investigation inv = investigationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Investigation not found with ID: " + id));
        List<InvestigationEvent> events = investigationEventRepository.findByInvestigation_InvestigationId(inv.getInvestigationId());
        return ResponseEntity.ok(InvestigationDetailDto.fromEntity(inv, events));
    }

    @GetMapping("/complaint/{complaintId}")
    public ResponseEntity<List<InvestigationDetailDto>> getByComplaintId(@PathVariable UUID complaintId) {
        List<Investigation> investigations = investigationRepository.findByComplaint_ComplaintId(complaintId);
        List<InvestigationDetailDto> dtos = investigations.stream().map(inv -> {
            List<InvestigationEvent> events = investigationEventRepository.findByInvestigation_InvestigationId(inv.getInvestigationId());
            return InvestigationDetailDto.fromEntity(inv, events);
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/trigger/{complaintId}")
    public ResponseEntity<InvestigationDetailDto> triggerInvestigation(@PathVariable UUID complaintId) {
        InvestigationDetailDto result = investigationService.triggerInvestigation(complaintId);
        return ResponseEntity.ok(result);
    }
}
