// VITE_ROUTINE_ORIGIN is the complete API base URL including any path prefix.
// e.g. "http://127.0.0.1:8000/api"  or  "/api/routine"
//
// In development, extract only the pathname so Vite's proxy can intercept.
// e.g. "http://127.0.0.1:8000/api" → BASE_URL = "/api"  → fetch("/api/routines")
//      "/api/routine"              → BASE_URL = "/api/routine" (already a path)
// In production, use the value as-is (full URL or absolute path).
const _raw = import.meta.env.VITE_ROUTINE_ORIGIN ?? 'http://127.0.0.1:8000/api';

function resolveBaseUrl(raw: string): string {
  if (!import.meta.env.DEV) return raw.replace(/\/$/, '');
  try {
    return new URL(raw).pathname.replace(/\/$/, '');
  } catch {
    return raw.replace(/\/$/, '');
  }
}

const BASE_URL = resolveBaseUrl(_raw);

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body?.detail ?? JSON.stringify(body);
    } catch {
      // ignore parse errors
    }
    throw new Error(`[${res.status}] ${detail}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
