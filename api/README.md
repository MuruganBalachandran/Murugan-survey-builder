# API — Survey Builder

Hono on Cloudflare Workers. Handles auth, survey CRUD, questions, and response collection. Persisted in Cloudflare D1 (SQLite at the edge).

## Stack

- **Runtime:** Cloudflare Workers
- **Framework:** Hono
- **Database:** Cloudflare D1 (SQLite)
- **Auth:** JWT via `jose`, passwords hashed with PBKDF2 (`@noble/hashes`)

## Architecture

```
src/
├── index.ts          # App entry — mounts routes, CORS, error/404 handlers
├── routes/           # Route definitions (thin — just maps paths to controllers)
│   ├── auth.ts
│   ├── surveys.ts
│   ├── questions.ts
│   └── responses.ts
├── controllers/      # Request/response logic — validates input, calls queries, returns JSON
│   ├── authController.ts
│   ├── surveyController.ts
│   ├── questionsController.ts
│   └── responseController.ts
├── queries/          # Raw D1 SQL — one file per domain, no ORM
│   ├── users.ts
│   ├── surveys.ts
│   ├── questions.ts
│   └── responses.ts
├── middleware/
│   ├── auth.ts       # Verifies Bearer JWT, attaches { userId, email } to context
│   ├── rateLimit.ts  # Simple per-IP rate limiting via KV or in-memory
│   ├── errorHandler.ts
│   └── notFound.ts
├── utils/
│   ├── jwt.ts        # generateToken / verifyToken using jose (HS256, 1h expiry)
│   ├── password.ts   # hashPassword / comparePassword using PBKDF2-SHA256, 100k iterations
│   ├── generators.ts # Slug and ID generation
│   └── validation.ts # Input validation helpers
└── types/
    └── index.ts      # Shared types: User, Survey, Question, Answer, ApiResponse<T>
```

**Why this layering:** controllers own HTTP concerns (status codes, response shape), queries own SQL. Swapping the DB layer doesn't touch controllers.

## API Endpoints

All responses follow `ApiResponse<T>: { success, message, data?, errors? }`.

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/signup` | — | Register. Returns JWT + user. |
| POST | `/login` | — | Authenticate. Returns JWT + user. |
| GET | `/verify` | — | Validate a token. Used by frontend on load. |
| POST | `/logout` | ✓ | Stateless — client drops the token. |

### Surveys — `/api/surveys`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | ✓ | Create survey (title, description). Returns survey with generated slug. |
| GET | `/` | ✓ | List surveys for the authenticated user, paginated and filtered server-side. Accepts `page`, `pageSize`, `search`, `status`, `dateRange`, `sort` query params. Returns `{ surveys, total, page, pageSize }`. |
| GET | `/:id` | ✓ | Fetch survey + its ordered questions. |
| PUT | `/:id` | ✓ | Update title, description, primaryColor, logoUrl, status, publishedAt. |
| DELETE | `/:id` | ✓ | Deletes survey, its questions, and all responses (cascaded manually). |
| GET | `/public/:slug` | — | Fetch published survey by slug for public respondents. Returns 403 if not published. |

### Questions — `/api/surveys/:surveyId/questions`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | ✓ | Add question (type, uiType, title, description, options, required, order). |
| PUT | `/reorder` | ✓ | Accepts `{ questionIds: string[] }`, updates `order` in a batch. |
| PUT | `/:questionId` | ✓ | Update question fields. |
| DELETE | `/:questionId` | ✓ | Remove question. |

### Responses — `/api/surveys/:surveyId/responses`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | — | Submit a response. Accepts `{ answers: { questionId, value }[] }`. No auth — public. |
| GET | `/` | ✓ | Fetch all responses for a survey (owner only). Answers stored as JSON. |

## Auth Flow

1. Signup/login returns a signed HS256 JWT (`userId`, `email`, 1h expiry).
2. Frontend stores it in `localStorage` under `authToken`.
3. Every protected request sends `Authorization: Bearer <token>`.
4. `authMiddleware` verifies the token with `jose` and attaches the decoded payload to the Hono context (`c.set('user', ...)`).
5. Token is stateless — logout is client-side only.

## Database — D1

Schema has four tables: `users`, `surveys`, `questions`, `survey_responses`.

- `responseCount` and `questionCount` on surveys are computed via subquery `COUNT(*)` — not stored columns, so they're always accurate.
- Answers are stored as a JSON string in `survey_responses.answers` and parsed back in the query layer.
- Survey deletion manually cascades: deletes questions → responses → survey.

## Running locally

```bash
pnpm dev   # from workspace root — starts Worker on :8787
```

To apply schema changes to the local D1 instance:

```bash
pnpm --filter sde-intern-task-api wrangler d1 execute survey-builder --local --file=schema.sql
```

Regenerate Worker env types after changing `wrangler.jsonc` bindings:

```bash
pnpm --filter sde-intern-task-api cf-typegen
```
