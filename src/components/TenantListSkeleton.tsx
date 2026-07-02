/**
 * Shimmer skeleton placeholders for the tenant list — displayed while
 * the initial query is in flight so the UI never shows a blank screen.
 */
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { colors } from "@/theme";

function Shimmer({
  width,
  height = 12,
  radius = 6,
  style,
}: {
  width: number | string;
  height?: number;
  radius?: number;
  style?: any;
}) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: radius,
          backgroundColor: colors.muted,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function TenantListSkeleton() {
  return (
    <View style={styles.container}>
      {/* Card skeleton */}
      <View style={styles.card}>
        <Shimmer width="65%" height={16} />
        <Shimmer width="45%" height={12} style={{ marginTop: 6 }} />
        <View style={styles.detailRow}>
          <View>
            <Shimmer width={40} height={10} />
            <Shimmer width={60} height={14} style={{ marginTop: 4 }} />
          </View>
          <View>
            <Shimmer width={50} height={10} />
            <Shimmer width={80} height={14} style={{ marginTop: 4 }} />
          </View>
        </View>
      </View>

      {/* Header skeleton */}
      <View style={styles.headerRow}>
        <Shimmer width={50} height={10} />
        <Shimmer width={30} height={10} />
        <Shimmer width={50} height={10} />
      </View>

      {/* Row skeletons */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Shimmer width="70%" height={14} />
            <Shimmer width="50%" height={10} style={{ marginTop: 4 }} />
          </View>
          <Shimmer width={50} height={14} />
          <Shimmer width={75} height={14} style={{ marginLeft: 12 }} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 8 },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.muted,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    gap: 32,
    marginTop: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
