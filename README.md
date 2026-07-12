# TransitOps

TransitOps is a modern Transport Operations ERP designed to streamline and digitize fleet management workflows for logistics and transportation businesses.
The platform provides centralized management of vehicles, drivers, trips, maintenance schedules, fuel records, and operational expenses while enforcing critical business rules throughout the transport lifecycle.
Built as a pat of a software engineering hackathon, TransitOps emphasizes on clean architecture, scalability, data integrity, and an intuitive user experience.

##Key Features:

- Fleet & Vehicle Management
- Driver Management
- Trip Planning & Tracking
- Maintenance Scheduling
- Fuel Consumption Monitoring
- Expense Tracking
- Role-Based Access Control (RBAC)
- Operational Dashboard & Analytics

##  Stack Structure:

**FRONTEND**
- `client/` - Next.js + TypeScript+ Tailwind CSS
  
**BACKEND**
- `server/` - Express + Node +PostgreSQL
  
**DevOps**
- Docker

## Current Status
We are aligning our frontend and backend database schemas.

## Running Locally

**Backend:**
1. cd server
2. npm install
3. set up your `.env` (check `.env.example`)
4. run `npx prisma db push` or migrate to set up the DB
5. `npm run dev`

**Frontend:**
1. cd client
2. npm install
3. `npm run dev`

## Project Goal:
The objective of TransitOps is not simply to perform CRUD operations, but to model real-world transport operations through robust business workflows, validation rules, and scalable system design.
