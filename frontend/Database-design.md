# DATABASE ARCHITECTURE CONTEXT
## Regional AI-Powered Delivery Exception Investigation and Customer Response System

You are working on a project called:

**Regional AI-Powered Delivery Exception Investigation and Customer Response System.**

Before writing any code, understand the entire database architecture, its relationships, business logic, and intended functionality.

The database is hosted on **Supabase PostgreSQL**.

The primary backend is **Java 21 + Spring Boot 3**, using Spring Data JPA and Hibernate.

Python FastAPI is used as a separate AI processing service.

React is used for the frontend.

Your responsibility is to understand how all components interact with the database and preserve the database architecture throughout development.

---

# 1. PROJECT PURPOSE

This application investigates delivery delays using real-world regional disruptions.

When a customer submits a delivery complaint, the system must:

1. Understand the customer's complaint.
2. Extract the Order ID.
3. Retrieve order and shipment information.
4. Retrieve the warehouse and delivery destination.
5. Retrieve shipment tracking history.
6. Investigate external disruptions around the shipment's geographical journey.
7. Identify relevant weather conditions, floods, road closures, strikes, political disturbances and other incidents.
8. Correlate external events with shipment locations and timelines.
9. Generate an evidence-based investigation report.
10. Generate a personalized customer response if sufficient evidence exists.
11. Escalate unresolved cases to a human investigator.

The database must support this complete workflow.

The system must never generate fabricated reasons for delivery delays.

---

# 2. TECHNOLOGY ARCHITECTURE

Use the following architecture:

Frontend:
- React
- TypeScript
- Tailwind CSS

Primary Backend:
- Java 21
- Spring Boot 3
- Spring Web
- Spring Data JPA
- Hibernate
- Spring Security
- JWT Authentication
- Spring Mail
- WebClient

Database:
- Supabase PostgreSQL
- PostGIS can be enabled for geographical queries.
- Supabase Storage can optionally store email attachments and investigation documents.

AI Service:
- Python
- FastAPI
- LLM API integration

IMPORTANT ARCHITECTURAL RULE:

Java Spring Boot is the primary backend and the central business logic orchestrator.

Python FastAPI is only responsible for specialized AI processing, including:
- Email classification.
- Order ID extraction.
- Complaint understanding.
- External event analysis.
- Shipment-event correlation.
- Investigation reasoning.
- Customer response drafting.

Python must not independently modify the database.

Spring Boot should retrieve the required database information, send relevant context to Python, receive structured AI results, validate them, and persist the results into Supabase PostgreSQL.

The frontend must communicate with Spring Boot REST APIs rather than directly modifying database records.

---

# 3. DATABASE OVERVIEW

The database contains 11 primary tables.

These tables are organized into four functional modules.

MODULE 1: USER AND LOGISTICS MANAGEMENT
1. users
2. customers
3. warehouses
4. orders
5. shipments
6. tracking_events

MODULE 2: CUSTOMER COMPLAINT MANAGEMENT
7. complaints

MODULE 3: REGIONAL EVENT INTELLIGENCE
8. regional_events

MODULE 4: AI INVESTIGATION AND CUSTOMER COMMUNICATION
9. investigations
10. investigation_events
11. responses

Do not unnecessarily create additional tables or duplicate existing information.

If additional tables become genuinely necessary, explain why before introducing them.

---

# 4. COMPLETE TABLE EXPLANATION

## TABLE 1: users

Purpose:
Stores application users, including administrators, support agents and investigators.

Columns:
- user_id: Primary key.
- name: Full name.
- email: Unique login email.
- password: Secure password hash.
- role: ADMIN, SUPPORT or INVESTIGATOR.
- created_at: Account creation timestamp.

Business logic:

Administrators manage the platform.

Support agents review incoming complaints.

Investigators handle escalated complaints.

The assigned user is referenced by complaints.assigned_to.

Never store plain-text passwords.

## TABLE 2: customers

Purpose:
Stores customers who place orders and submit delivery complaints.

Columns:
- customer_id: Primary key.
- name: Customer name.
- email: Customer email.
- phone: Contact number.
- created_at: Registration timestamp.

Relationships:

One customer can place multiple orders.

One customer can submit multiple complaints.

A customer record must not be duplicated every time a new complaint is received.

Use the customer's email to identify an existing customer where appropriate.

## TABLE 3: warehouses

Purpose:
Stores warehouse information.

Columns:
- warehouse_id: Primary key.
- warehouse_name: Warehouse name.
- address: Complete address.
- city: City.
- district: District.
- state: State.
- latitude: Geographic latitude.
- longitude: Geographic longitude.

Business logic:

A warehouse is associated with multiple shipments.

Its coordinates are used by the AI investigation process to identify regional disruptions near shipment origin locations.

Initially, focus on Tamil Nadu but support other Indian states.

## TABLE 4: orders

Purpose:
Stores customer order information.

Columns:
- order_id: Internal primary key.
- order_number: Unique customer-facing Order ID.
- customer_id: Foreign key referencing customers.
- order_date: Order placement timestamp.
- delivery_address: Destination address.
- delivery_city: Destination city.
- delivery_state: Destination state.
- delivery_latitude: Destination latitude.
- delivery_longitude: Destination longitude.
- order_status: Current order status.

Business logic:

The customer generally provides order_number in the complaint email.

The backend must search using order_number, not the internal database order_id.

One order can contain multiple shipments.

The Order ID is the primary entry point for shipment retrieval.

## TABLE 5: shipments

Purpose:
Stores shipment information for each order.

Columns:
- shipment_id: Primary key.
- order_id: Foreign key referencing orders.
- warehouse_id: Foreign key referencing warehouses.
- tracking_number: Unique courier tracking identifier.
- courier_name: Delivery company.
- current_status: Current shipment status.
- estimated_delivery: Expected delivery timestamp.
- actual_delivery: Actual delivery timestamp.
- last_location: Last known shipment location.
- last_latitude: Last known latitude.
- last_longitude: Last known longitude.

Business logic:

An order may have multiple shipments.

A shipment originates from a warehouse.

The shipment record is the central source for delivery tracking information.

The AI investigation service uses shipment information to understand the delivery journey.

## TABLE 6: tracking_events

Purpose:
Maintains the chronological tracking history of shipments.

Columns:
- tracking_id: Primary key.
- shipment_id: Foreign key referencing shipments.
- event_description: Description of the tracking event.
- location_name: Location of the event.
- latitude: Event latitude.
- longitude: Event longitude.
- event_time: Timestamp of the event.
- status: Shipment status at that point.

Example:

Shipment TRK20261125:

1. Shipment picked up in Chennai.
2. Shipment departed from Chennai warehouse.
3. Shipment arrived at Vellore transit hub.
4. Shipment delayed in transit.
5. Shipment reached Coimbatore.

Business logic:

A shipment can have multiple tracking events.

Always sort tracking events chronologically when displaying shipment history or conducting AI analysis.

These events provide the actual shipment timeline against which external incidents are compared.

Do not confuse tracking events with regional events.

Tracking events describe what happened to the shipment.

Regional events describe what happened in the outside world.

## TABLE 7: complaints

Purpose:
Stores customer delivery complaints.

Columns:
- complaint_id: Primary key.
- customer_id: Foreign key referencing customers.
- order_id: Nullable foreign key referencing orders.
- email_subject: Original email subject.
- email_body: Original email content.
- complaint_type: Classified complaint category.
- urgency: Complaint urgency.
- extracted_order_id: Order ID extracted from the email.
- status: Complaint processing status.
- assigned_to: Nullable foreign key referencing users.
- received_at: Complaint reception timestamp.

Business logic:

When a customer sends an email, the AI extracts the Order ID, complaint category and urgency.

The backend identifies the customer and attempts to find the corresponding order.

If the Order ID exists, associate the complaint with the corresponding order_id.

If the Order ID is invalid or unavailable, order_id remains NULL, but extracted_order_id retains the original value.

The complaint must still be saved.

The complaint can be assigned to a human investigator.

Suggested complaint statuses:

- RECEIVED
- PROCESSING
- INVESTIGATING
- ESCALATED
- AWAITING_CUSTOMER
- RESOLVED
- CLOSED

## TABLE 8: regional_events

Purpose:
Stores external disruptions detected through weather services, disaster authorities, news sources and other external feeds.

Columns:
- event_id: Primary key.
- event_title: Event title.
- event_type: Event category.
- description: Event description.
- severity: Event severity.
- location_name: Affected location.
- latitude: Event latitude.
- longitude: Event longitude.
- affected_radius_km: Approximate affected radius.
- source_name: Source name.
- source_url: Original evidence URL.
- start_time: Event start timestamp.
- end_time: Event end timestamp.
- detected_at: Timestamp when the system detected the event.

Possible event categories:

- WEATHER
- FLOOD
- CYCLONE
- ROAD_CLOSURE
- TRANSPORT_STRIKE
- POLITICAL_DISTURBANCE
- LANDSLIDE
- OTHER

Business logic:

This table must be independent of individual customer complaints.

An event should be stored once and reused across multiple investigations.

For example:

A flood in Vellore may affect 100 shipments.

The system must not create 100 duplicate flood records.

Instead, create one regional event and associate it with multiple investigation records through investigation_events.

The event's source URL and source name must be retained for evidence traceability.

An event's existence does not automatically prove that it caused a shipment delay.

## TABLE 9: investigations

Purpose:
Stores AI investigation results for customer complaints.

Columns:
- investigation_id: Primary key.
- complaint_id: Foreign key referencing complaints.
- shipment_id: Nullable foreign key referencing shipments.
- investigation_status: Current investigation status.
- ai_summary: AI-generated investigation summary.
- final_decision: Final investigation outcome.
- confidence_score: AI confidence score.
- started_at: Investigation start timestamp.
- completed_at: Investigation completion timestamp.

Suggested investigation statuses:

- PENDING
- IN_PROGRESS
- COMPLETED
- FAILED
- ESCALATED

Suggested final decisions:

- CONFIRMED_EXCEPTION
- POSSIBLE_EXCEPTION
- NO_EVIDENCE_FOUND
- NEEDS_HUMAN_REVIEW

Business logic:

One complaint can have multiple investigations if a new investigation is required after additional evidence becomes available.

An investigation may be created without a valid shipment if the order cannot be identified.

Store investigation results separately from complaint information.

Never overwrite an earlier investigation when a new investigation is started.

## TABLE 10: investigation_events

Purpose:
Connects investigations with the regional events considered during the investigation.

Columns:
- id: Primary key.
- investigation_id: Foreign key referencing investigations.
- event_id: Foreign key referencing regional_events.
- distance_km: Distance between the event and the relevant shipment location or route.
- time_overlap: Indicates whether the event overlapped with the shipment timeline.
- relevance_score: AI-assessed relevance score.
- ai_reasoning: Explanation of why the event may be relevant.
- impact_status: Assessment of the event's potential impact.

Business logic:

This is a linking table between investigations and regional events.

One investigation can consider multiple regional events.

One regional event can be considered in multiple investigations.

This creates a many-to-many relationship.

Example:

Investigation INV101:

- Event 25: Heavy rainfall in Vellore.
- Distance: 3.2 km.
- Time overlap: TRUE.
- Relevance: HIGH.
- AI reasoning: Heavy rainfall occurred near the transit hub during the expected shipment arrival window.

The AI must distinguish geographical proximity and temporal overlap from verified causation.

## TABLE 11: responses

Purpose:
Stores customer responses generated by AI or written by human support agents.

Columns:
- response_id: Primary key.
- complaint_id: Foreign key referencing complaints.
- investigation_id: Foreign key referencing investigations.
- response_type: AI_GENERATED, HUMAN_VERIFIED or FOLLOW_UP.
- subject: Email subject.
- response_body: Complete email body.
- approval_status: Approval state.
- created_by: Nullable foreign key referencing users.
- sent_at: Actual sending timestamp.
- created_at: Response creation timestamp.

Business logic:

AI can generate a draft response based on investigation findings.

Support agents can edit, approve, reject or send the response.

Unverified investigation findings must not be presented to customers as confirmed facts.

Suggested approval statuses:

- DRAFT
- PENDING_APPROVAL
- APPROVED
- REJECTED
- SENT

Store multiple responses for the same complaint to maintain communication history.

---

# 5. COMPLETE DATABASE RELATIONSHIPS

Understand and preserve these relationships:

1. Customers → Orders
   One customer can have multiple orders.

2. Customers → Complaints
   One customer can submit multiple complaints.

3. Warehouses → Shipments
   One warehouse can dispatch multiple shipments.

4. Orders → Shipments
   One order can contain multiple shipments.

5. Shipments → Tracking Events
   One shipment can have multiple tracking events.

6. Orders → Complaints
   One order can be referenced by multiple complaints.

7. Users → Complaints
   One support agent can be assigned multiple complaints.

8. Complaints → Investigations
   One complaint can trigger multiple investigations.

9. Shipments → Investigations
   One shipment can be investigated multiple times.

10. Investigations ↔ Regional Events
    Many-to-many through investigation_events.

11. Complaints → Responses
    One complaint can have multiple responses.

12. Investigations → Responses
    One investigation can generate multiple responses.

All foreign keys must be implemented correctly.

Use appropriate indexes for frequently searched fields, especially order_number, tracking_number, customer email, complaint status and foreign keys.

---

# 6. COMPLETE APPLICATION DATA FLOW

Understand the following workflow before implementing any functionality.

STEP 1: CUSTOMER EMAIL

A customer sends an email reporting a delivery delay.

Spring Boot receives the email through the configured email integration.

The AI service classifies the complaint and extracts:
- Customer email.
- Order ID.
- Complaint category.
- Urgency.
- Complaint summary.

STEP 2: CUSTOMER AND ORDER IDENTIFICATION

Spring Boot identifies the customer in customers.

It searches orders using the extracted order_number.

The system retrieves:
- Order details.
- Shipment details.
- Warehouse information.
- Delivery destination.
- Tracking history.

STEP 3: REGIONAL EVENT INVESTIGATION

The AI service receives relevant shipment information.

It searches external sources for:
- Weather warnings.
- Floods.
- Natural disasters.
- Road closures.
- Transportation strikes.
- Political disturbances.

Newly discovered external events are validated and stored in regional_events through Spring Boot.

STEP 4: EVENT CORRELATION

The AI service compares:
- Event geographical location.
- Warehouse location.
- Shipment tracking checkpoints.
- Delivery destination.
- Event start and end times.
- Shipment delay timeline.

It identifies potentially relevant events.

Spring Boot stores the investigation and the associated event findings.

STEP 5: FINAL DECISION

If credible evidence supports a potential delivery exception:

- Mark the investigation decision appropriately.
- Store the investigation summary.
- Generate an evidence-backed customer response draft.

If there is insufficient evidence:

- Mark the investigation as NEEDS_HUMAN_REVIEW or NO_EVIDENCE_FOUND.
- Escalate the complaint.
- Assign a human investigator.
- Preserve all collected evidence.

STEP 6: CUSTOMER RESPONSE

Spring Boot stores the response in responses.

A support agent can review and approve the message.

Once approved, Spring Boot sends the email and records the actual sent_at timestamp.

Update the complaint and investigation statuses appropriately.

---

# 7. DATABASE DESIGN RULES

Follow these rules throughout development:

1. Supabase PostgreSQL is the single primary database.

2. Java Spring Boot is the primary application backend.

3. Use Spring Data JPA for database operations.

4. Use Python FastAPI for AI processing only.

5. Never duplicate customers, orders or regional events unnecessarily.

6. Never store the same shipment tracking history as repeated data inside investigations.

7. Always use foreign keys for relationships.

8. Use nullable foreign keys only where the business workflow genuinely permits missing information.

9. Never assume an Order ID exists just because the AI extracted it from an email.

10. Preserve the original customer email content.

11. Preserve investigation history instead of overwriting previous investigations.

12. Regional events must be reusable across multiple shipment investigations.

13. AI-generated conclusions must be distinguishable from verified external evidence.

14. Never automatically send unsupported explanations to customers.

15. Use timestamps consistently, storing database timestamps in UTC and displaying them in Asia/Kolkata where appropriate.

16. Store secrets and database credentials in environment variables.

17. Use database migrations to manage schema changes.

18. Do not modify the existing schema without explaining the reason and its impact on existing code.

19. Do not introduce unnecessary database tables, columns or complicated relationships.

20. Do not allow the frontend or Python AI service to bypass Spring Boot's business workflow and directly modify application records.

---

# 8. IMPLEMENTATION EXPECTATIONS

When implementing the project:

- First understand the existing database schema.
- Create corresponding Java entity classes.
- Create repositories for database access.
- Create service classes for business logic.
- Create REST controllers for frontend communication.
- Create DTOs for API requests and responses.
- Implement proper validation and exception handling.
- Implement authentication and role-based authorization.
- Integrate the Python AI service through HTTP APIs.
- Maintain clear separation between AI reasoning and database persistence.

Use a clean Spring Boot package structure:

com.logistics
    config
    security
    user
    customer
    warehouse
    order
    shipment
    tracking
    complaint
    regionalevent
    investigation
    response

Each functional package should contain the appropriate:
- Entity
- Repository
- Service
- Controller
- DTO

Do not put all business logic inside controllers.

---

# 9. IMPORTANT INSTRUCTION TO THE AI

You must treat this document as the authoritative business and database context for the project.

Before implementing any new feature, identify:

1. Which existing database tables are involved?
2. Which relationships are required?
3. Which Spring Boot services and repositories are involved?
4. Whether Python AI processing is required.
5. What information must be saved in Supabase?
6. What happens if data is missing or an external API fails?

Do not generate arbitrary database structures.

Do not simplify away required functionality.

Do not introduce unnecessary complexity.

If a requested feature requires a database schema modification, explain the modification before implementing it.

The goal is to build a reliable, maintainable and scalable logistics intelligence platform using the existing 11-table database architecture.