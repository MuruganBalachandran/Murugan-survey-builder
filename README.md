# Qorvia – Survey Builder

A survey platform for creating branded surveys, sharing them through a public link, collecting responses, and viewing analytics from a single dashboard.

Built with **React**, **Hono**, **Cloudflare Workers**, and **Cloudflare D1**.

**Live Demo:** https://main.survey-builder-dhz.pages.dev

## Demo

https://github.com/user-attachments/assets/aa2e6536-8695-4481-b2f5-0eb25384bf92

## Features

- Create surveys using a four-step guided wizard
- Add, edit, delete, and reorder questions
- Support for seven question types
- Customize surveys with a logo and brand colors
- Publish surveys and share a public link
- Collect anonymous responses
- View responses with charts and analytics
- Search, filter, sort, and paginate surveys
- Export responses to Excel
- Secure JWT-based authentication

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, TanStack Router |
| Backend | Hono on Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| Language | TypeScript |
| State Management | Redux Toolkit |
| Authentication | JWT (`jose`) + PBKDF2 |
| Styling | Tailwind CSS |
| HTTP | Axios |
| Charts | Chart.js |
| Excel Export | xlsx |
| Linting | Biome |

## Architecture

### High-level flow

```text
Browser
    │
React
(TanStack Router + Redux Toolkit)
    │
Axios
    │
Cloudflare Workers (Hono)
    │
JWT Authentication Middleware
    │
Controllers
    │
Raw SQL Queries
    │
Cloudflare D1 (SQLite)
```

### Detailed architecture

```html
<img width="1691" alt="Architecture" src="https://github.com/user-attachments/assets/3098910b-096c-4219-9dad-a8b59bcf322a" />
```

## Project Structure

```text
.
├── api/        # Hono API
├── web/        # React application
├── biome.json
└── package.json
```

See `api/README.md` and `web/README.md` for package-specific documentation.

## Engineering Decisions

### Stateless authentication

The API is stateless. Authentication uses JWTs stored in secure HttpOnly cookies, and every request is authenticated independently through middleware without server-side sessions.

### Raw SQL instead of an ORM

Prepared SQL statements are used instead of an ORM to keep the data layer simple and provide full control over queries, filtering, pagination, and batch operations.

### Survey builder workflow

Survey creation happens inside a multi-step drawer rather than separate pages, allowing users to stay on the dashboard while building surveys.

### Locked dashboard preview

Unauthenticated users see a blurred preview of the dashboard instead of an empty login screen, providing context before asking them to sign in.

### Server-side data operations

Searching, filtering, sorting, and pagination are handled in SQL using `WHERE`, `ORDER BY`, `LIMIT`, and `OFFSET`, so only the required data is returned to the client.

## Future Improvements

The next planned feature is private surveys.

Survey owners would be able to require respondents to sign in before submitting responses, allowing responses to be associated with verified users instead of remaining anonymous.

This would require:

- Survey visibility (`public` / `private`)
- JWT verification for response submission
- Linking responses to authenticated users
- Showing respondent identities in the dashboard

## Running Locally

```bash
pnpm install
pnpm dev
```

Useful commands:

```bash
pnpm build
pnpm check
pnpm check:fix
pnpm typecheck
```

## Deployment

- Frontend: Cloudflare Pages
- Backend: Cloudflare Workers
- Database: Cloudflare D1

## AI Usage

AI tools were used to speed up development tasks such as refactoring, documentation, and TypeScript fixes.

The application architecture, authentication flow, database design, project structure, and implementation decisions were designed and implemented manually. AI-generated suggestions were reviewed, understood, and modified before being included in the project.
