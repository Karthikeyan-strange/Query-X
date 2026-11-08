package com.logistics.tracking;

import com.logistics.shipment.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link TrackingEvent} entities.
 */
@Repository
public interface TrackingEventRepository extends JpaRepository<TrackingEvent, UUID> {

    /**
     * Finds all tracking events for the given shipment entity,
     * ordered chronologically from earliest to latest.
     *
     * @param shipment the {@link Shipment} entity
     * @return list of tracking events in ascending time order
     */
    List<TrackingEvent> findByShipmentOrderByEventTimeAsc(Shipment shipment);

    /**
     * Finds all tracking events for the given shipment ID,
     * ordered chronologically from earliest to latest.
     * Useful when only the UUID is available without loading the entity.
     *
     * @param shipmentId the UUID of the shipment
     * @return list of tracking events in ascending time order
     */
    List<TrackingEvent> findByShipment_ShipmentIdOrderByEventTimeAsc(UUID shipmentId);
}
