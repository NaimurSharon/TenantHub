/**
 * ScreenHeader — reusable top bar matching the TenantHub header style exactly.
 * Used by Daily Reports, Financial Hub, and any future screen.
 */
import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "@/components/ui/Text";
import { ArrowLeft } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { colors, fonts } from "@/theme";
import { useRouter } from "expo-router";

interface ScreenHeaderProps {
  title: string;
  /** Defaults to navigating back to /hub-selector */
  onBack?: () => void;
  /** Optional right-side action element */
  rightAction?: React.ReactNode;
}

export function ScreenHeader({ title, onBack, rightAction }: ScreenHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onBack) onBack();
    else router.replace("/hub-selector");
  };

  return (
    <View style={styles.header}>
      <Pressable onPress={handleBack} hitSlop={12} style={styles.backBtn}>
        <ArrowLeft size={20} color={colors.mutedForeground} />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.rightSlot}>{rightAction ?? <View style={{ width: 28 }} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  backBtn: {
    padding: 4,
    width: 28,
  },
  headerTitle: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.foreground,
    letterSpacing: 1.5,
    textAlign: "center",
  },
  rightSlot: {
    width: 28,
    alignItems: "flex-end",
  },
});
