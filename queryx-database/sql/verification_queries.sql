-- ============================================================
-- QueryX Database Verification Queries
-- verification_queries.sql
-- Run these after applying V1__create_initial_schema.sql
-- and optionally after sample_data.sql for row count checks.
-- ============================================================

-- ============================================================
-- SECTION 1: Verify All 11 Tables Exist
-- ============================================================

SELECT
    table_name,
    table_type
FROM
    information_schema.tables
WHERE
    table_schema = 'public'
    AND table_name IN (
        'users',
        'customers',
        'warehouses',
        'orders',
        'shipments',
        'tracking_events',
        'complaints',
        'regional_events',
        'investigations',
        'investigation_events',
        'responses'
    )
ORDER BY
    table_name;

-- Expected: 11 rows, all with table_type = 'BASE TABLE'

-- ============================================================
-- SECTION 2: Row Counts for All Tables (after sample_data.sql)
-- ============================================================

SELECT 'users'               AS table_name, COUNT(*) AS row_count FROM users
UNION ALL
SELECT 'customers',           COUNT(*) FROM customers
UNION ALL
SELECT 'warehouses',          COUNT(*) FROM warehouses
UNION ALL
SELECT 'orders',              COUNT(*) FROM orders
UNION ALL
SELECT 'shipments',           COUNT(*) FROM shipments
UNION ALL
SELECT 'tracking_events',     COUNT(*) FROM tracking_events
UNION ALL
SELECT 'complaints',          COUNT(*) FROM complaints
UNION ALL
SELECT 'regional_events',     COUNT(*) FROM regional_events
UNION ALL
SELECT 'investigations',      COUNT(*) FROM investigations
UNION ALL
SELECT 'investigation_events', COUNT(*) FROM investigation_events
UNION ALL
SELECT 'responses',           COUNT(*) FROM responses
ORDER BY
    table_name;

-- Expected row counts after sample_data.sql:
-- customers            : 2
-- complaints           : 2
-- investigation_events : 3
-- investigations       : 2
-- orders               : 2
-- regional_events      : 2
-- responses            : 2
-- shipments            : 2
-- tracking_events      : 12
-- users                : 2
-- warehouses           : 2

-- ============================================================
-- SECTION 3: UNIQUE Constraint Verification
-- ============================================================

-- Verify unique emails in users
SELECT email, COUNT(*) AS cnt
FROM users
GROUP BY email
HAVING COUNT(*) > 1;
-- Expected: 0 rows (no duplicates)

-- Verify unique emails in customers
SELECT email, COUNT(*) AS cnt
FROM customers
GROUP BY email
HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- Verify unique order_number in orders
SELECT order_number, COUNT(*) AS cnt
FROM orders
GROUP BY order_number
HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- Verify unique tracking_number in shipments
SELECT tracking_number, COUNT(*) AS cnt
FROM shipments
GROUP BY tracking_number
HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- Verify unique (investigation_id, event_id) in investigation_events
SELECT investigation_id, event_id, COUNT(*) AS cnt
FROM investigation_events
GROUP BY investigation_id, event_id
HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- ============================================================
-- SECTION 4: Foreign Key Integrity Checks
-- ============================================================

-- Orders must reference valid customers
SELECT o.order_id, o.order_number, o.customer_id
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.customer_id
WHERE c.customer_id IS NULL;
-- Expected: 0 rows (all order customer_ids exist in customers)

-- Shipments must reference valid orders
SELECT s.shipment_id, s.tracking_number, s.order_id
FROM shipments s
LEFT JOIN orders o ON s.order_id = o.order_id
WHERE o.order_id IS NULL;
-- Expected: 0 rows

-- Shipments must reference valid warehouses
SELECT s.shipment_id, s.tracking_number, s.warehouse_id
FROM shipments s
LEFT JOIN warehouses w ON s.warehouse_id = w.warehouse_id
WHERE w.warehouse_id IS NULL;
-- Expected: 0 rows

-- Tracking events must reference valid shipments
SELECT te.tracking_id, te.shipment_id
FROM tracking_events te
LEFT JOIN shipments s ON te.shipment_id = s.shipment_id
WHERE s.shipment_id IS NULL;
-- Expected: 0 rows

-- Complaints must reference valid customers
SELECT c.complaint_id, c.customer_id
FROM complaints c
LEFT JOIN customers cu ON c.customer_id = cu.customer_id
WHERE cu.customer_id IS NULL;
-- Expected: 0 rows

-- Complaints with order_id must reference valid orders (nullable FK)
SELECT c.complaint_id, c.order_id
FROM complaints c
LEFT JOIN orders o ON c.order_id = o.order_id
WHERE c.order_id IS NOT NULL AND o.order_id IS NULL;
-- Expected: 0 rows

-- Complaints assigned_to must reference valid users (nullable FK)
SELECT c.complaint_id, c.assigned_to
FROM complaints c
LEFT JOIN users u ON c.assigned_to = u.user_id
WHERE c.assigned_to IS NOT NULL AND u.user_id IS NULL;
-- Expected: 0 rows

-- Investigations must reference valid complaints
SELECT i.investigation_id, i.complaint_id
FROM investigations i
LEFT JOIN complaints c ON i.complaint_id = c.complaint_id
WHERE c.complaint_id IS NULL;
-- Expected: 0 rows

-- Investigation_events must reference valid investigations
SELECT ie.id, ie.investigation_id
FROM investigation_events ie
LEFT JOIN investigations i ON ie.investigation_id = i.investigation_id
WHERE i.investigation_id IS NULL;
-- Expected: 0 rows

-- Investigation_events must reference valid regional_events
SELECT ie.id, ie.event_id
FROM investigation_events ie
LEFT JOIN regional_events re ON ie.event_id = re.event_id
WHERE re.event_id IS NULL;
-- Expected: 0 rows

-- Responses must reference valid complaints
SELECT r.response_id, r.complaint_id
FROM responses r
LEFT JOIN complaints c ON r.complaint_id = c.complaint_id
WHERE c.complaint_id IS NULL;
-- Expected: 0 rows

-- Responses with investigation_id must reference valid investigations (nullable FK)
SELECT r.response_id, r.investigation_id
FROM responses r
LEFT JOIN investigations i ON r.investigation_id = i.investigation_id
WHERE r.investigation_id IS NOT NULL AND i.investigation_id IS NULL;
-- Expected: 0 rows

-- ============================================================
-- SECTION 5: Cross-Table JOIN Queries - Relationship Verification
-- ============================================================

-- 5a: Customer orders with status
SELECT
    c.name        AS customer_name,
    c.email       AS customer_email,
    o.order_number,
    o.order_status,
    o.order_date,
    o.delivery_city
FROM
    customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id
ORDER BY
    o.order_date;

-- 5b: Order → Shipment → Warehouse join
SELECT
    o.order_number,
    s.tracking_number,
    s.courier_name,
    s.current_status,
    w.warehouse_name,
    w.city AS warehouse_city
FROM
    orders o
    INNER JOIN shipments s    ON o.order_id    = s.order_id
    INNER JOIN warehouses w   ON s.warehouse_id = w.warehouse_id
ORDER BY
    o.order_number;

-- 5c: Shipment tracking timeline (ordered by time)
SELECT
    s.tracking_number,
    te.event_time,
    te.location_name,
    te.status,
    te.event_description
FROM
    shipments s
    INNER JOIN tracking_events te ON s.shipment_id = te.shipment_id
ORDER BY
    s.tracking_number,
    te.event_time ASC;

-- 5d: Complaint with assigned support user
SELECT
    c.name            AS customer_name,
    cmp.email_subject,
    cmp.complaint_type,
    cmp.urgency,
    cmp.status        AS complaint_status,
    u.name            AS assigned_to_name,
    u.role            AS assigned_to_role
FROM
    complaints cmp
    INNER JOIN customers c ON cmp.customer_id = c.customer_id
    LEFT  JOIN users     u ON cmp.assigned_to  = u.user_id
ORDER BY
    cmp.received_at;

-- 5e: Regional events with investigation linkage
SELECT
    re.event_title,
    re.event_type,
    re.severity,
    re.location_name,
    re.start_time,
    re.end_time,
    COUNT(ie.id) AS linked_investigations
FROM
    regional_events re
    LEFT JOIN investigation_events ie ON re.event_id = ie.event_id
GROUP BY
    re.event_id,
    re.event_title,
    re.event_type,
    re.severity,
    re.location_name,
    re.start_time,
    re.end_time
ORDER BY
    re.start_time;

-- ============================================================
-- SECTION 6: Many-to-Many investigation_events Join
-- ============================================================

-- Full investigation → regional_events many-to-many join with extra columns
SELECT
    i.investigation_id,
    i.investigation_status,
    i.final_decision,
    i.confidence_score,
    re.event_title,
    re.event_type,
    re.severity,
    ie.distance_km,
    ie.time_overlap,
    ie.relevance_score,
    ie.impact_status,
    ie.ai_reasoning
FROM
    investigations i
    INNER JOIN investigation_events ie ON i.investigation_id = ie.investigation_id
    INNER JOIN regional_events      re ON ie.event_id        = re.event_id
ORDER BY
    i.investigation_id,
    ie.relevance_score DESC;

-- ============================================================
-- SECTION 7: Full Complaint Workflow Query
-- complaint → order → shipment → tracking → investigation
--           → regional events → response
-- ============================================================

SELECT
    -- Complaint
    cmp.complaint_id,
    cmp.email_subject                         AS complaint_subject,
    cmp.complaint_type,
    cmp.urgency,
    cmp.status                                AS complaint_status,
    cmp.received_at,

    -- Customer
    cu.name                                   AS customer_name,
    cu.email                                  AS customer_email,

    -- Order
    o.order_number,
    o.order_status,
    o.delivery_city,

    -- Shipment
    s.tracking_number,
    s.courier_name,
    s.current_status                          AS shipment_status,
    s.last_location,

    -- Most recent tracking event
    latest_te.event_time                      AS last_event_time,
    latest_te.location_name                   AS last_event_location,
    latest_te.status                          AS last_tracking_status,

    -- Investigation
    inv.investigation_id,
    inv.investigation_status,
    inv.final_decision,
    inv.confidence_score,
    inv.ai_summary,

    -- Regional event (highest relevance)
    re.event_title                            AS top_regional_event,
    re.event_type                             AS top_event_type,
    ie.relevance_score                        AS top_relevance_score,
    ie.impact_status,

    -- Response
    resp.response_type,
    resp.approval_status                      AS response_status,
    resp.subject                              AS response_subject,
    resp.sent_at                              AS response_sent_at

FROM
    complaints cmp

    -- Customer
    INNER JOIN customers cu
        ON cmp.customer_id = cu.customer_id

    -- Order (nullable)
    LEFT JOIN orders o
        ON cmp.order_id = o.order_id

    -- Shipment (via order)
    LEFT JOIN shipments s
        ON o.order_id = s.order_id

    -- Most recent tracking event per shipment (lateral subquery)
    LEFT JOIN LATERAL (
        SELECT *
        FROM tracking_events te
        WHERE te.shipment_id = s.shipment_id
        ORDER BY te.event_time DESC
        LIMIT 1
    ) latest_te ON TRUE

    -- Investigation
    LEFT JOIN investigations inv
        ON cmp.complaint_id = inv.complaint_id

    -- Top investigation event by relevance score (lateral subquery)
    LEFT JOIN LATERAL (
        SELECT *
        FROM investigation_events
        WHERE investigation_id = inv.investigation_id
        ORDER BY relevance_score DESC
        LIMIT 1
    ) ie ON TRUE

    -- Regional event (highest relevance)
    LEFT JOIN regional_events re
        ON ie.event_id = re.event_id

    -- Response
    LEFT JOIN responses resp
        ON cmp.complaint_id = resp.complaint_id

ORDER BY
    cmp.received_at;

-- ============================================================
-- SECTION 8: ENUM Type Verification
-- ============================================================

-- Verify user_role enum values
SELECT enumlabel AS user_role_values
FROM pg_enum
WHERE enumtypid = (
    SELECT oid FROM pg_type WHERE typname = 'user_role'
)
ORDER BY enumsortorder;
-- Expected: ADMIN, SUPPORT, INVESTIGATOR

-- Verify regional_event_type enum values
SELECT enumlabel AS regional_event_type_values
FROM pg_enum
WHERE enumtypid = (
    SELECT oid FROM pg_type WHERE typname = 'regional_event_type'
)
ORDER BY enumsortorder;
-- Expected: WEATHER, FLOOD, CYCLONE, ROAD_CLOSURE, TRANSPORT_STRIKE, POLITICAL_DISTURBANCE, LANDSLIDE, OTHER

-- ============================================================
-- SECTION 9: Index Existence Verification
-- ============================================================

SELECT
    indexname,
    tablename,
    indexdef
FROM
    pg_indexes
WHERE
    schemaname = 'public'
    AND indexname IN (
        'idx_customers_email',
        'idx_orders_order_number',
        'idx_orders_customer_id',
        'idx_shipments_tracking_number',
        'idx_shipments_order_id',
        'idx_shipments_warehouse_id',
        'idx_tracking_events_shipment_id',
        'idx_tracking_events_event_time',
        'idx_complaints_customer_id',
        'idx_complaints_order_id',
        'idx_complaints_status',
        'idx_complaints_assigned_to',
        'idx_regional_events_event_type',
        'idx_regional_events_start_time',
        'idx_investigations_complaint_id',
        'idx_investigations_shipment_id',
        'idx_investigations_status',
        'idx_investigation_events_investigation_id',
        'idx_investigation_events_event_id',
        'idx_responses_complaint_id',
        'idx_responses_investigation_id',
        'idx_responses_approval_status'
    )
ORDER BY
    tablename,
    indexname;
-- Expected: 22 rows (all custom indexes)

-- ============================================================
-- SECTION 10: CHECK Constraint Verification
-- ============================================================

-- Verify confidence_score CHECK constraint on investigations
SELECT
    conname   AS constraint_name,
    contype   AS constraint_type,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE
    conrelid = 'investigations'::regclass
    AND contype = 'c';
-- Expected: chk_investigations_confidence_score

-- Verify relevance_score CHECK constraint on investigation_events
SELECT
    conname   AS constraint_name,
    contype   AS constraint_type,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE
    conrelid = 'investigation_events'::regclass
    AND contype = 'c';
-- Expected: chk_investigation_events_relevance_score

-- ============================================================
-- SECTION 11: Sample Data Spot Checks
-- ============================================================

-- Verify user roles
SELECT name, email, role FROM users ORDER BY role;

-- Verify shipment statuses match tracking events
SELECT
    s.tracking_number,
    s.current_status,
    COUNT(te.tracking_id) AS event_count,
    MAX(te.event_time)    AS last_event_time
FROM
    shipments s
    LEFT JOIN tracking_events te ON s.shipment_id = te.shipment_id
GROUP BY
    s.shipment_id, s.tracking_number, s.current_status
ORDER BY
    s.tracking_number;

-- Verify investigations are completed with confidence scores
SELECT
    investigation_id,
    investigation_status,
    final_decision,
    confidence_score
FROM
    investigations
ORDER BY
    confidence_score DESC;

-- Verify responses are sent
SELECT
    response_id,
    response_type,
    approval_status,
    sent_at
FROM
    responses
ORDER BY
    sent_at;
