package com.logistics.complaint;

import com.logistics.complaint.dto.ComplaintResponseDto;
import com.logistics.complaint.dto.CreateComplaintRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for Customer Complaints.
 */
@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping
    public ResponseEntity<List<ComplaintResponseDto>> getAllComplaints(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(complaintService.getAllComplaints(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponseDto> getComplaintById(@PathVariable UUID id) {
        return ResponseEntity.ok(complaintService.getComplaintById(id));
    }

    @PostMapping
    public ResponseEntity<ComplaintResponseDto> createComplaint(
            @Valid @RequestBody CreateComplaintRequest request,
            Authentication authentication) {
        String authEmail = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(complaintService.createComplaint(request, authEmail));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<ComplaintResponseDto> assignComplaint(
            @PathVariable UUID id,
            @RequestParam UUID userId) {
        return ResponseEntity.ok(complaintService.assignComplaint(id, userId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ComplaintResponseDto> updateStatus(
            @PathVariable UUID id,
            @RequestParam String status) {
        return ResponseEntity.ok(complaintService.updateStatus(id, status));
    }
}
