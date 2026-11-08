-- ============================================================
-- QueryX Sample Data - Tamil Nadu Logistics Context
-- sample_data.sql
-- ============================================================
-- Run AFTER V1__create_initial_schema.sql has been applied.
-- All UUIDs are hard-coded v4 strings.
-- ============================================================

-- ============================================================
-- USERS (2 records: 1 ADMIN, 1 SUPPORT)
-- ============================================================

INSERT INTO users (user_id, name, email, password, role, created_at)
VALUES
    (
        'a1b2c3d4-0001-4000-8000-100000000001',
        'Arjun Krishnamurthy',
        'arjun.admin@queryx.in',
        '$2a$12$XKP3v5Z8q1J2mN9wL7cReOeU4A6kFhBzWd3TnCPsY8vMrGj0HiOlu',  -- bcrypt hashed 'Admin@1234'
        'ADMIN',
        '2024-01-10T09:00:00+05:30'
    ),
    (
        'a1b2c3d4-0001-4000-8000-100000000002',
        'Priya Subramaniam',
        'priya.support@queryx.in',
        '$2a$12$YLQ4w6A9r2K3nO0xM8dSfPfV5B7lGiCaXe4UoDQtZ9wNsHk1IjPlv',  -- bcrypt hashed 'Support@1234'
        'SUPPORT',
        '2024-01-15T10:30:00+05:30'
    );

-- ============================================================
-- CUSTOMERS (2 records)
-- ============================================================

INSERT INTO customers (customer_id, name, email, phone, created_at)
VALUES
    (
        'b2c3d4e5-0002-4000-8000-200000000001',
        'Karthik Rajan',
        'karthik.rajan@gmail.com',
        '+91-9876543210',
        '2024-02-01T11:00:00+05:30'
    ),
    (
        'b2c3d4e5-0002-4000-8000-200000000002',
        'Meenakshi Sundaram',
        'meenakshi.s@outlook.com',
        '+91-8765432109',
        '2024-02-05T14:00:00+05:30'
    );

-- ============================================================
-- WAREHOUSES (2 records: Chennai, Coimbatore)
-- ============================================================

INSERT INTO warehouses (warehouse_id, warehouse_name, address, city, district, state, latitude, longitude)
VALUES
    (
        'c3d4e5f6-0003-4000-8000-300000000001',
        'QueryX Chennai Central Warehouse',
        'No. 45, Industrial Estate, Ambattur, Chennai - 600058',
        'Chennai',
        'Tiruvallur',
        'Tamil Nadu',
        13.1143200,
        80.1548600
    ),
    (
        'c3d4e5f6-0003-4000-8000-300000000002',
        'QueryX Coimbatore Distribution Hub',
        'No. 12, SIPCOT Industrial Park, Perundurai Road, Coimbatore - 641021',
        'Coimbatore',
        'Coimbatore',
        'Tamil Nadu',
        10.9916600,
        76.9674400
    );

-- ============================================================
-- ORDERS (2 records)
-- ============================================================

INSERT INTO orders (order_id, order_number, customer_id, order_date, delivery_address, delivery_city, delivery_state, delivery_latitude, delivery_longitude, order_status)
VALUES
    (
        'd4e5f6a7-0004-4000-8000-400000000001',
        'QX-2024-00001',
        'b2c3d4e5-0002-4000-8000-200000000001',
        '2024-03-01T08:00:00+05:30',
        'No. 7, Gandhi Nagar, 3rd Cross Street, Madurai - 625001',
        'Madurai',
        'Tamil Nadu',
        9.9252000,
        78.1198000
    ),
    (
        'd4e5f6a7-0004-4000-8000-400000000002',
        'QX-2024-00002',
        'b2c3d4e5-0002-4000-8000-200000000002',
        '2024-03-05T10:00:00+05:30',
        'No. 22, Anna Nagar, Salem - 636004',
        'Salem',
        'Tamil Nadu',
        11.6643300,
        78.1460000
    );

-- ============================================================
-- SHIPMENTS (2 records)
-- ============================================================

INSERT INTO shipments (shipment_id, order_id, warehouse_id, tracking_number, courier_name, current_status, estimated_delivery, actual_delivery, last_location, last_latitude, last_longitude)
VALUES
    (
        'e5f6a7b8-0005-4000-8000-500000000001',
        'd4e5f6a7-0004-4000-8000-400000000001',
        'c3d4e5f6-0003-4000-8000-300000000001',
        'QXT-CH-20240301-001',
        'Blue Dart Express',
        'DELAYED',
        '2024-03-04T18:00:00+05:30',
        NULL,
        'Trichy Sorting Hub, Tiruchirappalli',
        10.7905000,
        78.7047000
    ),
    (
        'e5f6a7b8-0005-4000-8000-500000000002',
        'd4e5f6a7-0004-4000-8000-400000000002',
        'c3d4e5f6-0003-4000-8000-300000000002',
        'QXT-CB-20240305-001',
        'DTDC Courier',
        'DELIVERED',
        '2024-03-08T18:00:00+05:30',
        '2024-03-08T14:30:00+05:30',
        'Salem Delivery Office, Salem',
        11.6643300,
        78.1460000
    );

-- ============================================================
-- TRACKING EVENTS (5+ per shipment = 12 total)
-- ============================================================

-- Shipment 1 tracking events (QXT-CH-20240301-001) - DELAYED due to flood
INSERT INTO tracking_events (tracking_id, shipment_id, event_description, location_name, latitude, longitude, event_time, status)
VALUES
    (
        'f6a7b8c9-0006-4000-8000-600000000001',
        'e5f6a7b8-0005-4000-8000-500000000001',
        'Shipment picked up from Chennai Central Warehouse and dispatched for delivery.',
        'Chennai Central Warehouse, Ambattur',
        13.1143200,
        80.1548600,
        '2024-03-01T10:30:00+05:30',
        'PICKED_UP'
    ),
    (
        'f6a7b8c9-0006-4000-8000-600000000002',
        'e5f6a7b8-0005-4000-8000-500000000001',
        'Package arrived at Chennai Sorting Hub and processed for dispatch.',
        'Blue Dart Chennai Hub, Perungalathur',
        12.8990000,
        80.1420000,
        '2024-03-01T16:00:00+05:30',
        'IN_TRANSIT'
    ),
    (
        'f6a7b8c9-0006-4000-8000-600000000003',
        'e5f6a7b8-0005-4000-8000-500000000001',
        'Package departed Chennai for Trichy. Estimated arrival at Trichy hub by morning.',
        'Blue Dart Chennai Hub, Perungalathur',
        12.8990000,
        80.1420000,
        '2024-03-01T22:00:00+05:30',
        'IN_TRANSIT'
    ),
    (
        'f6a7b8c9-0006-4000-8000-600000000004',
        'e5f6a7b8-0005-4000-8000-500000000001',
        'Package arrived at Trichy Sorting Hub and held for regional clearance.',
        'Trichy Sorting Hub, Tiruchirappalli',
        10.7905000,
        78.7047000,
        '2024-03-02T07:45:00+05:30',
        'IN_TRANSIT'
    ),
    (
        'f6a7b8c9-0006-4000-8000-600000000005',
        'e5f6a7b8-0005-4000-8000-500000000001',
        'Delivery delayed due to severe flooding on NH-38 near Dindigul. Roads are impassable. Shipment held at Trichy hub.',
        'Trichy Sorting Hub, Tiruchirappalli',
        10.7905000,
        78.7047000,
        '2024-03-02T13:00:00+05:30',
        'DELAYED'
    ),
    (
        'f6a7b8c9-0006-4000-8000-600000000006',
        'e5f6a7b8-0005-4000-8000-500000000001',
        'Flooding conditions persist on delivery route. Courier awaiting road clearance from local authorities.',
        'Trichy Sorting Hub, Tiruchirappalli',
        10.7905000,
        78.7047000,
        '2024-03-03T09:00:00+05:30',
        'DELAYED'
    );

-- Shipment 2 tracking events (QXT-CB-20240305-001) - DELIVERED successfully
INSERT INTO tracking_events (tracking_id, shipment_id, event_description, location_name, latitude, longitude, event_time, status)
VALUES
    (
        'f6a7b8c9-0006-4000-8000-600000000007',
        'e5f6a7b8-0005-4000-8000-500000000002',
        'Shipment picked up from Coimbatore Distribution Hub.',
        'QueryX Coimbatore Distribution Hub, SIPCOT',
        10.9916600,
        76.9674400,
        '2024-03-05T11:00:00+05:30',
        'PICKED_UP'
    ),
    (
        'f6a7b8c9-0006-4000-8000-600000000008',
        'e5f6a7b8-0005-4000-8000-500000000002',
        'Package processed at Coimbatore DTDC sorting facility.',
        'DTDC Coimbatore Sorting Center, Race Course',
        11.0168000,
        76.9558000,
        '2024-03-05T15:30:00+05:30',
        'IN_TRANSIT'
    ),
    (
        'f6a7b8c9-0006-4000-8000-600000000009',
        'e5f6a7b8-0005-4000-8000-500000000002',
        'Package departed Coimbatore en route to Salem.',
        'DTDC Coimbatore Sorting Center, Race Course',
        11.0168000,
        76.9558000,
        '2024-03-05T21:00:00+05:30',
        'IN_TRANSIT'
    ),
    (
        'f6a7b8c9-0006-4000-8000-600000000010',
        'e5f6a7b8-0005-4000-8000-500000000002',
        'Package arrived at Salem distribution center. Out for delivery soon.',
        'DTDC Salem Distribution Center, Fairlands',
        11.6811000,
        78.1424000,
        '2024-03-06T08:00:00+05:30',
        'IN_TRANSIT'
    ),
    (
        'f6a7b8c9-0006-4000-8000-600000000011',
        'e5f6a7b8-0005-4000-8000-500000000002',
        'Package out for delivery. Courier on the way to delivery address in Anna Nagar, Salem.',
        'Salem Delivery Office, Salem',
        11.6643300,
        78.1460000,
        '2024-03-08T10:00:00+05:30',
        'OUT_FOR_DELIVERY'
    ),
    (
        'f6a7b8c9-0006-4000-8000-600000000012',
        'e5f6a7b8-0005-4000-8000-500000000002',
        'Package successfully delivered to Meenakshi Sundaram at No. 22, Anna Nagar, Salem. Received by recipient.',
        'No. 22, Anna Nagar, Salem',
        11.6643300,
        78.1460000,
        '2024-03-08T14:30:00+05:30',
        'DELIVERED'
    );

-- ============================================================
-- COMPLAINTS (2 records)
-- ============================================================

INSERT INTO complaints (complaint_id, customer_id, order_id, email_subject, email_body, complaint_type, urgency, extracted_order_id, status, assigned_to, received_at)
VALUES
    (
        'a7b8c9d0-0007-4000-8000-700000000001',
        'b2c3d4e5-0002-4000-8000-200000000001',
        'd4e5f6a7-0004-4000-8000-400000000001',
        'My order QX-2024-00001 has not been delivered - URGENT',
        'Dear QueryX Support,

I placed an order (QX-2024-00001) on 1st March 2024 and was promised delivery by 4th March. It is now 5th March and I still have not received my package. The tracking shows it has been stuck at Trichy since yesterday.

This is a time-sensitive item. Please investigate and arrange delivery urgently. I am very disappointed with this service.

Order Number: QX-2024-00001
Tracking Number: QXT-CH-20240301-001

Regards,
Karthik Rajan
+91-9876543210',
        'DELIVERY_DELAY',
        'HIGH',
        'QX-2024-00001',
        'UNDER_INVESTIGATION',
        'a1b2c3d4-0001-4000-8000-100000000002',
        '2024-03-05T09:15:00+05:30'
    ),
    (
        'a7b8c9d0-0007-4000-8000-700000000002',
        'b2c3d4e5-0002-4000-8000-200000000002',
        'd4e5f6a7-0004-4000-8000-400000000002',
        'Package delivered in damaged condition - Order QX-2024-00002',
        'Hello,

I received my order QX-2024-00002 today (8th March 2024), but the package was delivered in a damaged condition. The outer carton was crushed and there is visible damage to the contents inside.

I request either a replacement or a refund for the damaged item. Please look into this matter.

Order Number: QX-2024-00002
Tracking Number: QXT-CB-20240305-001

Best regards,
Meenakshi Sundaram',
        'DAMAGED_GOODS',
        'MEDIUM',
        'QX-2024-00002',
        'RESOLVED',
        'a1b2c3d4-0001-4000-8000-100000000002',
        '2024-03-08T16:00:00+05:30'
    );

-- ============================================================
-- REGIONAL EVENTS (2 records: Flood + Road Closure)
-- ============================================================

INSERT INTO regional_events (event_id, event_title, event_type, description, severity, location_name, latitude, longitude, affected_radius_km, source_name, source_url, start_time, end_time, detected_at)
VALUES
    (
        'b8c9d0e1-0008-4000-8000-800000000001',
        'Heavy Flooding on NH-38 near Dindigul - Madurai Corridor Disrupted',
        'FLOOD',
        'Severe flooding caused by cyclonic remnant rainfall has inundated major sections of NH-38 between Trichy and Dindigul. The flood waters have made the highway impassable for all vehicles. NDRF teams are deployed for rescue operations. All logistics routes through this corridor are severely affected.',
        'HIGH',
        'Dindigul, Tamil Nadu',
        10.3673000,
        77.9803000,
        75.00,
        'Tamil Nadu State Disaster Management Authority',
        'https://tnsdma.tn.gov.in/alerts/flood-nh38-march-2024',
        '2024-03-02T06:00:00+05:30',
        '2024-03-07T18:00:00+05:30',
        '2024-03-02T07:30:00+05:30'
    ),
    (
        'b8c9d0e1-0008-4000-8000-800000000002',
        'Road Closure - Madurai Bypass Due to Emergency Bridge Repair',
        'ROAD_CLOSURE',
        'The Madurai Western Bypass has been closed for emergency structural repair works on the Vaigai River bridge. All heavy vehicles are diverted via alternate routes, adding 2-3 hours to delivery times in the Madurai region. Light vehicles must use inner city roads.',
        'MEDIUM',
        'Madurai, Tamil Nadu',
        9.9252000,
        78.1198000,
        30.00,
        'Tamil Nadu Highways Department',
        'https://highways.tn.gov.in/closures/madurai-bypass-march-2024',
        '2024-03-03T00:00:00+05:30',
        '2024-03-10T23:59:00+05:30',
        '2024-03-03T01:00:00+05:30'
    );

-- ============================================================
-- INVESTIGATIONS (2 records)
-- ============================================================

INSERT INTO investigations (investigation_id, complaint_id, shipment_id, investigation_status, ai_summary, final_decision, confidence_score, started_at, completed_at)
VALUES
    (
        'c9d0e1f2-0009-4000-8000-900000000001',
        'a7b8c9d0-0007-4000-8000-700000000001',
        'e5f6a7b8-0005-4000-8000-500000000001',
        'COMPLETED',
        'The shipment QXT-CH-20240301-001 for order QX-2024-00001 experienced a significant delay due to severe flooding on NH-38 near Dindigul, Tamil Nadu. The flood event (started 2nd March 2024) is documented and verified through TNSDMA sources. The shipment''s last known position at Trichy Sorting Hub is approximately 68 km from the flood zone, within the declared affected radius of 75 km. The delay is classified as a force majeure event beyond the courier''s control. Customer communication and expedited re-delivery should be initiated once road conditions normalise.',
        'FORCE_MAJEURE_DELAY',
        0.9200,
        '2024-03-05T10:00:00+05:30',
        '2024-03-05T12:30:00+05:30'
    ),
    (
        'c9d0e1f2-0009-4000-8000-900000000002',
        'a7b8c9d0-0007-4000-8000-700000000002',
        'e5f6a7b8-0005-4000-8000-500000000002',
        'COMPLETED',
        'The package for order QX-2024-00002 (tracking QXT-CB-20240305-001) was successfully delivered but arrived in a damaged condition. Review of tracking events shows no anomalous handling flags. The road closure on Madurai Bypass is not relevant to this shipment''s route (Coimbatore to Salem). Damage likely occurred during loading/unloading at the DTDC Salem distribution center. Recommend full refund or replacement as per company policy.',
        'COURIER_FAULT_DAMAGE',
        0.8500,
        '2024-03-08T17:00:00+05:30',
        '2024-03-09T09:00:00+05:30'
    );

-- ============================================================
-- INVESTIGATION EVENTS (linking investigations to regional events)
-- ============================================================

INSERT INTO investigation_events (id, investigation_id, event_id, distance_km, time_overlap, relevance_score, ai_reasoning, impact_status)
VALUES
    (
        'd0e1f2a3-0010-4000-8000-000000000001',
        'c9d0e1f2-0009-4000-8000-900000000001',
        'b8c9d0e1-0008-4000-8000-800000000001',
        68.42,
        TRUE,
        0.9500,
        'The flood event on NH-38 near Dindigul directly overlaps with the shipment delay period (2nd March – 5th March). The shipment was stuck at Trichy hub which is 68.42 km from the flood epicenter, well within the 75 km affected radius. The road between Trichy and Madurai (the delivery destination) passes through the flooded corridor. This event is the primary cause of the shipment delay.',
        'PRIMARY_CAUSE'
    ),
    (
        'd0e1f2a3-0010-4000-8000-000000000002',
        'c9d0e1f2-0009-4000-8000-900000000001',
        'b8c9d0e1-0008-4000-8000-800000000002',
        45.20,
        TRUE,
        0.6500,
        'The Madurai Bypass road closure began on 3rd March 2024 and also overlaps with the delay period. While the bypass closure is at the delivery destination (Madurai), it is a secondary contributing factor that would further delay last-mile delivery even after the flood waters recede. The shipment would need to navigate alternate inner-city routes upon reaching Madurai.',
        'CONTRIBUTING_FACTOR'
    ),
    (
        'd0e1f2a3-0010-4000-8000-000000000003',
        'c9d0e1f2-0009-4000-8000-900000000002',
        'b8c9d0e1-0008-4000-8000-800000000002',
        180.50,
        FALSE,
        0.1000,
        'The Madurai Bypass road closure is geographically distant (180.5 km) from the Coimbatore-Salem delivery route and has no temporal overlap with the actual delivery of this shipment on 8th March. This event is not relevant to the damage complaint for order QX-2024-00002.',
        'NOT_RELEVANT'
    );

-- ============================================================
-- RESPONSES (2 records)
-- ============================================================

INSERT INTO responses (response_id, complaint_id, investigation_id, response_type, subject, response_body, approval_status, created_by, sent_at, created_at)
VALUES
    (
        'e1f2a3b4-0011-4000-8000-110000000001',
        'a7b8c9d0-0007-4000-8000-700000000001',
        'c9d0e1f2-0009-4000-8000-900000000001',
        'AI_GENERATED',
        'RE: Your Order QX-2024-00001 - Delay Due to Flooding (Force Majeure)',
        'Dear Karthik,

Thank you for reaching out to QueryX Support regarding your order QX-2024-00001.

We sincerely apologise for the delay in delivering your shipment (Tracking: QXT-CH-20240301-001). After thoroughly investigating your complaint, we have identified the cause of the delay.

**Reason for Delay:**
Severe flooding on NH-38 near Dindigul, Tamil Nadu has rendered the primary delivery route impassable. This is a declared force majeure event verified by the Tamil Nadu State Disaster Management Authority (TNSDMA). Our courier partner Blue Dart has confirmed that road conditions made it unsafe to proceed with delivery.

**Current Status:**
Your shipment is safely held at the Trichy Sorting Hub. As of 7th March 2024, the floodwaters have begun receding and road clearances are being issued. Your delivery is expected to be rescheduled within 24-48 hours.

**What We Are Doing:**
- Your shipment has been prioritised for the next available dispatch once routes reopen
- We are waiving all extended storage charges
- You will receive a fresh delivery notification via SMS and email

We understand how frustrating delays can be and assure you that this was entirely beyond the control of our logistics team. We appreciate your patience and understanding.

If you have any further concerns, please do not hesitate to contact us.

Warm regards,
QueryX Customer Support Team
support@queryx.in | 1800-XXX-XXXX',
        'SENT',
        'a1b2c3d4-0001-4000-8000-100000000002',
        '2024-03-05T13:00:00+05:30',
        '2024-03-05T12:45:00+05:30'
    ),
    (
        'e1f2a3b4-0011-4000-8000-110000000002',
        'a7b8c9d0-0007-4000-8000-700000000002',
        'c9d0e1f2-0009-4000-8000-900000000002',
        'HUMAN_VERIFIED',
        'RE: Damaged Package - Order QX-2024-00002 - Resolution',
        'Dear Meenakshi,

Thank you for bringing the condition of your delivered package to our attention. We are very sorry to hear that your order QX-2024-00002 arrived in a damaged state.

**Investigation Findings:**
Our team has reviewed the tracking history and handling records for your shipment (QXT-CB-20240305-001). Based on our investigation, we have determined that the damage occurred during the handling process at our courier partner''s (DTDC) distribution facility in Salem.

**Resolution:**
We take full responsibility for this incident. You are entitled to your choice of the following:

1. **Full Replacement** – We will dispatch a replacement item at no charge within 2-3 business days
2. **Full Refund** – A complete refund to your original payment method, processed within 5-7 business days

Please reply to this email or call 1800-XXX-XXXX with your preferred resolution option, and our team will action it immediately.

We have also raised a formal complaint with DTDC and will work to prevent such incidents in the future.

Once again, we apologise for the inconvenience caused and thank you for giving us the opportunity to make this right.

Warm regards,
Priya Subramaniam
Senior Support Executive - QueryX
priya.support@queryx.in',
        'SENT',
        'a1b2c3d4-0001-4000-8000-100000000002',
        '2024-03-09T10:00:00+05:30',
        '2024-03-09T09:30:00+05:30'
    );
