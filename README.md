# LunaJoy — Mental Health Tracker

A personal mental health tracking app with mood logging, sleep tracking, activity monitoring, and data visualization.

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL (or [Supabase](https://supabase.com/) account)
- Google OAuth credentials ([setup guide](https://console.cloud.google.com/))

### Setup

```bash
# 1. Clone and install
git clone https://github.com/doctorchebo/Mental-Health.git
cd Mental-Health
pnpm install

# 2. Configure environment
cp packages/db/.env.example packages/db/.env
cp apps/api/.env.example apps/api/.env

# 3. Edit .env files with your credentials
# - packages/db/.env → DATABASE_URL, DATABASE_URL_DIRECT
# - apps/api/.env → JWT secrets, Google OAuth credentials

# 4. Build shared packages
pnpm --filter @mental-health/db build

# 5. Run database migrations
pnpm db:migrate

# 6. Start development servers
pnpm dev
```

### Access

| App      | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:3001 |
| API      | http://localhost:3000 |

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS, shadcn/ui, Recharts
- **Backend:** NestJS 11, Drizzle ORM, Passport (Google OAuth + JWT)
- **Database:** PostgreSQL
- **Monorepo:** pnpm workspaces + Turborepo

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — Project structure, tech stack, API endpoints
- [Setup Guide](docs/SETUP.md) — Detailed installation and configuration

## License

Private
