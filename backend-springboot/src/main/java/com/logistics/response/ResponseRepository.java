package com.logistics.response;

import com.logistics.complaint.Complaint;
import com.logistics.investigation.Investigation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link Response} entities.
 */
@Repository
public interface ResponseRepository extends JpaRepository<Response, UUID> {

    /**
     * Finds all responses linked to the given complaint entity.
     *
     * @param complaint the {@link Complaint} entity
     * @return list of responses for that complaint
     */
    List<Response> findByComplaint(Complaint complaint);

    /**
     * Finds all responses linked to the given investigation entity.
     *
     * @param investigation the {@link Investigation} entity
     * @return list of responses produced by that investigation
     */
    List<Response> findByInvestigation(Investigation investigation);

    /**
     * Finds all responses with the given approval status.
     *
     * @param approvalStatus the status string (e.g. "DRAFT", "APPROVED", "SENT", "REJECTED")
     * @return list of matching responses
     */
    List<Response> findByApprovalStatus(String approvalStatus);

    /**
     * Finds all responses linked to the complaint with the given UUID.
     * Avoids loading the full {@link Complaint} entity when only the ID is known.
     *
     * @param complaintId the UUID of the complaint
     * @return list of responses for that complaint ID
     */
    List<Response> findByComplaint_ComplaintId(UUID complaintId);

    /**
     * Finds all responses linked to the investigation with the given UUID.
     * Avoids loading the full {@link Investigation} entity when only the ID is known.
     *
     * @param investigationId the UUID of the investigation
     * @return list of responses for that investigation ID
     */
    List<Response> findByInvestigation_InvestigationId(UUID investigationId);
}
