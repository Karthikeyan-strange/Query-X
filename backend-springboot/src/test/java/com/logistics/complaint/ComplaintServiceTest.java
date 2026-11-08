package com.logistics.complaint;

import com.logistics.complaint.dto.ComplaintResponseDto;
import com.logistics.complaint.dto.CreateComplaintRequest;
import com.logistics.customer.Customer;
import com.logistics.customer.CustomerRepository;
import com.logistics.order.Order;
import com.logistics.order.OrderRepository;
import com.logistics.user.User;
import com.logistics.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ComplaintServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ComplaintService complaintService;

    private Customer sampleCustomer;
    private Order sampleOrder;
    private Complaint sampleComplaint;

    @BeforeEach
    void setUp() {
        sampleCustomer = Customer.builder()
                .customerId(UUID.randomUUID())
                .name("Karthik Rajan")
                .email("karthik.rajan@gmail.com")
                .build();

        sampleOrder = Order.builder()
                .orderId(UUID.randomUUID())
                .orderNumber("QX-2024-00001")
                .customer(sampleCustomer)
                .build();

        sampleComplaint = Complaint.builder()
                .complaintId(UUID.randomUUID())
                .customer(sampleCustomer)
                .order(sampleOrder)
                .emailSubject("Delivery Delayed")
                .emailBody("My package has not moved")
                .complaintType("Delayed delivery")
                .urgency("High")
                .status("RECEIVED")
                .build();
    }

    @Test
    void testCreateComplaint_Success() {
        when(customerRepository.findByEmailIgnoreCase("karthik.rajan@gmail.com")).thenReturn(Optional.of(sampleCustomer));
        when(orderRepository.findByOrderNumber("QX-2024-00001")).thenReturn(Optional.of(sampleOrder));
        when(complaintRepository.save(any(Complaint.class))).thenReturn(sampleComplaint);

        CreateComplaintRequest request = new CreateComplaintRequest(
                "karthik.rajan@gmail.com",
                "QX-2024-00001",
                "Delivery Delayed",
                "My package has not moved",
                "Delayed delivery",
                "High"
        );

        ComplaintResponseDto response = complaintService.createComplaint(request, "karthik.rajan@gmail.com");

        assertNotNull(response);
        assertEquals("RECEIVED", response.getStatus());
        assertEquals("QX-2024-00001", response.getOrderNumber());
        assertEquals("Karthik Rajan", response.getCustomerName());
    }

    @Test
    void testAssignComplaint_Success() {
        User agent = User.builder()
                .userId(UUID.randomUUID())
                .name("Priya Subramaniam")
                .build();

        when(complaintRepository.findById(sampleComplaint.getComplaintId())).thenReturn(Optional.of(sampleComplaint));
        when(userRepository.findById(agent.getUserId())).thenReturn(Optional.of(agent));
        when(complaintRepository.save(any(Complaint.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ComplaintResponseDto response = complaintService.assignComplaint(sampleComplaint.getComplaintId(), agent.getUserId());

        assertNotNull(response);
        assertEquals("INVESTIGATING", response.getStatus());
        assertEquals("Priya Subramaniam", response.getAssignedToName());
    }
}
