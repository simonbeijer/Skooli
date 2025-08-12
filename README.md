# Skooli

A modern education platform built with Next.js 15, TypeScript, and PostgreSQL. Skooli provides a comprehensive foundation for educational applications with authentication, user management, and a responsive design.

## 🔥 **NEW PROJECT SETUP**

**⚠️ IMPORTANT: Before you start coding, customize this template for your project!**

📖 **See [overview_setup.md](./overview_setup.md) for the complete customization checklist.**

The overview document contains a step-by-step checklist of everything you need to change to make this template your own, including project names, database configuration, environment variables, and more.

---

## Get Started

Make sure you have Node.js (v18+), npm, and Docker installed.

## Set Up Environment

Create a `.env` file in the project root with your database connection string:

DATABASE_URL="postgresql://simon:S1m0n@postgres:5432/skoolidb"

## Prepare Database

Start the PostgreSQL service:

docker compose up -d postgres

Generate Prisma client and apply migrations:

npm run prisma:generate  
npx prisma migrate dev --name init

(Optional) Seed the database:

npm run seed

## Run the App

Start the Next.js application:

Using Docker Compose:  
docker compose up skooli

Or directly (if not using Docker for the app):  
npm run dev

Visit `http://localhost:3000` in your browser.

## Key Commands

- `npm run dev` — Start development server  
- `npm run build` — Build for production  
- `npm run start` — Start production server  
- `npm test` — Run unit/integration tests  
- `npm run test:e2e` — Run end-to-end tests  
- `npm run prisma:generate` — Update Prisma client  
- `npm run seed` — Run database seed script  

## More Info

- [Next.js Docs](https://nextjs.org/docs)  
- [Prisma Docs](https://www.prisma.io/docs)  
- [Docker Docs](https://docs.docker.com)  

## Deployment

This project is set up for easy deployment to Vercel.
