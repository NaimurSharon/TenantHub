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

import { useAuthStore } from "@/store/useAuthStore";
import { radii } from "@/theme";

interface ScreenHeaderProps {
  title: string;
  /** Defaults to navigating back to /hub-selector */
  onBack?: () => void;
  /** Optional right-side action element */
  rightAction?: React.ReactNode;
}

export function ScreenHeader({ title, onBack, rightAction }: ScreenHeaderProps) {
  const router = useRouter();
  const propertyCode = useAuthStore((s) => s.propertyCode);

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
      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
        {propertyCode ? (
          <View style={styles.propCodeBadge}>
            <Text style={styles.propCodeText}>{propertyCode}</Text>
          </View>
        ) : null}
      </View>
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
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.foreground,
    letterSpacing: 1.2,
  },
  propCodeBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  propCodeText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.primary,
  },
  rightSlot: {
    width: 28,
    alignItems: "flex-end",
  },
});
