---
name: project-quality-standards
description: Best practices, performance optimizations, and UI patterns for mobile (React Native) and backend (Laravel).
---

# Code Quality & Architectural Standards

When working on this repository, strictly adhere to the following standards established across the backend and mobile projects:

## Mobile (React Native / Expo)

1. **Bottom Sheet & Modal Animations**:
   - Use the custom `useSheetAnimation` hook for smooth sheet transitions.
   - Set `<Modal animationType="none">` when using custom animated sheet values.
   - Separate backdrop fade, card slide animation, and touch handlers into distinct layers.
   - Keep drag-to-dismiss gesture handling intact.

2. **Data Loading & Lifecycle Management**:
   - Do NOT refetch static/infrequent data (such as office locations) on every navigation focus event. Load once on mount (`useEffect`).
   - Use the TTL-aware cache wrapper (`src/utils/cache.ts`) with the default 5-minute TTL.
   - Replace deprecated `InteractionManager.runAfterInteractions` with `requestIdleCallback` (with fallback).

3. **Toast Notifications**:
   - Use the queued `ToastOverlay` system. Do not display concurrent overlapping toasts or create timer state races.

4. **Defensive Rendering**:
   - Synthesize fallback audit log entries using `check_in_time` and `check_out_time` when backend audit-trail records are missing.

---

## Backend (Laravel / PHP)

1. **Query & Payload Optimization**:
   - Use explicit model column projections (e.g. `User::CARD_COLUMNS`, `OfficeLocation::SUMMARY_COLUMNS`, `UserLevel::CARD_COLUMNS`, `LeaveType::CARD_COLUMNS`). Never run unconstrained `SELECT *` on card views.
   - Perform aggregate calculations (e.g. `count()`, `exists()`) directly in SQL database queries rather than loading Eloquent collections into memory.
   - Constrain eager loading relationships using explicit column selections.

2. **Timezone Integrity**:
   - Always evaluate dates and scheduled tasks within the `Asia/Dhaka` timezone.
