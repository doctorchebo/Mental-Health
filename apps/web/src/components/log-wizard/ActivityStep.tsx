"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { ActivityType } from "@mental-health/types";
import { useTranslations } from "next-intl";

const ACTIVITIES: ActivityType[] = [
  "walking",
  "running",
  "cycling",
  "yoga",
  "gym",
  "swimming",
  "dancing",
  "none",
  "other",
];

interface Props {
  activityMinutes: number;
  activityType: ActivityType;
  onMinutesChange: (v: number) => void;
  onTypeChange: (type: ActivityType) => void;
}

export default function ActivityStep({
  activityMinutes,
  activityType,
  onMinutesChange,
  onTypeChange,
}: Props) {
  const t = useTranslations("log.steps.activity");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t("description")}</p>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("minutesLabel")}</Label>
        <span className="text-center text-3xl">
          {activityMinutesEmoji(activityMinutes)}
        </span>
        <Slider
          min={0}
          max={180}
          step={5}
          value={[activityMinutes]}
          onValueChange={([v]) => onMinutesChange(v)}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0 min</span>
          <span className="font-medium">{activityMinutes} min</span>
          <span>180 min</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("typesLabel")}</Label>
        <div className="flex flex-wrap gap-2">
          {ACTIVITIES.map((a) => (
            <Badge
              key={a}
              variant={activityType === a ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onTypeChange(a)}
            >
              {t(`types.${a}`)}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

function activityMinutesEmoji(min: number): string {
  if (min === 0) return "🛍️";
  if (min <= 15) return "🚶";
  if (min <= 30) return "🏃";
  if (min <= 60) return "💪";
  if (min <= 90) return "🏋️";
  if (min <= 120) return "🔥";
  return "🏆";
}
