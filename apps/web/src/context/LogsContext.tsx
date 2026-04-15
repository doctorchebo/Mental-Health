"use client";

import { useAuth } from "@/context/AuthContext";
import {
  createLog as apiCreateLog,
  deleteLog as apiDeleteLog,
  getLogs as apiGetLogs,
  updateLog as apiUpdateLog,
} from "@/lib/api";
import type {
  CreateLogDTO,
  DailyLog,
  UpdateLogDTO,
} from "@mental-health/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface LogsContextValue {
  logs: DailyLog[];
  loading: boolean;
  fetchLogs: (from?: string, to?: string) => Promise<void>;
  addLog: (dto: CreateLogDTO) => Promise<DailyLog>;
  updateLog: (id: string, dto: UpdateLogDTO) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
}

const LogsContext = createContext<LogsContextValue | null>(null);

export function LogsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(false);
  const logsRef = useRef(logs);
  logsRef.current = logs;

  const fetchLogs = useCallback(async (from?: string, to?: string) => {
    setLoading(true);
    try {
      const data = await apiGetLogs(from, to);
      setLogs(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchLogs();
  }, [user, fetchLogs]);

  const addLog = useCallback(async (dto: CreateLogDTO): Promise<DailyLog> => {
    try {
      const created = await apiCreateLog(dto);
      setLogs((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      // If a log already exists for this date, update it instead
      if (err instanceof Error && err.message.includes("409")) {
        const existing = logsRef.current.find((l) => l.logDate === dto.logDate);
        if (existing) {
          const updated = await apiUpdateLog(existing.id, dto);
          setLogs((prev) =>
            prev.map((l) => (l.id === existing.id ? updated : l)),
          );
          return updated;
        }
        // Existing log not in local state — refetch then patch
        const fresh = await apiGetLogs(dto.logDate, dto.logDate);
        if (fresh.length > 0) {
          const updated = await apiUpdateLog(fresh[0].id, dto);
          setLogs((prev) => {
            const exists = prev.some((l) => l.id === fresh[0].id);
            return exists
              ? prev.map((l) => (l.id === fresh[0].id ? updated : l))
              : [updated, ...prev];
          });
          return updated;
        }
      }
      throw err;
    }
  }, []);

  const updateLog = useCallback(async (id: string, dto: UpdateLogDTO) => {
    const updated = await apiUpdateLog(id, dto);
    setLogs((prev) => prev.map((l) => (l.id === id ? updated : l)));
  }, []);

  const removeLog = useCallback(async (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
    await apiDeleteLog(id);
  }, []);

  const value = useMemo(
    () => ({ logs, loading, fetchLogs, addLog, updateLog, removeLog }),
    [logs, loading, fetchLogs, addLog, updateLog, removeLog],
  );

  return <LogsContext.Provider value={value}>{children}</LogsContext.Provider>;
}

export function useLogs(): LogsContextValue {
  const ctx = useContext(LogsContext);
  if (!ctx) throw new Error("useLogs must be used inside LogsProvider");
  return ctx;
}
