"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useTranslations } from "next-intl";

interface Props {
  anxietyLevel: number;
  stressLevel: number;
  onAnxietyChange: (v: number) => void;
  onStressChange: (v: number) => void;
}

export default function AnxietyStressStep({
  anxietyLevel,
  stressLevel,
  onAnxietyChange,
  onStressChange,
}: Props) {
  const t = useTranslations("log.steps.anxietyStress");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t("description")}</p>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("anxietyLabel")}</Label>
        <span className="text-center text-3xl">
          {ANXIETY_EMOJI[anxietyLevel - 1]}
        </span>
        <Slider
          min={1}
          max={10}
          step={1}
          value={[anxietyLevel]}
          onValueChange={([v]) => onAnxietyChange(v)}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t("low")}</span>
          <span className="font-medium">{anxietyLevel}/10</span>
          <span>{t("high")}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("stressLabel")}</Label>
        <span className="text-center text-3xl">
          {STRESS_EMOJI[stressLevel - 1]}
        </span>
        <Slider
          min={1}
          max={10}
          step={1}
          value={[stressLevel]}
          onValueChange={([v]) => onStressChange(v)}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t("low")}</span>
          <span className="font-medium">{stressLevel}/10</span>
          <span>{t("high")}</span>
        </div>
      </div>
    </div>
  );
}

const ANXIETY_EMOJI = [
  "😌",
  "🙂",
  "😐",
  "😕",
  "😟",
  "😰",
  "😨",
  "😱",
  "🤯",
  "😵",
];
const STRESS_EMOJI = [
  "🧘",
  "😌",
  "🙂",
  "😐",
  "😓",
  "😫",
  "😤",
  "😡",
  "🤬",
  "🤯",
];
