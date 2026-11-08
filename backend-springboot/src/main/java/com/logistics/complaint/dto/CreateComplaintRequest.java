package com.logistics.complaint.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateComplaintRequest {

    private String customerEmail;
    private String orderNumber;

    @NotBlank(message = "Subject is required")
    private String emailSubject;

    @NotBlank(message = "Complaint body is required")
    private String emailBody;

    private String complaintType;
    private String urgency;
}
