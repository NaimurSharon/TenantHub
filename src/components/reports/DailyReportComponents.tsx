import React from "react";
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
  dailyRows: any[];
  dailyTotals: any;
}

export function CollectionsTabContent({
  dailyRows,
  dailyTotals,
}: CollectionsTabContentProps) {
  return (
    <View>
      <Text style={styles.blockTitle}>Daily Collections by Category</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.thTxt, { flex: 1.4 }]}>Date</Text>
        <Text style={[styles.thTxt, { flex: 1, textAlign: "right" }]}>Rent</Text>
        <Text style={[styles.thTxt, { flex: 1, textAlign: "right" }]}>Svc. Charge</Text>
        <Text style={[styles.thTxt, { flex: 1, textAlign: "right" }]}>Elec. & Others</Text>
        <Text style={[styles.thTxt, { flex: 1, textAlign: "right" }]}>Parking</Text>
        <Text style={[styles.thTxt, { flex: 1.2, textAlign: "right" }]}>Total</Text>
      </View>

      {dailyRows.length === 0 ? (
        <View style={styles.emptyTable}>
          <Text style={styles.emptyTableTxt}>No entries for this date</Text>
        </View>
      ) : (
        dailyRows.map((row: any, idx: number) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={[styles.tdTxt, { flex: 1.4 }]}>{row.display_date}</Text>
            <Text style={[styles.tdTxt, { flex: 1, textAlign: "right" }]}>
              {formatCurrency(row.rent)}
            </Text>
            <Text style={[styles.tdTxt, { flex: 1, textAlign: "right" }]}>
              {formatCurrency(row.service_charge)}
            </Text>
            <Text style={[styles.tdTxt, { flex: 1, textAlign: "right" }]}>
              {formatCurrency(row.electricity_and_others)}
            </Text>
            <Text style={[styles.tdTxt, { flex: 1, textAlign: "right" }]}>
              {formatCurrency(row.parking)}
            </Text>
            <Text style={[styles.tdTxt, { flex: 1.2, textAlign: "right", fontFamily: fonts.bold }]}>
              {formatCurrency(row.total_collection)}
            </Text>
          </View>
        ))
      )}

      {dailyTotals && (
        <View style={styles.tableTotalsRow}>
          <Text style={[styles.totalsLabelTxt, { flex: 1.4 }]}>Total</Text>
          <Text style={[styles.totalsValTxt, { flex: 1, textAlign: "right" }]}>
            {formatCurrency(dailyTotals.rent)}
          </Text>
          <Text style={[styles.totalsValTxt, { flex: 1, textAlign: "right" }]}>
            {formatCurrency(dailyTotals.service_charge)}
          </Text>
          <Text style={[styles.totalsValTxt, { flex: 1, textAlign: "right" }]}>
            {formatCurrency(dailyTotals.electricity_and_others)}
          </Text>
          <Text style={[styles.totalsValTxt, { flex: 1, textAlign: "right" }]}>
            {formatCurrency(dailyTotals.parking ?? 0)}
          </Text>
          <Text style={[styles.totalsValTxt, { flex: 1.2, textAlign: "right" }]}>
            {formatCurrency(dailyTotals.total_collection)}
          </Text>
        </View>
      )}
    </View>
  );
}

// ── 5. BreakdownTabContent ────────────────────────────────────────────────────
interface BreakdownTabContentProps {
  dailyTotals: any;
}

export function BreakdownTabContent({ dailyTotals }: BreakdownTabContentProps) {
  if (!dailyTotals) {
    return (
      <View style={styles.emptyTable}>
        <Text style={styles.emptyTableTxt}>No data available</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.blockTitle}>Revenue Stream Breakdown</Text>
      <View style={styles.breakdownGrid}>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Rent</Text>
          <Text style={styles.breakdownValue}>{formatCurrency(dailyTotals.rent ?? 0)}</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Service Charge</Text>
          <Text style={styles.breakdownValue}>{formatCurrency(dailyTotals.service_charge ?? 0)}</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Electricity & Others</Text>
          <Text style={styles.breakdownValue}>{formatCurrency(dailyTotals.electricity_and_others ?? 0)}</Text>
        </View>
        {(dailyTotals.parking ?? 0) > 0 && (
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Parking</Text>
            <Text style={styles.breakdownValue}>{formatCurrency(dailyTotals.parking)}</Text>
          </View>
        )}
        {(dailyTotals.parking_security_deposit ?? 0) > 0 && (
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Parking Security Deposit</Text>
            <Text style={styles.breakdownValue}>{formatCurrency(dailyTotals.parking_security_deposit)}</Text>
          </View>
        )}
        {(dailyTotals.rent_security_deposit ?? 0) > 0 && (
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Rent Security Deposit</Text>
            <Text style={styles.breakdownValue}>{formatCurrency(dailyTotals.rent_security_deposit)}</Text>
          </View>
        )}
        {(dailyTotals.others ?? 0) > 0 && (
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Others</Text>
            <Text style={styles.breakdownValue}>{formatCurrency(dailyTotals.others)}</Text>
          </View>
        )}
        <View style={[styles.breakdownRow, styles.breakdownTotal]}>
          <Text style={styles.breakdownLabelTotal}>Total Collection</Text>
          <Text style={styles.breakdownValueTotal}>
            {formatCurrency(dailyTotals.total_collection ?? 0)}
          </Text>
        </View>
      </View>
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
