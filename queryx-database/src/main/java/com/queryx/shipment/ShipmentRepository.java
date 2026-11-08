package com.queryx.shipment;

import com.queryx.order.Order;
import com.queryx.warehouse.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link Shipment} entities.
 */
@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, UUID> {

    /**
     * Finds a shipment by its unique tracking number.
     *
     * @param trackingNumber the carrier tracking number
     * @return an {@link Optional} containing the shipment if found
     */
    Optional<Shipment> findByTrackingNumber(String trackingNumber);

    /**
     * Finds all shipments associated with a given order entity.
     *
     * @param order the {@link Order} entity
     * @return list of shipments for that order
     */
    List<Shipment> findByOrder(Order order);

    /**
     * Finds all shipments dispatched from the specified warehouse.
     *
     * @param warehouse the {@link Warehouse} entity
     * @return list of shipments originating from that warehouse
     */
    List<Shipment> findByWarehouse(Warehouse warehouse);

    /**
     * Finds all shipments with the given current status.
     *
     * @param currentStatus the status string (e.g. "PENDING", "IN_TRANSIT", "DELIVERED", "DELAYED")
     * @return list of matching shipments
     */
    List<Shipment> findByCurrentStatus(String currentStatus);
}
