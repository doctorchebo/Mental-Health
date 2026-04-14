import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

// Use transaction pooler (port 6543) for NestJS; set prepare:false per Supabase requirement
const client = postgres(process.env.DATABASE_URL!, {
  prepare: false,
  max: 10,
});

export const db = drizzle({ client, schema });

export type Database = typeof db;
