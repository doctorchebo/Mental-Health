/**
 * Seed script — inserts 30 days of realistic dummy logs for every existing user.
 * Usage:
 *   $env:SUPABASE_DB_URL = "postgresql://..."
 *   npx ts-node -r tsconfig-paths/register src/seed.ts
 *
 * Skips any date that already has a log (safe to re-run).
 */

import * as schema from '@mental-health/db/schema';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as fs from 'fs';
import * as path from 'path';
import postgres from 'postgres';

// Manually parse .env to pick up DATABASE_URL / SUPABASE_DB_URL
function loadEnvFile() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile();

// Expand ${SUPABASE_DB_URL} if DATABASE_URL uses variable substitution
const rawUrl = process.env.DATABASE_URL ?? '';
const DATABASE_URL = rawUrl.startsWith('${')
  ? (process.env.SUPABASE_DB_URL ?? rawUrl)
  : rawUrl;

if (!DATABASE_URL || DATABASE_URL.startsWith('${')) {
  console.error('ERROR: Set SUPABASE_DB_URL env var before running seed.');
  process.exit(1);
}

const ACTIVITY_TYPES = [
  'walking',
  'running',
  'yoga',
  'gym',
  'swimming',
  'cycling',
  'none',
] as const;

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, step = 0.5) {
  const steps = Math.floor((max - min) / step);
  return min + Math.floor(Math.random() * (steps + 1)) * step;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function dateISO(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function main() {
  const client = postgres(DATABASE_URL, { prepare: false, max: 3 });
  const db = drizzle({ client, schema });

  const users = await db
    .select({ id: schema.users.id, email: schema.users.email })
    .from(schema.users);

  if (users.length === 0) {
    console.log('No users found — log in via Google first, then re-run.');
    await client.end();
    return;
  }

  // Clear all existing logs before reseeding
  console.log('Clearing existing logs…');
  await db.delete(schema.dailyLogs);

  let inserted = 0;
  let skipped = 0;

  for (const user of users) {
    console.log(`Seeding user ${user.email}…`);

    // Days 0..29 (today is 0, yesterday is 1, 29 days ago is 29)
    for (let daysAgo = 0; daysAgo <= 29; daysAgo++) {
      const logDate = dateISO(daysAgo);

      // Skip if already exists
      const existing = await db.query.dailyLogs.findFirst({
        where: and(
          eq(schema.dailyLogs.userId, user.id),
          eq(schema.dailyLogs.logDate, logDate),
        ),
      });
      if (existing) {
        skipped++;
        continue;
      }

      // Simulate a slow recovery trend: mood improves slightly over time
      const base = 4 + Math.round((30 - daysAgo) / 8);

      await db.insert(schema.dailyLogs).values({
        userId: user.id,
        logDate,
        moodRating: Math.min(10, Math.max(1, base + rand(-1, 1))),
        anxietyLevel: Math.min(10, Math.max(1, 8 - base + rand(-1, 1))),
        stressLevel: Math.min(10, Math.max(1, 7 - base + rand(-1, 1))),
        sleepHours: String(randFloat(4.5, 9, 0.5)),
        sleepQuality: rand(2, 8),
        sleepDisturbances: JSON.stringify(
          Math.random() < 0.4
            ? [pick(['insomnia', 'nightmares', 'restless', 'waking_early'])]
            : [],
        ),
        activityType: pick(ACTIVITY_TYPES),
        activityMinutes: rand(0, 75),
        socialInteractions: rand(0, 5),
        depressionSymptoms: JSON.stringify(
          Math.random() < 0.5
            ? [
                pick([
                  'low_energy',
                  'hopelessness',
                  'loss_of_interest',
                  'appetite_changes',
                ]),
              ]
            : [],
        ),
        anxietySymptoms: JSON.stringify(
          Math.random() < 0.4
            ? [
                pick([
                  'racing_thoughts',
                  'restlessness',
                  'muscle_tension',
                  'irritability',
                ]),
              ]
            : [],
        ),
        notes: null,
      });

      inserted++;
    }
  }

  console.log(
    `Done. Inserted: ${inserted}, Skipped (already exist): ${skipped}`,
  );
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
