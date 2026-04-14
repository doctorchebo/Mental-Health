// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string | null;
  googleId: string | null;
  hasSeenOnboarding: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Daily Log ────────────────────────────────────────────────────────────────

export type SleepDisturbance =
  | "nightmares"
  | "insomnia"
  | "waking_early"
  | "restless"
  | "sleep_apnea"
  | "other";

export type ActivityType =
  | "walking"
  | "running"
  | "yoga"
  | "gym"
  | "swimming"
  | "cycling"
  | "dancing"
  | "other"
  | "none";

export type DepressionSymptom =
  | "low_energy"
  | "hopelessness"
  | "loss_of_interest"
  | "appetite_changes"
  | "difficulty_concentrating"
  | "worthlessness"
  | "crying_spells";

export type AnxietySymptom =
  | "racing_thoughts"
  | "restlessness"
  | "muscle_tension"
  | "irritability"
  | "panic_attacks"
  | "avoidance"
  | "worry";

export interface DailyLog {
  id: string;
  userId: string;
  logDate: string; // ISO date string 'YYYY-MM-DD'

  // Step 1 – Mood
  moodRating: number; // 1–10

  // Step 2 – Anxiety & Stress
  anxietyLevel: number; // 1–10
  stressLevel: number; // 1–10

  // Step 3 – Sleep
  sleepHours: number;
  sleepQuality: number; // 1–5
  sleepDisturbances: SleepDisturbance[];

  // Step 4 – Activity
  activityType: ActivityType;
  activityMinutes: number;

  // Step 5 – Social
  socialInteractions: number; // 1–5 frequency scale

  // Step 6 – Symptoms
  depressionSymptoms: DepressionSymptom[];
  anxietySymptoms: AnxietySymptom[];
  notes: string | null;

  createdAt: Date;
  updatedAt: Date;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export type CreateLogDTO = Omit<
  DailyLog,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

export type UpdateLogDTO = Partial<CreateLogDTO>;

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}
