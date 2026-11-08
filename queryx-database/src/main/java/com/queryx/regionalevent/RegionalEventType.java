package com.queryx.regionalevent;

/**
 * Categories of regional events that can disrupt shipment delivery.
 * Stored as a PostgreSQL ENUM type {@code regional_event_type}.
 */
public enum RegionalEventType {
    WEATHER,
    FLOOD,
    CYCLONE,
    ROAD_CLOSURE,
    TRANSPORT_STRIKE,
    POLITICAL_DISTURBANCE,
    LANDSLIDE,
    OTHER
}
