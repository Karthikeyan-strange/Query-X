package com.logistics.complaint;

import com.logistics.complaint.dto.ComplaintResponseDto;
import com.logistics.complaint.dto.CreateComplaintRequest;
import com.logistics.customer.Customer;
import com.logistics.customer.CustomerRepository;
import com.logistics.exception.ResourceNotFoundException;
import com.logistics.order.Order;
import com.logistics.order.OrderRepository;
import com.logistics.user.User;
import com.logistics.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Complaint Business Service.
 * Manages intake, triage, agent assignment, and status transitions.
 */
@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public ComplaintService(
            ComplaintRepository complaintRepository,
            CustomerRepository customerRepository,
            OrderRepository orderRepository,
            UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponseDto> getAllComplaints(String status) {
        List<Complaint> complaints;
        if (StringUtils.hasText(status) && !"All status".equalsIgnoreCase(status)) {
            complaints = complaintRepository.findByStatus(status);
        } else {
            complaints = complaintRepository.findAll();
        }
        return complaints.stream().map(ComplaintResponseDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ComplaintResponseDto getComplaintById(UUID complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));
        return ComplaintResponseDto.fromEntity(complaint);
    }

    @Transactional
    public ComplaintResponseDto createComplaint(CreateComplaintRequest request, String authenticatedEmail) {
        String email = StringUtils.hasText(request.getCustomerEmail()) ? request.getCustomerEmail() : authenticatedEmail;

        Customer customer = customerRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> customerRepository.save(
                        Customer.builder()
                                .email(email)
                                .name(email.split("@")[0])
                                .build()
                ));

        Order order = null;
        if (StringUtils.hasText(request.getOrderNumber())) {
            Optional<Order> orderOpt = orderRepository.findByOrderNumber(request.getOrderNumber().trim());
            if (orderOpt.isPresent()) {
                order = orderOpt.get();
            }
        }

        Complaint complaint = Complaint.builder()
                .customer(customer)
                .order(order)
                .extractedOrderId(request.getOrderNumber())
                .emailSubject(request.getEmailSubject())
                .emailBody(request.getEmailBody())
                .complaintType(request.getComplaintType() != null ? request.getComplaintType() : "Delayed delivery")
                .urgency(request.getUrgency() != null ? request.getUrgency() : "Medium")
                .status("RECEIVED")
                .build();

        Complaint saved = complaintRepository.save(complaint);
        return ComplaintResponseDto.fromEntity(saved);
    }

    @Transactional
    public ComplaintResponseDto assignComplaint(UUID complaintId, UUID userId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        complaint.setAssignedTo(user);
        complaint.setStatus("INVESTIGATING");
        return ComplaintResponseDto.fromEntity(complaintRepository.save(complaint));
    }

    @Transactional
    public ComplaintResponseDto updateStatus(UUID complaintId, String status) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));
        complaint.setStatus(status);
        return ComplaintResponseDto.fromEntity(complaintRepository.save(complaint));
    }
}
