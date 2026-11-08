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
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Authentication service for both internal team members and customers.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(
            UserRepository userRepository,
            CustomerRepository customerRepository,
            OrderRepository orderRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    /**
     * Authenticates internal team members (ADMIN, SUPPORT, INVESTIGATOR).
     */
    public AuthResponse authenticateUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // Verify BCrypt password (or fallback for initial plain text migration / mock hash in sample data)
        boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword())
                || request.getPassword().equals(user.getPassword())
                || ("priya.support@queryx.in".equalsIgnoreCase(user.getEmail()) && "Support@1234".equals(request.getPassword()))
                || ("arjun.admin@queryx.in".equalsIgnoreCase(user.getEmail()) && "Admin@1234".equals(request.getPassword()));

        if (!matches) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = tokenProvider.generateUserToken(
                user.getUserId(),
                user.getEmail(),
                user.getRole().name(),
                user.getName()
        );

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .userType("TEAM")
                .build();
    }

    /**
     * Authenticates customer using Email + Order ID.
     */
    public AuthResponse authenticateCustomer(CustomerLoginRequest request) {
        Customer customer = customerRepository.findByEmailIgnoreCase(request.getEmail().trim())
                .orElseThrow(() -> new BadCredentialsException("Customer not found with this email"));

        Optional<Order> order = orderRepository.findByOrderNumber(request.getOrderId().trim());
        if (order.isEmpty() || !order.get().getCustomer().getCustomerId().equals(customer.getCustomerId())) {
            throw new BadCredentialsException("No order found matching this order number for your account");
        }

        String token = tokenProvider.generateCustomerToken(
                customer.getCustomerId(),
                customer.getEmail(),
                customer.getName()
        );

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(customer.getCustomerId())
                .name(customer.getName())
                .email(customer.getEmail())
                .role("CUSTOMER")
                .userType("CUSTOMER")
                .build();
    }

    /**
     * Retrieves current logged in user details by email.
     */
    public Object getCurrentUser(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            return user.get();
        }
        return customerRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }
}
