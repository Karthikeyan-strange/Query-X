package com.logistics.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDto {

    private long totalComplaints;
    private long activeComplaints;
    private long escalatedCases;
    private long completedInvestigations;
    private long activeRegionalEvents;
    private long totalShipmentsInTransit;
}
