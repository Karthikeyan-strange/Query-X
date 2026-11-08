package com.logistics.order;

import com.logistics.exception.ResourceNotFoundException;
import com.logistics.order.dto.OrderResponseDto;
import com.logistics.shipment.Shipment;
import com.logistics.shipment.ShipmentRepository;
import com.logistics.shipment.dto.ShipmentDetailDto;
import com.logistics.tracking.TrackingEvent;
import com.logistics.tracking.TrackingEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Order & Tracking Service.
 */
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ShipmentRepository shipmentRepository;
    private final TrackingEventRepository trackingEventRepository;

    public OrderService(
            OrderRepository orderRepository,
            ShipmentRepository shipmentRepository,
            TrackingEventRepository trackingEventRepository) {
        this.orderRepository = orderRepository;
        this.shipmentRepository = shipmentRepository;
        this.trackingEventRepository = trackingEventRepository;
    }

    @Transactional(readOnly = true)
    public OrderResponseDto getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with order number: " + orderNumber));
        return OrderResponseDto.fromEntity(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getOrdersByCustomerEmail(String email) {
        return orderRepository.findByCustomerEmail(email)
                .stream()
                .map(OrderResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShipmentDetailDto> getShipmentsByOrderId(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        List<Shipment> shipments = shipmentRepository.findByOrder(order);

        return shipments.stream().map(shipment -> {
            List<TrackingEvent> events = trackingEventRepository.findByShipmentOrderByEventTimeAsc(shipment);
            return ShipmentDetailDto.fromEntity(shipment, events);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ShipmentDetailDto getShipmentByTrackingNumber(String trackingNumber) {
        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with tracking number: " + trackingNumber));
        List<TrackingEvent> events = trackingEventRepository.findByShipmentOrderByEventTimeAsc(shipment);
        return ShipmentDetailDto.fromEntity(shipment, events);
    }
}
