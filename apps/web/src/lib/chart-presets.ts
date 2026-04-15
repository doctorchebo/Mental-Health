import type { MetricKey } from "./chart-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ChartSeriesType = "line" | "bar";
export type YAxisSide = "left" | "right" | "single";

export type MetricPolarity =
  | "higher-better"
  | "lower-better"
  | "target-optimal";

export interface MetricConfig {
  key: MetricKey;
  /** i18n key within dashboard.charts.metrics.* */
  labelKey: string;
  color: string;
  seriesType: ChartSeriesType;
  yAxisId: YAxisSide;
  domain: [number, number];
  unit?: string;
  /** Direction of improvement for trend calculation */
  polarity: MetricPolarity;
  /** Only used when polarity is "target-optimal" */
  optimalValue?: number;
}

export interface ChartPreset {
  id: string;
  /** i18n key under dashboard.charts.presets.*.title */
  titleKey: string;
  /** i18n key under dashboard.charts.presets.*.description */
  descriptionKey: string;
  metrics: MetricConfig[];
}

// ─── Presets ──────────────────────────────────────────────────────────────────

export const CHART_PRESETS: ChartPreset[] = [
  {
    id: "mental_health",
    titleKey: "mental_health",
    descriptionKey: "mental_health_desc",
    metrics: [
      {
        key: "moodRating",
        labelKey: "moodRating",
        color: "#3b82f6", // blue
        seriesType: "line",
        yAxisId: "single",
        domain: [1, 10],
        polarity: "higher-better",
      },
      {
        key: "anxietyLevel",
        labelKey: "anxietyLevel",
        color: "#f59e0b", // amber
        seriesType: "line",
        yAxisId: "single",
        domain: [1, 10],
        polarity: "lower-better",
      },
      {
        key: "stressLevel",
        labelKey: "stressLevel",
        color: "#ef4444", // red
        seriesType: "line",
        yAxisId: "single",
        domain: [1, 10],
        polarity: "lower-better",
      },
    ],
  },
  {
    id: "sleep_analysis",
    titleKey: "sleep_analysis",
    descriptionKey: "sleep_analysis_desc",
    metrics: [
      {
        key: "sleepHours",
        labelKey: "sleepHours",
        color: "#a855f7", // purple
        seriesType: "bar",
        yAxisId: "left",
        domain: [0, 12],
        unit: "h",
        polarity: "target-optimal",
        optimalValue: 8,
      },
      {
        key: "sleepQuality",
        labelKey: "sleepQuality",
        color: "#3b82f6", // blue
        seriesType: "line",
        yAxisId: "right",
        domain: [1, 5],
        polarity: "higher-better",
      },
    ],
  },
  {
    id: "activity_mood",
    titleKey: "activity_mood",
    descriptionKey: "activity_mood_desc",
    metrics: [
      {
        key: "activityMinutes",
        labelKey: "activityMinutes",
        color: "#22c55e", // green
        seriesType: "bar",
        yAxisId: "left",
        domain: [0, 120],
        unit: "min",
        polarity: "higher-better",
      },
      {
        key: "moodRating",
        labelKey: "moodRating",
        color: "#3b82f6", // blue
        seriesType: "line",
        yAxisId: "right",
        domain: [1, 10],
        polarity: "higher-better",
      },
    ],
  },
  {
    id: "social_wellness",
    titleKey: "social_wellness",
    descriptionKey: "social_wellness_desc",
    metrics: [
      {
        key: "socialInteractions",
        labelKey: "socialInteractions",
        color: "#f97316", // orange
        seriesType: "line",
        yAxisId: "left",
        domain: [1, 5],
        polarity: "higher-better",
      },
      {
        key: "moodRating",
        labelKey: "moodRating",
        color: "#3b82f6", // blue
        seriesType: "line",
        yAxisId: "right",
        domain: [1, 10],
        polarity: "higher-better",
      },
    ],
  },
  {
    id: "anxiety_stress",
    titleKey: "anxiety_stress",
    descriptionKey: "anxiety_stress_desc",
    metrics: [
      {
        key: "anxietyLevel",
        labelKey: "anxietyLevel",
        color: "#f59e0b", // amber
        seriesType: "line",
        yAxisId: "single",
        domain: [1, 10],
        polarity: "lower-better",
      },
      {
        key: "stressLevel",
        labelKey: "stressLevel",
        color: "#ef4444", // red
        seriesType: "line",
        yAxisId: "single",
        domain: [1, 10],
        polarity: "lower-better",
      },
    ],
  },
];
