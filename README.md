# TransitOps 🚚

TransitOps is a modern Transport Operations ERP that digitizes and centralizes fleet management workflows for logistics and transportation businesses. 

Instead of just simple CRUD operations, we built this platform to enforce real-world business rules. For example, the system will actively block you from dispatching a vehicle if its insurance has expired, or if the assigned driver is suspended.

This project was built as part of a software engineering hackathon with a heavy focus on clean architecture, scalability, data integrity, and a great user experience.

---

## 🚀 Quick Evaluation Guide (Credentials & Data)

Both our Local and Neon (Cloud) PostgreSQL databases have been seeded with extensive, varied data (100+ vehicles, 75 drivers, 400+ trips, rich audit logs, maintenance records, and fuel histories). 



### Role-Based Access Control (Demo Credentials)
We've implemented Role-Based Access Control (RBAC) across the app. We recommend trying out these demo accounts to see how the views and permissions change:

- **Fleet Manager** (Full Access): `fleet@demo.com` / `Password123`
- **Driver** (Limited View): `driver@demo.com` / `Password123`
- **Safety Officer** (Compliance Focus): `safety@demo.com` / `Password123`
- **Financial Analyst** (Cost/Expense Focus): `finance@demo.com` / `Password123`

---

## Core Features 

Here are some of the key features we've built into the backend that you should definitely check out:

### 1. Explainable Validation Engine
When you try to dispatch a trip, the system runs a deep validation matrix checking vehicle roadworthiness, driver status, and 4 different compliance certificates (Insurance, PUC, Fitness, Registration). If it fails, it returns a precise dictionary of *exactly why* it failed (e.g., `{"Compliance: PUC": "Expired"}`) rather than a generic error.
**How to test:** Try dispatching a trip using an `IN_SHOP` vehicle ID.

### 2. Operations Center
Fleet Managers usually spend hours cross-referencing tables. We built a single endpoint (`/api/dashboard/operations-center`) that aggregates all urgent action items across the entire database: trips pending approval, vehicles stuck in the shop, compliances expiring in <30 days, and suspended drivers.

### 3. Unified Asset Timelines
For complete auditability, we built endpoints that merge system `AuditLog` events, `VehicleStatusHistory`, and `Trip` assignments chronologically. You can pull the entire history of a specific vehicle or driver in one go (`/api/vehicles/:id/timeline`).

### 4. Executive Insights & Global Search
- **Insights:** The dashboard pulls live fleet utilization %, total maintenance spend, and identifies the highest operational cost vehicles (`/api/dashboard/insights`).
- **Universal Search Examples:** 
  You can hit `/api/dashboard/search?q=Ahmedabad` and it will instantly search across vehicles, drivers, and trips to return grouped results. Try these searches:
  - `"DRAFT"` or `"COMPLETED"` to find trips by status.
  - `"HEAVY"` to find heavy-duty vehicles or heavy-licensed drivers.
  - `"DEMO-LIC-123"` to find the specific demo driver by license.
  - Use table filters on the Vehicles page to filter by `status=IN_SHOP` to test operations center alerts.

---

## The Complete Feature List

While the dashboard gets a lot of attention, the backend APIs power a massive array of fleet management modules:

- **🔐 Role-Based Access Control (RBAC):** JWT authentication with strict route protection based on user roles (Admin, Fleet Manager, Driver, Safety Officer, Financial Analyst).
- **🚛 Vehicle Management:** Full CRUD operations for fleet assets, capacity tracking, odometer updates, and automated status history logging (`AVAILABLE`, `ON_TRIP`, `IN_SHOP`, `RETIRED`).
- **👨‍✈️ Driver Management:** Driver profiling, license category enforcement, automated safety score tracking, and status transitions (`AVAILABLE`, `ON_TRIP`, `OFF_DUTY`, `SUSPENDED`).
- **🛣️ Trip Lifecycle & Dispatching:** End-to-end trip state machine (`DRAFT` → `PENDING_APPROVAL` → `DISPATCHED` → `COMPLETED` or `CANCELLED`). Enforces the Explainable Validation rules before any vehicle leaves the depot.
- **🛡️ Compliance & Safety Tracking:** Dedicated endpoints to upload and track expiry dates for Insurance, PUC, Fitness, and Registration certificates.
- **🔧 Maintenance Jobs:** Track shop vehicles, record maintenance types (Routine, Repair, Inspection), and automatically map repair costs into the central expense ledger.
- **💰 Finance & Fuel Logging:** Automatically logs fuel consumption, calculates cost per liter, and tracks secondary trip expenses like tolls and repairs to calculate total operational overhead.
- **📜 System Audit Logs:** Every critical action (dispatching a trip, updating a vehicle status) is logged immutably with the user ID, timestamp, and a before/after snapshot.

---

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Deployment**: Docker

---

## Running Locally

To make testing easy, we've included a robust seed script that populates the database with 75 drivers, 100 vehicles, and 400 trips so the dashboards look great right out of the box.

**Backend:**
1. `cd server`
2. `npm install`
3. Set up your `.env` using `.env.example` (make sure your `DATABASE_URL` is set)
4. `npx prisma db push`
5. `npx tsx prisma/seed.ts` (This will seed the rich dataset)
6. `npm run dev`

**Frontend:**
1. `cd client`
2. `npm install`
3. `npm run dev`
