# QueryX API Documentation & Frontend Integration Guide

This document describes the complete REST API interface provided by **QueryX Spring Boot Backend** (`D:\QueryX\backend-springboot`) running at `http://localhost:8080`.

CORS is configured to permit:
- `https://query-x-six.vercel.app` (Production React Frontend)
- `http://localhost:5173` (Local Vite Dev Server)
- `http://localhost:3000`

---

## 1. Authentication APIs (`/api/auth`)

### 1.1 Team Login (Support / Admin / Investigator)
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "priya.s@logistics.com",
  "password": "password123"
}
```
- **Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "id": "11111111-1111-1111-1111-111111111111",
  "name": "Priya Srinivasan",
  "email": "priya.s@logistics.com",
  "role": "SUPPORT",
  "userType": "TEAM"
}
```

### 1.2 Customer Portal Login
- **Endpoint:** `POST /api/auth/customer/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "arun.kumar@example.in",
  "orderId": "TN-78420319"
}
```
- **Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "id": "33333333-3333-3333-3333-333333333333",
  "name": "Arun Kumar",
  "email": "arun.kumar@example.in",
  "role": "CUSTOMER",
  "userType": "CUSTOMER"
}
```

### 1.3 Current User Info
- **Endpoint:** `GET /api/auth/me`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Response:** `200 OK`

---

## 2. Dashboard KPIs (`/api/dashboard`)

### 2.1 Get Summary KPI Statistics
- **Endpoint:** `GET /api/dashboard/stats`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Response:** `200 OK`
```json
{
  "totalComplaints": 2,
  "activeComplaints": 2,
  "escalatedCases": 0,
  "completedInvestigations": 1,
  "activeRegionalEvents": 2,
  "totalShipmentsInTransit": 1
}
```

---

## 3. Customer Complaints (`/api/complaints`)

### 3.1 Get All Complaints
- **Endpoint:** `GET /api/complaints?status={status}`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Response:** `200 OK` (List of complaints with customer and order summary)

### 3.2 Get Complaint by ID
- **Endpoint:** `GET /api/complaints/{id}`
- **Headers:** `Authorization: Bearer <TOKEN>`

### 3.3 Create New Complaint
- **Endpoint:** `POST /api/complaints`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Request Body:**
```json
{
  "orderNumber": "TN-78420319",
  "emailSubject": "Delivery delayed for my order",
  "emailBody": "My package has been delayed in transit near Chennai hub for 2 days.",
  "complaintType": "Delayed delivery",
  "urgency": "High"
}
```

### 3.4 Assign Complaint to Investigator / Support Agent
- **Endpoint:** `PATCH /api/complaints/{id}/assign?userId={userId}`
- **Headers:** `Authorization: Bearer <TOKEN>`

### 3.5 Update Complaint Status
- **Endpoint:** `PATCH /api/complaints/{id}/status?status={status}`
- **Headers:** `Authorization: Bearer <TOKEN>`

---

## 4. Orders & Shipments (`/api/orders`)

### 4.1 Lookup Order by Order Number
- **Endpoint:** `GET /api/orders/{orderNumber}`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Example:** `GET /api/orders/TN-78420319`

### 4.2 Customer Portal: My Orders
- **Endpoint:** `GET /api/orders/my-orders`
- **Headers:** `Authorization: Bearer <CUSTOMER_TOKEN>`

### 4.3 Track Shipment & Chronological History
- **Endpoint:** `GET /api/orders/track/{trackingNumber}`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Example:** `GET /api/orders/track/LGC-TN-90218471`
- **Response:** Full shipment details + chronological list of tracking events.

---

## 5. Regional Disruption Events (`/api/regional-events`)

### 5.1 List Regional Events
- **Endpoint:** `GET /api/regional-events?location={loc}&type={type}`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Response:** List of external disruptions (Floods, Heavy Rain, Road Closures, Strikes) with latitude, longitude, and radius.

---

## 6. AI Investigations (`/api/investigations`)

### 6.1 List Investigations
- **Endpoint:** `GET /api/investigations?status={status}`
- **Headers:** `Authorization: Bearer <TOKEN>`

### 6.2 Get Investigation Details with Correlated Regional Events
- **Endpoint:** `GET /api/investigations/{id}`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Response:** Contains AI summary, confidence score, final decision, and associated regional events with distance (`distanceKm`), time overlap, and AI reasoning.

---

## 7. Customer Responses (`/api/responses`)

### 7.1 View Responses for a Complaint
- **Endpoint:** `GET /api/responses/complaint/{complaintId}`
- **Headers:** `Authorization: Bearer <TOKEN>`

### 7.2 Support Agent Approve & Send Response
- **Endpoint:** `POST /api/responses/{responseId}/approve`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Behavior:** Updates status to `APPROVED` / `SENT`, sets `sentAt`, and triggers email dispatch.
