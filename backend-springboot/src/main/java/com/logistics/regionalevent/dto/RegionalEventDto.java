package com.logistics.regionalevent.dto;

import com.logistics.regionalevent.RegionalEvent;
import com.logistics.regionalevent.RegionalEventType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegionalEventDto {

    private UUID eventId;
    private String eventTitle;
    private RegionalEventType eventType;
    private String description;
    private String severity;
    private String locationName;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal affectedRadiusKm;
    private String sourceName;
    private String sourceUrl;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private OffsetDateTime detectedAt;

    public static RegionalEventDto fromEntity(RegionalEvent e) {
        return RegionalEventDto.builder()
                .eventId(e.getEventId())
                .eventTitle(e.getEventTitle())
                .eventType(e.getEventType())
                .description(e.getDescription())
                .severity(e.getSeverity())
                .locationName(e.getLocationName())
                .latitude(e.getLatitude())
                .longitude(e.getLongitude())
                .affectedRadiusKm(e.getAffectedRadiusKm())
                .sourceName(e.getSourceName())
                .sourceUrl(e.getSourceUrl())
                .startTime(e.getStartTime())
                .endTime(e.getEndTime())
                .detectedAt(e.getDetectedAt())
                .build();
    }
}
