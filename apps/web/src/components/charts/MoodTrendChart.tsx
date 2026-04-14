"use client";

import type { DailyLog } from "@mental-health/types";
import { useTranslations } from "next-intl";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  logs: DailyLog[];
}

export default function MoodTrendChart({ logs }: Props) {
  const t = useTranslations("dashboard.charts");
  const data = [...logs]
    .sort(
      (a, b) => new Date(a.logDate).getTime() - new Date(b.logDate).getTime(),
    )
    .map((l) => ({ date: l.logDate.slice(5), mood: l.moodRating }));

  return (
    <div className="w-full h-48">
      <p className="text-sm font-medium text-muted-foreground mb-2">
        {t("moodTrend")}
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 4, right: 8, bottom: 4, left: -20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis domain={[1, 10]} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
