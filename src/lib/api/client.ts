/**
 * HTTP API client — production-ready fetch wrapper.
 *
 * Base URL: https://backendbms.siscotech.com/api/
 * Includes Authorization + x-selected-property-id headers automatically.
 */

const getBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE;
  const url = envUrl || "https://devbackendbms.siscotech.com/api";
  return url.replace(/\/+$/, "");
};

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
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base = getBaseUrl() + normalizedPath;
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

function extractErrorMessage(data: any, fallback: string): string {
  if (!data) return fallback;

  // 1. Check nested validation errors: data.error.errors or data.errors
  const validationObj = data.error?.errors || data.errors;
  if (validationObj && typeof validationObj === "object") {
    const keys = Object.keys(validationObj);
    if (keys.length > 0) {
      const firstVal = validationObj[keys[0]];
      if (Array.isArray(firstVal) && firstVal.length > 0 && typeof firstVal[0] === "string") {
        return firstVal[0];
      }
      if (typeof firstVal === "string") {
        return firstVal;
      }
    }
  }

  // 2. Check string message or string error
  if (typeof data.message === "string" && data.message.trim() && data.message !== "Validation failed.") {
    return data.message;
  }
  if (typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }
  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  return fallback;
}

export async function apiRequest<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const authHeaders = getAuthHeaders();
  const fullUrl = buildUrl(path, opts.query);
  console.log(`🌐 [API REQUEST] ${opts.method ?? "GET"} ${fullUrl}`);

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
      } catch { }
    }
    const errorMsg = extractErrorMessage(data, res.statusText || `Request failed (${res.status})`);
    throw new ApiError(res.status, errorMsg, data);
  }

  return data as T;
}
