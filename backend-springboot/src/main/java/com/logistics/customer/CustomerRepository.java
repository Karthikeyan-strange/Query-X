package com.logistics.customer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link Customer} entities.
 */
@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {

    /**
     * Finds a customer by exact email address (case-sensitive).
     *
     * @param email the email address
     * @return an {@link Optional} containing the customer if found
     */
    Optional<Customer> findByEmail(String email);

    /**
     * Finds a customer by email address, ignoring case.
     *
     * @param email the email address (case-insensitive)
     * @return an {@link Optional} containing the customer if found
     */
    Optional<Customer> findByEmailIgnoreCase(String email);
}
