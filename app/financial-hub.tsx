import React, { useState, useMemo } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { Text } from "@/components/ui/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { colors, fonts } from "@/theme";
import { useBankAccounts, useBankAccountDetail } from "@/hooks/queries/useFinancialQuery";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import {
  BankSidebar,
  BankSummaryCard,
  MovementsTable,
  MovementTabType,
} from "@/components/financial/FinancialComponents";

export default function FinancialHubScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useSafeNavigation();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // ── States ──────────────────────────────────────────────────
  const [isActive, setIsActive] = useState(true);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<MovementTabType>("all");
  const [tableSearch, setTableSearch] = useState("");
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // ── Data Fetching ───────────────────────────────────────────
  const {
    data: bankAccounts = [],
    isLoading: isListLoading,
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
    navigation.replace("/hub-selector");
  };

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
      <View style={[styles.detailContainer, { paddingBottom: Math.max(16, insets.bottom) }]}>
        <BankSummaryCard
          bank={currentBank}
          onMobileBack={() => setShowMobileDetail(false)}
          isTablet={isTablet}
        />
        <MovementsTable
          movements={paginatedMovements}
          filteredTotal={filteredMovements.length}
          activeTab={activeTab}
          allCount={allMovements.length}
          onTabChange={setActiveTab}
          tableSearch={tableSearch}
          onSearchChange={setTableSearch}
          isLoading={isDetailLoading}
          isTablet={isTablet}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onRefresh={refetchDetail}
        />
      </View>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {isTablet ? (
        <View style={styles.splitLayout}>
          <BankSidebar
            accounts={filteredSidebarAccounts}
            activeBankId={activeBankId}
            isLoading={isListLoading}
            isActive={isActive}
            search={sidebarSearch}
            onSearchChange={setSidebarSearch}
            onToggleActive={setIsActive}
            onSelectBank={handleBankSelect}
            onBack={handleBackToRouter}
          />
          {renderDetail()}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {showMobileDetail ? (
            renderDetail()
          ) : (
            <BankSidebar
              accounts={filteredSidebarAccounts}
              activeBankId={activeBankId}
              isLoading={isListLoading}
              isActive={isActive}
              search={sidebarSearch}
              onSearchChange={setSidebarSearch}
              onToggleActive={setIsActive}
              onSelectBank={handleBankSelect}
              onBack={handleBackToRouter}
            />
          )}
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
});
