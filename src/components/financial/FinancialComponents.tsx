/**
 * Financial Hub components — BankAccountCard, BankSidebar, BankSummaryCard,
 * MovementRow, MovementsTable.
 */
import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Text } from "@/components/ui/Text";
import {
  ArrowLeft,
  Plus,
  Search,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { colors, fonts, radii, shadows } from "@/theme";
import { formatCurrency } from "@/lib/api/types";
import { TabBar, TabItem } from "@/components/shared/TabBar";
import { ScreenHeader } from "@/components/shared/ScreenHeader";

const ACC_WIDTH = 90;
const BALANCE_WIDTH = 90;

// ── BankAccountCard ──────────────────────────────────────────────────────────
interface BankAccountCardProps {
  account: any;
  isSelected: boolean;
  onPress: () => void;
}

export function BankAccountCard({ account: acc, isSelected, onPress }: BankAccountCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.bankCard, isSelected && styles.bankCardSelected]}
    >
      <View style={styles.cardRow}>
        <Text style={styles.cardBankName} numberOfLines={1}>{acc.bank_name}</Text>
        <Text style={[styles.cardLabel, { width: ACC_WIDTH }]}>Account No</Text>
        <Text style={[styles.cardLabel, { width: BALANCE_WIDTH, textAlign: "right" }]}>Balance</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardAccountName} numberOfLines={1}>
          {acc.account_name || "Cash Account"}
        </Text>
        <Text style={[styles.cardValue, { width: ACC_WIDTH }]}>{acc.account_no}</Text>
        <Text style={[styles.cardBalance, { width: BALANCE_WIDTH, textAlign: "right" }]}>
          {formatCurrency(acc.current_balance)}
        </Text>
      </View>
    </Pressable>
  );
}

// ── BankSidebar ──────────────────────────────────────────────────────────────
interface BankSidebarProps {
  accounts: any[];
  activeBankId: number | undefined;
  isLoading: boolean;
  isActive: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  onToggleActive: (v: boolean) => void;
  onSelectBank: (id: number) => void;
  onBack: () => void;
}

export function BankSidebar({
  accounts, activeBankId, isLoading,
  isActive, search, onSearchChange, onToggleActive,
  onSelectBank, onBack,
}: BankSidebarProps) {
  return (
    <View style={styles.sidebar}>
      <ScreenHeader
        title="FINANCIAL HUB"
        onBack={onBack}
        rightAction={
          <Pressable
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            hitSlop={12}
            style={styles.addNewBtn}
          >
            <Plus size={20} color={colors.primary} strokeWidth={2.5} />
          </Pressable>
        }
      />

      {/* Active / Inactive toggle */}
      <View style={styles.toggleWrapper}>
        <View style={styles.toggleTrack}>
          <Pressable
            style={[styles.toggleSegment, isActive && styles.toggleSegmentActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggleActive(true); }}
          >
            <Text style={[styles.toggleLabel, isActive && styles.toggleLabelActive]}>Active</Text>
          </Pressable>
          <Pressable
            style={[styles.toggleSegment, !isActive && styles.toggleSegmentActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggleActive(false); }}
          >
            <Text style={[styles.toggleLabel, !isActive && styles.toggleLabelActive]}>Inactive</Text>
          </Pressable>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Search size={18} color={colors.mutedForeground} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search name, account..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={onSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable onPress={() => onSearchChange("")} hitSlop={8}>
            <X size={18} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      {/* List */}
      {isLoading && accounts.length === 0 ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 40 }} />
      ) : accounts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTxt}>No bank accounts found</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.sidebarScroll}
          contentContainerStyle={{ paddingBottom: 24, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
        >
          {accounts.map((acc) => (
            <BankAccountCard
              key={acc.id}
              account={acc}
              isSelected={acc.id === activeBankId}
              onPress={() => onSelectBank(acc.id)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// ── BankSummaryCard ──────────────────────────────────────────────────────────
interface BankSummaryCardProps {
  bank: any;
  onMobileBack: () => void;
  isTablet: boolean;
}

export function BankSummaryCard({ bank, onMobileBack, isTablet }: BankSummaryCardProps) {
  return (
    <>
      {!isTablet && (
        <View style={styles.mobileHeader}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onMobileBack(); }}
            style={styles.mobileBackBtn}
          >
            <ArrowLeft size={20} color={colors.mutedForeground} />
          </Pressable>
          <Text style={styles.mobileHeaderTitle}>{bank.bank_name}</Text>
          <View style={{ width: 28 }} />
        </View>
      )}

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryBankName}>{bank.bank_name}</Text>
            <Text style={styles.summaryAccountName}>
              {bank.account_name || bank.bank_name}
            </Text>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>A/C: {bank.account_no}</Text>
            </View>
          </View>
          <View style={styles.summaryRight}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={[styles.balanceValue, bank.current_balance < 0 && { color: colors.destructive }]}>
              {formatCurrency(bank.current_balance)}
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

// ── MovementsTable ────────────────────────────────────────────────────────────
export type MovementTabType = "all" | "transaction" | "transfer" | "documents" | "contacts" | "profile";

interface MovementsTableProps {
  movements: any[];
  filteredTotal: number;
  activeTab: MovementTabType;
  allCount: number;
  onTabChange: (tab: MovementTabType) => void;
  tableSearch: string;
  onSearchChange: (v: string) => void;
  isLoading: boolean;
  isTablet: boolean;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

const MOVEMENT_TABS: TabItem<MovementTabType>[] = [
  { id: "all", label: "All" },
  { id: "transaction", label: "Transaction" },
  { id: "transfer", label: "Transfer" },
  { id: "documents", label: "Documents 0" },
  { id: "contacts", label: "Contacts 0" },
  { id: "profile", label: "Profile" },
];

export function MovementsTable({
  movements, filteredTotal, activeTab, allCount,
  onTabChange, tableSearch, onSearchChange,
  isLoading, isTablet, currentPage, totalPages, pageSize, onPageChange, onRefresh,
}: MovementsTableProps) {
  const tabs = MOVEMENT_TABS.map((t) => t.id === "all" ? { ...t, label: `All ${allCount}` } : t);

  return (
    <View style={styles.detailSection}>
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => {
          if (["all", "transaction", "transfer"].includes(id)) onTabChange(id as MovementTabType);
        }}
      />

      <View style={styles.movementsSection}>
        {/* Search + refresh bar */}
        <View style={styles.movementsHeader}>
          <Text style={styles.movementsTitle}>All Bank Movements</Text>
          <View style={styles.tableControls}>
            <View style={styles.tableSearchInputBox}>
              <Search size={16} color={colors.mutedForeground} />
              <TextInput
                style={styles.tableSearchInput}
                placeholder="Search ref, desc..."
                placeholderTextColor={colors.mutedForeground}
                value={tableSearch}
                onChangeText={onSearchChange}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <View style={styles.actionIconsRow}>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onRefresh(); }}
                style={styles.actionIconBtn}
              >
                <RefreshCw size={15} color={colors.foregroundSoft} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Table / cards */}
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : movements.length === 0 ? (
          <View style={styles.emptyTableContainer}>
            <Text style={styles.emptyTableTxt}>No transactions recorded</Text>
          </View>
        ) : isTablet ? (
          <View style={{ flex: 1 }}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.thText, { flex: 1.2 }]}>Date</Text>
              <Text style={[styles.thText, { flex: 1 }]}>Type</Text>
              <Text style={[styles.thText, { flex: 1.5 }]}>Reference</Text>
              <Text style={[styles.thText, { flex: 2 }]}>Description</Text>
              <Text style={[styles.thText, { flex: 1.2, textAlign: "right" }]}>Amount</Text>
              <Text style={[styles.thText, { flex: 1, textAlign: "center" }]}>Status</Text>
            </View>
            <ScrollView style={styles.tableScroll} showsVerticalScrollIndicator={false}>
              {movements.map((move) => {
                const isDebit = move.amount < 0;
                return (
                  <View key={move.id} style={styles.tableDataRow}>
                    <Text style={[styles.tdText, { flex: 1.2 }]}>{move.date}</Text>
                    <Text style={[styles.tdText, { flex: 1 }]}>{move.type}</Text>
                    <Text style={[styles.tdText, { flex: 1.5 }]} numberOfLines={1}>{move.reference}</Text>
                    <Text style={[styles.tdText, { flex: 2 }]} numberOfLines={1}>{move.description}</Text>
                    <Text style={[styles.tdText, { flex: 1.2, textAlign: "right", fontFamily: fonts.bold }, isDebit ? { color: colors.destructive } : { color: colors.success }]}>
                      {isDebit ? `- ${formatCurrency(Math.abs(move.amount))}` : formatCurrency(move.amount)}
                    </Text>
                    <View style={{ flex: 1, alignItems: "center" }}>
                      <View style={[styles.statusBadge, move.status === "posted" && { backgroundColor: "#EEF2FF" }]}>
                        <Text style={[styles.statusBadgeText, move.status === "posted" && { color: "#4F46E5" }]}>{move.status}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          <ScrollView style={styles.tableScroll} showsVerticalScrollIndicator={false}>
            {movements.map((move) => {
              const isDebit = move.amount < 0;
              return (
                <View key={move.id} style={styles.mobileDataCard}>
                  <View style={styles.mobileCardHeader}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.mobileCardTitle} numberOfLines={1}>{move.description}</Text>
                      <Text style={styles.mobileCardSub}>{move.type}</Text>
                    </View>
                    <Text style={[styles.mobileCardValue, isDebit ? { color: colors.destructive } : { color: colors.success }]}>
                      {isDebit ? `- ${formatCurrency(Math.abs(move.amount))}` : formatCurrency(move.amount)}
                    </Text>
                  </View>
                  <View style={styles.mobileCardFooter}>
                    <Text style={styles.mobileCardDate}>{move.date} · Ref: {move.reference}</Text>
                    <View style={[styles.statusBadge, move.status === "posted" && { backgroundColor: "#EEF2FF" }]}>
                      <Text style={[styles.statusBadgeText, move.status === "posted" && { color: "#4F46E5" }]}>{move.status}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Pagination */}
        <View style={styles.paginationRow}>
          <View style={styles.pageSizeContainer}>
            <Text style={styles.pageLabel}>Page Size:</Text>
            <View style={styles.pageSizeDropdown}>
              <Text style={styles.dropdownValue}>{pageSize}</Text>
            </View>
          </View>
          <View style={styles.pageRightControls}>
            <Text style={styles.recordsText}>
              {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredTotal)} of {filteredTotal}
            </Text>
            <View style={styles.pageButtons}>
              <Pressable
                disabled={currentPage === 1}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPageChange(currentPage - 1); }}
                style={[styles.arrowBtn, currentPage === 1 && { opacity: 0.4 }]}
              >
                <ChevronLeft size={16} color={colors.foreground} />
              </Pressable>
              <Text style={styles.pageNumberText}>{currentPage}/{totalPages}</Text>
              <Pressable
                disabled={currentPage === totalPages}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPageChange(currentPage + 1); }}
                style={[styles.arrowBtn, currentPage === totalPages && { opacity: 0.4 }]}
              >
                <ChevronRight size={16} color={colors.foreground} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Sidebar
  sidebar: { flex: 1.2, borderRightWidth: 1, borderRightColor: colors.border, backgroundColor: colors.background },
  addNewBtn: { padding: 4 },
  toggleWrapper: { alignItems: "center", paddingVertical: 12 },
  toggleTrack: { width: 240, height: 42, backgroundColor: colors.secondary, borderRadius: radii.full, flexDirection: "row", padding: 3 },
  toggleSegment: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: radii.full },
  toggleSegmentActive: { backgroundColor: colors.primary, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  toggleLabel: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.mutedForeground },
  toggleLabelActive: { color: colors.primaryForeground },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, height: 42, paddingHorizontal: 12, marginHorizontal: 16, marginBottom: 16, gap: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.foreground, paddingVertical: 0 },
  sidebarScroll: { flex: 1 },
  bankCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, marginHorizontal: 16, marginBottom: 8, paddingHorizontal: 14, paddingVertical: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  bankCardSelected: { borderColor: colors.primary, borderWidth: 1.5, backgroundColor: "#EFF6FF" },
  cardRow: { flexDirection: "row", alignItems: "center" },
  cardBankName: { flex: 1, fontFamily: fonts.bold, fontSize: 14, color: colors.foreground, marginRight: 8 },
  cardAccountName: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: colors.mutedForeground, marginRight: 8, marginTop: 2 },
  cardLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.mutedForeground },
  cardValue: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.foreground, marginTop: 2 },
  cardBalance: { fontFamily: fonts.semiBold, fontSize: 13, color: "#16A34A", marginTop: 2 },
  emptyContainer: { alignItems: "center", marginTop: 40 },
  emptyTxt: { fontFamily: fonts.medium, fontSize: 13, color: colors.mutedForeground },
  // Mobile header inside detail
  mobileHeader: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  mobileBackBtn: { padding: 4 },
  mobileHeaderTitle: { flex: 1, fontFamily: fonts.bold, fontSize: 18, color: colors.foreground, textAlign: "center" },
  // Summary card
  summaryCard: { backgroundColor: colors.surface, marginHorizontal: 16, marginTop: 16, borderRadius: radii.lg, padding: 16, borderLeftWidth: 4, borderLeftColor: colors.primary, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLeft: { flex: 1, marginRight: 12 },
  summaryRight: { alignItems: "flex-end" },
  summaryBankName: { fontFamily: fonts.bold, fontSize: 16, color: colors.foreground },
  summaryAccountName: { fontFamily: fonts.regular, fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
  metaChip: { alignSelf: "flex-start", backgroundColor: colors.secondary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radii.sm, marginTop: 8 },
  metaChipText: { fontFamily: fonts.medium, fontSize: 11, color: colors.foregroundSoft },
  balanceLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.mutedForeground },
  balanceValue: { fontFamily: fonts.bold, fontSize: 18, color: colors.success, marginTop: 2 },
  // Movements
  detailSection: { flex: 2, backgroundColor: colors.background },
  movementsSection: { flex: 1, marginTop: 16, paddingHorizontal: 16 },
  movementsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  movementsTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.foreground },
  tableControls: { flexDirection: "row", alignItems: "center", gap: 8 },
  tableSearchInputBox: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, height: 32, paddingHorizontal: 8, gap: 6, width: 140 },
  tableSearchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: colors.foreground, paddingVertical: 0 },
  actionIconsRow: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, overflow: "hidden" },
  actionIconBtn: { padding: 7, backgroundColor: colors.surface },
  tableHeaderRow: { flexDirection: "row", backgroundColor: colors.muted, paddingVertical: 8, paddingHorizontal: 10, borderRadius: radii.md, marginBottom: 6 },
  thText: { fontFamily: fonts.bold, fontSize: 12, color: colors.mutedForeground },
  tableScroll: { flex: 1 },
  tableDataRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: colors.borderSoft, backgroundColor: colors.surface },
  tdText: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.foregroundSoft },
  statusBadge: { backgroundColor: colors.successLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.sm },
  statusBadgeText: { fontFamily: fonts.medium, fontSize: 11, color: colors.success },
  mobileDataCard: { backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  mobileCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  mobileCardTitle: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.foreground },
  mobileCardSub: { fontFamily: fonts.regular, fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
  mobileCardValue: { fontFamily: fonts.bold, fontSize: 14, color: colors.success },
  mobileCardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  mobileCardDate: { fontFamily: fonts.regular, fontSize: 12, color: colors.mutedForeground },
  emptyTableContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  emptyTableTxt: { fontFamily: fonts.medium, fontSize: 13, color: colors.mutedForeground },
  // Pagination
  paginationRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: colors.borderSoft, paddingTop: 12, marginTop: 10, paddingBottom: 8 },
  pageSizeContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  pageLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.mutedForeground },
  pageSizeDropdown: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: colors.surface },
  dropdownValue: { fontFamily: fonts.bold, fontSize: 12, color: colors.foreground },
  pageRightControls: { flexDirection: "row", alignItems: "center", gap: 12 },
  recordsText: { fontFamily: fonts.medium, fontSize: 12, color: colors.mutedForeground },
  pageButtons: { flexDirection: "row", alignItems: "center", gap: 8 },
  arrowBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, padding: 4, backgroundColor: colors.surface },
  pageNumberText: { fontFamily: fonts.bold, fontSize: 12, color: colors.foreground },
});
