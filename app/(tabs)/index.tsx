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
import React, { useState, useCallback, useRef } from "react";
import {
  View,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
  RefreshControl,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, SlidersHorizontal, X, Plus, LogOut } from "lucide-react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutRight,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { colors, fonts, radii, shadows, spacing } from "@/theme";
import { StatusToggle } from "@/components/StatusToggle";
import { TenantCard } from "@/components/TenantCard";
import { TenantRow } from "@/components/TenantRow";
import { FilterSheet } from "@/components/FilterSheet";
import { EmptyState } from "@/components/EmptyState";
import { TenantListSkeleton } from "@/components/TenantListSkeleton";
import { NetworkBanner } from "@/components/NetworkBanner";
import { useTenants } from "@/hooks/queries/useTenantQuery";
import { useFilterStore } from "@/store/useFilterStore";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import type { Tenant } from "@/lib/api/types";

export default function TenantsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const searchRef = useRef<TextInput>(null);

  // ── Data ───────────────────────────────────────────────────
  const { data, isLoading, isRefetching, refetch, error, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = useTenants();
  const tenants = data?.data ?? [];

  const search = useFilterStore((s) => s.search);
  const setSearch = useFilterStore((s) => s.setSearch);
  const hasFilters = useFilterStore((s) => s.hasActiveFilters());

  // Default to first tenant when selection is invalid
  const selectedTenant: Tenant | undefined =
    tenants.find((t) => t.id === selectedId) ?? tenants[0];

  // ── Handlers ───────────────────────────────────────────────
  const toggleSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (searchVisible) {
      setSearch("");
      Keyboard.dismiss();
    }
    setSearchVisible(!searchVisible);
    if (!searchVisible) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  };

  const openFilter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilterVisible(true);
  };

  const handleAddNew = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/tenant/new");
  };

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoggingOut(true);
    try {
      await api.auth.logout();
    } catch {}
    useAuthStore.getState().logout();
    router.replace("/login");
  };

  const renderItem = useCallback(
    ({ item }: { item: Tenant }) => (
      <TenantRow
        tenant={item}
        selected={item.id === selectedTenant?.id}
        onPress={() => {
          setSelectedId(item.id);
          router.push(`/tenant/${item.id}`);
        }}
      />
    ),
    [selectedTenant?.id],
  );

  const keyExtractor = useCallback((item: Tenant) => String(item.id), []);

  // ── Render ─────────────────────────────────────────────────
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <Pressable onPress={handleLogout} disabled={loggingOut} hitSlop={12} style={styles.logoutBtn}>
          {loggingOut ? (
            <ActivityIndicator size="small" color={colors.mutedForeground} />
          ) : (
            <LogOut size={20} color={colors.mutedForeground} />
          )}
        </Pressable>
        <Text style={styles.headerTitle}>TENANT HUB</Text>
        <Pressable onPress={handleAddNew} hitSlop={12} style={styles.addNewHeaderBtn}>
          <Plus size={20} color={colors.primary} strokeWidth={2.5} />
        </Pressable>
      </View>

      {/* ── Status Toggle ──────────────────────────────────── */}
      <StatusToggle />

      {/* ── Search & Filter Row ────────────────────────────── */}
      <View style={styles.actionRow}>
        {searchVisible ? (
          <Animated.View
            entering={SlideInRight.duration(200)}
            exiting={SlideOutRight.duration(150)}
            style={styles.searchBar}
          >
            <Search size={18} color={colors.mutedForeground} />
            <TextInput
              ref={searchRef}
              style={styles.searchInput}
              placeholder="Search name, company, unit…"
              placeholderTextColor={colors.mutedForeground}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            <Pressable onPress={toggleSearch} hitSlop={8}>
              <X size={18} color={colors.mutedForeground} />
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(100)}
            style={styles.iconRow}
          >
            <View style={{ flex: 1 }} />
            <Pressable onPress={toggleSearch} hitSlop={12} style={styles.iconBtn}>
              <Search size={21} color={colors.foregroundSoft} />
            </Pressable>
            <Pressable onPress={openFilter} hitSlop={12} style={styles.iconBtn}>
              <SlidersHorizontal
                size={21}
                color={hasFilters ? colors.primary : colors.foregroundSoft}
              />
              {hasFilters && <View style={styles.filterDot} />}
            </Pressable>
          </Animated.View>
        )}
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
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListHeaderComponent={
            selectedTenant ? <TenantCard tenant={selectedTenant} /> : null
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={{ paddingVertical: 16, alignItems: "center" }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : null
          }
        />
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
  headerTitle: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.foreground,
    letterSpacing: 1.5,
    textAlign: "center",
  },
  actionRow: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    height: 40,
  },
  iconBtn: {
    padding: 8,
    marginLeft: 8,
    position: "relative",
  },
  filterDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    height: 42,
    paddingHorizontal: 12,
    gap: 8,
    ...shadows.soft,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.foreground,
    paddingVertical: 0,
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
});
