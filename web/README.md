# Web — Survey Builder

React + Vite + TanStack Router. Client-side only — no SSR. Talks to the Hono API over `/api` (proxied by Vite in dev).

## Stack

- **Framework:** React 18 + Vite
- **Routing:** TanStack Router (file-based, client-side)
- **State:** Redux Toolkit + redux-persist (auth token survives reload)
- **Styling:** Tailwind CSS
- **HTTP:** Axios with request/response interceptors
- **Linting/Formatting:** Biome

## Architecture

```
src/
├── routes/           # TanStack Router file-based routes
│   ├── __root.tsx    # Root layout — auth guard, session-expiry handler, ToastContainer
│   ├── index.tsx     # / — Home page
│   ├── login.tsx / signup.tsx
│   ├── dashboard.tsx
│   ├── surveys.tsx
│   ├── surveys.$id.edit.tsx
│   ├── surveys.$id.responses.tsx
│   └── survey.$slug.tsx   # Public survey (no auth)
├── pages/            # Page-level components, one per route
├── components/
│   ├── home/         # HomeHero, FeaturesSection, HowItWorksSection, FaqSection, FinalCtaSection
│   ├── surveys/      # Builder UI — SurveyCard, QuestionComposerCard, BrandingForm, SurveyQuestionsStep, etc.
│   ├── Layout/       # AppLayout, Header, Footer
│   ├── common/       # OffCanvas, CustomModal, Toast, LockedAccessPage, EmptyState, Loading
│   └── ui/           # Primitives — Button, Input, Select, Textarea, Checkbox, RadioGroup, Badge, ColorPicker
├── store/
│   ├── index.ts      # configureStore — auth, survey, question (response thunks), response slices
│   └── slices/
│       ├── authSlice.ts      # loginUser, signupUser, verifyToken, logout
│       ├── surveySlice.ts    # CRUD thunks for surveys + currentSurvey
│       ├── questionSlice.ts  # Question thunks + response thunks (submitSurveyResponse, fetchSurveyResponses)
│       └── responseSlice.ts  # Response slice reducer
├── services/api/     # Axios wrappers — one file per domain (auth, surveys, questions, responses)
│   └── client.ts     # Base axios instance with auth interceptor and session-expiry event
├── hooks/
│   ├── redux.ts      # Typed useAppDispatch / useAppSelector
│   └── useModal.ts   # Encapsulates confirm-modal open/close/loading state
├── types/            # Shared TypeScript interfaces across pages, components, and store
├── utils/
│   ├── common/       # survey.ts (normalizeQuestionType, statusLabel, buildPaginationItems, getSurveyUrl), functions.ts, auth.ts
│   ├── constants/    # DEFAULT_SURVEY_FORM, DEFAULT_QUESTION_FORM, SURVEY_PAGE_SIZE, route constants, theme tokens
│   └── validations/  # isValidSurveyTitle, isValidQuestionOptions, isMultipleChoiceQuestion, etc.
└── styles/
    └── globals.css
```

## Routing

TanStack Router with file-based routes. `__root.tsx` is the root layout — it handles:
- Verifying the stored JWT on app load (`verifyToken` thunk).
- Listening for the `auth:session-expired` custom event (dispatched by the Axios interceptor on 401) to show a toast and redirect to `/login`.
- Rendering `LockedAccessPage` for protected routes when unauthenticated instead of a hard redirect, so the layout doesn't flash.

Public routes: `/`, `/login`, `/signup`, `/terms`, `/privacy`, `/survey/:slug`.

## State Management

Redux Toolkit. Three meaningful slices:

- **authSlice** — user, token, isAuthenticated, isLoading. Persisted via redux-persist (token survives page reload).
- **surveySlice** — surveys list, `surveysTotal` (total count from API), and `currentSurvey` (survey with questions). Fetched on page load and refreshed after mutations. Pagination and filtering are server-driven — the slice stores only the current page of results.
- **questionSlice** — question mutation thunks (add, update, delete, reorder) and response thunks (submit, fetch). Shares the response slice reducer with `responseSlice.ts`.

Why Redux over local state: the survey builder drawer and the surveys list are siblings, both needing `currentSurvey`. Lifting that state through props would be fragile. Redux keeps the active survey as a single source of truth both the drawer and the grid can read.

## HTTP Layer

`services/api/client.ts` creates a single Axios instance. Two interceptors:

- **Request** — attaches `Authorization: Bearer <token>` from `localStorage`.
- **Response** — on 401, fires a `auth:session-expired` custom event exactly once (guarded by `sessionExpiryHandled` flag, reset only on successful responses, and skipped for `/auth/verify` so the silent startup check doesn't trigger a toast).

Each domain file (`surveys.ts`, `questions.ts`, etc.) wraps the Axios calls and normalises errors so every function returns `ApiResponse<T>` — callers never deal with thrown exceptions.

## Survey Builder

The builder lives entirely in `pages/Surveys.tsx` as an OffCanvas drawer — no separate route. This was a deliberate tradeoff: it keeps the survey list and builder on the same page, so the user sees updates instantly without navigation.

Key interactions:
- **Create wizard** — 4-step flow (basics → branding → questions → publish) inside an OffCanvas.
- **Edit drawer** — same OffCanvas, pre-filled with the selected survey's current values.
- **Question composer** — `QuestionComposerCard` renders inline inside the questions step. Supports 7 question types: short text, long text, multiple choice, checkbox group, dropdown, rating, yes/no.
- **Reorder** — HTML5 drag-and-drop. `draggedQuestionId` tracks the dragged item; on drop, the new order is computed client-side and sent to `PUT /questions/reorder`.
- **Branding** — `ColorPicker` + logo URL input. Primary color is applied live in the preview panel and persisted on the survey.
- **Filtering and pagination** — search, status, date range, and sort are filter state on the frontend. Each change fires a debounced fetch to the API, which applies the filters in SQL and returns only the current page. `surveysTotal` from the API response drives the pagination bar.

## Public Survey Page

`/survey/:slug` — no auth required. Fetches the survey by slug (returns 403 if not published), renders questions using `uiType` to pick the right input (radio, checkbox, select, textarea, star rating, toggle). On submit, sends `POST /:surveyId/responses`.

## Running locally

```bash
pnpm dev   # from workspace root — starts Vite on :5173, proxies /api to :8787
```

```bash
pnpm check        # Biome lint + format check (must pass before submitting)
pnpm check:fix    # Auto-fix Biome issues
pnpm typecheck    # tsc --noEmit
pnpm build        # Production build to dist/
```

## Deploying to Production

### Prerequisites
- Cloudflare account with Pages enabled
- `wrangler` CLI installed and authenticated (`wrangler login`)
- API already deployed (see api/README.md for setup)

### Step 1: Set API URL

Update `web/.env` with your production API URL:

```bash
echo "VITE_API_URL=https://<your-api-domain>/api" > web/.env
```

### Step 2: Build

```bash
cd web
npm run build
```

This creates a `dist/` directory with the optimized production build.

### Step 3: Deploy to Cloudflare Pages

```bash
wrangler pages deploy dist
```

On first deployment, you'll be prompted to:
- Enter a project name (e.g., `survey-builder`)
- Enter a production branch name (e.g., `deploy`)

The frontend will be available at `https://<hash>.survey-builder-<hash>.pages.dev`

### Step 4: Update API CORS

After frontend deployment, update the `FRONTEND_URL` in `api/wrangler.jsonc` with your Pages URL and redeploy:

```bash
cd api
wrangler deploy
```

### Continuous Deployment

For automated deployments on each push:
1. Connect your GitHub repo to Cloudflare Pages in the dashboard
2. Set build settings:
   - **Build command**: `npm run build`
   - **Build directory**: `dist`
   - **Root directory**: `web`
3. Add environment variables in the dashboard (if needed)

The frontend will auto-deploy on every push to your production branch.

