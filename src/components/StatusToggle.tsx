/**
 * Animated segmented control — Active / Inactive toggle.
 * Uses RN Animated for a smooth sliding indicator and haptic feedback on tap.
 */
import React, { useEffect, useRef } from "react";
import { View, Pressable, StyleSheet, Animated, Easing } from "react-native";
import { Text } from "@/components/ui/Text";
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

  const progress = useRef(new Animated.Value(status === "active" ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: status === "active" ? 0 : 1,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [status]);

  const handlePress = (key: TenantStatus) => {
    if (key === status) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStatus(key);
  };

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, PILL_WIDTH / 2],
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.track}>
        <Animated.View style={[styles.indicator, { transform: [{ translateX }] }]} />
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
