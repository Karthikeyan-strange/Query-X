package com.queryx.investigation;

import com.queryx.complaint.Complaint;
import com.queryx.shipment.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link Investigation} entities.
 */
@Repository
public interface InvestigationRepository extends JpaRepository<Investigation, UUID> {

    /**
     * Finds all investigations linked to the given complaint entity.
     *
     * @param complaint the {@link Complaint} entity
     * @return list of investigations for that complaint
     */
    List<Investigation> findByComplaint(Complaint complaint);

    /**
     * Finds all investigations linked to the given shipment entity.
     *
     * @param shipment the {@link Shipment} entity
     * @return list of investigations for that shipment
     */
    List<Investigation> findByShipment(Shipment shipment);

    /**
     * Finds all investigations with the given status.
     *
     * @param investigationStatus the status string (e.g. "PENDING", "IN_PROGRESS", "COMPLETED")
     * @return list of matching investigations
     */
    List<Investigation> findByInvestigationStatus(String investigationStatus);

    /**
     * Finds all investigations linked to the complaint with the given UUID.
     * Avoids loading the full {@link Complaint} entity when only the ID is known.
     *
     * @param complaintId the UUID of the complaint
     * @return list of investigations for that complaint ID
     */
    List<Investigation> findByComplaintId(UUID complaintId);
}
