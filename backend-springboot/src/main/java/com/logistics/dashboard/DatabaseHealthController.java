package com.logistics.dashboard;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Health Check Controller.
 * Provides general application health and verifies live Supabase PostgreSQL connectivity.
 */
@RestController
@RequestMapping("/api/health")
public class DatabaseHealthController {

    private static final Logger log = LoggerFactory.getLogger(DatabaseHealthController.class);
    private final JdbcTemplate jdbcTemplate;

    /**
     * Constructor injection for Spring JdbcTemplate.
     * @param jdbcTemplate Spring JdbcTemplate configured with Supabase PostgreSQL DataSource
     */
    public DatabaseHealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * General application health check.
     * @return 200 OK with application status
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAppHealth() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("application", "QueryX");
        response.put("service", "Spring Boot Backend");
        response.put("status", "UP");
        return ResponseEntity.ok(response);
    }

    /**
     * Verifies live database connectivity to Supabase PostgreSQL using 'SELECT 1;'.
     * @return 200 OK with database connection status, or 503 Service Unavailable on failure
     */
    @GetMapping("/database")
    public ResponseEntity<Map<String, Object>> getDatabaseHealth() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("application", "QueryX");

        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1;", Integer.class);
            if (result != null && result == 1) {
                response.put("database", "Connected");
                response.put("status", "UP");
                return ResponseEntity.ok(response);
            } else {
                response.put("database", "Disconnected");
                response.put("status", "DOWN");
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
            }
        } catch (Exception ex) {
            log.error("Failed to connect to Supabase PostgreSQL database: {}", ex.getMessage());
            response.put("database", "Disconnected");
            response.put("status", "DOWN");
            response.put("error", ex.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
        }
    }
}
