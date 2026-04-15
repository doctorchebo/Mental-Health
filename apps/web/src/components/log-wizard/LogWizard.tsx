"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLogs } from "@/context/LogsContext";
import type {
  ActivityType,
  AnxietySymptom,
  CreateLogDTO,
  DepressionSymptom,
  SleepDisturbance,
} from "@mental-health/types";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import ActivityStep from "./ActivityStep";
import AnxietyStressStep from "./AnxietyStressStep";
import MoodStep from "./MoodStep";
import SleepStep from "./SleepStep";
import SocialStep from "./SocialStep";
import SymptomsStep from "./SymptomsStep";

const TOTAL_STEPS = 6;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function LogWizard() {
  const t = useTranslations("log");
  const locale = useLocale();
  const router = useRouter();
  const { addLog } = useLogs();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [moodRating, setMoodRating] = useState(5);
  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [activityMinutes, setActivityMinutes] = useState(30);
  const [activityType, setActivityType] = useState<ActivityType>("none");
  const [socialInteractions, setSocialInteractions] = useState(3);
  const [notes, setNotes] = useState("");
  const [depressionSymptoms, setDepressionSymptoms] = useState<
    DepressionSymptom[]
  >([]);
  const [anxietySymptoms, setAnxietySymptoms] = useState<AnxietySymptom[]>([]);
  const [sleepDisturbances, setSleepDisturbances] = useState<
    SleepDisturbance[]
  >([]);

  async function handleSubmit() {
    const dto: CreateLogDTO = {
      logDate: todayISO(),
      moodRating,
      anxietyLevel,
      stressLevel,
      sleepHours,
      sleepQuality,
      activityMinutes,
      activityType,
      socialInteractions,
      notes: notes || null,
      depressionSymptoms,
      anxietySymptoms,
      sleepDisturbances,
    };

    await doSave(dto);
  }

  async function doSave(dto: CreateLogDTO) {
    setSubmitting(true);
    try {
      await addLog(dto);
      toast.success(t("success"));
      router.push(`/${locale}/dashboard`);
    } catch (err) {
      console.error("[LogWizard] save error:", err);
      toast.error(t("error"));
    } finally {
      setSubmitting(false);
    }
  }

  const steps = [
    <MoodStep key="mood" value={moodRating} onChange={setMoodRating} />,
    <AnxietyStressStep
      key="anxiety"
      anxietyLevel={anxietyLevel}
      stressLevel={stressLevel}
      onAnxietyChange={setAnxietyLevel}
      onStressChange={setStressLevel}
    />,
    <SleepStep
      key="sleep"
      sleepHours={sleepHours}
      sleepQuality={sleepQuality}
      onHoursChange={setSleepHours}
      onQualityChange={setSleepQuality}
    />,
    <ActivityStep
      key="activity"
      activityMinutes={activityMinutes}
      activityType={activityType}
      onMinutesChange={setActivityMinutes}
      onTypeChange={setActivityType}
    />,
    <SocialStep
      key="social"
      socialInteractions={socialInteractions}
      notes={notes}
      onInteractionsChange={setSocialInteractions}
      onNotesChange={setNotes}
    />,
    <SymptomsStep
      key="symptoms"
      depressionSymptoms={depressionSymptoms}
      anxietySymptoms={anxietySymptoms}
      sleepDisturbances={sleepDisturbances}
      onDepressionChange={setDepressionSymptoms}
      onAnxietyChange={setAnxietySymptoms}
      onSleepDisturbancesChange={setSleepDisturbances}
    />,
  ];

  const isLast = step === TOTAL_STEPS - 1;

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="flex flex-col gap-1">
        <Progress value={((step + 1) / TOTAL_STEPS) * 100} className="h-2" />
        <p className="text-xs text-muted-foreground text-right">
          {step + 1}/{TOTAL_STEPS}
        </p>
      </div>

      {/* Current step */}
      <div className="min-h-[300px]">{steps[step]}</div>

      {/* Nav buttons */}
      <div className="flex justify-between gap-3">
        <Button
          variant="ghost"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
        >
          {t("back")}
        </Button>
        {isLast ? (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? t("saving") : t("submit")}
          </Button>
        ) : (
          <Button onClick={() => setStep((s) => s + 1)}>{t("next")}</Button>
        )}
      </div>
    </div>
  );
}
