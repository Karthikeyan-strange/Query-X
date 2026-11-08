package com.logistics.order;

import com.logistics.customer.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link Order} entities.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    /**
     * Finds an order by its unique order number.
     *
     * @param orderNumber the order number string (e.g. "QX-2024-00001")
     * @return an {@link Optional} containing the order if found
     */
    Optional<Order> findByOrderNumber(String orderNumber);

    /**
     * Finds all orders placed by the given customer entity.
     *
     * @param customer the {@link Customer} entity
     * @return list of orders belonging to the customer
     */
    List<Order> findByCustomer(Customer customer);

    /**
     * Finds all orders with the given status string.
     *
     * @param orderStatus the status value (e.g. "PENDING", "SHIPPED", "DELIVERED")
     * @return list of matching orders
     */
    List<Order> findByOrderStatus(String orderStatus);

    /**
     * Finds all orders placed by the customer with the given email address.
     * Uses a JPQL join to traverse the customer relationship.
     *
     * @param email the customer's email address
     * @return list of orders for that customer email
     */
    @Query("SELECT o FROM Order o WHERE o.customer.email = :email")
    List<Order> findByCustomerEmail(@Param("email") String email);
}
