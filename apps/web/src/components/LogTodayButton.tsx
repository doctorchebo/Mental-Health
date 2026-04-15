"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useLogs } from "@/context/LogsContext";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  size?: "sm" | "default" | "lg";
  "data-tour"?: string;
}

export default function LogTodayButton({ size = "sm", ...rest }: Props) {
  const t = useTranslations("log");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const { logs } = useLogs();

  const [open, setOpen] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const alreadyLogged = logs.some((l) => l.logDate === today);

  function handleClick() {
    if (alreadyLogged) {
      setOpen(true);
    } else {
      router.push(`/${locale}/log`);
    }
  }

  return (
    <>
      <Button size={size} onClick={handleClick} {...rest}>
        {tNav("logToday")}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("duplicateModal.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("duplicateModal.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("duplicateModal.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push(`/${locale}/log`)}>
              {t("duplicateModal.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
