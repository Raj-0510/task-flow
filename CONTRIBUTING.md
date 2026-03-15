# Contributing

## Development Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Test locally (both client and server)
4. Submit a pull request

## Project Setup

See [SETUP.md](./SETUP.md) for detailed installation and configuration instructions.

## Code Style

### TypeScript
- Strict TypeScript is enabled
- Use explicit types for function parameters and return values
- Prefer `interface` over `type` for object shapes

### Client
- Use functional components with hooks
- Keep components focused — one component per file
- Place shared types in `src/types/`
- Place global state in `src/contexts/`
- Use the centralized `api` instance from `src/api.ts` for all HTTP calls

### Server
- Group routes by feature in separate files (`*Routes.ts`)
- Use middleware for cross-cutting concerns (auth, role checks)
- Always handle errors with try/catch and return consistent error responses
- Keep Prisma queries in route handlers (no separate service layer currently)

## File Naming Conventions

| Type | Convention | Example |
|---|---|---|
| React components | PascalCase | `ProjectDetail.tsx` |
| Contexts | PascalCase | `AuthContext.tsx` |
| Server routes | camelCase | `projectRoutes.ts` |
| Server middleware | camelCase | `authMiddleware.ts` |
| Types | PascalCase (exports) | `types/index.ts` |

## Adding a New Feature

### New API Endpoint

1. Create or modify a route file in `server/src/`
2. Apply appropriate middleware (`authMiddleware`, `roleMiddleware`, etc.)
3. Register the route in `server/src/index.ts`
4. Document the endpoint in [API.md](./API.md)

### New Page

1. Create the page component in `client/src/pages/`
2. Add the route in `client/src/App.tsx`
3. If protected, ensure it's nested under the `<ProtectedRoute>` wrapper

### New Database Model

1. Update `server/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <migration-name>`
3. Update TypeScript types in `client/src/types/` if needed

## Environment Variables

- **Never commit** `.env` files containing real secrets
- Use `.env.example` files as templates
- See [SETUP.md](./SETUP.md) for all required variables
