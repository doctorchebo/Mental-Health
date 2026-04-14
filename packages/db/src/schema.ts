import {
  date,
  decimal,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  googleId: text("google_id").unique(),
  hasSeenOnboarding: integer("has_seen_onboarding").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Daily Logs ───────────────────────────────────────────────────────────────

export const dailyLogs = pgTable(
  "daily_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    logDate: date("log_date").notNull(),

    // Step 1 – Mood (1–10)
    moodRating: integer("mood_rating").notNull(),

    // Step 2 – Anxiety & Stress (1–10)
    anxietyLevel: integer("anxiety_level").notNull(),
    stressLevel: integer("stress_level").notNull(),

    // Step 3 – Sleep
    sleepHours: decimal("sleep_hours", { precision: 4, scale: 1 }).notNull(),
    sleepQuality: integer("sleep_quality").notNull(), // 1–5
    // JSON array: SleepDisturbance[]
    sleepDisturbances: text("sleep_disturbances").notNull().default("[]"),

    // Step 4 – Activity
    activityType: text("activity_type").notNull().default("none"),
    activityMinutes: integer("activity_minutes").notNull().default(0),

    // Step 5 – Social interactions (1–5 frequency scale)
    socialInteractions: integer("social_interactions").notNull(),

    // Step 6 – Symptoms (JSON arrays)
    depressionSymptoms: text("depression_symptoms").notNull().default("[]"),
    anxietySymptoms: text("anxiety_symptoms").notNull().default("[]"),
    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Enforce one log per user per day
    uniqueIndex("daily_logs_user_date_idx").on(table.userId, table.logDate),
  ],
);

// ─── Types inferred from schema ───────────────────────────────────────────────

export type UserRecord = typeof users.$inferSelect;
export type NewUserRecord = typeof users.$inferInsert;
export type DailyLogRecord = typeof dailyLogs.$inferSelect;
export type NewDailyLogRecord = typeof dailyLogs.$inferInsert;
