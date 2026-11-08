package com.logistics.warehouse;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link Warehouse} entities.
 */
@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, UUID> {

    /**
     * Finds all warehouses located in the specified city.
     *
     * @param city the city name
     * @return list of warehouses in that city
     */
    List<Warehouse> findByCity(String city);

    /**
     * Finds all warehouses located in the specified state.
     *
     * @param state the state name
     * @return list of warehouses in that state
     */
    List<Warehouse> findByState(String state);
}
