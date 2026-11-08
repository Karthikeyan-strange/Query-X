-- ============================================================
-- QueryX Database Schema - V1__create_initial_schema.sql
-- PostgreSQL Production Schema
-- ============================================================

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'SUPPORT', 'INVESTIGATOR');

CREATE TYPE regional_event_type AS ENUM (
    'WEATHER',
    'FLOOD',
    'CYCLONE',
    'ROAD_CLOSURE',
    'TRANSPORT_STRIKE',
    'POLITICAL_DISTURBANCE',
    'LANDSLIDE',
    'OTHER'
);

-- ============================================================
-- TABLE 1: users
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    user_id    UUID         NOT NULL DEFAULT gen_random_uuid(),
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    role       user_role    NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_users PRIMARY KEY (user_id),
    CONSTRAINT uq_users_email UNIQUE (email)
);

-- ============================================================
-- TABLE 2: customers
-- ============================================================

CREATE TABLE IF NOT EXISTS customers (
    customer_id UUID         NOT NULL DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    phone       VARCHAR(50)  NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_customers PRIMARY KEY (customer_id),
    CONSTRAINT uq_customers_email UNIQUE (email)
);

-- ============================================================
-- TABLE 3: warehouses
-- ============================================================

CREATE TABLE IF NOT EXISTS warehouses (
    warehouse_id   UUID            NOT NULL DEFAULT gen_random_uuid(),
    warehouse_name VARCHAR(255)    NOT NULL,
    address        TEXT            NOT NULL,
    city           VARCHAR(100)    NOT NULL,
    district       VARCHAR(100)    NOT NULL,
    state          VARCHAR(100)    NOT NULL,
    latitude       DECIMAL(10, 7)  NOT NULL,
    longitude      DECIMAL(10, 7)  NOT NULL,

    CONSTRAINT pk_warehouses PRIMARY KEY (warehouse_id)
);

-- ============================================================
-- TABLE 4: orders
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
    order_id            UUID            NOT NULL DEFAULT gen_random_uuid(),
    order_number        VARCHAR(100)    NOT NULL,
    customer_id         UUID            NOT NULL,
    order_date          TIMESTAMPTZ     NOT NULL DEFAULT now(),
    delivery_address    TEXT            NOT NULL,
    delivery_city       VARCHAR(100)    NOT NULL,
    delivery_state      VARCHAR(100)    NOT NULL,
    delivery_latitude   DECIMAL(10, 7)  NULL,
    delivery_longitude  DECIMAL(10, 7)  NULL,
    order_status        VARCHAR(50)     NOT NULL DEFAULT 'PENDING',

    CONSTRAINT pk_orders PRIMARY KEY (order_id),
    CONSTRAINT uq_orders_order_number UNIQUE (order_number),
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id)
        REFERENCES customers (customer_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================================
-- TABLE 5: shipments
-- ============================================================

CREATE TABLE IF NOT EXISTS shipments (
    shipment_id        UUID            NOT NULL DEFAULT gen_random_uuid(),
    order_id           UUID            NOT NULL,
    warehouse_id       UUID            NOT NULL,
    tracking_number    VARCHAR(100)    NOT NULL,
    courier_name       VARCHAR(100)    NOT NULL,
    current_status     VARCHAR(50)     NOT NULL DEFAULT 'PENDING',
    estimated_delivery TIMESTAMPTZ     NULL,
    actual_delivery    TIMESTAMPTZ     NULL,
    last_location      TEXT            NULL,
    last_latitude      DECIMAL(10, 7)  NULL,
    last_longitude     DECIMAL(10, 7)  NULL,

    CONSTRAINT pk_shipments PRIMARY KEY (shipment_id),
    CONSTRAINT uq_shipments_tracking_number UNIQUE (tracking_number),
    CONSTRAINT fk_shipments_order FOREIGN KEY (order_id)
        REFERENCES orders (order_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_shipments_warehouse FOREIGN KEY (warehouse_id)
        REFERENCES warehouses (warehouse_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================================
-- TABLE 6: tracking_events
-- ============================================================

CREATE TABLE IF NOT EXISTS tracking_events (
    tracking_id       UUID            NOT NULL DEFAULT gen_random_uuid(),
    shipment_id       UUID            NOT NULL,
    event_description TEXT            NOT NULL,
    location_name     VARCHAR(255)    NOT NULL,
    latitude          DECIMAL(10, 7)  NULL,
    longitude         DECIMAL(10, 7)  NULL,
    event_time        TIMESTAMPTZ     NOT NULL,
    status            VARCHAR(50)     NOT NULL,

    CONSTRAINT pk_tracking_events PRIMARY KEY (tracking_id),
    CONSTRAINT fk_tracking_events_shipment FOREIGN KEY (shipment_id)
        REFERENCES shipments (shipment_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- TABLE 7: complaints
-- ============================================================

CREATE TABLE IF NOT EXISTS complaints (
    complaint_id        UUID         NOT NULL DEFAULT gen_random_uuid(),
    customer_id         UUID         NOT NULL,
    order_id            UUID         NULL,
    email_subject       VARCHAR(500) NOT NULL,
    email_body          TEXT         NOT NULL,
    complaint_type      VARCHAR(100) NULL,
    urgency             VARCHAR(50)  NULL,
    extracted_order_id  VARCHAR(100) NULL,
    status              VARCHAR(50)  NOT NULL DEFAULT 'RECEIVED',
    assigned_to         UUID         NULL,
    received_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_complaints PRIMARY KEY (complaint_id),
    CONSTRAINT fk_complaints_customer FOREIGN KEY (customer_id)
        REFERENCES customers (customer_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_complaints_order FOREIGN KEY (order_id)
        REFERENCES orders (order_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_complaints_assigned_to FOREIGN KEY (assigned_to)
        REFERENCES users (user_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ============================================================
-- TABLE 8: regional_events
-- ============================================================

CREATE TABLE IF NOT EXISTS regional_events (
    event_id            UUID                NOT NULL DEFAULT gen_random_uuid(),
    event_title         VARCHAR(500)        NOT NULL,
    event_type          regional_event_type NOT NULL,
    description         TEXT                NULL,
    severity            VARCHAR(50)         NULL,
    location_name       VARCHAR(255)        NOT NULL,
    latitude            DECIMAL(10, 7)      NOT NULL,
    longitude           DECIMAL(10, 7)      NOT NULL,
    affected_radius_km  DECIMAL(8, 2)       NULL,
    source_name         VARCHAR(255)        NULL,
    source_url          TEXT                NULL,
    start_time          TIMESTAMPTZ         NOT NULL,
    end_time            TIMESTAMPTZ         NULL,
    detected_at         TIMESTAMPTZ         NOT NULL DEFAULT now(),

    CONSTRAINT pk_regional_events PRIMARY KEY (event_id)
);

-- ============================================================
-- TABLE 9: investigations
-- ============================================================

CREATE TABLE IF NOT EXISTS investigations (
    investigation_id    UUID            NOT NULL DEFAULT gen_random_uuid(),
    complaint_id        UUID            NOT NULL,
    shipment_id         UUID            NULL,
    investigation_status VARCHAR(50)   NOT NULL DEFAULT 'PENDING',
    ai_summary          TEXT            NULL,
    final_decision      VARCHAR(255)    NULL,
    confidence_score    DECIMAL(5, 4)   NULL,
    started_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),
    completed_at        TIMESTAMPTZ     NULL,

    CONSTRAINT pk_investigations PRIMARY KEY (investigation_id),
    CONSTRAINT fk_investigations_complaint FOREIGN KEY (complaint_id)
        REFERENCES complaints (complaint_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_investigations_shipment FOREIGN KEY (shipment_id)
        REFERENCES shipments (shipment_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_investigations_confidence_score
        CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1))
);

-- ============================================================
-- TABLE 10: investigation_events (many-to-many join with extra columns)
-- ============================================================

CREATE TABLE IF NOT EXISTS investigation_events (
    id                UUID            NOT NULL DEFAULT gen_random_uuid(),
    investigation_id  UUID            NOT NULL,
    event_id          UUID            NOT NULL,
    distance_km       DECIMAL(8, 2)   NULL,
    time_overlap      BOOLEAN         NULL,
    relevance_score   DECIMAL(5, 4)   NULL,
    ai_reasoning      TEXT            NULL,
    impact_status     VARCHAR(100)    NULL,

    CONSTRAINT pk_investigation_events PRIMARY KEY (id),
    CONSTRAINT uq_investigation_events UNIQUE (investigation_id, event_id),
    CONSTRAINT fk_investigation_events_investigation FOREIGN KEY (investigation_id)
        REFERENCES investigations (investigation_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_investigation_events_regional_event FOREIGN KEY (event_id)
        REFERENCES regional_events (event_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_investigation_events_relevance_score
        CHECK (relevance_score IS NULL OR (relevance_score >= 0 AND relevance_score <= 1))
);

-- ============================================================
-- TABLE 11: responses
-- ============================================================

CREATE TABLE IF NOT EXISTS responses (
    response_id      UUID         NOT NULL DEFAULT gen_random_uuid(),
    complaint_id     UUID         NOT NULL,
    investigation_id UUID         NULL,
    response_type    VARCHAR(50)  NOT NULL,
    subject          VARCHAR(500) NOT NULL,
    response_body    TEXT         NOT NULL,
    approval_status  VARCHAR(50)  NOT NULL DEFAULT 'DRAFT',
    created_by       UUID         NULL,
    sent_at          TIMESTAMPTZ  NULL,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_responses PRIMARY KEY (response_id),
    CONSTRAINT fk_responses_complaint FOREIGN KEY (complaint_id)
        REFERENCES complaints (complaint_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_responses_investigation FOREIGN KEY (investigation_id)
        REFERENCES investigations (investigation_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_responses_created_by FOREIGN KEY (created_by)
        REFERENCES users (user_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ============================================================
-- INDEXES
-- ============================================================

-- customers
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers (email);

-- orders
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders (customer_id);

-- shipments
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON shipments (tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON shipments (order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_warehouse_id ON shipments (warehouse_id);

-- tracking_events
CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment_id ON tracking_events (shipment_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_event_time ON tracking_events (event_time);

-- complaints
CREATE INDEX IF NOT EXISTS idx_complaints_customer_id ON complaints (customer_id);
CREATE INDEX IF NOT EXISTS idx_complaints_order_id ON complaints (order_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints (status);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_to ON complaints (assigned_to);

-- regional_events
CREATE INDEX IF NOT EXISTS idx_regional_events_event_type ON regional_events (event_type);
CREATE INDEX IF NOT EXISTS idx_regional_events_start_time ON regional_events (start_time);

-- investigations
CREATE INDEX IF NOT EXISTS idx_investigations_complaint_id ON investigations (complaint_id);
CREATE INDEX IF NOT EXISTS idx_investigations_shipment_id ON investigations (shipment_id);
CREATE INDEX IF NOT EXISTS idx_investigations_status ON investigations (investigation_status);

-- investigation_events
CREATE INDEX IF NOT EXISTS idx_investigation_events_investigation_id ON investigation_events (investigation_id);
CREATE INDEX IF NOT EXISTS idx_investigation_events_event_id ON investigation_events (event_id);

-- responses
CREATE INDEX IF NOT EXISTS idx_responses_complaint_id ON responses (complaint_id);
CREATE INDEX IF NOT EXISTS idx_responses_investigation_id ON responses (investigation_id);
CREATE INDEX IF NOT EXISTS idx_responses_approval_status ON responses (approval_status);
