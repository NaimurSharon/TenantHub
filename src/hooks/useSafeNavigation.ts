import { useRouter } from "expo-router";
import { useCallback, useRef } from "react";

/**
 * A custom hook wrapping the expo-router to prevent double-tap
 * navigation transitions pushing pages multiple times on the history stack.
 */
export function useSafeNavigation() {
  const router = useRouter();
  const lastNavTime = useRef(0);

  const safePush = useCallback((path: string) => {
    const now = Date.now();
    if (now - lastNavTime.current < 800) return;
    lastNavTime.current = now;
    router.push(path as any);
  }, [router]);

  const safeReplace = useCallback((path: string) => {
    const now = Date.now();
    if (now - lastNavTime.current < 800) return;
    lastNavTime.current = now;
    router.replace(path as any);
  }, [router]);

  const safeBack = useCallback(() => {
    const now = Date.now();
    if (now - lastNavTime.current < 800) return;
    lastNavTime.current = now;
    router.back();
  }, [router]);

  return {
    push: safePush,
    replace: safeReplace,
    back: safeBack,
    originalRouter: router,
  };
}
