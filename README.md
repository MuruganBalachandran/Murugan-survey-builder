# Survey Builder

A lightweight branded survey builder. Create surveys, add questions, brand them with your colors and logo, share a public link, and view responses — all without leaving the dashboard.

**Live Demo:** https://main.survey-builder-dhz.pages.dev

[https://github.com/user-attachments/assets/5a898028-63e4-4eef-bd75-1e06e0852c8c](https://github.com/user-attachments/assets/aa2e6536-8695-4481-b2f5-0eb25384bf92)

## Architecture
<img width="1691" height="930" alt="image" src="https://github.com/user-attachments/assets/3098910b-096c-4219-9dad-a8b59bcf322a" />

## What it does

- Sign up / sign in with email + password
- Create surveys with a 4-step guided wizard (basics → branding → questions → publish)
- Add, edit, reorder, and delete questions from a slide-out drawer
- 7 question types: short text, long text, multiple choice, checkbox group, dropdown, rating, yes/no
- Per-survey branding: primary color picker + logo URL
- Publish a survey and share a public URL — no login required to respond
- View all responses per survey in the dashboard
- Server-side filtered and paginated survey list — search, status, date range, and sort are applied in SQL

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


## Most interesting decisions

**Locked dashboard instead of a blank login page** — Unauthenticated users see a blurred version of the real dashboard — analytics, charts, surveys — but cannot interact with it. The goal was to communicate the product's value before asking for a sign-in. It creates curiosity and gives context rather than dropping users onto an empty screen.

**Multi-step OffCanvas wizard for survey creation** — Survey creation is split into four steps (details → branding → questions → publish) inside a drawer. Users never leave the surveys page, so there are no route transitions to manage and the survey list updates immediately after creation.

**Server-side filtering and pagination** — The surveys list fetches only the current page from the API. Search, status, date range, and sort are passed as query params and applied in SQL with `WHERE`, `ORDER BY`, `LIMIT`, and `OFFSET`. The API returns `{ surveys, total, page, pageSize }` — the frontend stores only the visible page and drives the pagination bar from `total`. Search input is debounced 400ms client-side before triggering a fetch so the API isn't called on every keystroke.

**Client-side filtering, search, sort, and pagination composed together** — This was the original approach — all four applied in-memory from a single fetched list. It has since been moved server-side (see above). The frontend filter state, pagination controls, and search debounce remain on the client, but they now drive API params rather than in-memory operations.

## What I'd do differently with another week

Right now every published survey is fully public — anyone with the link can respond, anonymously, with no way to know who submitted what.

I'd add authenticated responses. A survey owner could mark a survey as private, requiring respondents to sign in before submitting. The response would then be tied to a verified identity instead of an anonymous submission.

This opens up the real organisational use case — a team lead sends an internal survey to their team, only team members can respond, and the owner can see exactly who said what. Anonymous public surveys are a commodity. Authenticated internal surveys for teams is where the product becomes genuinely useful to a paying user.

The work would touch three layers:
- The API needs a `visibility` field on surveys (`public` / `private`) and the response endpoint needs to verify a JWT before accepting a submission.
- The public survey page needs to handle the unauthenticated case gracefully — redirect to login, then return the respondent back to the survey after sign-in.
- The dashboard responses view needs to surface respondent identity instead of showing "Anonymous submitted."

The authentication infrastructure is already there — JWT, PBKDF2, the auth slice in Redux. The gap is purely on the response side. It would require a schema change on the responses table and a new respondent relationship, but nothing architecturally difficult.

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

## Deploying to Production

For detailed deployment instructions, see:
- **API deployment** → [`api/README.md` → Deploying to Production](./api/README.md#deploying-to-production)
- **Frontend deployment** → [`web/README.md` → Deploying to Production](./web/README.md#deploying-to-production)

Quick summary:
1. Deploy D1 database schema: `wrangler d1 execute survey-builder --remote --file=schema.sql`
2. Set environment variables in `wrangler.jsonc` (JWT_SECRET, FRONTEND_URL)
3. Deploy API: `cd api && npm run deploy`
4. Set VITE_API_URL in `web/.env` and build
5. Deploy frontend: `cd web && wrangler pages deploy dist`
6. Update FRONTEND_URL in API and redeploy for CORS

The full app is deployed across Cloudflare Workers (API) and Cloudflare Pages (frontend) with D1 for persistence.

## AI tools used

**Amazon Q Developer (IDE assistant)** — Used primarily as an implementation accelerator for fixing TypeScript issues, reducing repetitive Redux/thunk boilerplate, speeding up refactors, and improving documentation quality. Helpful for productivity-oriented tasks, but generated code was always reviewed and simplified where necessary to maintain the minimal, consistent code style of the project.

**Claude** — Used mainly during planning and UI iteration for discussing feature organisation, validating component structure ideas, and exploring UX tradeoffs before implementation. Some UI suggestions were intentionally overridden to better align with the product direction and interaction model I wanted.

**What remained fully manual** — The core engineering and system design decisions were entirely my own: the drawer-based UX, D1 over KV, no ORM, PBKDF2 for auth, and the overall project and file architecture. AI tools were used as assistants within an already defined structure — not as decision-makers. Every generated suggestion was reviewed, understood, modified when necessary, and integrated intentionally before being committed.
