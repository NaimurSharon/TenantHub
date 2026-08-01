import React from "react";
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Building2, Check, X } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { Text } from "@/components/ui/Text";
import { colors, fonts, radii, shadows } from "@/theme";
import { useSheetAnimation } from "@/hooks/useSheetAnimation";
import { useAuthStore } from "@/store/useAuthStore";
import { useSwitchProperty } from "@/hooks/queries/usePropertyQuery";
import type { PropertyItem } from "@/lib/api/types";

interface PropertySelectorSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function PropertySelectorSheet({ visible, onClose }: PropertySelectorSheetProps) {
  const insets = useSafeAreaInsets();
  const { modalVisible, backdrop, card, close } = useSheetAnimation(visible, onClose);

  const activePropertyId = useAuthStore((s) => s.propertyId);
  const assignedProperties = useAuthStore((s) => s.assignedProperties);

  const switchMutation = useSwitchProperty();

  const handleSelectProperty = (prop: PropertyItem) => {
    if (prop.id === activePropertyId) {
      close();
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    switchMutation.mutate(prop, {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Property Switched",
          text2: `Active property set to ${prop.display_name || prop.name}`,
        });
        close();
      },
      onError: (err: any) => {
        Toast.show({
          type: "error",
          text1: "Failed to switch property",
          text2: err?.message || "Please try again.",
        });
      },
    });
  };

  if (!modalVisible) return null;

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={() => close()}
      statusBarTranslucent
    >
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            opacity: backdrop,
          },
        ]}
      />

      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={() => close()}
      />

      <View style={styles.sheetWrapper} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.sheetCard,
            {
              transform: [{ translateY: card }],
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sheetTitle}>Select Property</Text>
              <Text style={styles.sheetSub}>
                Choose a property to switch dashboard context
              </Text>
            </View>
            <Pressable onPress={() => close()} hitSlop={12} style={styles.closeBtn}>
              <X size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>

          {/* Property List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {assignedProperties.map((prop) => {
              const isSelected = prop.id === activePropertyId;
              const isPending = switchMutation.isPending && switchMutation.variables?.id === prop.id;

              return (
                <Pressable
                  key={prop.id}
                  style={({ pressed }) => [
                    styles.propertyCard,
                    isSelected && styles.propertyCardSelected,
                    pressed && styles.propertyCardPressed,
                  ]}
                  onPress={() => handleSelectProperty(prop)}
                  disabled={switchMutation.isPending}
                >
                  <View style={[styles.iconBadge, isSelected && styles.iconBadgeSelected]}>
                    <Building2
                      size={20}
                      color={isSelected ? colors.primary : colors.mutedForeground}
                    />
                  </View>

                  <View style={styles.propDetails}>
                    <Text style={[styles.propName, isSelected && styles.propNameSelected]} numberOfLines={1}>
                      {prop.display_name || prop.name}
                    </Text>
                    <View style={styles.propMetaRow}>
                      <View style={styles.codeBadge}>
                        <Text style={styles.codeBadgeText}>{prop.property_code || `P-${prop.id}`}</Text>
                      </View>
                      <Text style={styles.propType}>{prop.property_type || "Commercial"}</Text>
                    </View>
                  </View>

                  {isPending ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : isSelected ? (
                    <View style={styles.checkBadge}>
                      <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheetWrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetCard: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii["2xl"],
    borderTopRightRadius: radii["2xl"],
    paddingHorizontal: 20,
    paddingTop: 20,
    ...shadows.card,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  sheetTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.foreground,
  },
  sheetSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  listContent: {
    gap: 10,
    paddingBottom: 16,
  },
  propertyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radii.xl,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
  },
  propertyCardSelected: {
    backgroundColor: colors.primary + "0A",
    borderColor: colors.primary,
  },
  propertyCardPressed: {
    opacity: 0.9,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBadgeSelected: {
    backgroundColor: colors.primary + "1A",
  },
  propDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  propName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.foreground,
  },
  propNameSelected: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  propMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  codeBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.foregroundSoft,
  },
  propType: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.mutedForeground,
    textTransform: "capitalize",
  },
  checkBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
