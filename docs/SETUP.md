# LunaJoy Setup Guide

This guide walks you through setting up the LunaJoy mental health tracker for local development.

## Prerequisites

| Requirement    | Minimum Version            |
| -------------- | -------------------------- |
| **Node.js**    | 20.x or higher             |
| **pnpm**       | 10.x or higher             |
| **PostgreSQL** | 15.x (or Supabase account) |

### Install pnpm

```bash
# Using npm
npm install -g pnpm@latest

# Or using Corepack (Node 16.13+)
corepack enable
corepack prepare pnpm@latest --activate
```

---

## 1. Clone the Repository

```bash
git clone https://github.com/doctorchebo/Mental-Health.git
cd Mental-Health
```

---

## 2. Install Dependencies

From the repository root:

```bash
pnpm install
```

This installs dependencies for all workspaces (`apps/*`, `packages/*`).

---

## 3. Environment Configuration

### 3.1 Database Package (`packages/db`)

```bash
cp packages/db/.env.example packages/db/.env
```

Edit `packages/db/.env`:

```env
# Transaction pooler (port 6543) — used at runtime
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Direct connection (port 5432) — used for migrations
DATABASE_URL_DIRECT=postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

**Local PostgreSQL alternative:**

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/lunajoy
DATABASE_URL_DIRECT=postgresql://postgres:password@localhost:5432/lunajoy
```

### 3.2 API (`apps/api`)

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`:

```env
PORT=3000
NODE_ENV=development

# Database — same as packages/db
DATABASE_URL=postgresql://...

# JWT secrets — generate secure random strings
JWT_SECRET=your-secure-random-string-at-least-32-chars
JWT_REFRESH_SECRET=another-secure-random-string-different-from-above

# Google OAuth credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3001
```

### 3.3 Web (`apps/web`)

Create `apps/web/.env.local`:

```env
# API URL (where NestJS runs)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 4. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add authorized redirect URI:
   ```
   http://localhost:3000/auth/google/callback
   ```
7. Copy the **Client ID** and **Client Secret** to your `.env`

---

## 5. Database Setup

### Build the database package first

```bash
pnpm --filter @mental-health/db build
```

### Run migrations

```bash
pnpm db:migrate
```

Or push schema directly (dev only):

```bash
pnpm db:push
```

### (Optional) Seed sample data

```bash
cd apps/api
pnpm seed
```

---

## 6. Start Development Servers

From the repository root:

```bash
pnpm dev
```

This starts both apps concurrently via Turborepo:

| App     | URL                   | Description      |
| ------- | --------------------- | ---------------- |
| **API** | http://localhost:3000 | NestJS backend   |
| **Web** | http://localhost:3001 | Next.js frontend |

### Start individually

```bash
# API only
pnpm --filter api dev

# Web only
pnpm --filter web dev
```

---

## 7. Verify Setup

1. Open http://localhost:3001 in your browser
2. Click **Login with Google**
3. Complete OAuth flow
4. You should be redirected to the dashboard

### Health check

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{ "status": "ok" }
```

---

## Common Commands

| Command                  | Description                                |
| ------------------------ | ------------------------------------------ |
| `pnpm dev`               | Start all apps in development mode         |
| `pnpm build`             | Build all packages and apps                |
| `pnpm lint`              | Lint all workspaces                        |
| `pnpm test`              | Run tests                                  |
| `pnpm db:generate`       | Generate new migration from schema changes |
| `pnpm db:migrate`        | Apply pending migrations                   |
| `pnpm db:push`           | Push schema directly (dev only)            |
| `pnpm --filter api seed` | Seed database with sample data             |

---

## Troubleshooting

### Port already in use

```bash
# Find process using port 3000
npx kill-port 3000

# Or change port in .env
PORT=3002
```

### Database connection errors

1. Verify your `DATABASE_URL` is correct
2. Ensure PostgreSQL is running
3. For Supabase, check if connection pooler is enabled
4. Try the direct connection URL for debugging

### OAuth redirect mismatch

Ensure `GOOGLE_CALLBACK_URL` in `.env` matches exactly what's configured in Google Cloud Console.

### Module not found errors

```bash
# Rebuild all packages
pnpm build

# Clear caches
rm -rf node_modules/.cache
pnpm install
```

### TypeScript errors after schema changes

```bash
# Rebuild the db package
pnpm --filter @mental-health/db build
```

---

## IDE Setup

### VS Code

Recommended extensions:

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar) — for better TS support

### Settings

The repository includes `.vscode/` settings for consistent formatting.

---

## Production Build

```bash
# Build all
pnpm build

# Start production API
cd apps/api && pnpm start:prod

# Start production Web
cd apps/web && pnpm start
```

---

## Environment Variables Reference

### `apps/api/.env`

| Variable               | Required | Description                          |
| ---------------------- | -------- | ------------------------------------ |
| `PORT`                 | No       | API server port (default: 3000)      |
| `NODE_ENV`             | No       | Environment (development/production) |
| `DATABASE_URL`         | Yes      | PostgreSQL connection string         |
| `JWT_SECRET`           | Yes      | Secret for access tokens             |
| `JWT_REFRESH_SECRET`   | Yes      | Secret for refresh tokens            |
| `GOOGLE_CLIENT_ID`     | Yes      | Google OAuth client ID               |
| `GOOGLE_CLIENT_SECRET` | Yes      | Google OAuth client secret           |
| `GOOGLE_CALLBACK_URL`  | Yes      | OAuth callback URL                   |
| `FRONTEND_URL`         | Yes      | Frontend URL for CORS                |

### `packages/db/.env`

| Variable              | Required | Description                               |
| --------------------- | -------- | ----------------------------------------- |
| `DATABASE_URL`        | Yes      | Connection string (pooler, port 6543)     |
| `DATABASE_URL_DIRECT` | Yes      | Direct connection (migrations, port 5432) |

### `apps/web/.env.local`

| Variable              | Required | Description     |
| --------------------- | -------- | --------------- |
| `NEXT_PUBLIC_API_URL` | Yes      | Backend API URL |
