import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui/Text";
import { FolderOpen } from "lucide-react-native";
import { colors, fonts } from "@/theme";

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export function EmptyState({
  title = "No tenants found",
  message = "Try adjusting your filters or add a new tenant.",
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <FolderOpen size={48} color={colors.mutedForeground} strokeWidth={1.2} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.foreground,
    marginTop: 16,
    textAlign: "center",
  },
  message: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 20,
  },
});
