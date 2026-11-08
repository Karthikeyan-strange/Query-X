package com.logistics.security;

import com.logistics.customer.Customer;
import com.logistics.customer.CustomerRepository;
import com.logistics.order.Order;
import com.logistics.order.OrderRepository;
import com.logistics.security.dto.AuthResponse;
import com.logistics.security.dto.CustomerLoginRequest;
import com.logistics.security.dto.LoginRequest;
import com.logistics.user.User;
import com.logistics.user.UserRepository;
import com.logistics.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;
    private Customer sampleCustomer;
    private Order sampleOrder;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .userId(UUID.randomUUID())
                .name("Priya Subramaniam")
                .email("priya.support@queryx.in")
                .password("$2a$10$hashedpassword")
                .role(UserRole.SUPPORT)
                .build();

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
    }

    @Test
    void testTeamLogin_Success() {
        when(userRepository.findByEmail("priya.support@queryx.in")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("Support@1234", sampleUser.getPassword())).thenReturn(true);
        when(tokenProvider.generateUserToken(any(), anyString(), anyString(), anyString())).thenReturn("mock.jwt.token");

        LoginRequest request = new LoginRequest("priya.support@queryx.in", "Support@1234");
        AuthResponse response = authService.authenticateUser(request);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getToken());
        assertEquals("SUPPORT", response.getRole());
        assertEquals("TEAM", response.getUserType());
    }

    @Test
    void testTeamLogin_InvalidPassword_ThrowsException() {
        when(userRepository.findByEmail("priya.support@queryx.in")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("WrongPassword", sampleUser.getPassword())).thenReturn(false);

        LoginRequest request = new LoginRequest("priya.support@queryx.in", "WrongPassword");
        assertThrows(BadCredentialsException.class, () -> authService.authenticateUser(request));
    }

    @Test
    void testCustomerLogin_Success() {
        when(customerRepository.findByEmailIgnoreCase("karthik.rajan@gmail.com")).thenReturn(Optional.of(sampleCustomer));
        when(orderRepository.findByOrderNumber("QX-2024-00001")).thenReturn(Optional.of(sampleOrder));
        when(tokenProvider.generateCustomerToken(any(), anyString(), anyString())).thenReturn("mock.customer.jwt");

        CustomerLoginRequest request = new CustomerLoginRequest("karthik.rajan@gmail.com", "QX-2024-00001");
        AuthResponse response = authService.authenticateCustomer(request);

        assertNotNull(response);
        assertEquals("mock.customer.jwt", response.getToken());
        assertEquals("CUSTOMER", response.getRole());
        assertEquals("CUSTOMER", response.getUserType());
    }
}
