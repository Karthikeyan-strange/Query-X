package com.logistics.complaint;

import com.logistics.customer.Customer;
import com.logistics.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link Complaint} entities.
 */
@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, UUID> {

    /**
     * Finds all complaints raised by the given customer entity.
     *
     * @param customer the {@link Customer} entity
     * @return list of complaints for that customer
     */
    List<Complaint> findByCustomer(Customer customer);

    /**
     * Finds all complaints with the given status.
     *
     * @param status the status string (e.g. "RECEIVED", "UNDER_INVESTIGATION", "RESOLVED")
     * @return list of matching complaints
     */
    List<Complaint> findByStatus(String status);

    /**
     * Finds all complaints linked to the given order UUID.
     *
     * @param orderId the UUID of the associated order
     * @return list of complaints for that order
     */
    List<Complaint> findByOrder_OrderId(UUID orderId);

    /**
     * Finds all complaints currently assigned to the given support user.
     *
     * @param assignedTo the {@link User} entity the complaints are assigned to
     * @return list of complaints assigned to that user
     */
    List<Complaint> findByAssignedTo(User assignedTo);

    /**
     * Finds all complaints whose status is in the provided collection.
     * Useful for fetching complaints needing attention (e.g. RECEIVED + UNDER_INVESTIGATION).
     *
     * @param statuses a collection of status strings
     * @return list of complaints matching any of the given statuses
     */
    List<Complaint> findByStatusIn(List<String> statuses);

    /**
     * Finds all complaints raised by the customer with the specified email address.
     * Uses a JPQL join to traverse the customer relationship.
     *
     * @param email the customer's email address
     * @return list of complaints for that customer email
     */
    @Query("SELECT c FROM Complaint c WHERE c.customer.email = :email")
    List<Complaint> findByCustomerEmail(@Param("email") String email);
}
