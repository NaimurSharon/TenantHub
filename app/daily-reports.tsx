import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  RefreshCw,
  Receipt,
  FileText,
  DollarSign,
  TrendingUp,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { colors, fonts, radii, shadows, spacing } from "@/theme";
import { useDailyReport } from "@/hooks/queries/useFinancialQuery";
import { useAuthStore } from "@/store/useAuthStore";
import { formatCurrency } from "@/lib/api/types";

type ActiveReportTab = "balances" | "collections" | "breakdown";

export default function DailyReportsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // Read propertyId from auth store — never hard-code
  const propertyId = useAuthStore((s) => s.propertyId);

  // ── Scroll & Tab Management ──────────────────────────────────
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 6, 8)); // 8 July 2026
  const [activeTab, setActiveTab] = useState<ActiveReportTab>("balances");
  const [scrollOffset, setScrollOffset] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // ── Calendar Picker — Animated State ─────────────────────────
  const [showCalendar, setShowCalendar] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(selectedDate.getMonth());
  const [pickerYear, setPickerYear] = useState(selectedDate.getFullYear());

  // Animation values
  const sheetAnim = useRef(new Animated.Value(0)).current;   // 0=hidden, 1=visible
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const gridSlide = useRef(new Animated.Value(0)).current;   // slides grid left/right on month change
  const gridOpacity = useRef(new Animated.Value(1)).current;

  const SHEET_HEIGHT = 420; // px — consistent sheet size

  // Spring config that matches iOS feel
  const SPRING = { tension: 280, friction: 26, useNativeDriver: true };

  const runOpen = useCallback(() => {
    setShowCalendar(true);
    Animated.parallel([
      Animated.spring(sheetAnim, { toValue: 1, ...SPRING }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const runClose = useCallback((then?: () => void) => {
    Animated.parallel([
      Animated.spring(sheetAnim, { toValue: 0, tension: 320, friction: 28, useNativeDriver: true }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setShowCalendar(false);
        then?.();
      }
    });
  }, []);

  const slideMonth = useCallback((direction: "left" | "right", changeFn: () => void) => {
    const outX = direction === "left" ? -40 : 40;
    const inX  = direction === "left" ?  40 : -40;
    Animated.parallel([
      Animated.timing(gridSlide,   { toValue: outX, duration: 120, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.timing(gridOpacity, { toValue: 0,    duration: 100, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start(() => {
      changeFn();
      gridSlide.setValue(inX);
      Animated.parallel([
        Animated.spring(gridSlide,   { toValue: 0, tension: 320, friction: 28, useNativeDriver: true }),
        Animated.timing(gridOpacity, { toValue: 1, duration: 130, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    });
  }, []);

  const openCalendar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPickerMonth(selectedDate.getMonth());
    setPickerYear(selectedDate.getFullYear());
    gridSlide.setValue(0);
    gridOpacity.setValue(1);
    sheetAnim.setValue(0);
    backdropAnim.setValue(0);
    runOpen();
  };

  const closeCalendar = () => runClose();

  const selectDay = useCallback((day: number) => {
    Haptics.selectionAsync();
    runClose(() => {
      setSelectedDate(new Date(pickerYear, pickerMonth, day));
    });
  }, [pickerYear, pickerMonth, runClose]);

  const prevPickerMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    slideMonth("right", () => {
      if (pickerMonth === 0) { setPickerMonth(11); setPickerYear(y => y - 1); }
      else setPickerMonth(m => m - 1);
    });
  };

  const nextPickerMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    slideMonth("left", () => {
      if (pickerMonth === 11) { setPickerMonth(0); setPickerYear(y => y + 1); }
      else setPickerMonth(m => m + 1);
    });
  };

  // Build calendar grid
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(pickerYear, pickerMonth, 1).getDay();
    const daysInMonth = new Date(pickerYear, pickerMonth + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [pickerMonth, pickerYear]);

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const handleTabChange = (tab: ActiveReportTab) => {
    Haptics.selectionAsync();
    setActiveTab(tab);
    if (scrollOffset > 285) {
      scrollViewRef.current?.scrollTo({ y: 285, animated: true });
    }
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

  const balances = report?.cash_bank_balances?.rows || [];
  const balanceTotals = report?.cash_bank_balances?.totals || { opening: 0, closing: 0 };
  const dailyRows = report?.daily_rows || [];
  const dailyTotals = report?.daily_totals || null;

  const handleBackToRouter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/hub-selector");
  };

  const renderSummaryCard = (
    title: string,
    amount: number,
    countText: string,
    icon: React.ReactNode,
    accentColor: string
  ) => (
    <View style={[styles.summaryCard, { borderLeftColor: accentColor }]}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>{title}</Text>
        {icon}
      </View>
      <Text style={styles.cardAmount}>{formatCurrency(amount)}</Text>
      <Text style={styles.cardCount}>{countText}</Text>
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header (matches TenantHub style exactly) */}
      <View style={styles.header}>
        <Pressable onPress={handleBackToRouter} hitSlop={12} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.mutedForeground} />
        </Pressable>
        <Text style={styles.headerTitle}>DAILY REPORTS</Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            refetch();
          }}
          hitSlop={12}
          style={styles.refreshBtn}
        >
          <RefreshCw size={20} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <ScrollView
        ref={scrollViewRef}
        onScroll={(e) => setScrollOffset(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Selector Row */}
        <View style={styles.dateSelectorContainer}>
          <Pressable onPress={() => adjustDate(-1)} style={styles.dateArrowBtn}>
            <ChevronLeft size={20} color={colors.foreground} />
          </Pressable>

          {/* Tap to open calendar picker */}
          <Pressable onPress={openCalendar} style={styles.dateDisplayBox}>
            <Calendar size={18} color={colors.primary} />
            <Text style={styles.dateDisplayText}>{displayDateStr}</Text>
          </Pressable>

          <Pressable onPress={() => adjustDate(1)} style={styles.dateArrowBtn}>
            <ChevronRight size={20} color={colors.foreground} />
          </Pressable>
        </View>

        {/* ── Calendar Picker Modal — Animated ───────────────── */}
        <Modal
          visible={showCalendar}
          transparent
          animationType="none"
          onRequestClose={closeCalendar}
          statusBarTranslucent
        >
          {/* Animated backdrop */}
          <Animated.View
            style={[
              styles.calendarOverlay,
              { opacity: backdropAnim },
            ]}
            pointerEvents="box-none"
          >
            <TouchableWithoutFeedback onPress={closeCalendar}>
              <View style={StyleSheet.absoluteFill} />
            </TouchableWithoutFeedback>
          </Animated.View>

          {/* Spring-animated bottom sheet */}
          <Animated.View
            style={[
              styles.calendarSheet,
              {
                transform: [{
                  translateY: sheetAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [SHEET_HEIGHT + 60, 0],
                  }),
                }],
                opacity: sheetAnim.interpolate({
                  inputRange: [0, 0.4, 1],
                  outputRange: [0, 1, 1],
                }),
              },
            ]}
          >
            {/* Drag handle */}
            <View style={styles.calHandle} />

            {/* Month navigation header */}
            <View style={styles.calendarHeader}>
              <Pressable
                onPress={prevPickerMonth}
                hitSlop={16}
                style={({ pressed }) => [styles.calNavBtn, pressed && styles.calNavBtnPressed]}
              >
                <ChevronLeft size={20} color={colors.foreground} />
              </Pressable>

              <Animated.Text style={[styles.calMonthTitle, { opacity: gridOpacity }]}>
                {MONTH_NAMES[pickerMonth]} {pickerYear}
              </Animated.Text>

              <Pressable
                onPress={nextPickerMonth}
                hitSlop={16}
                style={({ pressed }) => [styles.calNavBtn, pressed && styles.calNavBtnPressed]}
              >
                <ChevronRight size={20} color={colors.foreground} />
              </Pressable>
            </View>

            {/* Day-of-week labels */}
            <View style={styles.calDayLabels}>
              {DAY_LABELS.map((d) => (
                <Text key={d} style={styles.calDayLabel}>{d}</Text>
              ))}
            </View>

            {/* Date grid — slides + fades on month change */}
            <Animated.View
              style={[
                styles.calGrid,
                { transform: [{ translateX: gridSlide }], opacity: gridOpacity },
              ]}
            >
              {calendarGrid.map((day, idx) => {
                if (day === null) {
                  return <View key={`blank-${idx}`} style={styles.calCell} />;
                }
                const isSelected =
                  day === selectedDate.getDate() &&
                  pickerMonth === selectedDate.getMonth() &&
                  pickerYear === selectedDate.getFullYear();
                const isToday =
                  day === new Date().getDate() &&
                  pickerMonth === new Date().getMonth() &&
                  pickerYear === new Date().getFullYear();
                return (
                  <DayCell
                    key={`day-${idx}`}
                    day={day}
                    isSelected={isSelected}
                    isToday={isToday}
                    onPress={() => selectDay(day)}
                  />
                );
              })}
            </Animated.View>

            {/* Footer */}
            <View style={styles.calFooter}>
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  const today = new Date();
                  runClose(() => {
                    setPickerMonth(today.getMonth());
                    setPickerYear(today.getFullYear());
                    setSelectedDate(today);
                  });
                }}
                style={({ pressed }) => [styles.calTodayBtn, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.calTodayBtnText}>Today</Text>
              </Pressable>
              <Pressable
                onPress={closeCalendar}
                style={({ pressed }) => [styles.calCancelBtn, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.calCancelBtnText}>Cancel</Text>
              </Pressable>
            </View>
          </Animated.View>
        </Modal>

        {/* Summary Widgets Grid (responsive, matches layout grid) */}
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
        ) : (
          <View style={isTablet ? styles.summaryGridTablet : styles.summaryGridMobile}>
            {renderSummaryCard(
              "Invoice Amount",
              summary.invoice_amount,
              `${summary.invoice_count} Invoices`,
              <FileText size={20} color={colors.primary} />,
              colors.primary
            )}
            {renderSummaryCard(
              "Receipt Amount",
              summary.receipt_amount,
              `${summary.receipt_count} Receipts`,
              <Receipt size={20} color="#10B981" />,
              "#10B981"
            )}
            {renderSummaryCard(
              "Expense Amount",
              summary.expense_amount,
              `${summary.expense_count} Expenses`,
              <TrendingDown size={20} color={colors.destructive} />,
              colors.destructive
            )}
            {renderSummaryCard(
              "Net Collection",
              summary.net_collection,
              "Aggregate Cashflow",
              <DollarSign size={20} color="#F59E0B" />,
              "#F59E0B"
            )}
          </View>
        )}

        {/* Text-Link Tabs (matches TenantHub style exactly) */}
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
            {(
              [
                { id: "balances", label: "Cash & Bank Balances" },
                { id: "collections", label: "Collections Summary" },
                { id: "breakdown", label: "Daily Category Totals" },
              ] as const
            ).map((tab) => {
              const isTabActive = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => handleTabChange(tab.id)}
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

        {/* Main Content Block (styled matching detail card style) */}
        <View style={styles.cardBlock}>
          {isLoading || isRefetching ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : activeTab === "balances" ? (
            <View>
              <Text style={styles.blockTitle}>Closing & Opening Balances</Text>

              {isTablet ? (
                // Tablet Grid Table
                <View>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.thTxt, { flex: 0.6 }]}>SL</Text>
                    <Text style={[styles.thTxt, { flex: 2.2 }]}>Account Name</Text>
                    <Text style={[styles.thTxt, { flex: 1.2, textAlign: "right" }]}>Opening</Text>
                    <Text style={[styles.thTxt, { flex: 1.2, textAlign: "right" }]}>Closing</Text>
                    <Text style={[styles.thTxt, { flex: 1.2, textAlign: "right" }]}>Change</Text>
                  </View>

                  {balances.length === 0 ? (
                    <View style={styles.emptyTable}>
                      <Text style={styles.emptyTableTxt}>No bank entries recorded</Text>
                    </View>
                  ) : (
                    balances.map((row: any) => {
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
                              : `${isPositive ? "+" : "-"} ${formatCurrency(Math.abs(change))}`}
                          </Text>
                        </View>
                      );
                    })
                  )}

                  <View style={styles.tableTotalsRow}>
                    <Text style={[styles.totalsLabelTxt, { flex: 2.8 }]}>Total Balance</Text>
                    <Text style={[styles.totalsValTxt, { flex: 1.2, textAlign: "right" }]}>
                      {formatCurrency(balanceTotals.opening)}
                    </Text>
                    <Text style={[styles.totalsValTxt, { flex: 1.2, textAlign: "right" }]}>
                      {formatCurrency(balanceTotals.closing)}
                    </Text>
                    <Text style={[styles.totalsValTxt, { flex: 1.2, textAlign: "right" }]}>
                      {formatCurrency(balanceTotals.closing - balanceTotals.opening)}
                    </Text>
                  </View>
                </View>
              ) : (
                // Mobile Cards Layout (recreates TenantRow/dataCard layout)
                <View>
                  {balances.length === 0 ? (
                    <View style={styles.emptyTable}>
                      <Text style={styles.emptyTableTxt}>No bank entries recorded</Text>
                    </View>
                  ) : (
                    balances.map((row: any) => {
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
                            <Text style={styles.mobileCardValue}>{formatCurrency(row.closing)}</Text>
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
                                  : `${isPositive ? "+" : "-"} ${formatCurrency(Math.abs(change))}`}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })
                  )}

                  <View style={styles.mobileTotalCard}>
                    <Text style={styles.mobileTotalTitle}>Total Balance Scope</Text>
                    <View style={styles.mobileTotalRow}>
                      <Text style={styles.mobileTotalLabel}>Opening Aggregate:</Text>
                      <Text style={styles.mobileTotalValue}>{formatCurrency(balanceTotals.opening)}</Text>
                    </View>
                    <View style={styles.mobileTotalRow}>
                      <Text style={styles.mobileTotalLabel}>Closing Aggregate:</Text>
                      <Text style={[styles.mobileTotalValue, { color: colors.primary }]}>
                        {formatCurrency(balanceTotals.closing)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ) : activeTab === "collections" ? (
            <View>
              <Text style={styles.blockTitle}>Daily Collections by Category</Text>
              {/* Table header uses actual API fields: rent, service_charge, electricity_and_others, parking, total */}
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
                  {/* parking is in daily_rows but not always in daily_totals – safe guard */}
                  <Text style={[styles.totalsValTxt, { flex: 1, textAlign: "right" }]}>
                    {formatCurrency(dailyTotals.parking ?? 0)}
                  </Text>
                  <Text style={[styles.totalsValTxt, { flex: 1.2, textAlign: "right" }]}>
                    {formatCurrency(dailyTotals.total_collection)}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View>
              <Text style={styles.blockTitle}>Revenue Stream Breakdown</Text>
              {dailyTotals ? (
                <View style={styles.breakdownGrid}>
                  {/* Only map fields confirmed to exist in daily_totals API response */}
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
                  {/* Conditionally show extra fields if backend returns them */}
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
              ) : (
                <View style={styles.emptyTable}>
                  <Text style={styles.emptyTableTxt}>No data available</Text>
                </View>
              )}
            </View>
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
  refreshBtn: {
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
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
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
  // Text Tabs (matches TenantHub detail tabs)
  tabsWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    marginBottom: 16,
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
  cardBlock: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 16,
    ...shadows.soft,
    minHeight: 200,
  },
  blockTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.foreground,
    marginBottom: 14,
  },
  loadingBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
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

  // ── Calendar Picker ───────────────────────────────────────────
  calendarOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(15,23,42,0.55)",
    justifyContent: "flex-end",
  },
  calendarSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 32 : 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  calHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  calNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  calNavBtnPressed: {
    backgroundColor: colors.border,
    transform: [{ scale: 0.94 }],
  },
  calMonthTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.foreground,
    letterSpacing: 0.2,
  },
  calDayLabels: {
    flexDirection: "row",
    marginBottom: 4,
  },
  calDayLabel: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.mutedForeground,
    paddingVertical: 4,
  },
  calGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    overflow: "hidden",
  },
  calCell: {
    width: `${100 / 7}%` as any,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 1,
  },
  calCellInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  calCellToday: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 18,
    width: 36,
    height: 36,
  },
  calCellSelected: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    width: 36,
    height: 36,
  },
  calCellText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.foreground,
  },
  calCellTodayText: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  calCellSelectedText: {
    color: colors.primaryForeground,
    fontFamily: fonts.bold,
  },
  calFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  calTodayBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: radii.full,
  },
  calTodayBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.primaryForeground,
  },
  calCancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.secondary,
    borderRadius: radii.full,
  },
  calCancelBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.foregroundSoft,
  },
});

// ── DayCell — spring-animated day button ──────────────────────────────────────
type DayCellProps = {
  day: number;
  isSelected: boolean;
  isToday: boolean;
  onPress: () => void;
};
function DayCell({ day, isSelected, isToday, onPress }: DayCellProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.82,
      tension: 300,
      friction: 20,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 260,
      friction: 18,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.calCell}
    >
      <Animated.View
        style={[
          styles.calCellInner,
          isToday && !isSelected && styles.calCellToday,
          isSelected && styles.calCellSelected,
          { transform: [{ scale }] },
        ]}
      >
        <Text
          style={[
            styles.calCellText,
            isToday && !isSelected && styles.calCellTodayText,
            isSelected && styles.calCellSelectedText,
          ]}
        >
          {day}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
