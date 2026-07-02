import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import Toast from "react-native-toast-message";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient, hydrateQueryCache } from "@/lib/queryClient";
import { colors } from "@/theme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuthStore } from "@/store/useAuthStore";

SplashScreen.preventAutoHideAsync();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "login";
    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [cacheReady, setCacheReady] = useState(false);

  useEffect(() => {
    hydrateQueryCache().finally(() => setCacheReady(true));
  }, []);

  useEffect(() => {
    if (fontsLoaded && cacheReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, cacheReady]);

  if (!fontsLoaded || !cacheReady) return null;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <AuthGuard>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.background },
                  animation: "slide_from_right",
                  animationDuration: 180,
                }}
              >
                <Stack.Screen name="login" options={{ animation: "fade" }} />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="tenant/[id]"
                  options={{ animation: "slide_from_right" }}
                />
                <Stack.Screen
                  name="tenant/new"
                  options={{
                    presentation: "modal",
                    animation: "slide_from_bottom",
                    animationDuration: 200,
                  }}
                />
              </Stack>
            </AuthGuard>
            <StatusBar style="dark" />
            <Toast position="top" topOffset={54} visibilityTime={2500} />
          </SafeAreaProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
