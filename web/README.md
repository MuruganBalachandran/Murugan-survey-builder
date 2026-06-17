# Survey Builder - Frontend

A modern React-based survey building and management platform with real-time analytics and response tracking.

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [How to Run](#how-to-run)
- [How to Deploy](#how-to-deploy)
- [Data Flow](#data-flow)
- [API Integration](#api-integration)

## Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌─────────────┐    ┌──────────────┐  │
│  │   Pages      │◄──►│   Redux     │◄──►│   Services   │  │
│  │              │    │   Store     │    │   (API)      │  │
│  └──────────────┘    └─────────────┘    └──────────────┘  │
│        │                    │                    │          │
│        │                    │                    │          │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Components     │  │   Slices     │  │   Axios      │ │
│  │   - Surveys      │  │   - Survey   │  │   Client     │ │
│  │   - Responses    │  │   - Question │  └──────────────┘ │
│  │   - Questions    │  │   - Response │        │          │
│  │   - Auth         │  └──────────────┘        │          │
│  └──────────────────┘                          │          │
│                                        ┌───────▼────────┐  │
│                                        │  API Backend   │  │
│                                        │  (Cloudflare   │  │
│                                        │   Workers)     │  │
│                                        └────────────────┘  │
│                                                            │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Architecture Layers

#### 1. **Presentation Layer (Pages & Components)**
- **Pages**: High-level views (Surveys, Dashboard, SurveyResponses, etc.)
- **Components**: Reusable UI elements (Buttons, Forms, Cards, Charts)
- **Location**: `src/pages/`, `src/components/`

#### 2. **State Management Layer (Redux Toolkit)**
- **Redux Store**: Centralized state management for surveys, questions, responses, and auth
- **Slices**: Modular state logic (surveySlice, questionSlice, responseSlice)
- **Thunks**: Async operations that dispatch actions
- **Location**: `src/store/slices/`

#### 3. **API Integration Layer (Services)**
- **Service Files**: Abstracts API calls into reusable functions
- **Axios Client**: HTTP client with interceptors and base configuration
- **Location**: `src/services/api/`

#### 4. **Utilities & Helpers**
- **Validation**: Form and data validation rules
- **Common Functions**: Reusable utilities (pagination, formatting, etc.)
- **Icons**: SVG icon components
- **Toast Notifications**: User feedback system
- **Location**: `src/utils/`, `src/lib/`

#### 5. **Types & Constants**
- **TypeScript Interfaces**: Type definitions for data models
- **Constants**: Configuration values and enums
- **Location**: `src/types/`

## Tech Stack

### Core
- **React 19** - UI library
- **TypeScript 6** - Type safety
- **Vite 8** - Build tool and dev server
- **TailwindCSS 4** - Utility-first styling

### State Management
- **Redux Toolkit** - State management
- **Redux Persist** - Local storage persistence
- **Async Thunks** - API integration

### Routing & Navigation
- **TanStack Router** - Type-safe routing
- **React Router Plugins** - Automatic file-based routing

### Forms & Validation
- **React Hook Form** - Efficient form handling
- **Zod** - TypeScript-first validation
- **@hookform/resolvers** - Zod + React Hook Form integration

### API & Data
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **XLSX** - Excel export functionality

### Development
- **Biome** - Linting and formatting
- **TypeScript** - Type checking

## Project Structure

```
web/
├── src/
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   ├── common/            # Reusable UI components
│   │   ├── home/              # Landing page components
│   │   ├── Layout/            # Layout wrapper
│   │   ├── surveyBuilder/     # Survey creation/editing
│   │   └── surveyResponses/   # Response analytics & display
│   │
│   ├── pages/                 # Route pages
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Dashboard.tsx      # Survey list
│   │   ├── SurveyBuilder.tsx  # Survey creation
│   │   ├── SurveyResponses.tsx # Response analytics
│   │   └── PublicSurvey.tsx   # Public survey form
│   │
│   ├── store/
│   │   ├── slices/            # Redux Toolkit slices
│   │   │   ├── surveySlice.ts
│   │   │   ├── questionSlice.ts
│   │   │   ├── responseSlice.ts
│   │   │   └── authSlice.ts
│   │   └── index.ts           # Store configuration
│   │
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.ts      # Axios instance
│   │   │   ├── surveys.ts     # Survey API calls
│   │   │   ├── questions.ts   # Question API calls
│   │   │   ├── responses.ts   # Response API calls
│   │   │   └── auth.ts        # Auth API calls
│   │   └── index.ts
│   │
│   ├── types/
│   │   └── survey.ts          # TypeScript interfaces
│   │
│   ├── utils/
│   │   ├── common/
│   │   │   ├── survey.ts      # Survey helpers
│   │   │   └── index.ts
│   │   ├── validations/       # Validation schemas
│   │   ├── icons.tsx          # Icon components
│   │   ├── constants.ts       # App constants
│   │   └── index.ts
│   │
│   ├── lib/
│   │   └── toast.ts           # Toast notification system
│   │
│   ├── hooks/
│   │   └── redux.ts           # Redux hooks
│   │
│   ├── App.tsx                # Root component
│   └── index.css              # Global styles
│
├── index.html
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # TailwindCSS config
├── postcss.config.js
├── biome.json
└── package.json
```

## Features

### Authentication
- ✅ User registration with password validation
- ✅ Login with JWT tokens
- ✅ Secure token storage (Redux Persist)
- ✅ Protected routes and endpoints

### Survey Management
- ✅ Create surveys with title, description, branding
- ✅ Add custom color, logo, thank you message
- ✅ Publish/Draft status
- ✅ Response limits and expiration dates
- ✅ Search, filter, and sort surveys
- ✅ Pagination support

### Question Management
- ✅ Multiple question types (text, email, rating, multiple choice, etc.)
- ✅ Question reordering (drag & drop)
- ✅ Required field validation
- ✅ Character limits for text fields
- ✅ Conditional visibility (if/then logic)
- ✅ Question templates

### Response Analytics
- ✅ Real-time response tracking
- ✅ Summary statistics (total responses, response rate)
- ✅ Question breakdown with charts
- ✅ Weekly response trend analysis
- ✅ Response pagination (5 per page)
- ✅ Question chart pagination (10 per page)

### Data Export
- ✅ Export to Excel (.xlsx format)
- ✅ Professional styling with colors
- ✅ Padded cells for readability
- ✅ All responses included
- ✅ Auto-sized columns
- ✅ Timestamped filename

### Public Survey
- ✅ Public survey link sharing
- ✅ Anonymous response submission
- ✅ No authentication required
- ✅ Thank you message after submission
- ✅ Auto-save responses

## How to Run

### Prerequisites
- Node.js 18+ or pnpm
- npm/pnpm/yarn

### Installation

```bash
# Navigate to web directory
cd web

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API URL
```

### Development Server

```bash
# Start dev server
pnpm dev

# Server runs at http://localhost:5174
# Hot module replacement enabled
# TypeScript type checking on save
```

### Build

```bash
# Build for production
pnpm build

# Output in dist/ folder
# Optimized and minified

# Preview build locally
pnpm preview
```

### Type Checking

```bash
# Run TypeScript compiler
pnpm typecheck
```

## How to Deploy

### Deploy to Cloudflare Pages

```bash
# Build the project
pnpm build

# Deploy using Wrangler
pnpm dlx wrangler pages deploy dist --project-name=survey-builder

# Or deploy via Git integration:
# Push to GitHub and connect repository in Cloudflare Pages dashboard
```

### Environment Variables

Create `.env` file:

```env
VITE_API_URL=https://sde-intern-task-api.surveybuilder.workers.dev
```

### Production Checklist

- [ ] Set `VITE_API_URL` to production API endpoint
- [ ] Run `pnpm build` successfully
- [ ] Test all features in production
- [ ] Verify CORS configuration on backend
- [ ] Check authentication flow
- [ ] Test survey creation and response submission
- [ ] Verify analytics page
- [ ] Test Excel export functionality

## Data Flow

### 1. User Authentication Flow

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  User Input (Email, Password)                           │
│         │                                               │
│         ▼                                               │
│  Local Validation (Zod Schema)                         │
│         │                                               │
│         ▼                                               │
│  Redux Action: signup/login                            │
│         │                                               │
│         ▼                                               │
│  Async Thunk: authSlice.signupUser/loginUser          │
│         │                                               │
│         ▼                                               │
│  Axios POST to /api/auth/signup or /login             │
│         │                                               │
│         ▼                                               │
│  Backend Validation & Authentication                   │
│         │                                               │
│         ▼                                               │
│  Return JWT Token                                      │
│         │                                               │
│         ▼                                               │
│  Redux Store Token                                     │
│         │                                               │
│         ▼                                               │
│  Redux Persist to LocalStorage                         │
│         │                                               │
│         ▼                                               │
│  Redirect to Dashboard                                 │
│         │                                               │
│         ▼                                               │  
│  Component Re-render with Auth State                   │
│                                                        │
└──────────────────────────────────────────────────────────┘
```

### 2. Survey Creation Flow

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  User Fills Survey Form                                │
│  (Title, Description, Color, Logo)                    │
│         │                                               │
│         ▼                                               │
│  React Hook Form Validation (Zod)                     │
│         │                                               │
│         ▼                                               │
│  Redux Action: createSurvey                            │
│         │                                               │
│         ▼                                               │
│  Async Thunk: surveySlice.createSurvey                │
│         │                                               │
│         ▼                                               │
│  Axios POST to /api/surveys                           │
│  (with JWT token in header)                           │
│         │                                               │
│         ▼                                               │
│  Backend: Validate & Create Survey                    │
│  (Check ownership, validate data)                     │
│         │                                               │
│         ▼                                               │
│  Return Survey Object with ID                         │
│         │                                               │
│         ▼                                               │
│  Redux Store Survey                                   │
│         │                                               │
│         ▼                                               │
│  Redirect to SurveyBuilder with Survey ID            │
│         │                                               │
│         ▼                                               │
│  Component Renders Editor                             │
│                                                        │
└──────────────────────────────────────────────────────────┘
```

### 3. Question Management Flow

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  User Adds Question via Modal                          │
│  (Type, Title, Options, Required, etc.)               │
│         │                                               │
│         ▼                                               │
│  Local Validation                                      │
│         │                                               │
│         ▼                                               │
│  Redux Action: addQuestion                            │
│         │                                               │
│         ▼                                               │
│  Async Thunk: questionSlice.addQuestion              │
│         │                                               │
│         ▼                                               │
│  Axios POST to /api/surveys/{surveyId}/questions     │
│         │                                               │
│         ▼                                               │
│  Backend: Validate & Create Question                  │
│  (Check survey ownership, validate fields)            │
│         │                                               │
│         ▼                                               │
│  Return Question Object                               │
│         │                                               │
│         ▼                                               │
│  Redux Update: Add to questionSlice                   │
│         │                                               │
│         ▼                                               │
│  Component Re-render                                  │
│  (Show question in survey)                            │
│                                                        │
└──────────────────────────────────────────────────────────┘
```

### 4. Response Submission Flow (Public)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  User Accesses Public Survey Link                      │
│  (No authentication required)                          │
│         │                                               │
│         ▼                                               │
│  Axios GET to /api/surveys/public/{slug}             │
│         │                                               │
│         ▼                                               │
│  Backend Checks if Survey Published                   │
│         │                                               │
│         ▼                                               │
│  Return Survey Questions                              │
│         │                                               │
│         ▼                                               │
│  Component Renders Survey Form                        │
│         │                                               │
│         ▼                                               │
│  User Fills Out Form & Submits                        │
│         │                                               │
│         ▼                                               │
│  Local Validation (Zod)                               │
│         │                                               │
│         ▼                                               │
│  Axios POST to /api/surveys/{surveyId}/responses    │
│  (No auth required, just survey ID)                  │
│         │                                               │
│         ▼                                               │
│  Backend: Validate Answers                            │
│         │                                               │
│         ▼                                               │
│  Store Response in Database                           │
│         │                                               │
│         ▼                                               │
│  Return Success Message                               │
│         │                                               │
│         ▼                                               │
│  Component Shows Thank You Page                       │
│                                                        │
└──────────────────────────────────────────────────────────┘
```

### 5. Response Analytics Flow

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  User Clicks "View Responses" Button                   │
│         │                                               │
│         ▼                                               │
│  Lazy Load: Only fetch when Analytics tab clicked    │
│         │                                               │
│         ▼                                               │
│  Redux Action: fetchSurveyResponses                   │
│         │                                               │
│         ▼                                               │
│  Async Thunk with Pagination:                         │
│  - Page: 1, PageSize: 5 (or 100 for export)          │
│         │                                               │
│         ▼                                               │
│  Axios GET to /api/surveys/{surveyId}/responses     │
│  ?page=1&pageSize=5                                  │
│         │                                               │
│         ▼                                               │
│  Backend Query DB with Pagination                     │
│  - Count total responses                              │
│  - Fetch paginated results                            │
│         │                                               │
│         ▼                                               │
│  Return { responses: [...], total: 6 }               │
│         │                                               │
│         ▼                                               │
│  Redux Store: Set responses & pagination state        │
│         │                                               │
│         ▼                                               │
│  Component Renders Tabs:                              │
│  - Analytics (summary stats, charts)                  │
│  - Question Breakdown (chart per question)            │
│  - All Responses (paginated list, 5 per page)        │
│         │                                               │
│         ▼                                               │
│  User Clicks Export Button                            │
│         │                                               │
│         ▼                                               │
│  Fetch ALL responses (page size 100)                  │
│  Handle multiple pages if needed                      │
│         │                                               │
│         ▼                                               │
│  XLSX Library: Generate Excel File                    │
│  - Header row (blue background, white text)          │
│  - All responses with formatting                      │
│  - Alternating row colors                             │
│  - Padded cells                                       │
│         │                                               │
│         ▼                                               │
│  Browser Download                                      │
│                                                        │
└──────────────────────────────────────────────────────────┘
```

## API Integration

### Base URL Configuration

```typescript
// src/services/api/client.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})
```

### API Endpoints Used

```
Authentication:
  POST   /api/auth/signup
  POST   /api/auth/login
  POST   /api/auth/logout

Surveys:
  GET    /api/surveys (paginated list with filters)
  GET    /api/surveys/:id
  POST   /api/surveys (create)
  PUT    /api/surveys/:id (update)
  DELETE /api/surveys/:id
  GET    /api/surveys/public/:slug (public access)

Questions:
  GET    /api/surveys/:surveyId/questions
  POST   /api/surveys/:surveyId/questions
  PUT    /api/surveys/:surveyId/questions/:questionId
  DELETE /api/surveys/:surveyId/questions/:questionId
  PUT    /api/surveys/:surveyId/questions/reorder

Responses:
  GET    /api/surveys/:surveyId/responses (paginated)
  POST   /api/surveys/:surveyId/responses (public submission)
```

### Request/Response Pattern

All API requests include JWT token:

```typescript
// Automatically added by Axios interceptor
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
}
```

Responses follow standard format:

```typescript
interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string>
}
```

## Performance Optimizations

1. **Code Splitting**: Route-based code splitting with Vite
2. **Lazy Loading**: Responses only load when Analytics tab clicked
3. **Pagination**: 5 responses per page, 10 questions per page
4. **Memoization**: useMemo for derived data (pagination items, charts)
5. **Redux**: Efficient state updates with Toolkit
6. **Images**: Optimized and cached by Cloudflare
7. **Caching**: Browser caching of static assets

## Troubleshooting

### Common Issues

**API Connection Error**
- Check `VITE_API_URL` environment variable
- Verify API server is running
- Check CORS settings on backend

**Auth Token Expired**
- Token refresh not implemented yet (TODO)
- Clear localStorage and re-login

**Survey Not Loading**
- Check survey ownership
- Verify survey ID is valid
- Check network tab for API errors

**Export Not Working**
- Ensure all responses have loaded
- Check browser console for errors
- Verify XLSX library is bundled

## Contributing

Follow these conventions:
- Use TypeScript strictly
- Write Zod schemas for validation
- Use Redux Toolkit slices
- Keep components focused and reusable
- Add comments for complex logic
- Test on multiple browsers
