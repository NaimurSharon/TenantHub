/**
 * HTTP API client — production-ready fetch wrapper.
 *
 * Base URL: https://devbackendbms.siscotech.com/api
 * Includes Authorization + x-selected-property-id headers automatically.
 */

const getBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE;
  if (envUrl) return envUrl;
  return "https://devbackendbms.siscotech.com/api";
};

const API_BASE = getBaseUrl();

const REQUEST_TIMEOUT_MS = 12_000;

export class ApiError extends Error {
  status: number;
  body?: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface RequestOptions {
  method?: Method;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const base = API_BASE.replace(/\/$/, "") + path;
  if (!query) return base;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null) params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/**
 * Returns the current auth token and property ID.
 */
function getAuthHeaders(): Record<string, string> {
  try {
    const { useAuthStore } = require("@/store/useAuthStore");
    const state = useAuthStore.getState();
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (state.token) headers["Authorization"] = `Bearer ${state.token}`;
    if (state.propertyId) headers["x-selected-property-id"] = String(state.propertyId);
    return headers;
  } catch {
    return { Accept: "application/json" };
  }
}

export async function apiRequest<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const authHeaders = getAuthHeaders();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const signal = opts.signal ?? controller.signal;

  const hasBody = opts.body !== undefined && opts.body !== null;

  let res: Response;
  try {
    res = await fetch(buildUrl(path, opts.query), {
      method: opts.method ?? "GET",
      headers: {
        ...authHeaders,
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...(opts.headers ?? {}),
      },
      body: hasBody ? JSON.stringify(opts.body) : undefined,
      signal,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new ApiError(0, "Request timed out. Check your network connection.");
    }
    throw new ApiError(0, err.message ?? "Network request failed");
  }

  clearTimeout(timeoutId);

  let data: any = null;
  const text = await res.text().catch(() => "");
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (!res.ok)
        throw new ApiError(res.status, `Server error (${res.status})`, text);
    }
  }

  if (!res.ok) {
    // Auto-logout on 401
    if (res.status === 401) {
      try {
        const { useAuthStore } = require("@/store/useAuthStore");
        useAuthStore.getState().logout();
      } catch {}
    }
    throw new ApiError(
      res.status,
      data?.error ?? data?.message ?? res.statusText,
      data,
    );
  }

  return data as T;
}
