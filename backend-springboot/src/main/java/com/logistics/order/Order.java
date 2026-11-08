package com.logistics.order;

import com.logistics.customer.Customer;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Represents a customer order placed through the QueryX platform.
 * Maps to the {@code orders} table.
 *
 * <p>Note: The class is named {@code Order} but {@code "order"} is a reserved SQL keyword,
 * so the table name is explicitly set to {@code "orders"}.</p>
 */
@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "order_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID orderId;

    @Column(name = "order_number", nullable = false, unique = true, length = 100)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_orders_customer"))
    private Customer customer;

    @Column(name = "order_date", nullable = false)
    @Builder.Default
    private OffsetDateTime orderDate = OffsetDateTime.now();

    @Column(name = "delivery_address", nullable = false, columnDefinition = "TEXT")
    private String deliveryAddress;

    @Column(name = "delivery_city", nullable = false, length = 100)
    private String deliveryCity;

    @Column(name = "delivery_state", nullable = false, length = 100)
    private String deliveryState;

    @Column(name = "delivery_latitude", nullable = true, precision = 10, scale = 7)
    private BigDecimal deliveryLatitude;

    @Column(name = "delivery_longitude", nullable = true, precision = 10, scale = 7)
    private BigDecimal deliveryLongitude;

    @Column(name = "order_status", nullable = false, length = 50)
    @Builder.Default
    private String orderStatus = "PENDING";
}
