package com.logistics.order;

import com.logistics.order.dto.OrderResponseDto;
import com.logistics.shipment.dto.ShipmentDetailDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for Orders and Shipments.
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<OrderResponseDto> getOrderByNumber(@PathVariable String orderNumber) {
        return ResponseEntity.ok(orderService.getOrderByOrderNumber(orderNumber));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderResponseDto>> getMyOrders(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(orderService.getOrdersByCustomerEmail(email));
    }

    @GetMapping("/{orderId}/shipments")
    public ResponseEntity<List<ShipmentDetailDto>> getOrderShipments(@PathVariable UUID orderId) {
        return ResponseEntity.ok(orderService.getShipmentsByOrderId(orderId));
    }

    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<ShipmentDetailDto> trackShipment(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(orderService.getShipmentByTrackingNumber(trackingNumber));
    }
}
