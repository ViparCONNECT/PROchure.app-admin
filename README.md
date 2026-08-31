# React Admin Panel

A production-ready admin panel for managing categories, sub-categories, profiles, and admin accounts. Consumes the NestJS REST API described in `nestjs-backend-copilot-prompt.md`.

## Tech stack

| Tool | Purpose |
|---|---|
| React 18 + TypeScript (strict) | UI |
| Vite | Build tooling |
| React Router v6 | Client-side routing |
| TanStack Query v5 | Server state / caching |
| React Hook Form + Zod | Forms and validation |
| MUI v5 | Accessible component system |
| Zustand | Auth state |
| Axios | HTTP client |
| Notistack | Toast notifications |
| Vitest + @testing-library/react | Unit tests |
| Playwright | E2E tests |

---

## Prerequisites

- Node.js ≥ 18
- NestJS backend running (see backend spec)

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set VITE_API_URL to your backend base URL (no trailing slash)
# e.g. VITE_API_URL=http://localhost:3000/api/v1

# 3. Start dev server
npm run dev
```

The app runs at **http://localhost:5173**.

---

## Environment variables

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000/api/v1` |

> Variables must be prefixed with `VITE_` to be exposed to the browser bundle. **Never put secrets in `.env`.**

---

## Available scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run format` | Prettier format |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:watch` | Unit tests in watch mode |
| `npm run test:coverage` | Unit tests with coverage |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run test:e2e:ui` | Playwright with UI mode |

---

## Project structure

```
src/
├── api/             # Axios client, typed API functions, TanStack Query hooks
│   ├── client.ts    # Axios instance + auth/refresh interceptors
│   ├── types.ts     # All TypeScript interfaces
│   ├── auth.ts
│   ├── admins.ts
│   ├── categories.ts
│   └── profiles.ts
├── components/
│   ├── auth/        # AuthGuard, RoleGuard
│   ├── common/      # ConfirmDialog, FormRenderer, ErrorBoundary, EmptyState, UnsavedChangesGuard
│   ├── layout/      # AppLayout, Sidebar, TopBar
│   └── profile/     # ProfileForm (reuses FormRenderer)
├── config/
│   └── formFields.ts  # Field definitions for all forms
├── hooks/           # useAuth, useTablePreferences
├── pages/           # All 10 routed pages
├── schemas/         # Zod validation schemas
├── store/           # auth.store.ts (Zustand)
├── utils/           # api-error.ts, formatters.ts
├── App.tsx          # Route tree
├── main.tsx         # App entry point with providers
└── theme.ts         # MUI theme
tests/
├── e2e/             # Playwright specs
└── unit/            # Vitest + Testing Library specs
```

---

## Authentication flow

1. **Login** — POST `/auth/login` with email + password → receives `accessToken` in response body; the backend sets an `httpOnly` refresh-token cookie.
2. **Token storage** — Access token is stored **in memory only** (Zustand store). It is never written to `localStorage` or `sessionStorage`.
3. **Session restore on reload** — On app mount, `AuthGuard` calls POST `/auth/refresh`. If the browser has a valid httpOnly cookie the backend returns a new access token and the session is restored automatically.
4. **Token refresh on 401** — The Axios response interceptor catches a `401` error, attempts one refresh, replaces the token, and replays queued requests. If refresh fails the user is signed out.
5. **Logout** — POST `/auth/logout` (invalidates the cookie server-side), then clears the Zustand store.

---

## Role behaviour

| Feature | SUPER_ADMIN | ADMIN |
|---|---|---|
| Dashboard | ✅ | ✅ |
| Admin list / create / edit / delete | ✅ | ❌ |
| Admin password reset | ✅ | ❌ |
| Category list / edit | ✅ | ✅ |
| Sub-category CRUD | ✅ | ✅ |
| Profile CRUD | ✅ | ✅ |

Routes protected by `RoleGuard` render an "Access denied" state rather than redirecting, so users understand why access is blocked.

---

## Dynamic form fields

All forms are driven by `FormFieldDefinition` objects in `src/config/formFields.ts`. The `FormRenderer` component supports the following field types:

`text` · `email` · `password` · `textarea` · `number` · `date` · `boolean` · `select` · `multiSelect` · `radio` · `section`

Each definition respects `create`/`edit` visibility flags, `readOnly`, `required`, `minLength`, `maxLength`, `helpText`, and `options`/`source` for selects.

To add a new field to any form, add an entry to the relevant array in `formFields.ts` and extend the corresponding Zod schema in `src/schemas/`.

---

## Profile category → sub-category behaviour

- The `ProfileForm` component watches the `categoryId` field.
- If the selected category has `needsSubCategory: true`, the sub-category selector is shown and marked required.
- Changing the category clears any previously selected sub-category automatically.
- Sub-category options are filtered to those belonging to the selected category.

---

## E2E tests

E2E tests require both the dev server and a running backend with seeded data.

```bash
# Set credentials
E2E_SUPER_ADMIN_EMAIL=superadmin@example.com \
E2E_SUPER_ADMIN_PASSWORD=yourpassword \
npm run test:e2e
```

---

## Assumptions

1. `adminCreate` / `adminEdit` form JSON in the backend spec was empty; standard fields (displayName, email, password, role, isActive) were used.
2. `profile_created_by` is treated as a free-text field set on create only; the backend may choose to auto-populate it from the JWT.
3. The four category enum values (`professional-consultant`, `service-brands`, `product-brands`, `retail-brands`) are seeded by the backend; the frontend fetches them dynamically — no hardcoded IDs.
4. The `CRED` category mentioned in the backend spec maps to the category with `needsSubCategory: true`; the frontend determines this at runtime from the API response.
5. Image and logo fields accept URLs. File upload is out of scope per the backend spec.
6. Working hours strings follow the backend-defined free-text format (`09:00 AM to 01:00 PM | Lunch Break | 02:00 PM to 07:00 PM`); no structured time-picker is implemented.
7. Password reset delivery is handled entirely by the backend; the frontend shows only a success/failure toast.

---

## Production deployment checklist

- [ ] Set `VITE_API_URL` to the production backend URL
- [ ] Ensure backend CORS allows the frontend origin with `credentials: true`
- [ ] The backend must set `Secure; SameSite=None` on the refresh-token cookie when frontend and backend are on different origins
- [ ] Run `npm run build` and serve `dist/` from a static host (Nginx, Vercel, etc.)
- [ ] Protect `/api/docs` (Swagger) in production on the backend
- [ ] Configure CSP headers on the static host
"# PROchure.app-admin" 
