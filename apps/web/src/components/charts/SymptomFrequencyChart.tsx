"use client";

import {
  countAnxietySymptoms,
  countDepressionSymptoms,
  countSleepDisturbances,
} from "@/lib/chart-utils";
import type { DailyLog } from "@mental-health/types";
import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type SymptomType = "depression" | "anxiety" | "sleep";

interface Props {
  logs: DailyLog[];
  symptomType: SymptomType;
}

const COLORS = {
  depression: "hsl(355, 32%, 50%)",
  anxiety: "hsl(32, 38%, 48%)",
  sleep: "hsl(220, 26%, 50%)",
};

export default function SymptomFrequencyChart({ logs, symptomType }: Props) {
  const tDepression = useTranslations("log.steps.symptoms.depressionSymptoms");
  const tAnxiety = useTranslations("log.steps.symptoms.anxietySymptoms");
  const tSleep = useTranslations("log.steps.symptoms.disturbances");

  const rawData =
    symptomType === "depression"
      ? countDepressionSymptoms(logs)
      : symptomType === "anxiety"
        ? countAnxietySymptoms(logs)
        : countSleepDisturbances(logs);

  const labelFn = (key: string) => {
    try {
      if (symptomType === "depression") return tDepression(key);
      if (symptomType === "anxiety") return tAnxiety(key);
      return tSleep(key);
    } catch {
      return key;
    }
  };

  const data = rawData.map((entry) => ({
    label: labelFn(entry.label),
    count: entry.count,
  }));

  const totalEntries = logs.length;
  const color = COLORS[symptomType];

  if (data.every((d) => d.count === 0)) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No symptoms recorded in this period.
      </p>
    );
  }

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 48, bottom: 4, left: 8 }}
        >
          <CartesianGrid
            horizontal={false}
            strokeDasharray="3 3"
            stroke="var(--border)"
          />
          <XAxis
            type="number"
            domain={[0, Math.max(totalEntries, 1)]}
            tick={{ fontSize: 11 }}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 11 }}
            width={140}
          />
          <Tooltip
            formatter={(value: number) => [
              `${value} / ${totalEntries} days`,
              "Frequency",
            ]}
            contentStyle={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: 12,
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
            {data.map((_entry, idx) => (
              <Cell key={idx} fill={color} fillOpacity={0.75 + idx * -0.05} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
