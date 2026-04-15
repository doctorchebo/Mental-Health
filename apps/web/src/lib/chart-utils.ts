import type {
  AnxietySymptom,
  DailyLog,
  DepressionSymptom,
  SleepDisturbance,
} from "@mental-health/types";
import type { ChartPreset } from "./chart-presets";

// ─── Date Filtering ───────────────────────────────────────────────────────────

export type DateRange = "7d" | "30d";

export function filterLogsByDateRange(
  logs: DailyLog[],
  range: DateRange,
): DailyLog[] {
  const days = range === "7d" ? 7 : 30;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  return [...logs]
    .filter((l) => l.logDate >= cutoffStr)
    .sort((a, b) => a.logDate.localeCompare(b.logDate));
}

// ─── Numeric Trend Data ───────────────────────────────────────────────────────

export type MetricKey =
  | "moodRating"
  | "anxietyLevel"
  | "stressLevel"
  | "sleepHours"
  | "sleepQuality"
  | "activityMinutes"
  | "socialInteractions";

export function buildTrendData(
  logs: DailyLog[],
  keys: MetricKey[],
): Record<string, string | number>[] {
  return logs.map((l) => {
    const point: Record<string, string | number> = {
      date: l.logDate.slice(5), // MM-DD
    };
    for (const key of keys) {
      point[key] = l[key] as number;
    }
    return point;
  });
}

// ─── Symptom Frequency ────────────────────────────────────────────────────────

export interface FrequencyEntry {
  label: string;
  count: number;
}

export function countDepressionSymptoms(logs: DailyLog[]): FrequencyEntry[] {
  const counts: Record<DepressionSymptom, number> = {
    low_energy: 0,
    hopelessness: 0,
    loss_of_interest: 0,
    appetite_changes: 0,
    difficulty_concentrating: 0,
    worthlessness: 0,
    crying_spells: 0,
  };
  for (const log of logs) {
    for (const s of log.depressionSymptoms) counts[s]++;
  }
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export function countAnxietySymptoms(logs: DailyLog[]): FrequencyEntry[] {
  const counts: Record<AnxietySymptom, number> = {
    racing_thoughts: 0,
    restlessness: 0,
    muscle_tension: 0,
    irritability: 0,
    panic_attacks: 0,
    avoidance: 0,
    worry: 0,
  };
  for (const log of logs) {
    for (const s of log.anxietySymptoms) counts[s]++;
  }
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export function countSleepDisturbances(logs: DailyLog[]): FrequencyEntry[] {
  const counts: Record<SleepDisturbance, number> = {
    nightmares: 0,
    insomnia: 0,
    waking_early: 0,
    restless: 0,
    sleep_apnea: 0,
    other: 0,
  };
  for (const log of logs) {
    for (const s of log.sleepDisturbances) counts[s]++;
  }
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export function countActivityTypes(logs: DailyLog[]): FrequencyEntry[] {
  const counts: Record<string, number> = {};
  for (const log of logs) {
    const t = log.activityType ?? "none";
    counts[t] = (counts[t] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .filter((e) => e.label !== "none" || e.count > 0)
    .sort((a, b) => b.count - a.count);
}

// ─── Preset Trend ─────────────────────────────────────────────────────────────

export type TrendDirection = "up" | "down" | "stable";

export interface PresetTrend {
  percent: number;
  direction: TrendDirection;
  hasEnoughData: boolean;
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Splits sorted logs into two halves, computes per-metric improvement
 * (normalised 0-1 per metric's domain), respects polarity, then averages.
 * Returns { percent, direction, hasEnoughData }.
 */
export function calculatePresetTrend(
  logs: DailyLog[],
  preset: ChartPreset,
): PresetTrend {
  const MIN_ENTRIES = 4;
  if (logs.length < MIN_ENTRIES) {
    return { percent: 0, direction: "stable", hasEnoughData: false };
  }

  const mid = Math.floor(logs.length / 2);
  const firstHalf = logs.slice(0, mid);
  const secondHalf = logs.slice(mid);

  let totalImprovement = 0;
  let metricCount = 0;

  for (const metric of preset.metrics) {
    const firstVals = firstHalf
      .map((l) => l[metric.key] as number | null | undefined)
      .filter((v): v is number => v != null);
    const secondVals = secondHalf
      .map((l) => l[metric.key] as number | null | undefined)
      .filter((v): v is number => v != null);

    if (firstVals.length === 0 || secondVals.length === 0) continue;

    const firstAvg = avg(firstVals);
    const secondAvg = avg(secondVals);
    const [domainMin, domainMax] = metric.domain;
    const range = domainMax - domainMin || 1;

    let improvement: number; // positive = getting better

    if (metric.polarity === "higher-better") {
      improvement = (secondAvg - firstAvg) / range;
    } else if (metric.polarity === "lower-better") {
      improvement = (firstAvg - secondAvg) / range;
    } else {
      // target-optimal
      const optimal = metric.optimalValue ?? (domainMin + domainMax) / 2;
      const firstDist = Math.abs(firstAvg - optimal) / range;
      const secondDist = Math.abs(secondAvg - optimal) / range;
      improvement = firstDist - secondDist; // positive means closer to optimal
    }

    totalImprovement += improvement;
    metricCount++;
  }

  if (metricCount === 0) {
    return { percent: 0, direction: "stable", hasEnoughData: false };
  }

  const raw = (totalImprovement / metricCount) * 100;
  const percent = Math.round(Math.abs(raw));
  const STABLE_THRESHOLD = 3;

  let direction: TrendDirection;
  if (raw >= STABLE_THRESHOLD) direction = "up";
  else if (raw <= -STABLE_THRESHOLD) direction = "down";
  else direction = "stable";

  return { percent, direction, hasEnoughData: true };
}
