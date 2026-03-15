# API Reference

**Base URL**: `http://localhost:5000`

All authenticated endpoints require an `Authorization: Bearer <token>` header.

---

## Authentication

### `POST /api/auth/register`

Create a new user account.

**Body**:
```json
{ "email": "user@example.com", "password": "secret123", "name": "John" }
```

**Response** `201`:
```json
{
  "token": "eyJhbGciOi...",
  "user": { "id": "clx...", "email": "user@example.com", "name": "John", "role": "MEMBER" }
}
```

**Errors**: `400` email/password missing or email already registered.

---

### `POST /api/auth/login`

Authenticate and receive a JWT.

**Body**:
```json
{ "email": "user@example.com", "password": "secret123" }
```

**Response** `200`:
```json
{
  "token": "eyJhbGciOi...",
  "user": { "id": "clx...", "email": "user@example.com", "name": "John", "role": "MEMBER" }
}
```

**Errors**: `401` invalid credentials.

---

### `GET /api/auth/me` 🔒

Get the currently authenticated user.

**Response** `200`:
```json
{ "id": "clx...", "email": "user@example.com", "name": "John", "role": "MEMBER" }
```

---

## Dashboard

### `GET /api/dashboard` 🔒

Get dashboard overview stats for the authenticated user.

**Response** `200`:
```json
{
  "totalProjects": 5,
  "totalTasks": 23,
  "recentProjects": [
    { "id": "clx...", "title": "My Project", "createdAt": "...", "updatedAt": "...", "taskCount": 4 }
  ]
}
```

---

## Projects

All project endpoints require authentication. `VIEWER` role cannot create, update, or delete.

### `GET /api/projects` 🔒

List all projects for the authenticated user.

**Response** `200`:
```json
[
  {
    "id": "clx...",
    "title": "My Project",
    "description": "A description",
    "createdAt": "...",
    "updatedAt": "...",
    "_count": { "tasks": 3 }
  }
]
```

---

### `POST /api/projects` 🔒 (ADMIN/MEMBER only)

Create a new project.

**Body**:
```json
{ "title": "New Project", "description": "Optional description" }
```

**Response** `201`: The created project object.

**Errors**: `400` title missing · `403` viewer role.

---

### `GET /api/projects/:id` 🔒

Get a project with its tasks.

**Response** `200`: Project object with `tasks[]` array.

**Errors**: `404` project not found or not owned by user.

---

### `PATCH /api/projects/:id` 🔒 (ADMIN/MEMBER only)

Update a project's title or description.

**Body**:
```json
{ "title": "Updated Title", "description": "Updated description" }
```

**Response** `200`: The updated project object.

---

### `DELETE /api/projects/:id` 🔒 (ADMIN/MEMBER only)

Delete a project and all its tasks (cascade).

**Response** `204`: No content.

---

## Tasks

All task endpoints require authentication. `VIEWER` role cannot create, update, or delete.

### `GET /api/projects/:projectId/tasks` 🔒

List all tasks for a project.

**Response** `200`:
```json
[
  { "id": "clx...", "title": "Do something", "completed": false, "projectId": "clx...", "createdAt": "...", "updatedAt": "..." }
]
```

---

### `POST /api/projects/:projectId/tasks` 🔒 (ADMIN/MEMBER only)

Create a task within a project.

**Body**:
```json
{ "title": "New task" }
```

**Response** `201`: The created task object.

---

### `PATCH /api/tasks/:id` 🔒 (ADMIN/MEMBER only)

Update a task's title or completion status.

**Body**:
```json
{ "title": "Updated title", "completed": true }
```

**Response** `200`: The updated task object.

---

### `DELETE /api/tasks/:id` 🔒 (ADMIN/MEMBER only)

Delete a task.

**Response** `204`: No content.

---

## Admin (ADMIN role only)

### `GET /api/admin/users` 🔒🛡️

List all users.

**Response** `200`:
```json
[
  { "id": "clx...", "email": "user@example.com", "name": "John", "role": "MEMBER", "createdAt": "..." }
]
```

**Errors**: `403` non-admin access.

---

### `PATCH /api/admin/users/:id/role` 🔒🛡️

Change a user's role.

**Body**:
```json
{ "role": "VIEWER" }
```

Valid roles: `ADMIN`, `MEMBER`, `VIEWER`.

**Response** `200`: The updated user object.

**Errors**: `400` invalid role or self-demotion · `403` non-admin · `404` user not found.

---

## Stripe Billing

### `POST /api/stripe/create-checkout-session` 🔒

Start a Stripe Checkout session for a subscription plan.

**Body**:
```json
{ "priceId": "price_xxxxx" }
```

**Response** `200`:
```json
{ "url": "https://checkout.stripe.com/c/pay/..." }
```

Redirect the user to the returned URL.

---

### `GET /api/stripe/subscription` 🔒

Get the current user's subscription status.

**Response** `200`:
```json
{ "plan": "pro", "status": "active", "currentPeriodEnd": "2026-04-01T00:00:00.000Z" }
```

Plan values: `free`, `pro`, `enterprise`.

---

### `POST /api/stripe/create-portal-session` 🔒

Open the Stripe Customer Portal for managing/cancelling subscriptions.

**Response** `200`:
```json
{ "url": "https://billing.stripe.com/p/session/..." }
```

---

### `POST /api/stripe/webhook`

Stripe webhook endpoint (no auth — verified by Stripe signature). Handled events:

- `checkout.session.completed` — activates the subscription
- `customer.subscription.updated` — syncs status/plan changes
- `customer.subscription.deleted` — marks subscription as canceled

---

## Error Format

All errors return:
```json
{ "error": "Human readable error message" }
```

## Auth Legend

- 🔒 Requires `Authorization: Bearer <token>` header
- 🛡️ Requires `ADMIN` role
