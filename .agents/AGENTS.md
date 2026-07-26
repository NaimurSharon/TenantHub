# Project Agent Guidelines & Code Quality Standards

These guidelines reflect learned best practices and architectural patterns established across the backend (Laravel) and mobile (React Native / Expo) codebases.

---

## 1. Mobile Development Standards (React Native / Expo)

### Modal & Sheet Animations
- **Custom `useSheetAnimation` Hook**: Use custom animated bottom sheet abstractions (`useSheetAnimation`) instead of native `animationType="slide"` for smooth, fine-grained control over backdrop fades and card slide-ups.
- **Separated Layers**: Keep backdrop fade, card slide animation, and dismiss touch handler in independent layers to avoid layout glitches.
- **`animationType="none"`**: Set `animationType="none"` on `<Modal>` wrappers when driving custom `Animated.Value` or sheet animations.
- **Preserve Gestures**: Retain pan gesture / drag-to-dismiss handlers on bottom sheets where applicable.

### Data Loading & Lifecycle
- **Avoid Over-fetching on Focus**: Static or infrequently changing data (e.g. location lists, categories) should fetch once on initial mount (`useEffect`), NOT re-trigger on every navigation focus event.
- **TTL Cache**: Utilize the TTL-aware caching module (`src/utils/cache.ts`). Check timestamps and invalidate entries older than the default 5-minute TTL.
- **Modern Idle Callbacks**: Never use deprecated `InteractionManager.runAfterInteractions`. Use `requestIdleCallback` (or `setTimeout` fallback) for deferring non-essential render/fetch workloads.

### Toast & Notification Reliability
- **Queued Toasts**: Enforce sequential queued execution for toast alerts using `ToastOverlay`. Avoid overlapping animations, timer races, or stale closure callbacks.

### Defensive Rendering & Data Integrity
- **Audit Fallbacks**: When displaying detailed attendance logs, tolerate incomplete audit trails by synthesizing fallback entries from `check_in_time` and `check_out_time` if specific audit log rows are missing.

---

## 2. Backend Development Standards (Laravel / PHP)

### Query Performance & Payload Optimization
- **Explicit Column Contracts**: Always define and use explicit model column constants (e.g., `User::CARD_COLUMNS`, `OfficeLocation::SUMMARY_COLUMNS`, `UserLevel::CARD_COLUMNS`, `LeaveType::CARD_COLUMNS`) in `select()` clauses instead of `SELECT *`.
- **Database Aggregates**: Use direct database aggregate functions (`count()`, `sum()`, `exists()`) for dashboard stats and calculations instead of hydrating full Eloquent models into memory.
- **Constrained Eager Loading**: Constrain relationship selections in `with()` queries (e.g., `with(['user' => fn($q) => $q->select(User::CARD_COLUMNS)])`) to minimize JSON payload size.
- **Single-Pass Queries**: Consolidate multiple queries for the same entity into single-pass operations.

### Timezones & Scheduled Tasks
- **Timezone Awareness**: Ensure application and scheduled cron commands operate explicitly in the target operational timezone (`Asia/Dhaka`).
