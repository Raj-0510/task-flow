# Server

Express REST API powering the SaaS application. Handles authentication, RBAC, project/task CRUD, and Stripe billing.

## Development

```bash
npm install
npm run dev          # starts on PORT (default 5000)
```

The dev server uses **nodemon + tsx** for auto-reloading TypeScript.

## Environment Variables

Copy `.env.example` to `.env` and fill in all values. See [.env.example](.env.example) for details.

## Database

This project uses **Prisma 7** with a PostgreSQL adapter (`@prisma/adapter-pg`).

```bash
# Generate the Prisma client (required after schema changes)
npx prisma generate

# Create a new migration
npx prisma migrate dev --name <migration_name>

# Apply migrations to a remote database
npx prisma migrate deploy

# Open Prisma Studio (GUI for browsing data)
npx prisma studio
```

### Schema Overview

| Model          | Purpose                                     |
| -------------- | ------------------------------------------- |
| `User`         | Accounts with email/password, name, role    |
| `Subscription` | Stripe customer & subscription mapping      |
| `Project`      | User-owned projects                         |
| `Task`         | Tasks belong to a project, have completion  |

### Roles (`UserRole` enum)

| Role     | Permissions                               |
| -------- | ----------------------------------------- |
| `ADMIN`  | Full access + user management             |
| `MEMBER` | CRUD on own projects & tasks              |
| `VIEWER` | Read-only access (cannot mutate resources)|

## Project Structure

```
server/
├── prisma/
│   ├── schema.prisma      # Data models & enums
│   └── migrations/        # SQL migration history
├── src/
│   ├── index.ts           # Express app setup & route mounting
│   ├── db.ts              # Prisma client singleton
│   ├── authMiddleware.ts  # JWT verification, role loading, mutation guard
│   ├── authRoutes.ts      # POST /register, POST /login, GET /me
│   ├── dashboardRoutes.ts # GET /dashboard (stats)
│   ├── projectRoutes.ts   # CRUD /projects
│   ├── taskRoutes.ts      # CRUD /projects/:id/tasks, /tasks/:id
│   ├── adminRoutes.ts     # GET /admin/users, PATCH /admin/users/:id/role
│   └── stripeRoutes.ts    # Checkout, webhook, subscription, portal
├── .env.example           # Template for environment variables
├── prisma.config.ts       # Prisma CLI configuration
└── package.json
```
