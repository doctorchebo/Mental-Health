# LunaJoy Architecture

LunaJoy is a mental health tracking application built as a monorepo using modern TypeScript tooling. This document outlines the project structure, tech stack, and architectural decisions.

## Project Structure

```
lunajoy-mental-health-tracker/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── packages/
│   ├── db/           # Drizzle ORM schema & migrations
│   └── types/        # Shared TypeScript types
├── turbo.json        # Turborepo configuration
├── pnpm-workspace.yaml
└── package.json
```

## Tech Stack

### Monorepo Tooling

| Tool           | Purpose                                        |
| -------------- | ---------------------------------------------- |
| **pnpm**       | Package manager with workspace support         |
| **Turborepo**  | Build orchestration, caching, and task running |
| **TypeScript** | Type safety across all packages                |

### Frontend (`apps/web`)

| Technology        | Version | Purpose                                 |
| ----------------- | ------- | --------------------------------------- |
| **Next.js**       | 16.x    | React framework with App Router         |
| **React**         | 19.x    | UI library                              |
| **Tailwind CSS**  | 4.x     | Utility-first CSS                       |
| **shadcn/ui**     | -       | Component library (Radix UI primitives) |
| **next-intl**     | 4.x     | Internationalization (i18n)             |
| **Recharts**      | 3.x     | Data visualization / charts             |
| **react-joyride** | 3.x     | Onboarding tour                         |
| **Sonner**        | 2.x     | Toast notifications                     |
| **Lucide React**  | -       | Icon library                            |

### Backend (`apps/api`)

| Technology                  | Version | Purpose                   |
| --------------------------- | ------- | ------------------------- |
| **NestJS**                  | 11.x    | Node.js framework         |
| **Drizzle ORM**             | 0.42.x  | Type-safe SQL ORM         |
| **Passport**                | 0.7.x   | Authentication middleware |
| **passport-google-oauth20** | -       | Google OAuth strategy     |
| **passport-jwt**            | -       | JWT strategy              |
| **class-validator**         | -       | DTO validation            |
| **class-transformer**       | -       | Object transformation     |

### Database (`packages/db`)

| Technology      | Purpose                               |
| --------------- | ------------------------------------- |
| **PostgreSQL**  | Primary database (via Supabase)       |
| **Drizzle ORM** | Schema definition & type-safe queries |
| **Drizzle Kit** | Migration generation & management     |

---

## Application Architecture

### Frontend Architecture

```
apps/web/src/
├── app/                    # Next.js App Router
│   ├── [locale]/           # i18n dynamic segment
│   │   ├── dashboard/      # Dashboard page
│   │   └── log/            # Log entry wizard
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/
│   ├── charts/             # Recharts visualizations
│   ├── log-wizard/         # Multi-step log entry form
│   ├── ui/                 # shadcn/ui components
│   └── *.tsx               # Shared components
├── context/
│   ├── AuthContext.tsx     # Authentication state
│   └── LogsContext.tsx     # Daily logs CRUD
├── i18n/                   # Internationalization config
├── lib/                    # Utilities & helpers
└── messages/               # Translation files (en.json, es.json)
```

**Key Patterns:**

- **App Router** with dynamic `[locale]` segment for i18n
- **React Context** for global state (Auth, Logs)
- **"use client"** directive for interactive components
- **Mobile-first** responsive design with Tailwind

### Backend Architecture

```
apps/api/src/
├── main.ts                 # Application bootstrap
├── app.module.ts           # Root module
├── auth/                   # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── guards/             # JWT & Google guards
│   └── strategies/         # Passport strategies
├── logs/                   # Daily logs module
│   ├── logs.controller.ts
│   ├── logs.service.ts
│   └── dto/                # Validation DTOs
├── users/                  # Users module
├── health/                 # Health check endpoint
├── db/                     # Database module
└── seed.ts                 # Development seed script
```

**Key Patterns:**

- **Modular architecture** (NestJS modules)
- **JWT authentication** with HTTP-only cookies
- **Google OAuth** for social login
- **Global validation pipe** with class-validator
- **CORS** enabled for frontend origin

### Database Schema

```
users
├── id (uuid, PK)
├── email (unique)
├── name
├── googleId (unique)
├── hasSeenOnboarding
├── createdAt
└── updatedAt

daily_logs
├── id (uuid, PK)
├── userId (FK → users)
├── logDate (date)
├── moodRating (1-10)
├── anxietyLevel (1-10)
├── stressLevel (1-10)
├── sleepHours (decimal)
├── sleepQuality (1-5)
├── sleepDisturbances (JSON array)
├── activityType
├── activityMinutes
├── socialInteractions (1-5)
├── depressionSymptoms (JSON array)
├── anxietySymptoms (JSON array)
├── notes
├── createdAt
└── updatedAt

Constraint: unique(userId, logDate) — one log per user per day
```

---

## API Endpoints

| Method   | Endpoint                    | Description           |
| -------- | --------------------------- | --------------------- |
| `GET`    | `/api/auth/google`          | Initiate Google OAuth |
| `GET`    | `/api/auth/google/callback` | OAuth callback        |
| `GET`    | `/api/auth/me`              | Get current user      |
| `POST`   | `/api/auth/refresh`         | Refresh access token  |
| `POST`   | `/api/auth/logout`          | Clear auth cookies    |
| `GET`    | `/api/logs`                 | List user's logs      |
| `POST`   | `/api/logs`                 | Create a new log      |
| `PUT`    | `/api/logs/:id`             | Update a log          |
| `DELETE` | `/api/logs/:id`             | Delete a log          |
| `GET`    | `/api/health`               | Health check          |

---

## Authentication Flow

```
┌─────────┐     ┌─────────┐     ┌──────────────┐     ┌────────┐
│  User   │────▶│  Web    │────▶│  API         │────▶│ Google │
│         │     │ (Next)  │     │  (NestJS)    │     │ OAuth  │
└─────────┘     └─────────┘     └──────────────┘     └────────┘
                    │                  │
                    │  JWT cookies     │
                    │◀─────────────────│
                    │                  │
                    │  /api/auth/me    │
                    │─────────────────▶│
                    │  user data       │
                    │◀─────────────────│
```

1. User clicks "Login with Google"
2. Frontend redirects to `/api/auth/google`
3. Backend redirects to Google OAuth consent
4. Google redirects back with code to callback URL
5. Backend exchanges code for tokens, creates/finds user
6. Backend sets HTTP-only JWT cookies (access + refresh)
7. Frontend calls `/api/auth/me` to get user data

---

## Data Flow

```
┌─────────────────┐
│   LogsContext   │  React Context (client-side cache)
└────────┬────────┘
         │ fetch / mutate
         ▼
┌─────────────────┐
│   API Routes    │  /api/logs/*
└────────┬────────┘
         │ Drizzle ORM
         ▼
┌─────────────────┐
│   PostgreSQL    │  Supabase (cloud) or local
└─────────────────┘
```

---

## Internationalization (i18n)

- **Library:** next-intl
- **Supported locales:** `en`, `es`
- **Strategy:** Path-based (`/en/dashboard`, `/es/dashboard`)
- **Translation files:** `apps/web/messages/{locale}.json`

---

## Charting & Visualization

All charts are built with **Recharts** and organized in `apps/web/src/components/charts/`:

| Chart                       | Purpose                               |
| --------------------------- | ------------------------------------- |
| `CustomChart`               | Configurable trend chart with presets |
| `ActivityDistributionChart` | Donut chart for activity types        |
| `SymptomFrequencyChart`     | Bar chart for symptom frequencies     |
| `MoodTrendChart`            | Mood over time                        |
| `SleepChart`                | Sleep hours & quality                 |
| `StressActivityChart`       | Stress vs activity correlation        |

**Chart Presets** allow users to toggle between different data views (mood, anxiety, sleep, activity, social wellness).

---

## Shared Packages

### `@mental-health/db`

- Houses Drizzle schema (`schema.ts`)
- Provides database client (`client.ts`)
- Contains migration files
- Exports types inferred from schema

### `@mental-health/types`

- Shared TypeScript interfaces and types
- Used by both `api` and `web` apps

---

## Development Workflow

```bash
# Start all apps in dev mode
pnpm dev

# Run from root — Turborepo handles dependencies
pnpm build       # Build all
pnpm lint        # Lint all
pnpm test        # Test all

# Database commands
pnpm db:generate # Generate migrations
pnpm db:migrate  # Run migrations
pnpm db:push     # Push schema directly (dev only)
```

---

## Environment Configuration

Each package/app has its own `.env` file. See `.env.example` files for required variables:

- `apps/api/.env.example` — API secrets, OAuth, JWT
- `packages/db/.env.example` — Database connection strings

**Important:** Never commit actual secrets. Use `.env.example` as a template.

---

## Design Principles

1. **Type Safety First** — Full TypeScript coverage with shared types
2. **Mobile-First UI** — Responsive design starting at 375px
3. **Modular Architecture** — NestJS modules, React components
4. **Optimized State** — `useMemo`, `useCallback` where needed
5. **Accessible** — Radix UI primitives with ARIA support
6. **Internationalized** — Multi-language support from day one
