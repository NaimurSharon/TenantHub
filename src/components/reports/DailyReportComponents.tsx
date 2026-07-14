import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { colors, fonts, radii, shadows } from "@/theme";
import { formatCurrency } from "@/lib/api/types";

// ── 1. ReportSummaryCard ──────────────────────────────────────────────────────
interface ReportSummaryCardProps {
  title: string;
  amount: number;
  countText: string;
  icon: React.ReactNode;
  accentColor: string;
}

export function ReportSummaryCard({
  title,
  amount,
  countText,
  icon,
  accentColor,
}: ReportSummaryCardProps) {
  return (
    <View style={[styles.summaryCard, { borderLeftColor: accentColor }]}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>{title}</Text>
        {icon}
      </View>
      <Text style={styles.cardAmount}>{formatCurrency(amount)}</Text>
      <Text style={styles.cardCount}>{countText}</Text>
    </View>
  );
}

// ── 2. DateSelector ───────────────────────────────────────────────────────────
interface DateSelectorProps {
  displayDateStr: string;
  onAdjustDate: (days: number) => void;
  onOpenCalendar: () => void;
}

export function DateSelector({
  displayDateStr,
  onAdjustDate,
  onOpenCalendar,
}: DateSelectorProps) {
  return (
    <View style={styles.dateSelectorContainer}>
      <Pressable
        onPress={() => onAdjustDate(-1)}
        style={({ pressed }) => [styles.dateArrowBtn, pressed && { opacity: 0.7 }]}
      >
        <ChevronLeft size={20} color={colors.foreground} />
      </Pressable>

      <Pressable
        onPress={onOpenCalendar}
        style={({ pressed }) => [styles.dateDisplayBox, pressed && { opacity: 0.8 }]}
      >
        <Calendar size={18} color={colors.primary} />
        <Text style={styles.dateDisplayText}>{displayDateStr}</Text>
      </Pressable>

      <Pressable
        onPress={() => onAdjustDate(1)}
        style={({ pressed }) => [styles.dateArrowBtn, pressed && { opacity: 0.7 }]}
      >
        <ChevronRight size={20} color={colors.foreground} />
      </Pressable>
    </View>
  );
}

// ── 3. BalancesTabContent ─────────────────────────────────────────────────────
interface BalancesTabContentProps {
  balances: any[];
  balanceTotals: { opening: number; closing: number };
  isTablet: boolean;
}

export function BalancesTabContent({
  balances,
  balanceTotals,
  isTablet,
}: BalancesTabContentProps) {
  return (
    <View>
      <Text style={styles.blockTitle}>Closing & Opening Balances</Text>

      {balances.length === 0 ? (
        <View style={styles.emptyTable}>
          <Text style={styles.emptyTableTxt}>No bank entries recorded</Text>
        </View>
      ) : isTablet ? (
        // Tablet Grid Table
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.thTxt, { flex: 0.6 }]}>SL</Text>
            <Text style={[styles.thTxt, { flex: 2.2 }]}>Account Name</Text>
            <Text style={[styles.thTxt, { flex: 1.2, textAlign: "right" }]}>Opening</Text>
            <Text style={[styles.thTxt, { flex: 1.2, textAlign: "right" }]}>Closing</Text>
            <Text style={[styles.thTxt, { flex: 1.2, textAlign: "right" }]}>Change</Text>
          </View>

          {balances.map((row: any) => {
            const change = Number(row.closing) - Number(row.opening);
            const isPositive = change > 0;
            const isNegative = change < 0;
            return (
              <View key={row.sl} style={styles.tableRow}>
                <Text style={[styles.tdTxt, { flex: 0.6 }]}>{row.sl}</Text>
                <Text style={[styles.tdTxt, { flex: 2.2, fontFamily: fonts.bold }]} numberOfLines={1}>
                  {row.type}
                </Text>
                <Text style={[styles.tdTxt, { flex: 1.2, textAlign: "right" }]}>
                  {formatCurrency(row.opening)}
                </Text>
                <Text style={[styles.tdTxt, { flex: 1.2, textAlign: "right" }]}>
                  {formatCurrency(row.closing)}
                </Text>
                <Text
                  style={[
                    styles.tdTxt,
                    { flex: 1.2, textAlign: "right", fontFamily: fonts.bold },
                    isPositive && { color: colors.success },
                    isNegative && { color: colors.destructive },
                  ]}
                >
                  {change === 0
                    ? "$ 0"
                    : isPositive
                      ? `+ ${formatCurrency(change)}`
                      : formatCurrency(change)}
                </Text>
              </View>
            );
          })}

          <View style={styles.tableTotalsRow}>
            <Text style={[styles.totalsLabelTxt, { flex: 2.8 }]}>Total Balance</Text>
            <Text style={[
              styles.totalsValTxt,
              { flex: 1.2, textAlign: "right" },
              balanceTotals.opening < 0 && { color: colors.destructive }
            ]}>
              {formatCurrency(balanceTotals.opening)}
            </Text>
            <Text style={[
              styles.totalsValTxt,
              { flex: 1.2, textAlign: "right" },
              balanceTotals.closing < 0 && { color: colors.destructive }
            ]}>
              {formatCurrency(balanceTotals.closing)}
            </Text>
            <Text style={[
              styles.totalsValTxt,
              { flex: 1.2, textAlign: "right" },
              (balanceTotals.closing - balanceTotals.opening) < 0 && { color: colors.destructive }
            ]}>
              {formatCurrency(balanceTotals.closing - balanceTotals.opening)}
            </Text>
          </View>
        </View>
      ) : (
        // Mobile Cards Layout
        <View>
          {balances.map((row: any) => {
            const change = Number(row.closing) - Number(row.opening);
            const isPositive = change > 0;
            const isNegative = change < 0;
            return (
              <View key={row.sl} style={styles.mobileDataCard}>
                <View style={styles.mobileCardHeader}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.mobileCardTitle} numberOfLines={1}>
                      {row.type}
                    </Text>
                    <Text style={styles.mobileCardSub}>Opening: {formatCurrency(row.opening)}</Text>
                  </View>
                  <Text style={[styles.mobileCardValue, row.closing < 0 && { color: colors.destructive }]}>
                    {formatCurrency(row.closing)}
                  </Text>
                </View>
                <View style={styles.mobileCardFooter}>
                  <Text style={styles.mobileCardDate}>SL: {row.sl}</Text>
                  <View
                    style={[
                      styles.changeBadge,
                      change === 0 && { backgroundColor: colors.secondary },
                      isPositive && { backgroundColor: colors.successLight },
                      isNegative && { backgroundColor: colors.destructiveLight },
                    ]}
                  >
                    <Text
                      style={[
                        styles.changeBadgeText,
                        change === 0 && { color: colors.mutedForeground },
                        isPositive && { color: colors.success },
                        isNegative && { color: colors.destructive },
                      ]}
                    >
                      {change === 0
                        ? "No Change"
                        : isPositive
                          ? `+ ${formatCurrency(change)}`
                          : formatCurrency(change)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}

          <View style={styles.mobileTotalCard}>
            <Text style={styles.mobileTotalTitle}>Total Balance Scope</Text>
            <View style={styles.mobileTotalRow}>
              <Text style={styles.mobileTotalLabel}>Opening Aggregate:</Text>
              <Text style={[
                styles.mobileTotalValue,
                balanceTotals.opening < 0 && { color: colors.destructive }
              ]}>{formatCurrency(balanceTotals.opening)}</Text>
            </View>
            <View style={styles.mobileTotalRow}>
              <Text style={styles.mobileTotalLabel}>Closing Aggregate:</Text>
              <Text style={[
                styles.mobileTotalValue,
                { color: colors.primary },
                balanceTotals.closing < 0 && { color: colors.destructive }
              ]}>
                {formatCurrency(balanceTotals.closing)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// ── 4. CollectionsTabContent ──────────────────────────────────────────────────
interface CollectionsTabContentProps {
  receiptRows: any[];
  isTablet: boolean;
}

export function CollectionsTabContent({
  receiptRows,
  isTablet,
}: CollectionsTabContentProps) {
  const totalCollections = useMemo(() => {
    return receiptRows.reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
  }, [receiptRows]);

  if (receiptRows.length === 0) {
    return (
      <View>
        <Text style={styles.blockTitle}>Daily Collections</Text>
        <View style={styles.emptyTable}>
          <Text style={styles.emptyTableTxt}>No collections for this date</Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.blockTitle}>Daily Collections</Text>

      {isTablet ? (
        // Tablet horizontal table layout
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.thTxt, { flex: 1.2 }]}>Receipt No</Text>
            <Text style={[styles.thTxt, { flex: 2.5 }]}>Tenant / Unit</Text>
            <Text style={[styles.thTxt, { flex: 1.2 }]}>Method</Text>
            <Text style={[styles.thTxt, { flex: 1.2, textAlign: "right" }]}>Amount</Text>
          </View>

          {receiptRows.map((row: any, idx: number) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.tdTxt, { flex: 1.2 }]}>{row.number || row.id}</Text>
              <Text style={[styles.tdTxt, { flex: 2.5 }]}>
                {row.customer || row.party}{row.unit_name ? ` (Unit: ${row.unit_name})` : ""}
              </Text>
              <Text style={[styles.tdTxt, { flex: 1.2 }]}>
                {row.method || "Cash"}
              </Text>
              <Text style={[styles.tdTxt, { flex: 1.2, textAlign: "right", color: "#10B981" }]}>
                {formatCurrency(row.amount)}
              </Text>
            </View>
          ))}

          <View style={styles.tableTotalsRow}>
            <Text style={[styles.totalsLabelTxt, { flex: 4.9 }]}>Total Collections</Text>
            <Text style={[styles.totalsValTxt, { flex: 1.2, textAlign: "right", color: "#10B981" }]}>
              {formatCurrency(totalCollections)}
            </Text>
          </View>
        </View>
      ) : (
        // Mobile vertical list layout (matching breakdown/expenses styling)
        <View>
          <View style={styles.breakdownGrid}>
            {receiptRows.map((row: any, idx: number) => (
              <View key={idx} style={styles.breakdownRow}>
                <View style={{ flex: 1, marginRight: 16 }}>
                  <Text style={styles.breakdownLabel} numberOfLines={2}>
                    {row.customer || row.party || "Tenant"}
                  </Text>
                  <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.mutedForeground, marginTop: 2 }}>
                    Unit: {row.unit_name || "N/A"} • Category: {row.report_type || "Others"}
                  </Text>
                  <Text style={{ fontFamily: fonts.regular, fontSize: 10, color: colors.mutedForeground, marginTop: 2 }}>
                    Receipt: {row.number || row.id} ({row.method || "Cash"})
                  </Text>
                </View>
                <Text style={[styles.breakdownValue, { color: "#10B981" }]}>
                  {formatCurrency(row.amount)}
                </Text>
              </View>
            ))}

            <View style={[styles.breakdownRow, styles.breakdownTotal]}>
              <Text style={styles.breakdownLabelTotal}>Total Collection</Text>
              <Text style={[styles.breakdownValueTotal, { color: "#10B981" }]}>
                {formatCurrency(totalCollections)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// ── 5. ExpensesTabContent ─────────────────────────────────────────────────────
interface ExpensesTabContentProps {
  expenseRows: any[];
  isTablet: boolean;
}

export function ExpensesTabContent({ expenseRows, isTablet }: ExpensesTabContentProps) {
  const totalExpenses = useMemo(() => {
    return expenseRows.reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
  }, [expenseRows]);

  if (expenseRows.length === 0) {
    return (
      <View>
        <Text style={styles.blockTitle}>Daily Expenses</Text>
        <View style={styles.emptyTable}>
          <Text style={styles.emptyTableTxt}>No expenses for this date</Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.blockTitle}>Daily Expenses</Text>

      {isTablet ? (
        // Tablet horizontal table layout
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.thTxt, { flex: 1.2 }]}>Voucher No</Text>
            <Text style={[styles.thTxt, { flex: 2.5 }]}>Description / Party</Text>
            <Text style={[styles.thTxt, { flex: 1, textAlign: "center" }]}>Status</Text>
            <Text style={[styles.thTxt, { flex: 1.2, textAlign: "right" }]}>Amount</Text>
          </View>

          {expenseRows.map((row: any, idx: number) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.tdTxt, { flex: 1.2 }]}>{row.number || row.id}</Text>
              <Text style={[styles.tdTxt, { flex: 2.5 }]}>
                {row.party}{row.description ? ` - ${row.description}` : ""}
              </Text>
              <Text style={[styles.tdTxt, { flex: 1, textAlign: "center", textTransform: "capitalize" }]}>
                {row.status || "Posted"}
              </Text>
              <Text style={[styles.tdTxt, { flex: 1.2, textAlign: "right", color: colors.destructive }]}>
                {formatCurrency(row.amount)}
              </Text>
            </View>
          ))}

          <View style={styles.tableTotalsRow}>
            <Text style={[styles.totalsLabelTxt, { flex: 4.7 }]}>Total Expenses</Text>
            <Text style={[styles.totalsValTxt, { flex: 1.2, textAlign: "right", color: colors.destructive }]}>
              {formatCurrency(totalExpenses)}
            </Text>
          </View>
        </View>
      ) : (
        // Mobile vertical list layout (matching breakdown styling)
        <View>
          <View style={styles.breakdownGrid}>
            {expenseRows.map((row: any, idx: number) => (
              <View key={idx} style={styles.breakdownRow}>
                <View style={{ flex: 1, marginRight: 16 }}>
                  <Text style={styles.breakdownLabel} numberOfLines={2}>
                    {row.party || "Expense"}
                  </Text>
                  {row.description ? (
                    <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.mutedForeground, marginTop: 2 }}>
                      {row.description}
                    </Text>
                  ) : null}
                  <Text style={{ fontFamily: fonts.regular, fontSize: 10, color: colors.mutedForeground, marginTop: 2 }}>
                    Voucher: {row.number || row.id}
                  </Text>
                </View>
                <Text style={[styles.breakdownValue, { color: colors.destructive }]}>
                  {formatCurrency(row.amount)}
                </Text>
              </View>
            ))}

            <View style={[styles.breakdownRow, styles.breakdownTotal]}>
              <Text style={styles.breakdownLabelTotal}>Total Expenses</Text>
              <Text style={[styles.breakdownValueTotal, { color: colors.destructive }]}>
                {formatCurrency(totalExpenses)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// ── Local Styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  dateSelectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    gap: 16,
    paddingHorizontal: 16,
  },
  dateArrowBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 8,
    backgroundColor: colors.surface,
    ...shadows.soft,
  },
  dateDisplayBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    ...shadows.soft,
    minWidth: 180,
    justifyContent: "center",
  },
  dateDisplayText: {
    fontFamily: fonts.bold,
    fontSize: 14.5,
    color: colors.foreground,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flex: 1,
    minWidth: 140,
    borderLeftWidth: 4,
    ...shadows.soft,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.mutedForeground,
  },
  cardAmount: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.foreground,
    marginBottom: 4,
  },
  cardCount: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.mutedForeground,
  },
  blockTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.foreground,
    marginBottom: 14,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.muted,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radii.md,
    marginBottom: 8,
  },
  thTxt: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.mutedForeground,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    alignItems: "center",
  },
  tdTxt: {
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: colors.foregroundSoft,
  },
  tableTotalsRow: {
    flexDirection: "row",
    backgroundColor: colors.borderSoft,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: radii.md,
    marginTop: 10,
  },
  totalsLabelTxt: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.foreground,
  },
  totalsValTxt: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.primary,
  },
  emptyTable: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTableTxt: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.mutedForeground,
  },
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
    marginTop: 4,
  },
  mobileCardValue: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.foreground,
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
  changeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  changeBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  mobileTotalCard: {
    backgroundColor: colors.muted,
    borderRadius: radii.lg,
    padding: 14,
    marginTop: 8,
  },
  mobileTotalTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.foreground,
    marginBottom: 8,
  },
  mobileTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  mobileTotalLabel: {
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: colors.foregroundSoft,
    flex: 1,
    marginRight: 16,
  },
  mobileTotalValue: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.foreground,
  },
  breakdownGrid: {
    gap: 12,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  breakdownLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.foregroundSoft,
    flex: 1,
    marginRight: 16,
  },
  breakdownValue: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.foreground,
  },
  breakdownTotal: {
    borderBottomWidth: 0,
    backgroundColor: colors.highlight,
    padding: 12,
    borderRadius: radii.md,
    marginTop: 8,
  },
  breakdownLabelTotal: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.foreground,
  },
  breakdownValueTotal: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.primary,
  },
});
