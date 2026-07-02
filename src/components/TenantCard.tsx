/**
 * Expanded tenant detail card — shown for the selected/highlighted tenant.
 * Blue left accent border, name, company, unit, balance and a "..." menu.
 */
import React, { useState } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  ActionSheetIOS,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { MoreHorizontal } from "lucide-react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { colors, fonts, radii, shadows } from "@/theme";
import type { Tenant } from "@/lib/api/types";
import { formatCurrency } from "@/lib/api/types";
import { useDeleteTenant } from "@/hooks/queries/useTenantQuery";
import Toast from "react-native-toast-message";

interface TenantCardProps {
  tenant: Tenant;
}

export function TenantCard({ tenant }: TenantCardProps) {
  const router = useRouter();
  const deleteMutation = useDeleteTenant();

  const showMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const options = ["View Details", "Delete", "Cancel"];
    const destructiveIndex = 1;
    const cancelIndex = 2;

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, destructiveButtonIndex: destructiveIndex, cancelButtonIndex: cancelIndex },
        (idx) => {
          if (idx === 1) confirmDelete();
        },
      );
    } else {
      Alert.alert(tenant.name, "Choose an action", [
        { text: "View Details", onPress: () => router.push(`/tenant/${tenant.id}`) },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDelete,
        },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete Tenant",
      `Remove "${tenant.name}" permanently?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteMutation.mutate(tenant.id, {
              onSuccess: () =>
                Toast.show({ type: "success", text1: "Tenant deleted" }),
              onError: () =>
                Toast.show({ type: "error", text1: "Failed to delete tenant" }),
            });
          },
        },
      ],
    );
  };

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {tenant.name}
        </Text>
        <Pressable onPress={showMenu} hitSlop={12} style={styles.menuBtn}>
          <MoreHorizontal size={20} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {tenant.companyName ? (
        <Text style={styles.company}>{tenant.companyName}</Text>
      ) : null}

      <View style={styles.details}>
        <View style={styles.detailCol}>
          <Text style={styles.detailLabel}>Unit</Text>
          <Text style={styles.detailValue}>{tenant.unit}</Text>
        </View>
        <View style={styles.detailCol}>
          <Text style={styles.detailLabel}>Balance</Text>
          <Text style={[styles.detailValue, styles.balance]}>
            {formatCurrency(tenant.balance)}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.cardAccent,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    padding: 16,
    ...shadows.card,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.foreground,
    flex: 1,
    marginRight: 8,
  },
  menuBtn: {
    padding: 4,
  },
  company: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  details: {
    flexDirection: "row",
    marginTop: 14,
    gap: 32,
  },
  detailCol: {},
  detailLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.foreground,
  },
  balance: {
    color: colors.success,
  },
});
