/**
 * Main Tenant List Screen
 *
 * Layout (matches the design):
 *   • "TENANT HUB" header
 *   • Active / Inactive segmented toggle
 *   • Search + Filter action icons
 *   • Selected tenant detail card (blue left border)
 *   • Column headers (Name · Unit · Balance)
 *   • Scrollable tenant rows
 *   • "Add New" action at bottom
 */
import React, { useState, useCallback, useRef, useMemo } from "react";
import {
  View,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
  RefreshControl,
  Keyboard,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, SlidersHorizontal, X, Plus, ArrowLeft, Users, Wallet } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { colors, fonts, radii, shadows, spacing } from "@/theme";
import { StatusToggle } from "@/components/StatusToggle";
import { TenantCard } from "@/components/TenantCard";
import { TenantRow } from "@/components/TenantRow";
import { FilterSheet } from "@/components/FilterSheet";
import { EmptyState } from "@/components/EmptyState";
import { TenantListSkeleton } from "@/components/TenantListSkeleton";
import { NetworkBanner } from "@/components/NetworkBanner";
import { useTenants, useSystemPreferences, tenantKeys } from "@/hooks/queries/useTenantQuery";
import { useQueryClient } from "@tanstack/react-query";
import { useFilterStore } from "@/store/useFilterStore";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import type { Tenant } from "@/lib/api/types";
import { formatCurrency } from "@/lib/api/types";
import { TenantDetailView } from "@/components/TenantDetailView";

export default function TenantsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useSafeNavigation();
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // Sync active admin preferences (currency, date format)
  useSystemPreferences();

  const propertyCode = useAuthStore((s) => s.propertyCode);

  // ── State ──────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // ── Data ───────────────────────────────────────────────────
  const { data, isLoading, isRefetching, refetch, error, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = useTenants();
  const tenants = data?.data ?? [];

  const handleRefresh = useCallback(() => {
    refetch();
    queryClient.invalidateQueries({ queryKey: tenantKeys.preferences });
  }, [refetch, queryClient]);

  const search = useFilterStore((s) => s.search);
  const setSearch = useFilterStore((s) => s.setSearch);
  const hasFilters = useFilterStore((s) => s.hasActiveFilters());

  // Default to first tenant when selection is invalid
  const selectedTenant: Tenant | undefined =
    tenants.find((t) => t.id === selectedId) ?? tenants[0];

  // ── Handlers ───────────────────────────────────────────────
  const openFilter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilterVisible(true);
  };

  const handleAddNew = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.push("/tenant/new");
  };

  const handleBackToSelector = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.replace("/hub-selector");
  };

  const renderItem = useCallback(
    ({ item }: { item: Tenant }) => (
      <TenantRow
        tenant={item}
        selected={item.id === selectedTenant?.id}
        onPress={() => {
          setSelectedId(item.id);
          if (!isTablet) {
            navigation.push(`/tenant/${item.id}`);
          }
        }}
      />
    ),
    [selectedTenant?.id, navigation, isTablet],
  );

  const keyExtractor = useCallback((item: Tenant) => String(item.id), []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ── Render ─────────────────────────────────────────────────
  const renderSidebar = () => (
    <View style={isTablet ? styles.sidebar : { flex: 1 }}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <Pressable onPress={handleBackToSelector} hitSlop={12} style={styles.logoutBtn}>
          <ArrowLeft size={20} color={colors.mutedForeground} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>TENANT HUB</Text>
          {propertyCode ? (
            <View style={styles.headerPropBadge}>
              <Text style={styles.headerPropBadgeText}>{propertyCode}</Text>
            </View>
          ) : null}
        </View>
        <Pressable onPress={handleAddNew} hitSlop={12} style={styles.addNewHeaderBtn}>
          <Plus size={20} color={colors.primary} strokeWidth={2.5} />
        </Pressable>
      </View>

      {/* ── Status Toggle ──────────────────────────────────── */}
      <StatusToggle />

      {/* ── Search Bar & Filter (Matches Financial Hub) ─────── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={colors.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search name, company, unit…"
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <X size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        <Pressable onPress={openFilter} hitSlop={12} style={styles.filterBtn}>
          <SlidersHorizontal
            size={20}
            color={hasFilters ? colors.primary : colors.foregroundSoft}
          />
          {hasFilters && <View style={styles.filterDot} />}
        </Pressable>
      </View>

      {/* ── Network Error ───────────────────────────────────── */}
      {isError && (
        <NetworkBanner
          message={(error as any)?.message ?? "Network error. Check your connection."}
          onRetry={() => refetch()}
        />
      )}

      {/* ── Content ────────────────────────────────────────── */}
      {isLoading && tenants.length === 0 ? (
        <TenantListSkeleton />
      ) : tenants.length === 0 && !isError ? (
        <EmptyState />
      ) : (
        <FlatList
          data={tenants}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
          ItemSeparatorComponent={() => null}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListHeaderComponent={null}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={{ paddingVertical: 16, alignItems: "center" }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );

  const renderDetail = () => {
    const activeTenantId = selectedId || tenants[0]?.id;
    if (!activeTenantId) {
      return (
        <View style={styles.detailPlaceholder}>
          <Text style={styles.placeholderTxt}>Select a tenant to view details</Text>
        </View>
      );
    }
    return (
      <View style={styles.detailPane}>
        <TenantDetailView customerId={activeTenantId} isTablet={true} />
      </View>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {isTablet ? (
        <View style={styles.splitLayout}>
          {renderSidebar()}
          {renderDetail()}
        </View>
      ) : (
        renderSidebar()
      )}

      {/* ── Filter Sheet ────────────────────────────────────── */}
      <FilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  logoutBtn: {
    padding: 4,
  },
  addNewHeaderBtn: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.foreground,
    letterSpacing: 1.2,
  },
  headerPropBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerPropBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.primary,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 10,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    height: 42,
    paddingHorizontal: 12,
    gap: 8,
    boxShadow: "0px 2px 8px rgba(0,0,0,0.04)",
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.foreground,
    paddingVertical: 0,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    boxShadow: "0px 2px 8px rgba(0,0,0,0.04)",
  },
  filterDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  addNewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 6,
  },
  addNewText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.primary,
  },
  splitLayout: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    flex: 1.2,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.background,
  },
  detailPane: {
    flex: 2,
    backgroundColor: colors.background,
  },
  detailPlaceholder: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  placeholderTxt: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.mutedForeground,
  },
});
