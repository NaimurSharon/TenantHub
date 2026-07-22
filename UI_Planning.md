# Modal Overlay Animation Fix

## Problem

Bottom-sheet modals used React Native's `animationType="slide"` while their dark backdrop and card were rendered inside the same modal view. React Native therefore animated the complete view as one unit from the bottom. The backdrop visibly slid upward with the card instead of fading into place.

## Root Cause

`animationType="slide"` controls the entire transparent modal content tree. Because the backdrop and sheet card shared that tree, they could not have independent animations.

## Solution

The slide animation was replaced with a reusable hook:

- `mobile/src/hooks/useSheetAnimation.ts`

Each bottom sheet now uses this structure:

```tsx
<Modal visible={visible} animationType="none" transparent>
  <Animated.View
    pointerEvents="none"
    style={[
      StyleSheet.absoluteFill,
      {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        opacity: backdrop,
      },
    ]}
  />

  <TouchableOpacity
    style={StyleSheet.absoluteFill}
    activeOpacity={1}
    onPress={() => close(dismiss)}
  />

  <View style={{ flex: 1, justifyContent: 'flex-end' }} pointerEvents="box-none">
    <Animated.View style={[styles.sheet, { transform: [{ translateY: card }] }]}>
      {/* sheet content */}
    </Animated.View>
  </View>
</Modal>
```

### Animation behavior

- Backdrop opacity: `0` to `1` over `280ms`
- Card position: screen height to `0` over `360ms`
- Card easing: `Easing.out(Easing.poly(4))`
- Close backdrop fade: `200ms`
- Close card slide: `260ms`
- Native driver enabled for all animations

The card and backdrop run in parallel, so the overlay fades in while only the sheet moves upward.

## Updated Screens

- `mobile/src/app/(admin)/attendance.tsx`
  - Date filter sheet
  - Attendance detail sheet with swipe-to-dismiss
- `mobile/src/app/(admin)/employee-report.tsx`
  - Employee detail sheet with swipe-to-dismiss
- `mobile/src/app/(employee)/history.tsx`
  - Daily logs sheet with swipe-to-dismiss
- `mobile/src/app/(admin)/geofencing.tsx`
  - Create geofence sheet
  - Edit geofence sheet
- `mobile/src/app/(admin)/home.tsx`
  - All attendance activities sheet
- `mobile/src/app/(employee)/leaves.tsx`
  - Leave request sheet
- `mobile/src/app/(admin)/personnel.tsx`
  - Employee detail is a centered dialog, so it uses `animationType="fade"` rather than a bottom-sheet animation.

## Interaction Details

- Tapping outside a sheet closes it through the animated `close()` helper.
- Header close/cancel actions use the same close animation.
- Existing pan-to-dismiss behavior remains available for attendance, employee report, and history detail sheets.
- `pointerEvents="none"` keeps the animated backdrop from intercepting touches.
- `pointerEvents="box-none"` allows the sheet card to receive touches while empty space remains dismissible.

## Follow-up Fix

The geofencing screen already had a business function named `openEdit`. The animation hook initially introduced a second `openEdit` declaration, causing a Babel syntax error. The hook methods were renamed locally to `openEditSheet` and `closeEditSheet` to remove the collision.

## Verification

- Confirmed there are no remaining `animationType="slide"` modals under `mobile/src/app`.
- Type and compile diagnostics reported no errors after the geofencing naming fix.
