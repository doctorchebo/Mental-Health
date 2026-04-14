"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useTranslations } from "next-intl";

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export default function MoodStep({ value, onChange }: Props) {
  const t = useTranslations("log.steps.mood");
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t("description")}</p>
      </div>
      <div className="flex flex-col gap-3">
        <Label className="text-center text-4xl">
          {MOOD_EMOJI[value - 1] ?? "😐"}
        </Label>
        <Slider
          min={1}
          max={10}
          step={1}
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t("low")}</span>
          <span className="font-medium">{value}/10</span>
          <span>{t("high")}</span>
        </div>
      </div>
    </div>
  );
}

const MOOD_EMOJI = ["😞", "😟", "😕", "😐", "🙂", "😊", "😀", "😄", "🤩", "🌟"];
