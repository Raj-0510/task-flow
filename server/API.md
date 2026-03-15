# API Reference

Base URL: `http://localhost:5000/api`

All protected routes require the header:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## Authentication

### `POST /auth/register`

Create a new account.

**Body:**

```json
{ "email": "user@example.com", "password": "secret", "name": "Jane" }
```

**Response `201`:**

```json
{
  "token": "eyJ...",
  "user": { "id": "cuid", "email": "user@example.com", "name": "Jane", "role": "MEMBER" }
}
```

---

### `POST /auth/login`

Authenticate and receive a JWT.

**Body:**

```json
{ "email": "user@example.com", "password": "secret" }
```

**Response `200`:**

```json
{
  "token": "eyJ...",
  "user": { "id": "cuid", "email": "user@example.com", "name": "Jane", "role": "MEMBER" }
}
```

---

### `GET /auth/me` 🔒

Get the current authenticated user.

**Response `200`:**

```json
{ "id": "cuid", "email": "user@example.com", "name": "Jane", "role": "MEMBER" }
```

---

## Dashboard

### `GET /dashboard` 🔒

Get summary stats for the authenticated user.

**Response `200`:**

```json
{
  "totalProjects": 3,
  "totalTasks": 12,
  "recentProjects": [
    {
      "id": "cuid",
      "title": "My Project",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-02T00:00:00.000Z",
      "taskCount": 5
    }
  ]
}
```

---

## Projects

### `GET /projects` 🔒

List all projects owned by the authenticated user.

**Response `200`:** Array of project objects.

---

### `POST /projects` 🔒 ✏️

Create a new project. Requires `ADMIN` or `MEMBER` role.

**Body:**

```json
{ "title": "New Project", "description": "Optional description" }
```

**Response `201`:** Created project object.

---

### `GET /projects/:id` 🔒

Get a single project with its tasks.

**Response `200`:** Project object with `tasks` array.

---

### `PATCH /projects/:id` 🔒 ✏️

Update a project. Requires `ADMIN` or `MEMBER` role.

**Body:**

```json
{ "title": "Updated Title", "description": "Updated description" }
```

**Response `200`:** Updated project object.

---

### `DELETE /projects/:id` 🔒 ✏️

Delete a project and all its tasks. Requires `ADMIN` or `MEMBER` role.

**Response `204`:** No content.

---

## Tasks

### `GET /projects/:projectId/tasks` 🔒

List all tasks for a project.

**Response `200`:** Array of task objects.

---

### `POST /projects/:projectId/tasks` 🔒 ✏️

Create a task in a project. Requires `ADMIN` or `MEMBER` role.

**Body:**

```json
{ "title": "New Task" }
```

**Response `201`:** Created task object.

---

### `PATCH /tasks/:id` 🔒 ✏️

Update a task (title or completion). Requires `ADMIN` or `MEMBER` role.

**Body:**

```json
{ "title": "Renamed Task", "completed": true }
```

**Response `200`:** Updated task object.

---

### `DELETE /tasks/:id` 🔒 ✏️

Delete a task. Requires `ADMIN` or `MEMBER` role.

**Response `204`:** No content.

---

## Admin

All admin routes require `ADMIN` role.

### `GET /admin/users` 🔒 👑

List all users (without passwords).

**Response `200`:**

```json
[
  { "id": "cuid", "email": "admin@example.com", "name": "Admin", "role": "ADMIN", "createdAt": "..." }
]
```

---

### `PATCH /admin/users/:id/role` 🔒 👑

Change a user's role. Cannot change your own role.

**Body:**

```json
{ "role": "VIEWER" }
```

**Response `200`:** Updated user object.

---

## Stripe / Billing

### `POST /stripe/create-checkout-session` 🔒

Start a Stripe Checkout session for a subscription plan.

**Body:**

```json
{ "priceId": "price_..." }
```

**Response `200`:**

```json
{ "url": "https://checkout.stripe.com/..." }
```

---

### `GET /stripe/subscription` 🔒

Get the current user's subscription status.

**Response `200`:**

```json
{ "plan": "pro", "status": "active", "currentPeriodEnd": "2026-04-01T00:00:00.000Z" }
```

---

### `POST /stripe/create-portal-session` 🔒

Create a Stripe Customer Portal session for managing/cancelling subscriptions.

**Response `200`:**

```json
{ "url": "https://billing.stripe.com/..." }
```

---

### `POST /stripe/webhook`

Stripe webhook endpoint (no auth — verified via signature). Handles:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

---

## Legend

| Icon | Meaning                                     |
| ---- | ------------------------------------------- |
| 🔒   | Requires `Authorization: Bearer <token>`    |
| ✏️   | Mutation — requires `ADMIN` or `MEMBER` role|
| 👑   | Requires `ADMIN` role                       |
