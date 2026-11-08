package com.logistics.response;

import com.logistics.complaint.Complaint;
import com.logistics.complaint.ComplaintRepository;
import com.logistics.exception.ResourceNotFoundException;
import com.logistics.investigation.Investigation;
import com.logistics.investigation.InvestigationRepository;
import com.logistics.response.dto.ResponseDto;
import com.logistics.user.User;
import com.logistics.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service managing customer responses, draft generation, approval, and sending emails.
 */
@Service
public class ResponseService {

    private static final Logger log = LoggerFactory.getLogger(ResponseService.class);

    private final ResponseRepository responseRepository;
    private final ComplaintRepository complaintRepository;
    private final InvestigationRepository investigationRepository;
    private final UserRepository userRepository;
    private final Optional<JavaMailSender> mailSender;

    public ResponseService(
            ResponseRepository responseRepository,
            ComplaintRepository complaintRepository,
            InvestigationRepository investigationRepository,
            UserRepository userRepository,
            @Autowired(required = false) JavaMailSender mailSender) {
        this.responseRepository = responseRepository;
        this.complaintRepository = complaintRepository;
        this.investigationRepository = investigationRepository;
        this.userRepository = userRepository;
        this.mailSender = Optional.ofNullable(mailSender);
    }

    @Transactional(readOnly = true)
    public List<ResponseDto> getResponsesByComplaintId(UUID complaintId) {
        return responseRepository.findByComplaint_ComplaintId(complaintId)
                .stream()
                .map(ResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ResponseDto createDraftResponse(UUID complaintId, UUID investigationId, String subject, String body, UUID userId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));
        Investigation investigation = investigationId != null ? investigationRepository.findById(investigationId).orElse(null) : null;
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        Response response = Response.builder()
                .complaint(complaint)
                .investigation(investigation)
                .responseType("AI_GENERATED")
                .subject(subject)
                .responseBody(body)
                .approvalStatus("DRAFT")
                .createdBy(user)
                .build();

        return ResponseDto.fromEntity(responseRepository.save(response));
    }

    @Transactional
    public ResponseDto approveAndSendResponse(UUID responseId, UUID agentId) {
        Response response = responseRepository.findById(responseId)
                .orElseThrow(() -> new ResourceNotFoundException("Response not found with ID: " + responseId));
        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        response.setApprovalStatus("APPROVED");
        response.setCreatedBy(agent);

        // Attempt sending email via Spring Mail if configured
        if (mailSender.isPresent()) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(response.getComplaint().getCustomer().getEmail());
                message.setSubject(response.getSubject());
                message.setText(response.getResponseBody());
                mailSender.get().send(message);

                response.setSentAt(OffsetDateTime.now());
                response.setApprovalStatus("SENT");
                log.info("Email sent successfully to {}", response.getComplaint().getCustomer().getEmail());
            } catch (Exception ex) {
                log.warn("Email delivery skipped: {}", ex.getMessage());
                response.setSentAt(OffsetDateTime.now());
                response.setApprovalStatus("APPROVED");
            }
        } else {
            log.info("No SMTP mail sender configured; simulating response delivery.");
            response.setSentAt(OffsetDateTime.now());
            response.setApprovalStatus("APPROVED");
        }

        // Update complaint status
        Complaint complaint = response.getComplaint();
        complaint.setStatus("AWAITING_CUSTOMER");
        complaintRepository.save(complaint);

        return ResponseDto.fromEntity(responseRepository.save(response));
    }
}
