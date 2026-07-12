# Hackathon Starter Template

A production-ready full-stack boilerplate designed for hackathons. Focus on building your MVP instead of setting up infrastructure.

## Project Name
Your Project Name Here

## Folder Structure
- `client/`: Next.js App Router (Frontend)
- `server/`: Express + TypeScript (Backend)

## Tech Stack
### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS

### Backend
- Express.js
- TypeScript
- PostgreSQL (Preferred)
- Prisma (Preferred ORM)
- Zod (Validation)

## How to Run

### Backend
1. `cd server`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in values.
4. `npm run dev` (Starts backend on port 8000)

### Frontend
1. `cd client`
2. `npm install`
3. `npm run dev` (Starts frontend on port 3000)

## Deployment
- **Backend:** Dockerized (see `Dockerfile` in `server/`).
- **Frontend:** Can be deployed to Vercel, Netlify, or standard Node server.

## Contributing
- Every team member should contribute.
- Use meaningful commit messages.
- Commit frequently.

## License
MIT