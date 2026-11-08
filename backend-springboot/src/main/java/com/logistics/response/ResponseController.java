package com.logistics.response;

import com.logistics.response.dto.ResponseDto;
import com.logistics.user.User;
import com.logistics.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for Customer Responses.
 */
@RestController
@RequestMapping("/api/responses")
public class ResponseController {

    private final ResponseService responseService;
    private final UserRepository userRepository;

    public ResponseController(ResponseService responseService, UserRepository userRepository) {
        this.responseService = responseService;
        this.userRepository = userRepository;
    }

    @GetMapping("/complaint/{complaintId}")
    public ResponseEntity<List<ResponseDto>> getResponsesByComplaint(@PathVariable UUID complaintId) {
        return ResponseEntity.ok(responseService.getResponsesByComplaintId(complaintId));
    }

    @PostMapping("/{responseId}/approve")
    public ResponseEntity<ResponseDto> approveResponse(
            @PathVariable UUID responseId,
            Authentication authentication) {
        String email = authentication.getName();
        User agent = userRepository.findByEmail(email).orElse(null);
        UUID agentId = agent != null ? agent.getUserId() : null;

        return ResponseEntity.ok(responseService.approveAndSendResponse(responseId, agentId));
    }
}
