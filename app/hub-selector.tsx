import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Building,
  Landmark,
  FileText,
  ChevronRight,
  LogOut,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { colors, fonts, radii, shadows, spacing } from "@/theme";
import { useAuthStore } from "@/store/useAuthStore";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { useSystemPreferences } from "@/hooks/queries/useTenantQuery";
import { api } from "@/lib/api";

import { usePropertyContext } from "@/hooks/queries/usePropertyQuery";
import { PropertySelectorSheet } from "@/components/shared/PropertySelectorSheet";
import { Building2, ChevronDown } from "lucide-react-native";

export default function HubSelectorScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useSafeNavigation();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [loggingOut, setLoggingOut] = useState(false);
  const [propertySheetVisible, setPropertySheetVisible] = useState(false);

  // Sync active admin preferences (currency, date format) from backend
  useSystemPreferences();
  // Sync assigned properties & current property context from backend
  usePropertyContext();

  const user = useAuthStore((s) => s.user);
  const propertyName = useAuthStore((s) => s.propertyName);
  const propertyCode = useAuthStore((s) => s.propertyCode);

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoggingOut(true);
    try {
      await api.auth.logout();
    } catch { }
    useAuthStore.getState().logout();
    navigation.replace("/login");
  };

  const handleNavigate = (path: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.push(path);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PM SYSTEM</Text>
        <Pressable
          onPress={handleLogout}
          disabled={loggingOut}
          hitSlop={12}
          style={styles.logoutBtn}
        >
          {loggingOut ? (
            <ActivityIndicator size="small" color={colors.mutedForeground} />
          ) : (
            <LogOut size={20} color={colors.mutedForeground} />
          )}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Block */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeLabel}>Welcome Back,</Text>
          <Text style={styles.userName}>{user?.name || "Administrator"}</Text>
          <Text style={styles.welcomeSub}>
            Select a hub to manage PM System properties
          </Text>
        </View>

        {/* Active Property Card (Multi-Property Context Switcher) */}
        <Pressable
          style={({ pressed }) => [
            styles.activePropertyBanner,
            pressed && styles.activePropertyBannerPressed,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setPropertySheetVisible(true);
          }}
        >
          <View style={styles.propertyIconBadge}>
            <Building2 size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={styles.activePropLabel}>CURRENT PROPERTY</Text>
            <Text style={styles.activePropName} numberOfLines={1}>
              {propertyName || "Kader Tower Building Complex"}
            </Text>
          </View>
          <View style={styles.propCodeBadge}>
            <Text style={styles.propCodeText}>{propertyCode || "KT-001"}</Text>
          </View>
          <ChevronDown size={18} color={colors.mutedForeground} style={{ marginLeft: 6 }} />
        </Pressable>

        {/* Hub Cards */}
        <View style={[styles.cardsContainer, isTablet && styles.cardsContainerTablet]}>
          {/* Card 1: Tenant Hub */}
          <Pressable
            style={({ pressed }) => [
              styles.hubCard,
              isTablet && styles.hubCardTablet,
              pressed && styles.hubCardPressed,
              { borderLeftColor: colors.primary },
            ]}
            onPress={() => handleNavigate("/(tabs)")}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
              <Building size={24} color={colors.primary} />
            </View>
            <View style={styles.cardDetails}>
              <Text style={styles.cardTitle}>Tenants Hub</Text>
              <Text style={styles.cardDesc}>
                Manage tenants, active leases, units, and billing documents
              </Text>
            </View>
            <ChevronRight size={20} color={colors.mutedForeground} />
          </Pressable>

          {/* Card 2: Financial Hub */}
          <Pressable
            style={({ pressed }) => [
              styles.hubCard,
              isTablet && styles.hubCardTablet,
              pressed && styles.hubCardPressed,
              { borderLeftColor: "#F59E0B" },
            ]}
            onPress={() => handleNavigate("/financial-hub")}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#FEF3C7" }]}>
              <Landmark size={24} color="#D97706" />
            </View>
            <View style={styles.cardDetails}>
              <Text style={styles.cardTitle}>Financial Hub</Text>
              <Text style={styles.cardDesc}>
                Track bank accounts, daily receipts, payments, and transfers
              </Text>
            </View>
            <ChevronRight size={20} color={colors.mutedForeground} />
          </Pressable>

          {/* Card 3: Daily Reports */}
          <Pressable
            style={({ pressed }) => [
              styles.hubCard,
              isTablet && styles.hubCardTablet,
              pressed && styles.hubCardPressed,
              { borderLeftColor: "#10B981" },
            ]}
            onPress={() => handleNavigate("/daily-reports")}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#D1FAE5" }]}>
              <FileText size={24} color="#059669" />
            </View>
            <View style={styles.cardDetails}>
              <Text style={styles.cardTitle}>Daily Reports</Text>
              <Text style={styles.cardDesc}>
                View aggregate metrics, bank closing balances, and cashbooks
              </Text>
            </View>
            <ChevronRight size={20} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <Text style={styles.footer}>Powered by SiscoTek</Text>
      </ScrollView>

      {/* Property Selector Bottom Sheet */}
      <PropertySelectorSheet
        visible={propertySheetVisible}
        onClose={() => setPropertySheetVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  activePropertyBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.primary + "30",
    ...shadows.soft,
  },
  activePropertyBannerPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  propertyIconBadge: {
    width: 42,
    height: 42,
    borderRadius: radii.lg,
    backgroundColor: colors.primary + "14",
    alignItems: "center",
    justifyContent: "center",
  },
  activePropLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    color: colors.mutedForeground,
    letterSpacing: 0.5,
  },
  activePropName: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.foreground,
    marginTop: 1,
  },
  propCodeBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  propCodeText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.foreground,
    letterSpacing: 1.5,
  },
  logoutBtn: {
    padding: 6,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  welcomeContainer: {
    marginBottom: 28,
  },
  welcomeLabel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.mutedForeground,
  },
  userName: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: colors.foreground,
    marginTop: 2,
  },
  welcomeSub: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.mutedForeground,
    marginTop: 6,
  },
  cardsContainer: {
    gap: 16,
  },
  cardsContainerTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    maxWidth: 900,
    alignSelf: "center",
  },
  hubCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 18,
    borderLeftWidth: 4,
    ...shadows.card,
  },
  hubCardTablet: {
    width: 270,
    minHeight: 140,
  },
  hubCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  cardDetails: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  cardTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.foreground,
    marginBottom: 4,
  },
  cardDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.mutedForeground,
    lineHeight: 18,
  },
  footer: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: "center",
    marginTop: 48,
  },
});
