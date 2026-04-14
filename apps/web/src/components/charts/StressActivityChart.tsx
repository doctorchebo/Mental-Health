"use client";

import type { DailyLog } from "@mental-health/types";
import { useTranslations } from "next-intl";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  logs: DailyLog[];
}

export default function StressActivityChart({ logs }: Props) {
  const t = useTranslations("dashboard.charts");
  const data = [...logs]
    .sort(
      (a, b) => new Date(a.logDate).getTime() - new Date(b.logDate).getTime(),
    )
    .map((l) => ({
      date: l.logDate.slice(5),
      activity: l.activityMinutes,
      stress: l.stressLevel,
    }));

  return (
    <div className="w-full h-48">
      <p className="text-sm font-medium text-muted-foreground mb-2">
        {t("stressActivity")}
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 4, right: 8, bottom: 4, left: -20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="left" domain={[0, 120]} tick={{ fontSize: 11 }} />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[1, 10]}
            tick={{ fontSize: 11 }}
          />
          <Tooltip />
          <Bar
            yAxisId="left"
            dataKey="activity"
            fill="var(--accent)"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="stress"
            stroke="var(--destructive)"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
