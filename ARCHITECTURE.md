# Architecture

## System Overview

```
┌─────────────────────────┐      HTTP / REST       ┌──────────────────────────┐
│                         │ ◄────────────────────►  │                          │
│     React Client        │      localhost:5173     │     Express Server       │
│     (Vite + TS)         │      ────────────►      │     (Node.js + TS)       │
│                         │      JWT in header      │                          │
└─────────────────────────┘                         └────────────┬─────────────┘
                                                                 │
                                                         Prisma ORM
                                                                 │
                                                    ┌────────────▼─────────────┐
                                                    │     PostgreSQL (Neon)    │
                                                    └──────────────────────────┘

                     Stripe API ◄──────────── Webhooks ──────────── Stripe
```

## Client Architecture

### Routing (React Router v7)

```
/login           → Login page (public)
/register        → Register page (public)
/                → Dashboard (protected, Layout wrapper)
/projects        → Projects list
/projects/new    → New project form
/projects/:id    → Project detail with tasks
/admin/users     → Admin user management
/pricing         → Subscription plans
*                → Redirect to /
```

All protected routes are wrapped in `<ProtectedRoute>` which checks for an authenticated user and redirects to `/login` if unauthenticated.

### State Management

- **AuthContext** — global auth state (user, token, loading, ready)
  - Stored in React Context via `AuthProvider`
  - JWT token persisted in `localStorage`
  - Session restored on app load via `GET /api/auth/me`
  - Automatic logout on 401 responses (Axios interceptor dispatches `auth:logout` event)

### API Layer (`api.ts`)

- Single Axios instance with `baseURL = http://localhost:5000`
- **Request interceptor**: attaches `Authorization: Bearer <token>` from localStorage
- **Response interceptor**: on 401, clears localStorage and dispatches global logout event

## Server Architecture

### Middleware Chain

```
Request
  │
  ├── CORS (all origins)
  ├── Raw body parser (webhook route only)
  ├── JSON body parser (all other routes)
  │
  ├── Route-level middleware:
  │   ├── authMiddleware    → Verifies JWT, sets req.userId
  │   ├── roleMiddleware    → Loads user role from DB, sets req.role
  │   ├── requireCanMutate  → Blocks VIEWER from write operations
  │   └── requireAdmin      → Blocks non-ADMIN users
  │
  └── Route handlers
```

### Route Modules

| Module | Mount Point | Middleware | Purpose |
|---|---|---|---|
| `authRoutes` | `/api/auth` | None (public) | Register, Login, Me |
| `dashboardRoutes` | `/api/dashboard` | auth + role | Dashboard stats |
| `projectRoutes` | `/api/projects` | auth + role + mutate guard | Project CRUD |
| `taskRoutes` | `/api` | auth + role + mutate guard | Task CRUD |
| `adminRoutes` | `/api/admin` | auth + role + admin guard | User management |
| `stripeRoutes` | `/api/stripe` | auth (except webhook) | Billing |

### Authentication Flow

```
1. User registers/logs in → server returns JWT (7-day expiry)
2. Client stores token in localStorage
3. Every request attaches token via Axios interceptor
4. Server verifies token in authMiddleware
5. On 401, client auto-clears token and redirects to /login
```

### Role-Based Access Control (RBAC)

| Role | Permissions |
|---|---|
| `ADMIN` | Full access + user management + role assignment |
| `MEMBER` | CRUD on own projects/tasks |
| `VIEWER` | Read-only access to own projects/tasks |

Role enforcement happens at two levels:
1. **Server**: `roleMiddleware` + `requireCanMutate` / `requireAdmin` middleware
2. **Client**: UI conditionally hides mutation controls for viewers

## Database Schema

```
User 1──* Project 1──* Task
 │
 └──1 Subscription
```

- **User** → Projects (one-to-many, cascade delete)
- **User** → Subscription (one-to-one, cascade delete)
- **Project** → Tasks (one-to-many, cascade delete)

All IDs use `cuid()` for globally unique, sortable identifiers.

## Stripe Integration Flow

```
1. User clicks "Upgrade" on Pricing page
2. Client calls POST /api/stripe/create-checkout-session with priceId
3. Server finds/creates Stripe customer, creates Checkout Session
4. Client redirects to Stripe-hosted checkout page
5. After payment, Stripe sends webhook: checkout.session.completed
6. Server activates subscription in DB
7. Ongoing: Stripe sends webhooks for updates/cancellations
8. User can manage subscription via Customer Portal
```

### Webhook Events Handled

| Event | Action |
|---|---|
| `checkout.session.completed` | Activate subscription, store Stripe IDs |
| `customer.subscription.updated` | Sync status, price, period end |
| `customer.subscription.deleted` | Mark subscription as canceled |

## Security Considerations

- Passwords hashed with **bcrypt** (10 salt rounds)
- JWT tokens signed with `JWT_SECRET` env variable
- Stripe webhooks verified via signature (`STRIPE_WEBHOOK_SECRET`)
- Raw body parsing only on webhook route (required for Stripe signature verification)
- All data access is scoped to `userId` — users can only access their own projects/tasks
- Admin self-demotion is prevented
