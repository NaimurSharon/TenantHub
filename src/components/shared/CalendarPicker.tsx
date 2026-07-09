/**
 * CalendarPicker — iOS-quality animated bottom-sheet calendar.
 * Fully self-contained: manages its own animation state.
 *
 * Usage:
 *   const [date, setDate] = useState(new Date());
 *   const calRef = useRef<CalendarPickerRef>(null);
 *   <CalendarPicker ref={calRef} selectedDate={date} onDateSelect={setDate} />
 *   calRef.current?.open();
 */
import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { colors, fonts, radii } from "@/theme";

// ── Constants ────────────────────────────────────────────────────────────────
const SHEET_HEIGHT = 420;
const SPRING_OPEN = { tension: 280, friction: 26, useNativeDriver: true } as const;
const SPRING_CLOSE = { tension: 320, friction: 28, useNativeDriver: true } as const;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// ── Public imperative handle ─────────────────────────────────────────────────
export interface CalendarPickerRef {
  open: () => void;
  close: () => void;
}

interface CalendarPickerProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

// ── DayCell — spring-animated individual day button ──────────────────────────
interface DayCellProps {
  day: number;
  isSelected: boolean;
  isToday: boolean;
  onPress: () => void;
}

function DayCell({ day, isSelected, isToday, onPress }: DayCellProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.82, tension: 300, friction: 20, useNativeDriver: true }).start();

  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, tension: 260, friction: 18, useNativeDriver: true }).start();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={styles.calCell}>
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

// ── Main component ────────────────────────────────────────────────────────────
export const CalendarPicker = forwardRef<CalendarPickerRef, CalendarPickerProps>(
  function CalendarPicker({ selectedDate, onDateSelect }, ref) {
    const [visible, setVisible] = useState(false);
    const [pickerMonth, setPickerMonth] = useState(selectedDate.getMonth());
    const [pickerYear, setPickerYear] = useState(selectedDate.getFullYear());

    // Animated values
    const sheetAnim = useRef(new Animated.Value(0)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;
    const gridSlide = useRef(new Animated.Value(0)).current;
    const gridOpacity = useRef(new Animated.Value(1)).current;

    const runOpen = useCallback(() => {
      setVisible(true);
      Animated.parallel([
        Animated.spring(sheetAnim, { toValue: 1, ...SPRING_OPEN }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, []);

    const runClose = useCallback((then?: () => void) => {
      Animated.parallel([
        Animated.spring(sheetAnim, { toValue: 0, ...SPRING_CLOSE }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 180, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) { setVisible(false); then?.(); }
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
          Animated.spring(gridSlide,   { toValue: 0, ...SPRING_CLOSE }),
          Animated.timing(gridOpacity, { toValue: 1, duration: 130, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]).start();
      });
    }, []);

    // Imperative API exposed to parent
    useImperativeHandle(ref, () => ({
      open: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setPickerMonth(selectedDate.getMonth());
        setPickerYear(selectedDate.getFullYear());
        gridSlide.setValue(0);
        gridOpacity.setValue(1);
        sheetAnim.setValue(0);
        backdropAnim.setValue(0);
        runOpen();
      },
      close: () => runClose(),
    }));

    const selectDay = useCallback((day: number) => {
      Haptics.selectionAsync();
      runClose(() => onDateSelect(new Date(pickerYear, pickerMonth, day)));
    }, [pickerYear, pickerMonth, runClose, onDateSelect]);

    const prevMonth = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      slideMonth("right", () => {
        if (pickerMonth === 0) { setPickerMonth(11); setPickerYear(y => y - 1); }
        else setPickerMonth(m => m - 1);
      });
    };

    const nextMonth = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      slideMonth("left", () => {
        if (pickerMonth === 11) { setPickerMonth(0); setPickerYear(y => y + 1); }
        else setPickerMonth(m => m + 1);
      });
    };

    const calendarGrid = useMemo(() => {
      const firstDay = new Date(pickerYear, pickerMonth, 1).getDay();
      const daysInMonth = new Date(pickerYear, pickerMonth + 1, 0).getDate();
      const cells: (number | null)[] = [];
      for (let i = 0; i < firstDay; i++) cells.push(null);
      for (let d = 1; d <= daysInMonth; d++) cells.push(d);
      while (cells.length % 7 !== 0) cells.push(null);
      return cells;
    }, [pickerMonth, pickerYear]);

    const today = new Date();

    return (
      <Modal visible={visible} transparent animationType="none" onRequestClose={() => runClose()} statusBarTranslucent>
        {/* Dimmed backdrop */}
        <Animated.View style={[styles.overlay, { opacity: backdropAnim }]} pointerEvents="box-none">
          <TouchableWithoutFeedback onPress={() => runClose()}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
        </Animated.View>

        {/* Spring-animated sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{
                translateY: sheetAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [SHEET_HEIGHT + 60, 0],
                }),
              }],
              opacity: sheetAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
            },
          ]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Month nav */}
          <View style={styles.monthRow}>
            <Pressable onPress={prevMonth} hitSlop={16} style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}>
              <ChevronLeft size={20} color={colors.foreground} />
            </Pressable>
            <Animated.Text style={[styles.monthTitle, { opacity: gridOpacity }]}>
              {MONTH_NAMES[pickerMonth]} {pickerYear}
            </Animated.Text>
            <Pressable onPress={nextMonth} hitSlop={16} style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}>
              <ChevronRight size={20} color={colors.foreground} />
            </Pressable>
          </View>

          {/* Day labels */}
          <View style={styles.dayLabels}>
            {DAY_LABELS.map((d) => <Text key={d} style={styles.dayLabel}>{d}</Text>)}
          </View>

          {/* Date grid */}
          <Animated.View style={[styles.grid, { transform: [{ translateX: gridSlide }], opacity: gridOpacity }]}>
            {calendarGrid.map((day, idx) => {
              if (day === null) return <View key={`b-${idx}`} style={styles.calCell} />;
              const isSel = day === selectedDate.getDate() && pickerMonth === selectedDate.getMonth() && pickerYear === selectedDate.getFullYear();
              const isTod = day === today.getDate() && pickerMonth === today.getMonth() && pickerYear === today.getFullYear();
              return <DayCell key={`d-${idx}`} day={day} isSelected={isSel} isToday={isTod} onPress={() => selectDay(day)} />;
            })}
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                runClose(() => onDateSelect(new Date()));
              }}
              style={({ pressed }) => [styles.todayBtn, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.todayBtnText}>Today</Text>
            </Pressable>
            <Pressable
              onPress={() => runClose()}
              style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Modal>
    );
  }
);

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject as any,
    backgroundColor: "rgba(15,23,42,0.55)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
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
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  monthRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 20, paddingHorizontal: 4,
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.secondary,
    alignItems: "center", justifyContent: "center",
  },
  navBtnPressed: { backgroundColor: colors.border, transform: [{ scale: 0.94 }] },
  monthTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.foreground, letterSpacing: 0.2 },
  dayLabels: { flexDirection: "row", marginBottom: 4 },
  dayLabel: {
    flex: 1, textAlign: "center",
    fontFamily: fonts.semiBold, fontSize: 12, color: colors.mutedForeground, paddingVertical: 4,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", overflow: "hidden" },
  calCell: { width: `${100 / 7}%` as any, aspectRatio: 1, alignItems: "center", justifyContent: "center", marginVertical: 1 },
  calCellInner: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  calCellToday: { borderWidth: 1.5, borderColor: colors.primary, borderRadius: 18, width: 36, height: 36 },
  calCellSelected: { backgroundColor: colors.primary, borderRadius: 18, width: 36, height: 36 },
  calCellText: { fontFamily: fonts.medium, fontSize: 15, color: colors.foreground },
  calCellTodayText: { color: colors.primary, fontFamily: fonts.bold },
  calCellSelectedText: { color: colors.primaryForeground, fontFamily: fonts.bold },
  footer: {
    flexDirection: "row", justifyContent: "flex-end", gap: 10,
    marginTop: 20, paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
  },
  todayBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.primary, borderRadius: radii.full },
  todayBtnText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.primaryForeground },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.secondary, borderRadius: radii.full },
  cancelBtnText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.foregroundSoft },
});
