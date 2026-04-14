"use client";

import { useAuth } from "@/context/AuthContext";
import { markOnboardingSeen } from "@/lib/api";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { EventData } from "react-joyride";
import { Joyride, STATUS } from "react-joyride";

export default function OnboardingTour() {
  const t = useTranslations("onboarding");
  const { user, refreshUser } = useAuth();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (user && !user.hasSeenOnboarding) {
      // Delay until after first render so data-tour targets are in the DOM
      const id = setTimeout(() => setRun(true), 800);
      return () => clearTimeout(id);
    }
  }, [user]);

  const steps = [
    {
      target: "[data-tour='dashboard-header']",
      content: t("step1.content"),
      title: t("step1.title"),
      disableBeacon: true,
    },
    {
      target: "[data-tour='charts']",
      content: t("step2.content"),
      title: t("step2.title"),
    },
    {
      target: "[data-tour='log-button']",
      content: t("step3.content"),
      title: t("step3.title"),
    },
    {
      target: "[data-tour='locale-switcher']",
      content: t("step4.content"),
      title: t("step4.title"),
    },
  ];

  async function handleEvent(data: EventData) {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      await markOnboardingSeen();
      await refreshUser();
    }
  }

  if (!run) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      onEvent={handleEvent}
      locale={{
        back: t("back"),
        close: t("skip"),
        last: t("finish"),
        next: t("next"),
        skip: t("skip"),
      }}
    />
  );
}
