"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useTranslations } from "next-intl";

interface Props {
  sleepHours: number;
  sleepQuality: number;
  onHoursChange: (v: number) => void;
  onQualityChange: (v: number) => void;
}

export default function SleepStep({
  sleepHours,
  sleepQuality,
  onHoursChange,
  onQualityChange,
}: Props) {
  const t = useTranslations("log.steps.sleep");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t("description")}</p>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("hoursLabel")}</Label>
        <span className="text-center text-3xl">
          {sleepHoursEmoji(sleepHours)}
        </span>
        <Slider
          min={0}
          max={12}
          step={0.5}
          value={[sleepHours]}
          onValueChange={([v]) => onHoursChange(v)}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0h</span>
          <span className="font-medium">{sleepHours}h</span>
          <span>12h</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("qualityLabel")}</Label>
        <span className="text-center text-3xl">
          {SLEEP_QUALITY_EMOJI[sleepQuality - 1]}
        </span>
        <Slider
          min={1}
          max={10}
          step={1}
          value={[sleepQuality]}
          onValueChange={([v]) => onQualityChange(v)}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t("low")}</span>
          <span className="font-medium">{sleepQuality}/10</span>
          <span>{t("high")}</span>
        </div>
      </div>
    </div>
  );
}

function sleepHoursEmoji(h: number): string {
  if (h <= 2) return "😵";
  if (h <= 4) return "😫";
  if (h <= 6) return "😕";
  if (h <= 7.5) return "😐";
  if (h <= 9) return "😊";
  if (h <= 10.5) return "🙂";
  return "😴";
}

const SLEEP_QUALITY_EMOJI = [
  "😵",
  "😫",
  "😕",
  "😐",
  "🙂",
  "😊",
  "😄",
  "😁",
  "🤩",
  "✨",
];
