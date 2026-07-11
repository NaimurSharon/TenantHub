/**
 * Shared TanStack Query client with AsyncStorage-backed disk persistence.
 *
 * Cache Behaviour:
 * - Queries are considered stale after `staleTime`. A stale query will
 *   background-refetch on the next mount, so users see data instantly
 *   while a fresh copy loads behind the scenes.
 * - `gcTime` controls how long inactive (unmounted) query data is kept in
 *   memory before it is garbage-collected entirely.
 * - Cache is dehydrated to AsyncStorage on every change (debounced 1.5 s),
 *   so cold opens paint immediately with last-known data.
 *
 * IMPORTANT – Cache Isolation:
 * - `clearAndResetQueryCache()` MUST be called on every logout AND every
 *   login. This guarantees that data from one account (or reviewer mock)
 *   never leaks into a different account's session.
 */
import { QueryClient, dehydrate, hydrate } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "kadertower.queryCache.v2";
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 h — older entries discarded on hydration
const SAVE_DEBOUNCE_MS = 1500;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * 60 s stale time: data younger than 1 minute is served from cache
       * without a network round-trip. After 60 s the next mount triggers a
       * background refetch — user still sees the old value instantly.
       */
      staleTime: 60_000,
      /**
       * 15 min GC: unmounted query data lives in memory for 15 minutes.
       * If the user navigates back within that window they get instant paint.
       */
      gcTime: 15 * 60_000,
      /**
       * Only retry network errors (status 0) or server errors (5xx).
       * Never retry 4xx client errors to avoid hammering the API.
       */
      retry: (failureCount, error: any) => {
        if (failureCount >= 3) return false;
        const status = error?.status ?? 0;
        if (status >= 400 && status < 500 && status !== 408 && status !== 429)
          return false;
        return true;
      },
      retryDelay: (i) => Math.min(1000 * 2 ** i, 8000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      // Never retry mutations automatically — side-effects are not idempotent.
      retry: (failureCount, error: any) => {
        if (failureCount >= 1) return false;
        return (error?.status ?? 0) === 0;
      },
    },
  },
});

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let hydrated = false;

function scheduleSave() {
  if (!hydrated) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    saveTimer = null;
    try {
      const snapshot = dehydrate(queryClient);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (err) {
      console.warn("[queryClient] persist failed", err);
    }
  }, SAVE_DEBOUNCE_MS);
}

queryClient.getQueryCache().subscribe(scheduleSave);

/** Called once on app startup to restore last-known data from disk. */
export async function hydrateQueryCache(): Promise<void> {
  if (hydrated) return;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const snapshot = JSON.parse(raw);
      const now = Date.now();
      const fresh = {
        ...snapshot,
        queries: (snapshot.queries ?? []).filter(
          (q: any) => now - (q.state?.dataUpdatedAt ?? 0) < MAX_AGE_MS,
        ),
      };
      hydrate(queryClient, fresh);
    }
  } catch (err) {
    console.warn("[queryClient] hydrate failed", err);
  } finally {
    hydrated = true;
  }
}

/**
 * Wipes ALL cached query data — both in-memory and from AsyncStorage.
 *
 * MUST be called on:
 *   1. Logout  — prevent current user's data leaking into the next session.
 *   2. Login   — prevent a previous session's cached data (e.g. reviewer
 *                mock) from being served to the newly authenticated user.
 *
 * This is especially critical when switching between the reviewer sandbox
 * account and a real production account.
 */
export async function clearAndResetQueryCache(): Promise<void> {
  // Cancel any in-flight pending save
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }

  // 1. Wipe in-memory cache immediately
  queryClient.clear();

  // 2. Wipe persisted AsyncStorage snapshot
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("[queryClient] clear storage failed", err);
  }

  // Allow future saves once a new session begins
  hydrated = true;
}

/** @deprecated Use clearAndResetQueryCache() instead. */
export async function clearQueryCache(): Promise<void> {
  return clearAndResetQueryCache();
}
