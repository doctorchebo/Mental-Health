"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type {
  AnxietySymptom,
  DepressionSymptom,
  SleepDisturbance,
} from "@mental-health/types";
import { useTranslations } from "next-intl";

const DEPRESSION_SYMPTOMS: DepressionSymptom[] = [
  "low_energy",
  "hopelessness",
  "loss_of_interest",
  "appetite_changes",
  "difficulty_concentrating",
  "worthlessness",
  "crying_spells",
];

const ANXIETY_SYMPTOMS: AnxietySymptom[] = [
  "racing_thoughts",
  "restlessness",
  "muscle_tension",
  "irritability",
  "panic_attacks",
  "avoidance",
  "worry",
];

const SLEEP_DISTURBANCES: SleepDisturbance[] = [
  "nightmares",
  "insomnia",
  "waking_early",
  "restless",
  "sleep_apnea",
  "other",
];

interface Props {
  depressionSymptoms: DepressionSymptom[];
  anxietySymptoms: AnxietySymptom[];
  sleepDisturbances: SleepDisturbance[];
  onDepressionChange: (s: DepressionSymptom[]) => void;
  onAnxietyChange: (s: AnxietySymptom[]) => void;
  onSleepDisturbancesChange: (d: SleepDisturbance[]) => void;
}

function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export default function SymptomsStep({
  depressionSymptoms,
  anxietySymptoms,
  sleepDisturbances,
  onDepressionChange,
  onAnxietyChange,
  onSleepDisturbancesChange,
}: Props) {
  const t = useTranslations("log.steps.symptoms");

  return (
    <div className="flex flex-col gap-6 overflow-y-auto max-h-[60vh]">
      <div>
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t("description")}</p>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("depressionLabel")}</Label>
        <div className="flex flex-wrap gap-2">
          {DEPRESSION_SYMPTOMS.map((s) => (
            <Badge
              key={s}
              variant={depressionSymptoms.includes(s) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onDepressionChange(toggle(depressionSymptoms, s))}
            >
              {t(`depressionSymptoms.${s}`)}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("anxietyLabel")}</Label>
        <div className="flex flex-wrap gap-2">
          {ANXIETY_SYMPTOMS.map((s) => (
            <Badge
              key={s}
              variant={anxietySymptoms.includes(s) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onAnxietyChange(toggle(anxietySymptoms, s))}
            >
              {t(`anxietySymptoms.${s}`)}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("disturbancesLabel")}</Label>
        <div className="flex flex-wrap gap-2">
          {SLEEP_DISTURBANCES.map((d) => (
            <Badge
              key={d}
              variant={sleepDisturbances.includes(d) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() =>
                onSleepDisturbancesChange(toggle(sleepDisturbances, d))
              }
            >
              {t(`disturbances.${d}`)}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
