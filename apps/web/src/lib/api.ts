const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

type FetchOptions = RequestInit & { skipRefresh?: boolean };

async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { skipRefresh = false, ...init } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init.headers },
  });

  if (res.status === 401 && !skipRefresh) {
    const refreshed = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (refreshed.ok) {
      return apiFetch<T>(path, { ...options, skipRefresh: true });
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || res.statusText);
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

// ─── Auth ────────────────────────────────────────────────────────────────────

import type { User } from "@mental-health/types";

export function getGoogleLoginUrl(): string {
  return `${API_URL}/api/auth/google`;
}

export function getMe(): Promise<User> {
  return apiFetch<User>("/api/auth/me");
}

export async function logout(): Promise<void> {
  await apiFetch("/api/auth/logout", { method: "POST" });
}

export async function markOnboardingSeen(): Promise<void> {
  await apiFetch("/api/auth/onboarding", { method: "POST" });
}

// ─── Logs ────────────────────────────────────────────────────────────────────

import type {
  CreateLogDTO,
  DailyLog,
  UpdateLogDTO,
} from "@mental-health/types";

export function getLogs(from?: string, to?: string): Promise<DailyLog[]> {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  return apiFetch<DailyLog[]>(`/api/logs${qs ? `?${qs}` : ""}`);
}

export function createLog(dto: CreateLogDTO): Promise<DailyLog> {
  return apiFetch<DailyLog>("/api/logs", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateLog(id: string, dto: UpdateLogDTO): Promise<DailyLog> {
  return apiFetch<DailyLog>(`/api/logs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export async function deleteLog(id: string): Promise<void> {
  await apiFetch(`/api/logs/${id}`, { method: "DELETE" });
}
