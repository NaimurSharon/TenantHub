import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Settings as SettingsIcon } from "lucide-react-native";
import { colors, fonts } from "@/theme";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16 }]}>
      <SettingsIcon size={48} color={colors.mutedForeground} strokeWidth={1.2} />
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.foreground,
    marginTop: 16,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: 4,
  },
});
