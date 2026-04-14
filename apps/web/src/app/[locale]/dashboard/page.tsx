"use client";

import MoodTrendChart from "@/components/charts/MoodTrendChart";
import SleepChart from "@/components/charts/SleepChart";
import StressActivityChart from "@/components/charts/StressActivityChart";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useLogs } from "@/context/LogsContext";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const { user, loading: authLoading } = useAuth();
  const { logs, loading: logsLoading } = useLogs();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.replace(`/${locale}`);
  }, [authLoading, user, locale, router]);

  if (authLoading || !user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Header */}
        <div
          className="flex items-center justify-between mb-6"
          data-tour="dashboard-header"
        >
          <div>
            <h1 className="text-2xl font-bold">
              {t("greeting", { name: user.name ?? "" })}
            </h1>
            <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
          </div>
          <Button asChild size="sm">
            <Link href={`/${locale}/log`}>{t("logToday")}</Link>
          </Button>
        </div>

        {/* Charts */}
        {logsLoading ? (
          <p className="text-muted-foreground">{t("loading")}</p>
        ) : logs.length === 0 ? (
          <p className="text-muted-foreground">{t("empty")}</p>
        ) : (
          <div
            className="grid gap-4 md:grid-cols-1 lg:grid-cols-3"
            data-tour="charts"
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("charts.moodTrend")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MoodTrendChart logs={logs} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("charts.sleep")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SleepChart logs={logs} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("charts.stressActivity")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StressActivityChart logs={logs} />
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
