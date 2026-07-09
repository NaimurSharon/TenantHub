import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
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
import { colors, fonts, radii, shadows, spacing } from "@/theme";
import { useBankAccounts, useBankAccountDetail } from "@/hooks/queries/useFinancialQuery";
import { formatCurrency } from "@/lib/api/types";

type TabType = "all" | "transaction" | "transfer" | "documents" | "contacts" | "profile";

const ACC_WIDTH = 90;
const BALANCE_WIDTH = 90;

export default function FinancialHubScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // ── States ──────────────────────────────────────────────────
  const [isActive, setIsActive] = useState(true);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [tableSearch, setTableSearch] = useState("");
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // ── Data Fetching ───────────────────────────────────────────
  const {
    data: bankAccounts = [],
    isLoading: isListLoading,
    refetch: refetchList,
  } = useBankAccounts(isActive);

  // Automatically select first bank if none selected
  const activeBankId = selectedBankId || bankAccounts[0]?.id;

  const {
    data: bankDetail = null,
    isLoading: isDetailLoading,
    refetch: refetchDetail,
  } = useBankAccountDetail(activeBankId);

  // ── Sidebar Filtering ──────────────────────────────────────
  const filteredSidebarAccounts = useMemo(() => {
    return bankAccounts.filter((acc) => {
      const query = sidebarSearch.toLowerCase();
      return (
        acc.bank_name.toLowerCase().includes(query) ||
        acc.account_no.toLowerCase().includes(query) ||
        (acc.account_name && acc.account_name.toLowerCase().includes(query))
      );
    });
  }, [bankAccounts, sidebarSearch]);

  // ── Table Data Construction ──────────────────────────────────
  const allMovements = useMemo(() => {
    if (!bankDetail) return [];

    const txs = (bankDetail.transactions || []).map((t: any) => ({
      id: `tx-${t.id}`,
      date: t.date,
      type: "Transaction",
      reference: t.reference || t.number || "-",
      description: t.description || "Expense",
      amount: Number(t.amount),
      status: t.status || "posted",
    }));

    const transfers = (bankDetail.transfers || []).map((tr: any) => {
      const isOut = Number(tr.from_bank_account_id) === Number(activeBankId);
      return {
        id: `tr-${tr.id}`,
        date: tr.date,
        type: isOut ? "Transfer Out" : "Transfer In",
        reference: tr.transfer_no || "-",
        description: tr.remarks || `Transfer ${isOut ? "to" : "from"} ${isOut ? tr.to : tr.from}`,
        amount: isOut ? -Number(tr.amount) : Number(tr.amount),
        status: tr.status || "posted",
      };
    });

    const merged = [...txs, ...transfers];
    merged.sort((a, b) => b.date.localeCompare(a.date));
    return merged;
  }, [bankDetail, activeBankId]);

  // Filtered movements
  const filteredMovements = useMemo(() => {
    let list = allMovements;

    if (activeTab === "transaction") {
      list = list.filter((m) => m.type === "Transaction");
    } else if (activeTab === "transfer") {
      list = list.filter((m) => m.type.startsWith("Transfer"));
    }

    if (tableSearch.trim()) {
      const query = tableSearch.toLowerCase();
      list = list.filter(
        (m) =>
          m.reference.toLowerCase().includes(query) ||
          m.description.toLowerCase().includes(query) ||
          m.type.toLowerCase().includes(query)
      );
    }

    return list;
  }, [allMovements, activeTab, tableSearch]);

  // Paginated movements
  const paginatedMovements = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredMovements.slice(startIdx, startIdx + pageSize);
  }, [filteredMovements, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredMovements.length / pageSize) || 1;

  // ── Handlers ────────────────────────────────────────────────
  const handleBankSelect = (id: number) => {
    Haptics.selectionAsync();
    setSelectedBankId(id);
    setCurrentPage(1);
    if (!isTablet) {
      setShowMobileDetail(true);
    }
  };

  const handleBackToRouter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/hub-selector");
  };

  const renderSidebar = () => (
    <View style={styles.sidebar}>
      {/* Header (matches TenantHub style exactly) */}
      <View style={styles.header}>
        <Pressable onPress={handleBackToRouter} hitSlop={12} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.mutedForeground} />
        </Pressable>
        <Text style={styles.headerTitle}>FINANCIAL HUB</Text>
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          hitSlop={12}
          style={styles.addNewBtn}
        >
          <Plus size={20} color={colors.primary} strokeWidth={2.5} />
        </Pressable>
      </View>

      {/* Segmented Control Toggle (matches StatusToggle exactly) */}
      <View style={styles.toggleWrapper}>
        <View style={styles.toggleTrack}>
          <Pressable
            style={[styles.toggleSegment, isActive && styles.toggleSegmentActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsActive(true);
              setCurrentPage(1);
            }}
          >
            <Text style={[styles.toggleLabel, isActive && styles.toggleLabelActive]}>Active</Text>
          </Pressable>
          <Pressable
            style={[styles.toggleSegment, !isActive && styles.toggleSegmentActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsActive(false);
              setCurrentPage(1);
            }}
          >
            <Text style={[styles.toggleLabel, !isActive && styles.toggleLabelActive]}>Inactive</Text>
          </Pressable>
        </View>
      </View>

      {/* Search Input (matches TenantHub search bar style exactly) */}
      <View style={styles.searchBar}>
        <Search size={18} color={colors.mutedForeground} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search name, account..."
          placeholderTextColor={colors.mutedForeground}
          value={sidebarSearch}
          onChangeText={setSidebarSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {sidebarSearch.length > 0 && (
          <Pressable onPress={() => setSidebarSearch("")} hitSlop={8}>
            <X size={18} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      {/* Bank Cards (recreates TenantRow pattern exactly) */}
      {isListLoading && bankAccounts.length === 0 ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 40 }} />
      ) : filteredSidebarAccounts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTxt}>No bank accounts found</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.sidebarScroll}
          contentContainerStyle={{ paddingBottom: 24, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
        >
          {filteredSidebarAccounts.map((acc) => {
            const isSelected = acc.id === activeBankId;
            return (
              <Pressable
                key={acc.id}
                onPress={() => handleBankSelect(acc.id)}
                style={[styles.bankCard, isSelected && styles.bankCardSelected]}
              >
                {/* Row 1: Bank Name + labels */}
                <View style={styles.cardRow}>
                  <Text style={styles.cardBankName} numberOfLines={1}>
                    {acc.bank_name}
                  </Text>
                  <Text style={[styles.cardLabel, { width: ACC_WIDTH }]}>Account No</Text>
                  <Text style={[styles.cardLabel, { width: BALANCE_WIDTH, textAlign: "right" }]}>
                    Balance
                  </Text>
                </View>

                {/* Row 2: Company/Account Name + values */}
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
          })}
        </ScrollView>
      )}
    </View>
  );

  const renderDetail = () => {
    const currentBank = bankAccounts.find((acc) => acc.id === activeBankId) || bankDetail;
    if (!currentBank) {
      return (
        <View style={styles.detailPlaceholder}>
          <Text style={styles.placeholderTxt}>Select a bank account to view details</Text>
        </View>
      );
    }

    return (
      <View style={styles.detailContainer}>
        {/* Mobile Header (matches ScreenHeader style exactly) */}
        {!isTablet && (
          <View style={styles.mobileHeader}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowMobileDetail(false);
              }}
              style={styles.mobileBackBtn}
            >
              <ArrowLeft size={20} color={colors.mutedForeground} />
            </Pressable>
            <Text style={styles.mobileHeaderTitle}>{currentBank.bank_name}</Text>
            <View style={{ width: 28 }} />
          </View>
        )}

        {/* Bank summary details card (styled like summaryCard from TenantHub detail) */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryBankName}>{currentBank.bank_name}</Text>
              <Text style={styles.summaryAccountName}>
                {currentBank.account_name || currentBank.bank_name}
              </Text>
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>A/C: {currentBank.account_no}</Text>
              </View>
            </View>
            <View style={styles.summaryRight}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text
                style={[
                  styles.balanceValue,
                  currentBank.current_balance < 0 && { color: colors.destructive },
                ]}
              >
                {formatCurrency(currentBank.current_balance)}
              </Text>
            </View>
          </View>
        </View>

        {/* Text-Link Tabs (matches TenantHub detail tabs layout exactly) */}
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
            {(
              [
                { id: "all", label: `All ${allMovements.length}` },
                { id: "transaction", label: "Transaction" },
                { id: "transfer", label: "Transfer" },
                { id: "documents", label: "Documents 0" },
                { id: "contacts", label: "Contacts 0" },
                { id: "profile", label: "Profile" },
              ] as const
            ).map((tab) => {
              const isTabActive = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    if (["all", "transaction", "transfer"].includes(tab.id)) {
                      setActiveTab(tab.id as TabType);
                      setCurrentPage(1);
                    }
                  }}
                  style={[styles.tabLink, isTabActive && styles.tabLinkActive]}
                >
                  <Text style={[styles.tabLinkLabel, isTabActive && styles.tabLinkLabelActive]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Content Block / Table or mobile cards */}
        <View style={styles.movementsSection}>
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
                  onChangeText={setTableSearch}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <View style={styles.actionIconsRow}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    refetchDetail();
                  }}
                  style={styles.actionIconBtn}
                >
                  <RefreshCw size={15} color={colors.foregroundSoft} />
                </Pressable>
              </View>
            </View>
          </View>

          {isDetailLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : paginatedMovements.length === 0 ? (
            <View style={styles.emptyTableContainer}>
              <Text style={styles.emptyTableTxt}>No transactions recorded</Text>
            </View>
          ) : isTablet ? (
            // Grid Table layout for tablet widths
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
                {paginatedMovements.map((move) => {
                  const isDebit = move.amount < 0;
                  return (
                    <View key={move.id} style={styles.tableDataRow}>
                      <Text style={[styles.tdText, { flex: 1.2 }]}>{move.date}</Text>
                      <Text style={[styles.tdText, { flex: 1 }]}>{move.type}</Text>
                      <Text style={[styles.tdText, { flex: 1.5 }]} numberOfLines={1}>
                        {move.reference}
                      </Text>
                      <Text style={[styles.tdText, { flex: 2 }]} numberOfLines={1}>
                        {move.description}
                      </Text>
                      <Text
                        style={[
                          styles.tdText,
                          { flex: 1.2, textAlign: "right", fontFamily: fonts.bold },
                          isDebit ? { color: colors.destructive } : { color: colors.success },
                        ]}
                      >
                        {isDebit ? `- ${formatCurrency(Math.abs(move.amount))}` : formatCurrency(move.amount)}
                      </Text>
                      <View style={{ flex: 1, alignItems: "center" }}>
                        <View style={[styles.statusBadge, move.status === "posted" && { backgroundColor: "#EEF2FF" }]}>
                          <Text style={[styles.statusBadgeText, move.status === "posted" && { color: "#4F46E5" }]}>
                            {move.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          ) : (
            // Cards layout for phone widths (matches dataCard pattern exactly)
            <ScrollView style={styles.tableScroll} showsVerticalScrollIndicator={false}>
              {paginatedMovements.map((move) => {
                const isDebit = move.amount < 0;
                return (
                  <View key={move.id} style={styles.mobileDataCard}>
                    <View style={styles.mobileCardHeader}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.mobileCardTitle} numberOfLines={1}>
                          {move.description}
                        </Text>
                        <Text style={styles.mobileCardSub}>{move.type}</Text>
                      </View>
                      <Text
                        style={[
                          styles.mobileCardValue,
                          isDebit ? { color: colors.destructive } : { color: colors.success },
                        ]}
                      >
                        {isDebit ? `- ${formatCurrency(Math.abs(move.amount))}` : formatCurrency(move.amount)}
                      </Text>
                    </View>

                    <View style={styles.mobileCardFooter}>
                      <Text style={styles.mobileCardDate}>
                        {move.date} · Ref: {move.reference}
                      </Text>
                      <View style={[styles.statusBadge, move.status === "posted" && { backgroundColor: "#EEF2FF" }]}>
                        <Text style={[styles.statusBadgeText, move.status === "posted" && { color: "#4F46E5" }]}>
                          {move.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* Bottom Pagination Controls */}
          <View style={styles.paginationRow}>
            <View style={styles.pageSizeContainer}>
              <Text style={styles.pageLabel}>Page Size:</Text>
              <View style={styles.pageSizeDropdown}>
                <Text style={styles.dropdownValue}>{pageSize}</Text>
              </View>
            </View>

            <View style={styles.pageRightControls}>
              <Text style={styles.recordsText}>
                {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, filteredMovements.length)} of{" "}
                {filteredMovements.length}
              </Text>
              <View style={styles.pageButtons}>
                <Pressable
                  disabled={currentPage === 1}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setCurrentPage(currentPage - 1);
                  }}
                  style={[styles.arrowBtn, currentPage === 1 && { opacity: 0.4 }]}
                >
                  <ChevronLeft size={16} color={colors.foreground} />
                </Pressable>
                <Text style={styles.pageNumberText}>
                  {currentPage}/{totalPages}
                </Text>
                <Pressable
                  disabled={currentPage === totalPages}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setCurrentPage(currentPage + 1);
                  }}
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
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {isTablet ? (
        <View style={styles.splitLayout}>
          {renderSidebar()}
          {renderDetail()}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {showMobileDetail ? renderDetail() : renderSidebar()}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  backBtn: {
    padding: 4,
  },
  addNewBtn: {
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
  toggleWrapper: {
    alignItems: "center",
    paddingVertical: 12,
  },
  toggleTrack: {
    width: 240,
    height: 42,
    backgroundColor: colors.secondary,
    borderRadius: radii.full,
    flexDirection: "row",
    padding: 3,
    position: "relative",
  },
  toggleSegment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.full,
  },
  toggleSegmentActive: {
    backgroundColor: colors.primary,
    ...shadows.soft,
  },
  toggleLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.mutedForeground,
  },
  toggleLabelActive: {
    color: colors.primaryForeground,
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
    marginHorizontal: 16,
    marginBottom: 16,
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
  sidebarScroll: {
    flex: 1,
  },
  bankCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...shadows.soft,
  },
  bankCardSelected: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    backgroundColor: "#EFF6FF",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardBankName: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.foreground,
    marginRight: 8,
  },
  cardAccountName: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.mutedForeground,
    marginRight: 8,
    marginTop: 2,
  },
  cardLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.mutedForeground,
  },
  cardValue: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.foreground,
    marginTop: 2,
  },
  cardBalance: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: "#16A34A",
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyTxt: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.mutedForeground,
  },
  // ── Detail Pane ──────────────────────────────────────────────
  detailContainer: {
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
  mobileHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  mobileBackBtn: {
    padding: 4,
  },
  mobileHeaderTitle: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.foreground,
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: radii.lg,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    ...shadows.card,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLeft: {
    flex: 1,
    marginRight: 12,
  },
  summaryRight: {
    alignItems: "flex-end",
  },
  summaryBankName: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.foreground,
  },
  summaryAccountName: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  metaChip: {
    alignSelf: "flex-start",
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
    marginTop: 8,
  },
  metaChipText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.foregroundSoft,
  },
  balanceLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.mutedForeground,
  },
  balanceValue: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.success,
    marginTop: 2,
  },
  // Text Tabs (matches TenantHub tabs)
  tabsWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    marginTop: 16,
    height: 44,
  },
  tabScrollContent: {
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 4,
    height: 44,
  },
  tabLink: {
    paddingHorizontal: 12,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabLinkActive: {
    borderBottomColor: colors.primary,
  },
  tabLinkLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.foregroundSoft,
  },
  tabLinkLabelActive: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  movementsSection: {
    flex: 1,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  movementsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  movementsTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.foreground,
  },
  tableControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tableSearchInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    height: 32,
    paddingHorizontal: 8,
    gap: 6,
    width: 140,
  },
  tableSearchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.foreground,
    paddingVertical: 0,
  },
  actionIconsRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  actionIconBtn: {
    padding: 7,
    backgroundColor: colors.surface,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: colors.muted,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radii.md,
    marginBottom: 6,
  },
  thText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.mutedForeground,
  },
  tableScroll: {
    flex: 1,
  },
  tableDataRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    backgroundColor: colors.surface,
  },
  tdText: {
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: colors.foregroundSoft,
  },
  statusBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  statusBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.success,
  },
  // Mobile cards
  mobileDataCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 8,
    ...shadows.soft,
  },
  mobileCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  mobileCardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.foreground,
  },
  mobileCardSub: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  mobileCardValue: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.success,
  },
  mobileCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  mobileCardDate: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.mutedForeground,
  },
  emptyTableContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyTableTxt: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.mutedForeground,
  },
  // ── Pagination ────────────────────────────────────────────────
  paginationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    paddingTop: 12,
    marginTop: 10,
    paddingBottom: 8,
  },
  pageSizeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pageLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.mutedForeground,
  },
  pageSizeDropdown: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.surface,
  },
  dropdownValue: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.foreground,
  },
  pageRightControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  recordsText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.mutedForeground,
  },
  pageButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  arrowBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: 4,
    backgroundColor: colors.surface,
  },
  pageNumberText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.foreground,
  },
});
