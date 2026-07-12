# TransitOps

TransitOps is a Transport Operations ERP for managing fleets, drivers, and trips. We are currently building this as part of a hackathon.

## Structure
- `client/` - Next.js frontend (WIP)
- `server/` - Express + Node backend 

## Current Status
We just started setting up the backend database schemas using Prisma and PostgreSQL.

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