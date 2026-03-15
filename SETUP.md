# Setup Guide

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **PostgreSQL** database (local or hosted — e.g. [Neon](https://neon.tech))
- **Stripe** account ([dashboard.stripe.com](https://dashboard.stripe.com))

## 1. Clone & Install

```bash
git clone <repo-url>
cd saas-app

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

## 2. Server Environment (`server/.env`)

Create `server/.env` from the example:

```bash
cp server/.env.example server/.env
```

Fill in the values:

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/dbname?sslmode=require` |
| `JWT_SECRET` | Secret key for signing JWTs — use a strong random string | `openssl rand -hex 32` |
| `PORT` | Server port | `5000` |
| `CLIENT_URL` | Frontend URL (used for Stripe redirects) | `http://localhost:5173` |
| `STRIPE_SECRET_KEY` | Stripe secret key (starts with `sk_test_` or `sk_live_`) | From Stripe Dashboard → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (starts with `whsec_`) | See [Stripe webhooks](#stripe-webhooks) |
| `STRIPE_PRO_PRICE_ID` | Stripe Price ID for the Pro plan | `price_xxxxx` |
| `STRIPE_ENTERPRISE_PRICE_ID` | Stripe Price ID for the Enterprise plan | `price_xxxxx` |

## 3. Client Environment (`client/.env`)

The client currently hardcodes the API base URL in `src/api.ts`. To change it, edit:

```ts
const baseURL = 'http://localhost:5000'
```

> **Tip**: You can refactor this to use `import.meta.env.VITE_API_URL` and create a `client/.env` file.

## 4. Database Setup

```bash
cd server

# Generate Prisma client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev

# (Optional) Open Prisma Studio to inspect data
npx prisma studio
```

### Database Schema Overview

| Model | Purpose |
|---|---|
| `User` | Accounts with email/password, name, and role (`ADMIN` / `MEMBER` / `VIEWER`) |
| `Subscription` | Stripe billing link — customer ID, subscription ID, plan, status, period end |
| `Project` | User-owned projects with title and description |
| `Task` | Per-project tasks with title and completion status |

## 5. Stripe Setup

### Creating Products & Prices

1. Go to **Stripe Dashboard → Products**
2. Create two products: **Pro** and **Enterprise**
3. Add a recurring price to each (e.g. $19/mo and $49/mo)
4. Copy the Price IDs (`price_xxxxx`) → paste into `server/.env`

### Stripe Webhooks

#### Local Development (recommended)

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:5000/api/stripe/webhook
```

The CLI will print a webhook signing secret (`whsec_...`) — copy it to `STRIPE_WEBHOOK_SECRET` in `.env`.

#### Production

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the signing secret → `STRIPE_WEBHOOK_SECRET`

## 6. Running Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd server
npm run dev

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

## 7. Creating an Admin User

The first registered user will have the `MEMBER` role by default. To promote to admin:

```bash
cd server
npx prisma studio
```

Open the `User` table, find your user, and change `role` to `ADMIN`.

Alternatively, use a direct SQL update:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

## 8. Production Build

```bash
# Client
cd client
npm run build    # outputs to client/dist/

# Server
cd server
npx prisma generate
npx tsc          # compile TypeScript
node dist/index.js
```
