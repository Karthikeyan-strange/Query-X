package com.queryx.investigation;

import com.queryx.regionalevent.RegionalEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link InvestigationEvent} entities.
 *
 * <p>{@link InvestigationEvent} is the many-to-many join entity between
 * {@link Investigation} and {@link RegionalEvent} with additional analytical columns.</p>
 */
@Repository
public interface InvestigationEventRepository extends JpaRepository<InvestigationEvent, UUID> {

    /**
     * Finds all investigation-event links for the given investigation entity.
     *
     * @param investigation the {@link Investigation} entity
     * @return list of investigation events for that investigation
     */
    List<InvestigationEvent> findByInvestigation(Investigation investigation);

    /**
     * Finds all investigation-event links for the given regional event entity.
     *
     * @param event the {@link RegionalEvent} entity
     * @return list of investigation events referencing that regional event
     */
    List<InvestigationEvent> findByEvent(RegionalEvent event);

    /**
     * Finds all investigation-event links for the investigation with the given UUID.
     * Avoids loading the full {@link Investigation} entity when only the ID is known.
     *
     * @param investigationId the UUID of the investigation
     * @return list of investigation events for that investigation ID
     */
    List<InvestigationEvent> findByInvestigationId(UUID investigationId);

    /**
     * Finds all investigation-event links for the regional event with the given UUID.
     * Avoids loading the full {@link RegionalEvent} entity when only the ID is known.
     *
     * @param eventId the UUID of the regional event
     * @return list of investigation events referencing that regional event ID
     */
    List<InvestigationEvent> findByEventId(UUID eventId);
}
