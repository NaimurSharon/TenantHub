/**
 * Filter bottom sheet — slides up with filter controls for unit,
 * balance range, sort field and sort order.
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react-native";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, fonts, radii, shadows, spacing } from "@/theme";
import {
  useFilterStore,
  type SortField,
  type SortOrder,
} from "@/store/useFilterStore";

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
}

const SORT_OPTIONS: { key: SortField; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "balance", label: "Balance" },
  { key: "unit", label: "Unit" },
  { key: "createdAt", label: "Date Added" },
];

const ORDER_OPTIONS: { key: SortOrder; label: string }[] = [
  { key: "asc", label: "Ascending" },
  { key: "desc", label: "Descending" },
];

export function FilterSheet({ visible, onClose }: FilterSheetProps) {
  const store = useFilterStore();

  // Local state so changes aren't applied until "Apply"
  const [unit, setUnit] = useState(store.unit);
  const [balMin, setBalMin] = useState(
    store.balanceMin != null ? String(store.balanceMin) : "",
  );
  const [balMax, setBalMax] = useState(
    store.balanceMax != null ? String(store.balanceMax) : "",
  );
  const [sortBy, setSortBy] = useState<SortField>(store.sortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(store.sortOrder);

  // Sync local state when sheet opens
  useEffect(() => {
    if (visible) {
      setUnit(store.unit);
      setBalMin(store.balanceMin != null ? String(store.balanceMin) : "");
      setBalMax(store.balanceMax != null ? String(store.balanceMax) : "");
      setSortBy(store.sortBy);
      setSortOrder(store.sortOrder);
    }
  }, [visible]);

  const handleApply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    store.setUnit(unit);
    store.setBalanceRange(
      balMin ? parseFloat(balMin) : null,
      balMax ? parseFloat(balMax) : null,
    );
    store.setSort(sortBy, sortOrder);
    onClose();
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    store.reset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View
        entering={SlideInDown.duration(250)}
        exiting={SlideOutDown.duration(200)}
        style={styles.sheet}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Filters</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <X size={22} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Unit */}
          <Input
            label="Unit"
            placeholder="e.g. 4TH-10"
            value={unit}
            onChangeText={setUnit}
            autoCapitalize="characters"
          />

          {/* Balance Range */}
          <Text style={styles.sectionLabel}>Balance Range</Text>
          <View style={styles.rangeRow}>
            <View style={{ flex: 1 }}>
              <Input
                placeholder="Min"
                value={balMin}
                onChangeText={setBalMin}
                keyboardType="decimal-pad"
              />
            </View>
            <Text style={styles.rangeSep}>—</Text>
            <View style={{ flex: 1 }}>
              <Input
                placeholder="Max"
                value={balMax}
                onChangeText={setBalMax}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Sort By */}
          <Text style={styles.sectionLabel}>Sort By</Text>
          <View style={styles.chipRow}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setSortBy(opt.key)}
                style={[
                  styles.chip,
                  sortBy === opt.key && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    sortBy === opt.key && styles.chipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sort Order */}
          <Text style={styles.sectionLabel}>Order</Text>
          <View style={styles.chipRow}>
            {ORDER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setSortOrder(opt.key)}
                style={[
                  styles.chip,
                  sortOrder === opt.key && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    sortOrder === opt.key && styles.chipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={handleReset}
            style={styles.resetBtn}
            activeOpacity={0.75}
          >
            <Text style={styles.resetBtnText}>Reset</Text>
          </TouchableOpacity>
          <Button
            variant="default"
            size="default"
            onPress={handleApply}
            style={{ flex: 1 }}
          >
            Apply
          </Button>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    maxHeight: "75%",
    ...shadows.medium,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.foreground,
  },
  sectionLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.foregroundSoft,
    marginBottom: 10,
    marginTop: 4,
  },
  rangeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  rangeSep: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.mutedForeground,
    marginTop: 14,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.secondaryForeground,
  },
  chipTextActive: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
  },
  actions: {
    flexDirection: "row",
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: 12,
  },
  resetBtn: {
    flex: 1,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.destructiveLight,
    alignItems: "center",
    justifyContent: "center",
  },
  resetBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.destructive,
  },
});
