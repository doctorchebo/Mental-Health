"use client";

import Navbar from "@/components/Navbar";
import LogWizard from "@/components/log-wizard/LogWizard";
import { useAuth } from "@/context/AuthContext";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LogPage() {
  const t = useTranslations("log");
  const locale = useLocale();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace(`/${locale}`);
  }, [loading, user, locale, router]);

  if (loading || !user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8 text-center">
          {t("pageTitle")}
        </h1>
        <LogWizard />
      </main>
    </div>
  );
}
