/**
 * Run migrations against the direct (non-pooler) Supabase connection.
 * Usage: npx tsx scripts/migrate.ts
 * Set DATABASE_URL_DIRECT in your environment before running.
 */
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { resolve } from "path";
import postgres from "postgres";

// Load .env from packages/db root when running locally
config({ path: resolve(__dirname, "../.env") });

const connectionString = process.env.DATABASE_URL_DIRECT;
if (!connectionString) {
  console.error(
    "ERROR: DATABASE_URL_DIRECT environment variable is required for migrations.",
  );
  process.exit(1);
}

async function main() {
  const client = postgres(connectionString!, { max: 1 });
  const db = drizzle({ client });

  console.log("Running migrations...");
  await migrate(db, {
    migrationsFolder: resolve(__dirname, "../migrations"),
  });
  console.log("Migrations complete.");
  await client.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
