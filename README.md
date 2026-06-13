# Survey Builder

A lightweight branded survey builder. Create surveys, add questions, brand them with your colors and logo, share a public link, and view responses — all without leaving the dashboard.

Built as a take-home for the SDE intern role at [DoCoDeGo](https://docodego.com/).

## What it does

- Sign up / sign in with email + password
- Create surveys with a 4-step guided wizard (basics → branding → questions → publish)
- Add, edit, reorder, and delete questions from a slide-out drawer
- 7 question types: short text, long text, multiple choice, checkbox group, dropdown, rating, yes/no
- Per-survey branding: primary color picker + logo URL
- Publish a survey and share a public URL — no login required to respond
- View all responses per survey in the dashboard

## Stack

| Layer | Choice |
|---|---|
| Backend | Hono on Cloudflare Workers |
| Frontend | React 18 + Vite + TanStack Router |
| Database | Cloudflare D1 (SQLite at the edge) |
| Language | TypeScript end-to-end |
| Auth | JWT (HS256 via `jose`) + PBKDF2 password hashing |
| Styling | Tailwind CSS |
| State | Redux Toolkit + redux-persist |
| HTTP | Axios with interceptors |
| Linting | Biome |

## Project structure

This is a pnpm workspace with two packages.

```
/
├── api/        # Hono Worker — auth, surveys, questions, responses
├── web/        # React app — builder UI, dashboard, public survey page
├── biome.json
└── package.json
```

See [`api/README.md`](./api/README.md) and [`web/README.md`](./web/README.md) for detailed architecture notes on each package.

## Architecture overview

```
Browser
  └── React (TanStack Router, Redux)
        └── Axios → /api proxy (Vite dev) or direct (prod)
                      └── Hono Worker
                            └── Cloudflare D1
```

The API is stateless — JWT auth, no sessions. The frontend stores the token in `localStorage`, attaches it on every request via an Axios interceptor, and handles expiry with a custom `auth:session-expired` event that shows a toast and redirects to login.

The survey builder runs entirely inside an OffCanvas drawer — no separate route. This keeps the surveys list and builder on one page so changes appear immediately without navigation.

## Key decisions

**D1 over KV** — Survey data is relational (surveys → questions → responses). KV is key-value only; D1 gives SQL joins and `COUNT(*)` subqueries for response/question counts without extra round trips.

**Builder as a drawer, not a route** — Navigating to `/surveys/:id/edit` would require refetching survey data and managing back-navigation state. A drawer over the same page keeps `currentSurvey` in Redux and updates the grid beneath it in real time.

**No ORM** — The query layer uses raw D1 SQL. For this scope, an ORM adds indirection without benefit. The SQL is straightforward and readable in `api/src/queries/`.

**redux-persist only for auth** — Only the auth slice is persisted (token survives reload). Survey data is always re-fetched — stale survey state would be a worse UX than a brief loading state.

**PBKDF2 over bcrypt** — Cloudflare Workers run on V8, not Node. `@noble/hashes` is a pure-JS crypto library that works in the Workers runtime without native bindings. 100k iterations, random 16-byte salt, stored as `iterations$salt$hash`.

## Running locally

```bash
pnpm install          # installs api, web, and root devDeps
pnpm dev              # api on :8787, web on :5173 (proxies /api)
```

Other scripts from the root:

```bash
pnpm check            # Biome lint + format (must pass)
pnpm check:fix        # Auto-fix Biome issues
pnpm typecheck        # tsc --noEmit across both packages
pnpm build            # Production build of web/
```

## AI tools used

Amazon Q Developer (IDE assistant) — used throughout for fixing TypeScript errors, wiring Redux thunks, and writing the READMEs. Every suggestion was reviewed, understood, and adjusted where needed before committing. The architecture decisions, component structure, and UX choices were made independently.
