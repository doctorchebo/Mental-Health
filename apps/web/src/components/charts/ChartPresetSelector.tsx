"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ChartPreset } from "@/lib/chart-presets";
import { calculatePresetTrend } from "@/lib/chart-utils";
import { cn } from "@/lib/utils";
import type { DailyLog } from "@mental-health/types";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  presets: ChartPreset[];
  activeId: string;
  onChange: (id: string) => void;
  logs: DailyLog[];
}

const ICONS: Record<string, string> = {
  mental_health: "🧠",
  sleep_analysis: "😴",
  activity_mood: "🏃",
  social_wellness: "🤝",
  anxiety_stress: "😰",
};

function TrendBadge({
  logs,
  preset,
  isActive,
}: {
  logs: DailyLog[];
  preset: ChartPreset;
  isActive: boolean;
}) {
  const trend = calculatePresetTrend(logs, preset);

  if (!trend.hasEnoughData) return null;
  if (trend.direction === "stable") {
    return (
      <span
        className={cn(
          "text-xs font-semibold tabular-nums",
          isActive ? "text-primary-foreground/70" : "text-muted-foreground",
        )}
      >
        →0%
      </span>
    );
  }

  const isUp = trend.direction === "up";
  return (
    <span
      className={cn(
        "text-xs font-semibold tabular-nums",
        isActive
          ? isUp
            ? "text-emerald-300"
            : "text-red-300"
          : isUp
            ? "text-emerald-500"
            : "text-red-500",
      )}
    >
      {isUp ? "↑" : "↓"}
      {trend.percent}%
    </span>
  );
}

export function TrendInfoIcon() {
  const tInfo = useTranslations("dashboard.charts.trendInfo");
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-help"
            onClick={(e) => e.stopPropagation()}
            aria-label={tInfo("title")}
          >
            <Info className="w-3.5 h-3.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent
          className="max-w-72 text-xs leading-relaxed"
          side="bottom"
        >
          <p className="font-semibold mb-1">{tInfo("title")}</p>
          <p>{tInfo("body")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function ChartPresetSelector({
  presets,
  activeId,
  onChange,
  logs,
}: Props) {
  const t = useTranslations("dashboard.charts.presetLabels");
  const tDesc = useTranslations("dashboard.charts.presets");

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {presets.map((preset) => {
        const isActive = activeId === preset.id;
        return (
          <button
            key={preset.id}
            onClick={() => onChange(preset.id)}
            title={tDesc(preset.descriptionKey)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
              isActive
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground",
            )}
          >
            <span aria-hidden>{ICONS[preset.id] ?? "📊"}</span>
            {t(preset.titleKey)}
            <TrendBadge logs={logs} preset={preset} isActive={isActive} />
          </button>
        );
      })}
    </div>
  );
}
