/**
 * Animated segmented control — Active / Inactive toggle.
 * Uses Reanimated for a smooth sliding indicator and haptic feedback on tap.
 */
import React, { useEffect } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Text } from "@/components/ui/Text";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, fonts, radii, shadows } from "@/theme";
import { useFilterStore } from "@/store/useFilterStore";
import type { TenantStatus } from "@/lib/api/types";

const SEGMENTS: { key: TenantStatus; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

export function StatusToggle() {
  const status = useFilterStore((s) => s.status);
  const setStatus = useFilterStore((s) => s.setStatus);

  const progress = useSharedValue(status === "active" ? 0 : 1);

  useEffect(() => {
    progress.value = withTiming(status === "active" ? 0 : 1, {
      duration: 220,
      easing: Easing.out(Easing.quad),
    });
  }, [status]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * (PILL_WIDTH / 2) }],
  }));

  const handlePress = (key: TenantStatus) => {
    if (key === status) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStatus(key);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.track}>
        <Animated.View style={[styles.indicator, indicatorStyle]} />
        {SEGMENTS.map((seg) => (
          <Pressable
            key={seg.key}
            onPress={() => handlePress(seg.key)}
            style={styles.segment}
          >
            <Text
              style={[
                styles.label,
                status === seg.key && styles.labelActive,
              ]}
            >
              {seg.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const PILL_WIDTH = 240;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    paddingVertical: 12,
  },
  track: {
    width: PILL_WIDTH,
    height: 42,
    backgroundColor: colors.secondary,
    borderRadius: radii.full,
    flexDirection: "row",
    position: "relative",
    padding: 3,
  },
  indicator: {
    position: "absolute",
    top: 3,
    left: 3,
    width: PILL_WIDTH / 2 - 3,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    ...shadows.soft,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.mutedForeground,
  },
  labelActive: {
    color: colors.primaryForeground,
  },
});
