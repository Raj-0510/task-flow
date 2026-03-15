# Client

React SPA for the SaaS application, built with Vite + TypeScript + Tailwind CSS.

## Development

```bash
npm install
npm run dev       # starts on http://localhost:5173
```

## Build

```bash
npm run build     # outputs to dist/
npm run preview   # preview the production build
```

## Project Structure

```
client/src/
├── components/
│   └── Layout.tsx          # App shell with navigation
├── contexts/
│   └── AuthContext.tsx      # Auth state & JWT management
├── pages/
│   ├── Login.tsx            # Login form
│   ├── Register.tsx         # Registration form
│   ├── Dashboard.tsx        # Dashboard with stats
│   ├── Projects.tsx         # Project list
│   ├── ProjectNew.tsx       # Create project form
│   ├── ProjectDetail.tsx    # Single project with tasks
│   ├── Pricing.tsx          # Subscription plans & checkout
│   ├── AdminUsers.tsx       # Admin user management
│   └── ProtectedRoute.tsx   # Auth route guard
├── styles/                  # Additional CSS
├── types/                   # TypeScript declarations
├── api.ts                   # Axios instance with auth interceptor
├── App.tsx                  # Routes & app shell
├── App.css                  # App-level styles
├── index.css                # Global styles / Tailwind directives
└── main.tsx                 # Entry point
```

## Key Patterns

- **AuthContext** wraps the app and provides `user`, `token`, `login()`, `logout()`, and `register()` methods
- **ProtectedRoute** redirects unauthenticated users to `/login`
- **api.ts** automatically attaches the JWT token to all outgoing requests
- Pages fetch data on mount using the `api` axios instance
