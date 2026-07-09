import React from "react";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/hub-selector" />;
  }
  return <Redirect href="/login" />;
}
