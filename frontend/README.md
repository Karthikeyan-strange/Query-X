# Regional AI Logistics Intelligence Platform

Frontend prototype for a regional logistics operations dashboard and customer support portal. Built with React, TypeScript, Vite, Tailwind CSS, and Leaflet. The current experience uses realistic sample data and local UI state; it does not connect to a backend or authenticate users.

## Getting started

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

/

Open the local URL printed by Vite. Run `npm run build` to type-check and create a production build, or `npm run preview` to serve that build locally.

## Login and roles

The role selection screen is available at `/` and `/login`:

- **Customer** continues directly into the customer portal at `/customer` in UI preview mode. Order ID matching and OTP verification are disabled so the screens can be explored without credentials.
- **Logistics Team** opens the agent sign-in flow and routes to the logistics workspace at `/agent` after the demo form is submitted. This is frontend-only and does not validate an account with a server.

Use the logout controls in the portal and dashboard to return to role selection.

## Customer portal

The customer experience includes a dashboard, sample orders, complaint submission, support ticket list, ticket conversation view, notifications, and profile/preferences screens. Ticket submission and replies update local UI state for the current session. The conversation view presents customer-safe status updates, shipment information, and message history. No email is sent and no data is persisted to a backend.

## Logistics workspace

The agent dashboard provides complaint and investigation summaries, recent complaint records, investigation activity, navigation to operational sections, quick actions, and regional disruption monitoring. The regional map is an interactive React-Leaflet map using OpenStreetMap tiles, with sample Tamil Nadu warehouse, shipment, destination, route, and incident data. Map visibility controls and event popups are available in the map section.

OpenStreetMap attribution is included with the map. Map markers and operational records are sample data, not live shipment or incident feeds.

## Appearance

Use the **Dark/Light** control in the login, customer, or logistics header to switch themes. The choice is saved in browser local storage and shared across the app. Standard OpenStreetMap tiles retain their provider appearance when the rest of the interface is in dark mode.

## Project structure

```text
src/
  components/
    auth/                 Shared login form controls and branding
    dashboard/            DeliveryMap component
  data/                   Sample customer and map data
  hooks/                  Theme state and toggle
  pages/                  Login, logistics dashboard, customer portal
  *.css                   Shared, dashboard, portal, and theme styles
```

## Current scope

This repository is a frontend prototype. It has no Spring Boot service, database, API integration, backend authentication, OTP delivery, or email notification delivery. Customer, shipment, complaint, and regional event data are local examples intended for UI exploration.
