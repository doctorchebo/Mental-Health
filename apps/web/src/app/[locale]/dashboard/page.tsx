"use client";

import ActivityDistributionChart from "@/components/charts/ActivityDistributionChart";
import ChartPresetSelector, {
  TrendInfoIcon,
} from "@/components/charts/ChartPresetSelector";
import CustomChart from "@/components/charts/CustomChart";
import DateRangeFilter from "@/components/charts/DateRangeFilter";
import SymptomFrequencyChart, {
  type SymptomType,
} from "@/components/charts/SymptomFrequencyChart";
import LogTodayButton from "@/components/LogTodayButton";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useLogs } from "@/context/LogsContext";
import { CHART_PRESETS } from "@/lib/chart-presets";
import { filterLogsByDateRange, type DateRange } from "@/lib/chart-utils";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const SYMPTOM_TABS: { value: SymptomType; labelKey: string }[] = [
  { value: "depression", labelKey: "depression" },
  { value: "anxiety", labelKey: "anxiety" },
  { value: "sleep", labelKey: "sleep" },
];

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tCharts = useTranslations("dashboard.charts");
  const locale = useLocale();
  const { user, loading: authLoading } = useAuth();
  const { logs, loading: logsLoading } = useLogs();
  const router = useRouter();

  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [activePresetId, setActivePresetId] = useState(CHART_PRESETS[0].id);

  useEffect(() => {
    if (!authLoading && !user) router.replace(`/${locale}`);
  }, [authLoading, user, locale, router]);

  const filteredLogs = useMemo(
    () => filterLogsByDateRange(logs, dateRange),
    [logs, dateRange],
  );
  const activePreset = useMemo(
    () =>
      CHART_PRESETS.find((p) => p.id === activePresetId) ?? CHART_PRESETS[0],
    [activePresetId],
  );

  if (authLoading || !user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div
          className="flex items-center justify-between"
          data-tour="dashboard-header"
        >
          <div>
            <h1 className="text-2xl font-bold">
              {t("greeting", { name: user.name ?? "" })}
            </h1>
            <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
          </div>
          <LogTodayButton size="sm" data-tour="log-button" />
        </div>

        {logsLoading ? (
          <p className="text-muted-foreground">{t("loading")}</p>
        ) : logs.length === 0 ? (
          <p className="text-muted-foreground">{t("empty")}</p>
        ) : (
          <>
            {/* Controls row */}
            <div
              className="flex flex-wrap items-center gap-3"
              data-tour="charts"
            >
              <DateRangeFilter value={dateRange} onChange={setDateRange} />
              <span className="text-muted-foreground text-sm">
                {filteredLogs.length === 0
                  ? tCharts("noData")
                  : tCharts("entriesCount", { count: filteredLogs.length })}
              </span>
            </div>

            {filteredLogs.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {tCharts("noData")}
              </p>
            ) : (
              <>
                {/* Trend chart */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base flex items-center gap-1.5">
                          {tCharts("trendTitle")}
                          <TrendInfoIcon />
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          {tCharts(`presets.${activePreset.descriptionKey}`)}
                        </CardDescription>
                      </div>
                    </div>
                    <ChartPresetSelector
                      presets={CHART_PRESETS}
                      activeId={activePresetId}
                      onChange={setActivePresetId}
                      logs={filteredLogs}
                    />
                  </CardHeader>
                  <CardContent>
                    <CustomChart logs={filteredLogs} preset={activePreset} />
                  </CardContent>
                </Card>

                {/* Frequency charts */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {tCharts("frequencyTitle")}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {tCharts("frequencyDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="depression">
                      <TabsList className="mb-4 flex-wrap h-auto">
                        {SYMPTOM_TABS.map((tab) => (
                          <TabsTrigger key={tab.value} value={tab.value}>
                            {tCharts(`frequency.${tab.labelKey}`)}
                          </TabsTrigger>
                        ))}
                        <TabsTrigger value="activity">
                          {tCharts("frequency.activity")}
                        </TabsTrigger>
                      </TabsList>

                      {SYMPTOM_TABS.map((tab) => (
                        <TabsContent key={tab.value} value={tab.value}>
                          <SymptomFrequencyChart
                            logs={filteredLogs}
                            symptomType={tab.value}
                          />
                        </TabsContent>
                      ))}

                      <TabsContent value="activity">
                        <ActivityDistributionChart logs={filteredLogs} />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
