package com.logistics.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link User} entities.
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * Finds a user by their exact email address.
     *
     * @param email the email address to search for
     * @return an {@link Optional} containing the user if found
     */
    Optional<User> findByEmail(String email);

    /**
     * Finds all users assigned the given role.
     *
     * @param role the {@link UserRole} to filter by
     * @return list of users with the specified role
     */
    List<User> findByRole(UserRole role);
}
