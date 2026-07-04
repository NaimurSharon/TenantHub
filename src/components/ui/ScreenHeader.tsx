/**
 * ScreenHeader — reusable page header with optional back button and right slot.
 * Used by all full-screen routes to ensure a consistent header pattern.
 */
import React from "react";
import { View, Pressable, StyleSheet, type ViewStyle } from "react-native";
import { Text } from "@/components/ui/Text";
import { ChevronLeft } from "lucide-react-native";
import { colors, fonts, shadows } from "@/theme";

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  /** Rendered in the right slot (same width as back button for balance) */
  rightElement?: React.ReactNode;
  style?: ViewStyle;
}

export function ScreenHeader({ title, onBack, rightElement, style }: ScreenHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
            <ChevronLeft size={24} color={colors.foreground} />
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.side}>
        {rightElement ?? null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    ...shadows.soft,
  },
  side: {
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtn: {
    padding: 4,
  },
  title: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.foreground,
    textAlign: "center",
  },
});
