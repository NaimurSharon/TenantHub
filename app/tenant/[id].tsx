import React from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { TenantDetailView } from "@/components/TenantDetailView";
import { colors } from "@/theme";

export default function TenantHubScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const customerId = Number(id);
  const navigation = useSafeNavigation();

  return (
    <View style={styles.screen}>
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
