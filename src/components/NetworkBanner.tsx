/**
 * Network error banner — shows at top of screen when queries fail.
 * Includes a retry button.
 */
import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Text } from "@/components/ui/Text";
import { WifiOff, RefreshCw } from "lucide-react-native";
import { colors, fonts, radii } from "@/theme";

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function NetworkBanner({ message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <WifiOff size={16} color={colors.destructive} />
      <Text style={styles.text} numberOfLines={2}>
        {message ?? "Network error. Check your connection."}
      </Text>
      {onRetry && (
        <Pressable onPress={onRetry} hitSlop={8} style={styles.retryBtn}>
          <RefreshCw size={14} color="#FFF" />
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.destructiveLight,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.md,
    gap: 8,
  },
  text: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.destructive,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.destructive,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.sm,
  },
  retryText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: "#FFF",
  },
});
