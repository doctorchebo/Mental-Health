"use client";

import type { ChartPreset } from "@/lib/chart-presets";
import { buildTrendData, type MetricKey } from "@/lib/chart-utils";
import type { DailyLog } from "@mental-health/types";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  logs: DailyLog[];
  preset: ChartPreset;
}

interface TooltipEntry {
  name: string;
  value: number;
  color: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  preset: ChartPreset;
  notesMap: Map<string, string | null>;
  translate: (key: string) => string;
}

function ChartTooltip({
  active,
  payload,
  label,
  preset,
  notesMap,
  translate,
}: TooltipProps) {
  if (!active || !payload?.length) return null;

  const notes =
    preset.id === "social_wellness"
      ? (notesMap.get(label ?? "") ?? null)
      : null;

  return (
    <div
      style={{
        backgroundColor: "var(--background)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        fontSize: 12,
        padding: "8px 12px",
        maxWidth: 220,
      }}
    >
      <p
        style={{
          color: "var(--muted-foreground)",
          marginBottom: 4,
          fontWeight: 500,
        }}
      >
        {label}
      </p>
      {payload.map((entry, i) => {
        const metric = preset.metrics.find((m) => m.key === entry.name);
        return (
          <p key={i} style={{ color: entry.color, margin: "2px 0" }}>
            {translate(metric?.labelKey ?? entry.name)}:{" "}
            <strong>
              {entry.value}
              {metric?.unit ? ` ${metric.unit}` : ""}
            </strong>
          </p>
        );
      })}
      {notes && (
        <p
          style={{
            color: "var(--muted-foreground)",
            marginTop: 8,
            paddingTop: 6,
            borderTop: "1px solid var(--border)",
            fontStyle: "italic",
            lineHeight: 1.4,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          &ldquo;{notes}&rdquo;
        </p>
      )}
    </div>
  );
}

export default function CustomChart({ logs, preset }: Props) {
  const t = useTranslations("dashboard.charts.metrics");

  const notesMap = useMemo(() => {
    const map = new Map<string, string | null>();
    logs.forEach((l) => map.set(l.logDate.slice(5), l.notes));
    return map;
  }, [logs]);

  const keys = preset.metrics.map((m) => m.key) as MetricKey[];
  const data = buildTrendData(logs, keys);

  const isDual =
    preset.metrics.some((m) => m.yAxisId === "left") &&
    preset.metrics.some((m) => m.yAxisId === "right");

  const leftMetrics = preset.metrics.filter((m) => m.yAxisId === "left");
  const rightMetrics = preset.metrics.filter((m) => m.yAxisId === "right");
  const singleMetrics = preset.metrics.filter((m) => m.yAxisId === "single");

  // Combined left domain if multiple single-axis metrics
  const singleDomain =
    singleMetrics.length > 0
      ? ([
          Math.min(...singleMetrics.map((m) => m.domain[0])),
          Math.max(...singleMetrics.map((m) => m.domain[1])),
        ] as [number, number])
      : ([1, 10] as [number, number]);

  const leftDomain = leftMetrics[0]?.domain ?? singleDomain;
  const rightDomain = rightMetrics[0]?.domain ?? ([1, 10] as [number, number]);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 8, right: isDual ? 32 : 8, bottom: 4, left: -16 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />

          {isDual ? (
            <>
              <YAxis
                yAxisId="left"
                domain={leftDomain}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={rightDomain}
                tick={{ fontSize: 11 }}
              />
            </>
          ) : (
            <YAxis
              yAxisId="single"
              domain={singleDomain}
              tick={{ fontSize: 11 }}
            />
          )}

          <Tooltip
            content={(props) => (
              <ChartTooltip
                {...props}
                preset={preset}
                notesMap={notesMap}
                translate={t}
              />
            )}
          />
          <Legend
            formatter={(value: string) => {
              const metric = preset.metrics.find((m) => m.key === value);
              return t(metric?.labelKey ?? value);
            }}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12 }}
          />

          {preset.metrics.map((metric) => {
            const axisId = metric.yAxisId;
            if (metric.seriesType === "bar") {
              return (
                <Bar
                  key={metric.key}
                  yAxisId={axisId}
                  dataKey={metric.key}
                  fill={metric.color}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={20}
                />
              );
            }
            return (
              <Line
                key={metric.key}
                yAxisId={axisId}
                type="monotone"
                dataKey={metric.key}
                stroke={metric.color}
                strokeWidth={2}
                dot={{
                  r: logs.length <= 14 ? 3 : 2,
                  fill: metric.color,
                  strokeWidth: 0,
                }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
