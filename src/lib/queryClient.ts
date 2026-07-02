/**
 * Shared TanStack Query client with AsyncStorage-backed disk persistence.
 *
 * Caches are dehydrated on every cache change (debounced 1.5 s) and hydrated
 * once on app startup. This makes tab switches and cold opens paint instantly:
 * the last-known list shows immediately while background refetches confirm
 * freshness.
 */
import { QueryClient, dehydrate, hydrate } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "tenanthub.queryCache.v1";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const SAVE_DEBOUNCE_MS = 1500;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 15 * 60_000,
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

export async function clearQueryCache(): Promise<void> {
  hydrated = false;
  await AsyncStorage.removeItem(STORAGE_KEY);
}
