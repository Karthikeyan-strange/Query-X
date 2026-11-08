package com.logistics.shipment;

import com.logistics.order.Order;
import com.logistics.warehouse.Warehouse;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Represents a shipment associated with an order, dispatched from a warehouse.
 * Maps to the {@code shipments} table.
 */
@Entity
@Table(name = "shipments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "shipment_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID shipmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_shipments_order"))
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_shipments_warehouse"))
    private Warehouse warehouse;

    @Column(name = "tracking_number", nullable = false, unique = true, length = 100)
    private String trackingNumber;

    @Column(name = "courier_name", nullable = false, length = 100)
    private String courierName;

    @Column(name = "current_status", nullable = false, length = 50)
    @Builder.Default
    private String currentStatus = "PENDING";

    @Column(name = "estimated_delivery", nullable = true)
    private OffsetDateTime estimatedDelivery;

    @Column(name = "actual_delivery", nullable = true)
    private OffsetDateTime actualDelivery;

    @Column(name = "last_location", nullable = true, columnDefinition = "TEXT")
    private String lastLocation;

    @Column(name = "last_latitude", nullable = true, precision = 10, scale = 7)
    private BigDecimal lastLatitude;

    @Column(name = "last_longitude", nullable = true, precision = 10, scale = 7)
    private BigDecimal lastLongitude;
}
