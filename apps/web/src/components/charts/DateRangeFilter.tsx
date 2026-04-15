"use client";

import type { DateRange } from "@/lib/chart-utils";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const OPTIONS: { value: DateRange; labelKey: string }[] = [
  { value: "7d", labelKey: "7days" },
  { value: "30d", labelKey: "30days" },
];

export default function DateRangeFilter({ value, onChange }: Props) {
  const t = useTranslations("dashboard.charts.filter");

  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-muted p-1 gap-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1 rounded-md text-sm font-medium transition-colors",
            value === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t(opt.labelKey)}
        </button>
      ))}
    </div>
  );
}
