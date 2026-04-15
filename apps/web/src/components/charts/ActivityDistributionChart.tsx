"use client";

import { countActivityTypes } from "@/lib/chart-utils";
import type { DailyLog } from "@mental-health/types";
import { useTranslations } from "next-intl";
import {
  Cell,
  Label,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Props {
  logs: DailyLog[];
}

const PIE_COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(142, 71%, 45%)",
  "hsl(262, 83%, 58%)",
  "hsl(27, 96%, 61%)",
  "hsl(0, 84%, 60%)",
  "hsl(180, 60%, 45%)",
  "hsl(310, 70%, 50%)",
  "hsl(45, 90%, 55%)",
];

export default function ActivityDistributionChart({ logs }: Props) {
  const t = useTranslations("log.steps.activity.types");

  const rawData = countActivityTypes(logs);
  const data = rawData
    .filter((e) => e.count > 0)
    .map((entry) => {
      let label = entry.label;
      try {
        label = t(entry.label);
      } catch {
        // leave raw key
      }
      return { name: label, value: entry.count };
    });

  const activeLogs = logs.filter((l) => l.activityMinutes > 0);
  const avgMinutes =
    activeLogs.length > 0
      ? Math.round(
          activeLogs.reduce((sum, l) => sum + l.activityMinutes, 0) /
            activeLogs.length,
        )
      : 0;

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No activity recorded in this period.
      </p>
    );
  }

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {avgMinutes > 0 && (
              <Label
                content={({ viewBox }) => {
                  const { cx, cy } = (viewBox ?? {}) as {
                    cx?: number;
                    cy?: number;
                  };
                  if (cx == null || cy == null) return null;
                  return (
                    <text textAnchor="middle">
                      <tspan
                        x={cx}
                        y={cy - 7}
                        fontSize={11}
                        fill="var(--muted-foreground)"
                      >
                        Avg
                      </tspan>
                      <tspan
                        x={cx}
                        y={cy + 10}
                        fontSize={14}
                        fontWeight="600"
                        fill="var(--foreground)"
                      >
                        {avgMinutes} min
                      </tspan>
                    </text>
                  );
                }}
                position="center"
              />
            )}
            {data.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={PIE_COLORS[index % PIE_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, _name, entry) => [
              `${value} ${value === 1 ? "day" : "days"}`,
              entry.payload.name,
            ]}
            contentStyle={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: 12,
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
