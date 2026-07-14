import React, { useState, useMemo, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  TrendingDown,
  Receipt,
  DollarSign,
  RefreshCw,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { colors } from "@/theme";
import { useDailyReport } from "@/hooks/queries/useFinancialQuery";
import { useAuthStore } from "@/store/useAuthStore";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { TabBar } from "@/components/shared/TabBar";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { CalendarPicker, CalendarPickerRef } from "@/components/shared/CalendarPicker";
import {
  ReportSummaryCard,
  DateSelector,
  BalancesTabContent,
  CollectionsTabContent,
  BreakdownTabContent,
} from "@/components/reports/DailyReportComponents";

type ActiveReportTab = "balances" | "collections" | "breakdown";

export default function DailyReportsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useSafeNavigation();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // Read propertyId from auth store — never hard-code
  const propertyId = useAuthStore((s) => s.propertyId);

  // ── Scroll & Tab Management ──────────────────────────────────
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<ActiveReportTab>("balances");
  const scrollViewRef = useRef<ScrollView>(null);
  const calendarPickerRef = useRef<CalendarPickerRef>(null);

  const handleTabChange = (tab: ActiveReportTab) => {
    setActiveTab(tab);
    // Smooth scroll offset pinning to prevent page jump
    scrollViewRef.current?.scrollTo({ y: 285, animated: true });
  };

  const dateStr = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  const displayDateStr = useMemo(() => {
    return selectedDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [selectedDate]);

  const adjustDate = (days: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  // ── Data Fetching ───────────────────────────────────────────
  const {
    data: report = null,
    isLoading,
    refetch,
    isRefetching,
  } = useDailyReport(dateStr, propertyId);

  const summary = report?.summary || {
    invoice_amount: 0,
    receipt_amount: 0,
    expense_amount: 0,
    net_collection: 0,
    invoice_count: 0,
    receipt_count: 0,
    expense_count: 0,
  };

  const receiptRows = report?.receipt_rows || [];

  // Group receipts by date and category dynamically
  const dailyRows = useMemo(() => {
    if (!receiptRows || receiptRows.length === 0) return [];

    const groups: Record<string, any> = {};

    receiptRows.forEach((r: any) => {
      const date = r.date || dateStr;
      if (!groups[date]) {
        // Format display date (e.g. "2026-07-09" -> "09/07/2026")
        let display_date = date;
        if (date.includes("-")) {
          const parts = date.split("-");
          if (parts.length === 3) {
            display_date = `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
        }
        groups[date] = {
          date,
          display_date,
          cash: 0,
          cheque: 0,
          bank_deposit: 0,
          total_collection: 0,
        };
      }

      const row = groups[date];
      const amount = Number(r.amount ?? 0);
      row.total_collection += amount;

      // Group by payment method
      const method = (r.method || "").toLowerCase();
      if (method.includes("cash")) {
        row.cash += amount;
      } else if (method.includes("cheque")) {
        row.cheque += amount;
      } else {
        row.bank_deposit += amount;
      }

      // Group by category (report_type)
      const category = r.report_type || "Others";
      row[category] = (row[category] || 0) + amount;
    });

    return Object.values(groups);
  }, [receiptRows, dateStr]);

  // Compute dailyTotals from dailyRows
  const dailyTotals = useMemo(() => {
    if (dailyRows.length === 0) return null;

    const totals: any = {
      cash: 0,
      cheque: 0,
      bank_deposit: 0,
      total_collection: 0,
    };

    dailyRows.forEach((row: any) => {
      Object.keys(row).forEach((key) => {
        if (key !== "date" && key !== "display_date") {
          totals[key] = (totals[key] || 0) + row[key];
        }
      });
    });

    return totals;
  }, [dailyRows]);

  const handleBackToRouter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.replace("/hub-selector");
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="DAILY REPORTS"
        onBack={handleBackToRouter}
        rightAction={
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              refetch();
            }}
            hitSlop={12}
            style={styles.refreshBtn}
          >
            <View style={{ width: 20, height: 20, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator animating={isRefetching} size="small" color={colors.primary} style={{ position: "absolute" }} />
              <View style={isRefetching && { opacity: 0 }}>
                <RefreshCw size={20} color={colors.mutedForeground} />
              </View>
            </View>
          </Pressable>
        }
      />

      <ScrollView
        ref={scrollViewRef}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(40, insets.bottom + 16) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Selector Row */}
        <DateSelector
          displayDateStr={displayDateStr}
          onAdjustDate={adjustDate}
          onOpenCalendar={() => calendarPickerRef.current?.open()}
        />

        {/* Reusable Calendar Picker bottom sheet */}
        <CalendarPicker
          ref={calendarPickerRef}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />

        {/* Summary Widgets Grid */}
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
        ) : (
          <View style={isTablet ? styles.summaryGridTablet : styles.summaryGridMobile}>
            {/* <ReportSummaryCard
              title="Invoice Amount"
              amount={summary.invoice_amount}
              countText={`${summary.invoice_count} Invoices`}
              icon={<FileText size={20} color={colors.primary} />}
              accentColor={colors.primary}
            /> */}
            <ReportSummaryCard
              title="Receipt Amount"
              amount={summary.receipt_amount}
              countText={`${summary.receipt_count} Receipts`}
              icon={<Receipt size={20} color="#10B981" />}
              accentColor="#10B981"
            />
            <ReportSummaryCard
              title="Expense Amount"
              amount={summary.expense_amount}
              countText={`${summary.expense_count} Expenses`}
              icon={<TrendingDown size={20} color={colors.destructive} />}
              accentColor={colors.destructive}
            />
            <ReportSummaryCard
              title="Net Collection"
              amount={summary.net_collection}
              countText="Aggregate Cashflow"
              icon={<DollarSign size={20} color="#F59E0B" />}
              accentColor="#F59E0B"
            />
          </View>
        )}

        {/* Tabs Bar */}
        <TabBar
          tabs={[
            { id: "balances", label: "Cash & Bank Balances" },
            { id: "collections", label: "Collections Summary" },
            { id: "breakdown", label: "Daily Category Totals" },
          ]}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Content Block */}
        <View style={styles.cardBlock}>
          {isLoading || isRefetching ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : activeTab === "balances" ? (
            <BalancesTabContent
              balances={balances}
              balanceTotals={balanceTotals}
              isTablet={isTablet}
            />
          ) : activeTab === "collections" ? (
            <CollectionsTabContent
              dailyRows={dailyRows}
              dailyTotals={dailyTotals}
              isTablet={isTablet}
            />
          ) : (
            <BreakdownTabContent dailyTotals={dailyTotals} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  refreshBtn: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingTop: 16,
  },
  summaryGridMobile: {
    gap: 12,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  summaryGridTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  cardBlock: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    minHeight: 200,
  },
  loadingBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
});
