package com.logistics.shipment.dto;

import com.logistics.shipment.Shipment;
import com.logistics.tracking.TrackingEvent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentDetailDto {

    private UUID shipmentId;
    private String trackingNumber;
    private String courierName;
    private String currentStatus;
    private OffsetDateTime estimatedDelivery;
    private OffsetDateTime actualDelivery;
    private String lastLocation;
    private BigDecimal lastLatitude;
    private BigDecimal lastLongitude;
    private String warehouseName;
    private String warehouseCity;
    private List<TrackingEventDto> trackingEvents;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TrackingEventDto {
        private UUID trackingId;
        private String eventDescription;
        private String locationName;
        private OffsetDateTime eventTime;
        private String status;

        public static TrackingEventDto fromEntity(TrackingEvent te) {
            return TrackingEventDto.builder()
                    .trackingId(te.getTrackingId())
                    .eventDescription(te.getEventDescription())
                    .locationName(te.getLocationName())
                    .eventTime(te.getEventTime())
                    .status(te.getStatus())
                    .build();
        }
    }

    public static ShipmentDetailDto fromEntity(Shipment s, List<TrackingEvent> events) {
        return ShipmentDetailDto.builder()
                .shipmentId(s.getShipmentId())
                .trackingNumber(s.getTrackingNumber())
                .courierName(s.getCourierName())
                .currentStatus(s.getCurrentStatus())
                .estimatedDelivery(s.getEstimatedDelivery())
                .actualDelivery(s.getActualDelivery())
                .lastLocation(s.getLastLocation())
                .lastLatitude(s.getLastLatitude())
                .lastLongitude(s.getLastLongitude())
                .warehouseName(s.getWarehouse() != null ? s.getWarehouse().getWarehouseName() : null)
                .warehouseCity(s.getWarehouse() != null ? s.getWarehouse().getCity() : null)
                .trackingEvents(events != null ? events.stream().map(TrackingEventDto::fromEntity).collect(Collectors.toList()) : List.of())
                .build();
    }
}
