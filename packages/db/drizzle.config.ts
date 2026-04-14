import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    // Use the DIRECT connection (port 5432) for migrations — not the pooler
    url: process.env.DATABASE_URL_DIRECT!,
  },
  verbose: true,
  strict: true,
});
