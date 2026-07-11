/**
 * Tenant row card — matches the reference design exactly.
 * Two-row layout inside a bordered rounded card:
 *   Row 1: Name (left, bold)   |   "Unit" label   |   "Balance" label
 *   Row 2: Company (left, gray)|   unit value      |   balance value (green)
 */
import React from "react";
import { Pressable, View, StyleSheet, Alert } from "react-native";
import { Text } from "@/components/ui/Text";
import { colors, fonts } from "@/theme";
import type { Tenant } from "@/lib/api/types";
import { formatCurrency } from "@/lib/api/types";
import * as Haptics from "expo-haptics";
import { useDeleteTenant } from "@/hooks/queries/useTenantQuery";
import Toast from "react-native-toast-message";

interface TenantRowProps {
  tenant: Tenant;
  selected: boolean;
  onPress: () => void;
}

const UNIT_WIDTH = 72;
const BALANCE_WIDTH = 88;

export const TenantRow = React.memo(function TenantRow({ tenant, selected, onPress }: TenantRowProps) {
  const deleteMutation = useDeleteTenant();

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      tenant.name,
      "What would you like to do?",
      [
        { text: "View Details", onPress },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert("Delete Tenant", `Remove "${tenant.name}" permanently?`, [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                  deleteMutation.mutate(tenant.id, {
                    onSuccess: () => Toast.show({ type: "success", text1: "Tenant deleted" }),
                    onError: () => Toast.show({ type: "error", text1: "Failed to delete" }),
                  });
                },
              },
            ]);
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={400}
      style={[
        styles.card,
        selected && styles.cardSelected,
      ]}
    >
      {/* Row 1: Name + labels */}
      <View style={styles.row}>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
          {tenant.name}
        </Text>
        <Text style={[styles.label, { width: UNIT_WIDTH }]}>Unit</Text>
        <Text style={[styles.label, { width: BALANCE_WIDTH, textAlign: "right" }]}>Balance</Text>
      </View>

      {/* Row 2: Company + values */}
      <View style={styles.row}>
        <Text style={styles.company} numberOfLines={1} ellipsizeMode="tail">
          {tenant.companyName ?? tenant.unit}
        </Text>
        <Text style={[styles.unitValue, { width: UNIT_WIDTH }]}>{tenant.unit}</Text>
        <Text style={[
          styles.balanceValue,
          { width: BALANCE_WIDTH, textAlign: "right" },
          tenant.balance > 0 && { color: colors.destructive },
        ]}>
          {formatCurrency(tenant.balance)}
        </Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardSelected: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    backgroundColor: "#EFF6FF",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.foreground,
    marginRight: 8,
  },
  company: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.mutedForeground,
    marginRight: 8,
    marginTop: 2,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.mutedForeground,
  },
  unitValue: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.foreground,
    marginTop: 2,
  },
  balanceValue: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: "#16A34A",
    marginTop: 2,
  },
});
