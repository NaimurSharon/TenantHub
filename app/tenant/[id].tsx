import React from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { TenantDetailView } from "@/components/TenantDetailView";
import { colors } from "@/theme";

export default function TenantHubScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const customerId = Number(id);
  const navigation = useSafeNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <TenantDetailView
        customerId={customerId}
        isTablet={false}
        onBack={navigation.back}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
