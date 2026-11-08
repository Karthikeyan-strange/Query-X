package com.logistics.regionalevent;

import com.logistics.exception.ResourceNotFoundException;
import com.logistics.regionalevent.dto.RegionalEventDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controller for Regional Disruption Events (floods, weather, strikes, road closures).
 */
@RestController
@RequestMapping("/api/regional-events")
public class RegionalEventController {

    private final RegionalEventRepository regionalEventRepository;

    public RegionalEventController(RegionalEventRepository regionalEventRepository) {
        this.regionalEventRepository = regionalEventRepository;
    }

    @GetMapping
    public ResponseEntity<List<RegionalEventDto>> getAllRegionalEvents(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) RegionalEventType type) {
        List<RegionalEvent> events;

        if (type != null) {
            events = regionalEventRepository.findByEventType(type);
        } else if (location != null && !location.isBlank()) {
            events = regionalEventRepository.findByLocationNameContainingIgnoreCase(location.trim());
        } else {
            events = regionalEventRepository.findAll();
        }

        return ResponseEntity.ok(events.stream().map(RegionalEventDto::fromEntity).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegionalEventDto> getRegionalEventById(@PathVariable UUID id) {
        RegionalEvent event = regionalEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Regional event not found with ID: " + id));
        return ResponseEntity.ok(RegionalEventDto.fromEntity(event));
    }
}
