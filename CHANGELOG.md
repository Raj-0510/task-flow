# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] — 2026-03-01

### Added

- **Authentication** — Register, login, JWT-based sessions (`/api/auth`)
- **Role-Based Access Control** — `ADMIN`, `MEMBER`, `VIEWER` roles with middleware enforcement
- **Project Management** — Full CRUD for user-owned projects (`/api/projects`)
- **Task Management** — Tasks nested under projects with completion toggle (`/api/projects/:id/tasks`)
- **Dashboard** — Summary stats endpoint with recent projects (`/api/dashboard`)
- **Admin Panel** — User listing and role management for admins (`/api/admin`)
- **Stripe Integration** — Checkout sessions, subscription status, customer portal, webhook handling
- **Client App** — React 19 SPA with Vite, Tailwind CSS, and React Router
- **Database** — PostgreSQL via Prisma 7 with Neon serverless
