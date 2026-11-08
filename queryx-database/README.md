# QueryX Database Layer

> **PostgreSQL schema, Flyway migrations, JPA entities, and Spring Data repositories**  
> for the QueryX logistics complaint management and investigation platform.

---

## Project Overview

QueryX is an AI-assisted logistics complaint management system designed for the Tamil Nadu courier and logistics domain. This module provides the **entire database layer**:

- **11 PostgreSQL tables** covering users, customers, warehouses, orders, shipments, tracking events, complaints, regional events, investigations, and responses.
- **Flyway** database migrations for reproducible schema management.
- **JPA/Hibernate** entity classes for all 11 tables.
- **Spring Data JPA** repositories with custom query methods.
- **Sample data** representative of real Tamil Nadu logistics scenarios.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Java | 21+ |
| Maven | 3.9+ |
| PostgreSQL | 15+ (via Supabase or self-hosted) |
| Supabase Account | Free tier or higher |

---

## Table Descriptions and Relationships

```
users           — Internal system users (ADMIN, SUPPORT, INVESTIGATOR)
customers       — End customers who place orders and raise complaints
warehouses      — Dispatch hubs (e.g. Chennai, Coimbatore)
orders          — Customer orders  [FK → customers]
shipments       — Shipment records for each order  [FK → orders, warehouses]
tracking_events — Checkpoint scan events per shipment  [FK → shipments]
complaints      — Customer complaints received via email  [FK → customers, orders, users]
regional_events — External disruption events (floods, road closures, etc.)
investigations  — AI-driven complaint investigations  [FK → complaints, shipments]
investigation_events — Many-to-many join: investigations ↔ regional_events (with analytics)
responses       — Draft/sent email responses to customers  [FK → complaints, investigations, users]
```

### Entity Relationship Summary

```
customers ──< orders ──< shipments ──< tracking_events
                │              │
                └──< complaints └──> warehouses
                        │
                        └──< investigations ──< investigation_events >──> regional_events
                                    │
                                    └──< responses
```

---

## Environment Variable Setup

The application reads database credentials from environment variables. **Never hardcode credentials.**

### Linux / macOS

```bash
export DB_URL="jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres"
export DB_USERNAME="postgres"
export DB_PASSWORD="your-supabase-db-password"
```

### Windows (PowerShell)

```powershell
$env:DB_URL = "jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "your-supabase-db-password"
```

### Windows (Command Prompt)

```cmd
set DB_URL=jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres
set DB_USERNAME=postgres
set DB_PASSWORD=your-supabase-db-password
```

### Supabase Connection String

Find your connection string in the Supabase dashboard:  
**Project Settings → Database → Connection String → JDBC**

> **Note:** Supabase requires SSL. Append `?sslmode=require` to your DB_URL if you encounter SSL errors:
> ```
> jdbc:postgresql://db.<ref>.supabase.co:5432/postgres?sslmode=require
> ```

---

## Running Flyway Migration

Flyway runs **automatically on application startup** when `spring.flyway.enabled=true` (default). The migration file at `src/main/resources/db/migration/V1__create_initial_schema.sql` will be applied.

### Manual migration via Maven

```bash
mvn flyway:migrate \
  -Dflyway.url="${DB_URL}" \
  -Dflyway.user="${DB_USERNAME}" \
  -Dflyway.password="${DB_PASSWORD}"
```

### Check migration status

```bash
mvn flyway:info \
  -Dflyway.url="${DB_URL}" \
  -Dflyway.user="${DB_USERNAME}" \
  -Dflyway.password="${DB_PASSWORD}"
```

### Validate applied migrations

```bash
mvn flyway:validate \
  -Dflyway.url="${DB_URL}" \
  -Dflyway.user="${DB_USERNAME}" \
  -Dflyway.password="${DB_PASSWORD}"
```

---

## Running the Sample Data

Connect to your PostgreSQL database and execute the sample data script:

### Using psql

```bash
psql "${DB_URL}" -f sql/sample_data.sql
```

### Using Supabase SQL Editor

1. Open the [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **SQL Editor**
3. Open `sql/sample_data.sql` and paste its contents
4. Click **Run**

> **Important:** Run `V1__create_initial_schema.sql` (or let Flyway apply it) **before** running `sample_data.sql`.

---

## Running Verification Queries

After applying the schema and optionally the sample data:

```bash
psql "${DB_URL}" -f sql/verification_queries.sql
```

Or paste individual sections into the Supabase SQL Editor.

The verification queries check:
- All 11 tables exist
- Row counts per table
- FK referential integrity
- UNIQUE constraint violations (expect 0 rows)
- Cross-table JOIN relationships
- Many-to-many `investigation_events` join
- Full complaint workflow from complaint → response

---

## Building the Project

```bash
# Compile and package (skipping tests for initial build)
mvn clean package -DskipTests

# Full build with tests
mvn clean verify
```

---

## Project Structure

```
queryx-database/
├── sql/
│   ├── V1__create_initial_schema.sql     # Master DDL (source of truth)
│   ├── sample_data.sql                   # Tamil Nadu realistic sample data
│   └── verification_queries.sql          # Schema + data verification SQL
│
├── src/main/java/com/queryx/
│   ├── user/
│   │   ├── User.java                     # Entity
│   │   ├── UserRole.java                 # Enum (ADMIN, SUPPORT, INVESTIGATOR)
│   │   └── UserRepository.java           # Repository
│   ├── customer/
│   │   ├── Customer.java
│   │   └── CustomerRepository.java
│   ├── warehouse/
│   │   ├── Warehouse.java
│   │   └── WarehouseRepository.java
│   ├── order/
│   │   ├── Order.java                    # @Table(name="orders") — avoids SQL keyword
│   │   └── OrderRepository.java
│   ├── shipment/
│   │   ├── Shipment.java
│   │   └── ShipmentRepository.java
│   ├── tracking/
│   │   ├── TrackingEvent.java
│   │   └── TrackingEventRepository.java
│   ├── complaint/
│   │   ├── Complaint.java
│   │   └── ComplaintRepository.java
│   ├── regionalevent/
│   │   ├── RegionalEvent.java
│   │   ├── RegionalEventType.java        # Enum (WEATHER, FLOOD, CYCLONE, ...)
│   │   └── RegionalEventRepository.java
│   ├── investigation/
│   │   ├── Investigation.java
│   │   ├── InvestigationEvent.java       # Join entity with extra columns
│   │   ├── InvestigationRepository.java
│   │   └── InvestigationEventRepository.java
│   └── response/
│       ├── Response.java                 # @Table(name="responses")
│       └── ResponseRepository.java
│
├── src/main/resources/
│   ├── application.properties            # Spring/Flyway/HikariCP configuration
│   └── db/migration/
│       └── V1__create_initial_schema.sql # Flyway classpath migration (copy of sql/V1)
│
├── pom.xml                               # Maven build descriptor (Spring Boot 3.3, Java 21)
└── README.md                             # This file
```

---

## Flyway Migration Notes

| Topic | Detail |
|-------|--------|
| **Naming convention** | `V{version}__{description}.sql` — double underscore required |
| **Version ordering** | Flyway applies migrations in ascending version order |
| **Checksum validation** | Flyway checksums each applied migration. Do **not** edit already-applied migration files. For changes, create a new `V2__...sql` file. |
| **baseline-on-migrate** | Set to `true` so Flyway can operate on a pre-existing database |
| **ENUM types** | PostgreSQL ENUMs (`user_role`, `regional_event_type`) are created in V1. If you need to add values, use `ALTER TYPE ... ADD VALUE` in a new migration. |
| **pgcrypto** | The `pgcrypto` extension is enabled for `gen_random_uuid()`. Supabase enables this by default. |
| **Supabase schema** | The default schema is `public`. Flyway's migration history table (`flyway_schema_history`) is also created in `public`. |

---

## Key Design Decisions

1. **UUID Primary Keys** — All tables use UUID PKs with `gen_random_uuid()` defaults for distributed-safe ID generation.
2. **TIMESTAMPTZ** — All timestamps store timezone information, ensuring correct handling across IST and UTC.
3. **InvestigationEvent as Entity** — The `investigation_events` join table is modelled as a full JPA `@Entity` (not `@ManyToMany`) because it carries domain-specific analytical columns (`distance_km`, `relevance_score`, `ai_reasoning`, `impact_status`).
4. **Lazy Loading** — All `@ManyToOne` associations use `FetchType.LAZY` to avoid N+1 query problems. Use JPQL `JOIN FETCH` or `@EntityGraph` in service layer queries when you need eager data.
5. **ddl-auto=validate** — Hibernate validates schema-to-entity mapping but does not modify the database; schema changes are exclusively managed by Flyway.
6. **Reserved Word Safety** — `Order` class is mapped to `@Table(name="orders")` and `Response` to `@Table(name="responses")` to avoid SQL keyword conflicts.

---

## License

Internal project — QueryX Engineering Team.
