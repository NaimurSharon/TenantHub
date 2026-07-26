---
name: react-native
description: Comprehensive development standards, gesture animation guidelines, network rollback patterns, state persistence, media handling, Cloudinary uploads, real-time patterns, drag-and-drop grid sorting, query caching strategies, IAP/Apple Pay/Google Pay verification, Apple/Google social auth, points economy, App Store/Play Store compliance, push notifications/deep links, keyboard layout stability, and performance practices for React Native and Expo applications.
---

# React Native & Expo Development Standards

These guidelines reflect established best practices, performance targets, and architectural safety rules established across the React Native / Expo codebase (using Reanimated 3+, Gesture Handler 2+, and Zustand).

---

## 1. New Architecture (Fabric) Layout & Styling Rules

### Instructions
- **Explicit Container Dimensions on Absolute Position Nodes**: Nodes using `position: "absolute"` with edge insets (`top`, `left`, `right`, `bottom`) must specify explicit `width` or `height` (e.g., `width: "100%", height: "100%"`).
- **Modern Shadow Props**: Prefer CSS `boxShadow` props (e.g., `boxShadow: "0px 4px 14px rgba(0,0,0,0.12)"`) over legacy Android `elevation` + `borderRadius`.

### Targets Achieved
- Flawless, pixel-perfect rendering across iOS and Android on Expo SDK 56 / React Native Fabric engine.
- Consistent depth and card elevation without overflow artifacts.

### Bugs & Failure Modes Prevented
- **0x0 Layout Collapse**: Prevents absolute nodes from collapsing to 0 height/width on Yoga (Fabric renderer), which causes cards or screens to render completely invisible (black screen).
- **Clipping Artifacts**: Eliminates Android shadow clipping glitches caused by legacy `elevation` interacting with rounded corners (`overflow: "hidden"`).

---

## 2. Reanimated & Gesture Physics Standards

### Instructions
- **UI Thread Worklets & `runOnJS`**: Keep gesture calculations strictly on the UI thread (`'worklet'`). Wrap JS callbacks (such as API triggers or state updates) in `runOnJS(callback)`.
- **Damped Spring Configurations**: Use iOS-grade spring parameter presets:
  - *Entrance / Card Elevation*: `{ damping: 26, stiffness: 360, mass: 0.6 }`
  - *Settle / Snap-Back*: `{ damping: 28, stiffness: 320 }`
- **Rejection Snap-Back**: When an optimistic gesture is rejected by client gating or an async rule check, snap the card back using `withSpring(0, SETTLE_SPRING)`.

```typescript
// Production Code Pattern: UI thread gesture with damped spring snap-back
const ENTRANCE_SPRING = { damping: 26, stiffness: 360, mass: 0.6 };
const SETTLE_SPRING   = { damping: 28, stiffness: 320 };

const gesture = Gesture.Pan()
  .enabled(isTop)
  .onUpdate((e) => {
    'worklet';
    translateX.value = e.translationX;
    translateY.value = e.translationY;
  })
  .onEnd((e) => {
    'worklet';
    if (e.translationX > SWIPE_THRESHOLD) {
      flyOff("like", e.translationX, e.translationY, e.velocityX, e.velocityY);
      runOnJS(handleSwipeCheck)("like");
    } else {
      translateX.value = withSpring(0, SETTLE_SPRING);
      translateY.value = withSpring(0, SETTLE_SPRING);
    }
  });
```

### Targets Achieved
- Butter-smooth 60/120 FPS gesture dragging with natural rotation physics ($\pm 7^\circ$ max tilt).
- Instant responsive feel without frame drops during rapid swiping.

### Bugs & Failure Modes Prevented
- **Bridge Bottlenecks**: Prevents JS event-loop lag from stalling gesture tracking.
- **Stuck Cards**: Prevents cards getting frozen mid-gesture or flying off screen unexpectedly when an action is rejected by subscription or point limits.

---

## 3. Optimistic State Updates & Network Error Rollback

### Instructions
- **Transaction Rollbacks**: When modifying optimistic state (e.g., removing a card from the visible deck before server response), capture the record and revert state in `.catch()` blocks if network requests fail or return HTTP 402/403 errors.
- **In-Flight Request Deduplication**: Use module-scoped promise singletons (`inflightMatches`, `inflightHistory`) to deduplicate concurrent network fetches.

```typescript
// Production Code Pattern: Optimistic mutation with catch rollback
swipe: async (targetPet, action) => {
  const swiperPetId = usePetStore.getState().activePetId;
  const record: SwipeRecord = { petId: targetPet.id, action };

  // Optimistic UI update
  set((s) => ({ history: [...s.history, record] }));

  try {
    const result = await api.discover.swipe({ swiperPetId, targetPetId: targetPet.id, action });
    return result;
  } catch (error: any) {
    // Rollback state on error, HTTP 402, or HTTP 403 quota exhaustion
    set((s) => ({ history: s.history.filter((h) => h !== record) }));
    return null;
  }
}
```

### Targets Achieved
- Zero-latency UI response—swipes and messages reflect immediately.
- Resilient offline performance with automatic recovery.

### Bugs & Failure Modes Prevented
- **Phantom Card Losses**: Prevents cards disappearing permanently when API calls fail (e.g., HTTP 402 Insufficient Points, HTTP 403 Limit Exceeded, or offline network drops).
- **Thundering Herd API Calls**: Prevents duplicate parallel network requests when screen focus, WebSocket events, and app foreground triggers fire simultaneously.

---

## 4. Multi-Layer Storage & Event Deduplication

### Instructions
- **3-Layer Event Tracking**: Enforce three layers of status tracking for one-time alerts and celebrations:
  1. *Layer 1 (In-Memory)*: User-scoped synchronous `Set` (`${userId}:${id}`).
  2. *Layer 2 (Local Storage)*: User-scoped `AsyncStorage` key (`celebratedMatches:${userId}`).
  3. *Layer 3 (Server DB)*: Database column array (`celebrated_by[]`).
- **Single-Trigger Ref Guards**: Use component `useRef` guards (`celebratedKey.current`) for sound playback and entrance animations.

### Targets Achieved
- Guarantees celebrations, toasts, and match popups trigger **exactly once** per user, regardless of app restarts, reinstalls, or device switches.

### Bugs & Failure Modes Prevented
- **Double-Sound & Animation Jitter**: Prevents parent re-renders (e.g. tier refreshes, unread badges) from re-triggering sound effects or restarting spring animations.
- **Cross-User Privacy Leaks**: Prevents User B from seeing User A's dismissed match popups on shared devices by scoping storage keys to `${userId}:${matchId}`.

---

## 5. Monetization & Tier Limit Gating

### Instructions
- **Dual Gating (Client & Server)**: Perform instant client-side checks with `useTierSystem()`. Allow backend middleware to act as the authoritative gate while feature states hydrate.
- **Graceful Error Interception**: Catch HTTP 403 (`LIMIT_REACHED`) and HTTP 402 (`INSUFFICIENT_POINTS`) to display `UpgradeModal` or `InsufficientPointsModal`.

### Targets Achieved
- High-converting monetization flows with clear, friendly user feedback when limits are reached.

### Bugs & Failure Modes Prevented
- **Hydration Paywall Lockouts**: Prevents blocking user interactions while tier permissions are downloading on slow connections.
- **Uncaught App Crashes**: Prevents unhandled HTTP 402/403 exceptions from crashing the app during paywalled actions.

---

## 6. Socket Lifecycle & Real-Time Sync

### Instructions
- **Hydration-Aware Event Queue**: Queue incoming socket events in a `useRef` array if dependent state (`myPets`) is still hydrating; process the queue immediately once state is ready.
- **Background Resume Catch-Up**: Use `AppState` event listeners (`AppState === 'active'`) to pull missed notifications/matches when resuming from the background.

### Targets Achieved
- Instant real-time match popups and chat delivery without missing events while the app is suspended.

### Bugs & Failure Modes Prevented
- **Lost Real-Time Events**: Prevents matches arriving via WebSocket during app startup from disappearing when local user state isn't fully loaded yet.
- **Socket Memory Leaks**: Prevents dangling listener callbacks across navigation remounts.

---

## 7. Background Asynchronous Media Publishing

### Instructions
- **Unmount-Resilient Workers**: Perform post creation, image compression, and video uploading inside global store actions (`submitPost` in `useFeedStore`). Never couple network upload lifecycles to local component mount states.
- **Optimistic Progress Banners**: Render top progress banners (`PostingBanner`) driven by Reanimated shared values (`progressWidth`, `bannerOpacity`).

### Targets Achieved
- Non-blocking post creation—users can submit a post and immediately navigate away, scroll feeds, or switch tabs while heavy uploads process in the background.

### Bugs & Failure Modes Prevented
- **Aborted Media Uploads**: Eliminates lost or corrupted post submissions caused by screen unmounting when users navigate away during upload.
- **UI Thread Freezes**: Prevents UI freezing during multi-megabyte media encoding.

---

## 8. Viewability-Based Video Autoplay & Shared Player Instances

### Instructions
- **Scroll Viewability Tracking**: Wrap feed lists in `FeedVideoProvider`. Use `itemVisiblePercentThreshold: 60` and `minimumViewTime: 120` to activate playback only when a video is substantially visible and scroll inertia has settled.
- **Single Decoder Shared Players**: When opening `FullscreenVideoPlayer`, pass the existing `VideoPlayer` reference from `PostVideo` rather than instantiating a second video decoder.

```typescript
// Production Code Pattern: Pass caller's VideoPlayer instance to fullscreen overlay
interface FullscreenVideoPlayerProps {
  player: VideoPlayer; // Same instance from inline feed PostVideo
  onClose: () => void;
}

export function FullscreenVideoPlayer({ player, onClose }: FullscreenVideoPlayerProps) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <VideoView player={player} style={styles.fullscreenVideo} allowsFullscreen={false} />
    </Modal>
  );
}
```

### Targets Achieved
- Instant, zero-buffering transition when expanding an inline video to full screen.
- Smooth 60 FPS feed scrolling with automatic play/pause behavior matching Twitter and Instagram.

### Bugs & Failure Modes Prevented
- **Decoder Exhaustion & Hardware Crashes**: Prevents hardware video decoder exhaustion on mobile devices caused by duplicate active player instances.
- **Audio Overlay Collisions**: Prevents background video audio from continuing to play underneath full-screen modals.

---

## 9. Dirty-Flag State Merging & Store Pruning

### Instructions
- **Intent-Preserving Dirty Flags**: Mark optimistic interaction state (e.g. `liked: true`, `bookmarked: true`) with a `dirty: true` flag. Rejects incoming stale server snapshots from secondary tab caches until canonical reconciliation completes.
- **Bounded Interaction Stores**: Prune cached interaction dictionaries (`pruneInteractions`) to a fixed upper limit (e.g., MAX 200 items).

### Targets Achieved
- Reliable social interaction state across multi-tab feeds ("For You" vs "Following") and deep comment views.

### Bugs & Failure Modes Prevented
- **"Like Snap-Back" Bug**: Prevents stale cache responses from an unrefreshed secondary feed tab overwriting the user's optimistic like/bookmark state.
- **Memory Bloat**: Prevents unbounded Javascript memory growth during extended scrolling sessions.

---

## 10. Multi-Asset Media Grid & Pinch-Zoom Lightboxes

### Instructions
- **Adaptive Matrix Grids**: Compute layout geometry dynamically for 1, 2, 3, 4+ media assets in `MediaGrid.tsx`.
- **Gesture-Driven Lightboxes**: Use `ImageViewer.tsx` with Reanimated scale/translation handlers to enable smooth pinch-to-zoom and pan interactions.

### Targets Achieved
- High-impact Twitter/Instagram-style media layout with crisp full-resolution inspection.

### Bugs & Failure Modes Prevented
- **Aspect Ratio Shift**: Prevents ugly layout jumps and unexpected image cropping for mixed portrait/landscape uploads.
- **Gesture Conflicts**: Prevents pinch-zoom gestures from conflicting with vertical list scrolling.

---

## 11. Cloudinary Signed Uploads & Durable Asset Cleanup

### Instructions
- **Native File System Uploads (`uploadAsync`)**: When uploading images, videos, or audio to Cloudinary, ALWAYS use `expo-file-system`'s `uploadAsync` with `FileSystemUploadType.MULTIPART`. Never use standard `fetch()` with `{ uri, type, name }` FormData objects in React Native.
- **Signed Parameter Request**: Request ephemeral upload signatures (`api.upload.getSignature()`) from the backend before invoking Cloudinary API endpoints (`/v1_1/${cloudName}/${resource_type}/upload`). Secret API keys must never reside on mobile clients.
- **Automatic Asset Deletion on Entity Delete**: Whenever a post, pet photo, or user avatar is deleted, extract the Cloudinary `public_id` from the secure URL and execute backend asset destruction (`cloudinary.v2.uploader.destroy(public_id, { resource_type })`).
- **Durable Deletion Retry Queue**: Persist pending Cloudinary deletion tasks into a durable backend `MediaDeletion` queue model during transactions so that temporary network dropouts or backend crashes re-try deletion instead of leaking un-tracked media in cloud storage.

### Targets Achieved
- Secure, high-speed direct-to-cloud media uploads without exposing backend secrets.
- 100% clean media lifecycle with zero storage waste and zero orphaned assets on Cloudinary.

### Bugs & Failure Modes Prevented
- **Expo `FormDataPart` Crash**: Eliminates React Native JS engine crashes (`"Unsupported FormDataPart implementation"`) when streaming binary media files from device storage.
- **Orphaned Media Leakage**: Prevents deleted posts, deleted pets, and deleted user accounts from leaving abandoned media files behind on Cloudinary.

---

## 12. Decoupled Screen Controllers & Identity-Preserving Merges

### Instructions
- **Hook & Controller Separation**: Keep complex screens clean by delegating socket event wiring to custom hooks (`useChatSocket`), interaction handlers to action hooks (`useChatHandlers`), and state to Zustand stores (`useMatchStore`). Screens should assemble components and hooks without embedding raw API/socket logic in render functions.
- **Identity-Preserving List Merging**: When merging incoming WebSocket or network payloads into list caches (`mergeMessages`), reuse existing object references when data hasn't changed (`cur.text === inc.text ... ? cur : inc`). This preserves `React.memo` equality checks, skipping expensive native element re-renders.
- **Client Idempotency & Delivery Fallback Timers**: Assign unique client keys (`tempId`) to optimistic items. Maintain timeout timers (`sendTimers`) to transition pending items to `status: "failed"` if backend delivery acknowledgments do not resolve within a fixed timeout (e.g. 15 seconds). Clear timers immediately on acknowledgment.

### Targets Achieved
- Clean, maintainable screen components with zero unnecessary list re-renders.
- Robust chat delivery status feedback under weak network conditions.

### Bugs & Failure Modes Prevented
- **Mass Re-render Jank**: Prevents every message bubble in a chat list from re-rendering when a single new message arrives.
- **Infinite Pending States**: Prevents messages from staying stuck in a perpetual "sending" state when sockets drop.

---

## 13. Interactive Touch & Drag Gesture Scrubbing

### Instructions
- **Gesture Scrubbing for Continuous Streams**: Parse normalized 0–100 amplitude values into visual bar charts or timeline indicators (`VoiceMessage.tsx`). Implement tap-to-jump and horizontal pan gesture handlers across the track container, calculating scrubbed timestamp as `(clampedX / layoutWidth) * durationMs`.
- **Dynamic Media Poster Transforms**: Automatically derive video poster thumbnails from cloud video URLs by replacing file extensions (`.mp4` $\rightarrow$ `.jpg`), avoiding extra network requests for separate thumbnail images.
- **User-Scoped Block Enforcement**: Check block status on screen mount (`api.safety.blockStatus`) and replace interactive input bars with a passive banner (`BlockedBanner`) when blocked by either party.

### Targets Achieved
- WhatsApp-grade interactive voice/audio messages with visual amplitude scrubbing.
- Instant, zero-overhead video poster generation.

### Bugs & Failure Modes Prevented
- **Scrubber Jump Glitches**: Prevents touch events outside track bounds from calculating invalid playback timestamps.
- **Blocked Communication Exposure**: Prevents users from attempting to message accounts that have blocked them.

---

## 14. Touch-Hold Drag-and-Drop Reordering Systems

### Instructions
- **Touch-Hold Drag Reordering**: Implement sortable grid/list layouts using dedicated sortable libraries (`SortableGrid`). Configure press-and-hold activation delays (`dragActivationDelay: 150`) and trigger medium haptic feedback (`Haptics.impactAsync`) on drag start.
- **Placeholder Slot Locking**: Lock empty upload placeholders (`disabledDrag: true`) to prevent dragging unpopulated dashed slots.
- **Primary Cover Asset Rules**: Automatically assign the 1st element of the sorted array (`items[0]`) as the primary cover asset upon drag release (`onDragEnd`).

### Targets Achieved
- Smooth, intuitive photo/item reordering with clear tactile feedback.

### Bugs & Failure Modes Prevented
- **Accidental Scroll-Drag Triggers**: Prevents normal list scrolling from triggering item reordering accidentally.
- **Invalid Cover Image Assignment**: Guarantees the primary cover asset always corresponds to the top-sorted photo item.

---

## 15. Navigation Guards & Parent Query Cache Lookups

### Instructions
- **Double-Tap Navigation Guarding**: Wrap `useRouter()` in `useGuardedRouter()` with a 600ms debounce guard (`GUARD_MS = 600`) to prevent duplicate screen stack pushes when users tap navigation triggers rapidly.
- **Parent Query Cache Lookup (`getQueriesData`)**: Detail screens should call `getFeedPostFromCache()` to read single items directly out of existing parent list query memory, rendering on-screen content instantly without showing skeleton placeholders while a redundant API call resolves.

```typescript
// Production Code Pattern: 1. Double-tap router guard (useGuardedRouter.ts)
const GUARD_MS = 600;
export function useGuardedRouter() {
  const router = useRouter();
  const lastNav = useRef(0);
  return useMemo(() => ({
    ...router,
    push: (...args: Parameters<typeof router.push>) => {
      const now = Date.now();
      if (now - lastNav.current < GUARD_MS) return;
      lastNav.current = now;
      router.push(...args);
    },
  }), [router]);
}

// Production Code Pattern: 2. Direct parent query cache lookup (useFeedQuery.ts)
export function getFeedPostFromCache(queryClient: QueryClient, postId: string): Post | undefined {
  const caches = queryClient.getQueriesData<{ pages: { posts: Post[] }[] }>({ queryKey: ["feed"] });
  for (const [, data] of caches) {
    for (const page of data?.pages ?? []) {
      const found = page.posts?.find((p) => p.id === postId);
      if (found) return found;
    }
  }
  return undefined;
}
```

### Targets Achieved
- Eliminates duplicate screen pushes on fast button double-taps.
- Instant, zero-delay rendering of detail screens from pre-existing list memory.

### Bugs & Failure Modes Prevented
- **Duplicate Navigation Stack Push**: Prevents pushing the same route twice onto the Expo Router stack.
- **Skeleton Flashing**: Eliminates redundant loading state flashes when navigating from list items to detail screens.

---

## 16. Network Status Phasing & Offline Banners

### Instructions
- **Network Status State Machine (`OfflineBanner`)**:
  - *Transient Blip Hiding*: Ignore offline blips $< 1.5$ seconds to avoid annoying users during normal WiFi $\rightarrow$ Cellular network handoffs.
  - *Offline Escalation*: Display dark banner after 1.5 seconds offline; escalate to critical red banner after 10 seconds.
  - *Recovery Indication*: Display green "Back online" bar for 2 seconds upon connection recovery before sliding out.

```typescript
// Production Code Pattern: OfflineBanner phase state machine
const SHOW_DELAY = 1500;
const ESCALATE_DELAY = 10000;
const RECOVERY_DURATION = 2000;

export function OfflineBanner() {
  const { isConnected } = useNetworkStatus();
  const [phase, setPhase] = useState<"online" | "offline" | "critical" | "recovered">("online");
  const wasVisible = useRef(false);

  useEffect(() => {
    if (!isConnected) {
      const showTimer = setTimeout(() => {
        wasVisible.current = true;
        setPhase("offline");
        const escalateTimer = setTimeout(() => setPhase("critical"), ESCALATE_DELAY - SHOW_DELAY);
      }, SHOW_DELAY);
      return () => clearTimeout(showTimer);
    } else {
      if (wasVisible.current) {
        wasVisible.current = false;
        setPhase("recovered");
        const recTimer = setTimeout(() => setPhase("online"), RECOVERY_DURATION);
        return () => clearTimeout(recTimer);
      }
    }
  }, [isConnected]);

  if (phase === "online") return null;
  return (
    <Animated.View entering={SlideInUp.duration(250)} exiting={SlideOutUp.duration(200)}>
      {/* Banner view */}
    </Animated.View>
  );
}
```

### Targets Achieved
- Clear, non-intrusive offline feedback matching WhatsApp and Telegram.

### Bugs & Failure Modes Prevented
- **Banner Flicker**: Prevents annoying banner flickering during brief 1-second cellular network handoffs.

---

## 17. Native In-App Purchases, Apple Pay/Google Pay & Server Verification

### Instructions
- **Server-Authoritative Entitlements**: Never grant subscriptions, paid features, or consumable point packages locally on the mobile device. Always stream store purchases through server verification (`api.payments.verify`) BEFORE calling `finishTransaction()`.
- **Store Listener Cleanup & Timeout Guards**: Wrap purchase flows in a Promise backed by a 5-minute safety timeout net. Remove listener subscriptions (`purchaseUpdatedListener`, `purchaseErrorListener`) when the promise settles.
- **Android Subscription Offer Tokens**: Fetch products (`fetchStoreProducts`) prior to requesting Android subscriptions to extract `subscriptionOffers` and `offerToken`.
- **Graceful Environmental Fallback**: Guard native IAP modules (`iapAvailable()`) to fall back gracefully in Expo Go or Web environments.

```typescript
// Production Code Pattern: Server-authoritative purchase execution (iap.ts)
async function runPurchase(productId: string, type: "subs" | "in-app"): Promise<VerifyPurchaseResult> {
  await ensureConnection();

  return new Promise<VerifyPurchaseResult>((resolve, reject) => {
    let settled = false;
    const subs: any[] = [];

    const cleanup = () => { for (const s of subs) { try { s?.remove?.(); } catch {} } };
    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup();
      fn();
    };

    const timer = setTimeout(() => settle(() => reject(new Error("Purchase timed out"))), 5 * 60 * 1000);

    subs.push(
      iap.purchaseUpdatedListener(async (purchase: any) => {
        if (settled || (purchase?.productId && purchase.productId !== productId)) return;
        try {
          // 1. Server-side verification (authoritative)
          const payload = extractVerifyPayload(purchase);
          const result = await api.payments.verify(payload);
          // 2. Finish transaction ONLY after server verification succeeds
          await iap.finishTransaction({ purchase, isConsumable: type === "in-app" });
          settle(() => resolve(result));
        } catch (e) {
          // Do NOT finish on verify failure — allows purchase recovery via Restore
          settle(() => reject(e));
        }
      })
    );

    subs.push(
      iap.purchaseErrorListener((err: any) => {
        settle(() => reject(err));
      })
    );

    iap.requestPurchase({ request: { apple: { sku: productId }, google: { skus: [productId] } }, type });
  });
}
```

### Targets Achieved
- Fraud-proof native in-app billing across iOS and Android (Apple Pay & Google Pay).
- Guarantees purchases are acknowledged with store APIs only after backend verification succeeds.

### Bugs & Failure Modes Prevented
- **Local Entitlement Spoofing**: Prevents client-side script modifications from unlocking paid features locally without valid receipts.
- **Unfinished Transaction Re-delivery Loops**: Prevents App Store / Google Play from re-delivering unacknowledged transactions indefinitely.

---

## 18. Native Social Authentication & Cross-Account Session Sanitization

### Instructions
- **Apple First-Time Scope Rule**: Forward `fullName` on Apple sign-in (`AppleAuthentication.signInAsync`) conditionally, handling Apple's rule where `fullName` is sent **ONLY on the first authorization**.
- **Cancellation Noise Interception**: Intercept user cancellation errors (`ERR_REQUEST_CANCELED` for Apple, `ERR_OAUTH_CANCELED` for Google) quietly without popping intrusive error toasts.
- **Account Suspension Redirection**: Intercept 403 / account suspension errors during social login and route directly to `/suspended`.
- **Cross-Account Store Reset**: Reset all domain Zustand stores (`usePetStore.getState().reset()`, `useMatchStore.getState().reset()`) on login/logout to prevent stale state from leaking across accounts.

```typescript
// Production Code Pattern: Apple Sign-In with first-time scope handling & store reset
const appleSignIn = async () => {
  if (Platform.OS !== "ios" || busy) return;
  setBusy(true);
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!credential.identityToken) throw new Error("No identity token returned");

    // Apple only sends fullName on FIRST authorization — forward it conditionally
    const fullName = [credential.fullName?.givenName, credential.fullName?.familyName]
      .filter(Boolean)
      .join(" ") || undefined;

    const { created } = await api.auth.appleSignIn({
      identityToken: credential.identityToken,
      fullName,
    });

    // Sanitize domain stores to prevent cross-account state leakage
    usePetStore.getState().reset();
    useMatchStore.getState().reset();

    router.replace("/(tabs)");
  } catch (err: any) {
    if (err?.code === "ERR_REQUEST_CANCELED") return; // Quiet dismissal
    Toast.show({ type: "error", text1: err?.message || "Apple sign-in failed" });
  } finally {
    setBusy(false);
  }
};
```

### Targets Achieved
- Seamless single-tap social authentication for iOS and Android.
- Complete account isolation during user switches on shared mobile devices.

### Bugs & Failure Modes Prevented
- **Missing Name Bug**: Prevents subsequent Apple logins from overwriting user name fields with empty values.
- **Cross-Account Data Leakage**: Prevents User B from seeing User A's cached pets or matches after switching accounts on a shared device.

---

## 19. High-Frequency Wallet Prefetching & Dynamic Paywall Interception

### Instructions
- **Cache Warm-Up & Invalidation**: Prefetch wallet balances (`prefetchPoints`) on app startup and focus. Call `useInvalidatePoints()` immediately after any point-spending action (Super Likes, Boosts, Pinning) to force a silent background balance refresh.
- **Unified Paywall Interception Hook (`useInsufficientPoints`)**: Use a centralized state controller to catch HTTP 402 `INSUFFICIENT_POINTS` error payloads (`required` vs `available`), display `InsufficientPointsModal`, compute deficit (`shortBy = Math.max(required - available, 0)`), and provide a direct CTA to open consumable point package stores.

```typescript
// Production Pattern: Unified HTTP 402 Paywall Interception (useInsufficientPoints.ts)
export function useInsufficientPoints() {
  const [modalProps, setModalProps] = useState<{ visible: boolean; info: InsufficientPointsInfo | null }>({
    visible: false,
    info: null,
  });

  const open = useCallback((info: InsufficientPointsInfo) => {
    setModalProps({ visible: true, info });
  }, []);

  const dismiss = useCallback(() => {
    setModalProps((s) => ({ ...s, visible: false }));
  }, []);

  return { modalProps: { ...modalProps, onDismiss: dismiss, onViewPoints: ... }, open, dismiss };
}
```

### Targets Achieved
- Instant wallet balance display across headers and profile without loading spinners.
- Seamless user experience transitioning from an insufficient point spending attempt to the point store modal.

### Bugs & Failure Modes Prevented
- **Stale Balance Headers**: Prevents wallet headers from displaying old point totals after spending points.
- **Uncaptured 402 Errors**: Prevents raw API 402 HTTP errors from failing silently or popping unhelpful technical toasts.

---

## 20. Safety Toolkit & User Block Enforcement

### Instructions
- **Safety Toolkit Modal Sheet (`SafetyToolkit.tsx`)**: Provide clean action sheets for unmatching, blocking, unblocking, and reporting users (`ReportReasonSheet.tsx`) with clear user confirmation steps (`confirmAndUnmatch`).
- **Passive Blocked Input Overlays (`BlockedBanner.tsx`)**: Check mutual block status (`api.safety.blockStatus`) when mounting real-time screens. If blocked by either user, replace active input controls with a passive `BlockedBanner` overlay, disabling WebSocket listeners and input handlers.

```typescript
// Production Pattern: Safety Toolkit & Blocked Input Overlay
export function ChatInputArea({ blocked, onSend }: { blocked: boolean; onSend: (msg: string) => void }) {
  if (blocked) {
    return (
      <View style={styles.blockedContainer}>
        <Text style={styles.blockedText}>You cannot send messages to this user.</Text>
      </View>
    );
  }
  return <ActiveMessageInput onSend={onSend} />;
}
```

### Targets Achieved
- Enterprise-grade safety & moderation compliance for iOS App Store and Google Play guidelines.
- Instant, non-intrusive safety actions (unmatching, blocking, reporting) with clean confirmation dialogs.

### Bugs & Failure Modes Prevented
- **Forbidden Communication**: Prevents users from sending real-time messages to accounts that have blocked them.
- **Accidental Unmatches**: Prevents accidental single-tap unmatches by requiring explicit secondary user confirmation.

---

## 21. App Store & Google Play Store Review Compliance Rules

### Instructions
- **Mandatory In-App Account Deletion (Apple Guideline 5.1.1(v) & Google Play User Data Policy)**: Every app offering account creation MUST provide an easily accessible in-app entry point (`app/settings/account.tsx`) allowing users to delete their account. The deletion flow must purge user data, invalidate tokens, and schedule durable cleanup of all stored media assets (`MediaDeletion`).
- **UGC Safety, Reporting & Blocking (Apple Guideline 1.2 & Google Play UGC Policy)**: Apps featuring User-Generated Content (posts, comments, profile photos, chat messages) MUST provide:
  1. In-app content/user reporting (`ReportReasonSheet.tsx`).
  2. Instant user blocking (`SafetyToolkit.tsx`, `api.safety.block`).
  3. Direct links to EULA / Terms of Use (`app/terms.tsx`) and Privacy Policy (`app/privacy.tsx`).
  4. Passive input disabling (`BlockedBanner.tsx`) when mutual block status is active.
- **Restore Purchases Prominence (Apple Guideline 3.1.1 & Google Play Billing Policy)**: Every paywall or subscription screen (`app/premium.tsx`, `app/billing.tsx`) MUST feature a functional "Restore Purchases" button invoking `restorePurchases()`, along with subscription terms and renewal policies.
- **Social Login Parity (Apple Guideline 4.8)**: If third-party social login (e.g. Google Sign-In) is offered on iOS devices, Sign in with Apple (`AppleAuthentication`) MUST be offered with equivalent visual prominence.

```typescript
// Production Pattern: Mandatory Account Deletion Compliance (account.tsx)
const handleDeleteAccount = async () => {
  if (deleteText.trim().toLowerCase() !== "delete") {
    Toast.show({ type: "error", text1: "Type DELETE to confirm account deletion" });
    return;
  }
  setSaving(true);
  try {
    // 1. Purge server data & trigger durable media cleanup
    await api.auth.deleteAccount();
    // 2. Clear local storage & reset stores
    usePetStore.getState().reset();
    useMatchStore.getState().reset();
    await logout();
    Toast.show({ type: "success", text1: "Your account has been deleted" });
    router.replace("/(auth)/login");
  } catch (err: any) {
    Toast.show({ type: "error", text1: err?.message || "Deletion failed" });
  } finally {
    setSaving(false);
  }
};
```

### Targets Achieved
- 100% compliance with iOS App Store Review Guidelines and Google Play Developer Policies.
- Zero app review rejections for account deletion, UGC safety, purchase restoration, or social login parity.

### Bugs & Failure Modes Prevented
- **App Store Rejection (Guideline 5.1.1(v))**: Prevents rejection for missing in-app account deletion.
- **App Store Rejection (Guideline 1.2)**: Prevents rejection for un-moderated user content or missing block/report controls.
- **App Store Rejection (Guideline 3.1.1)**: Prevents rejection for missing Restore Purchases buttons on paywall screens.

---

## 22. Error Boundaries, Deep Link Push Notifications & Keyboard Layout Stability

### Instructions
- **Keyboard Avoidance & Persistence**: Wrap forms and modal input sheets in `KeyboardAvoidingView` with `behavior={Platform.OS === "ios" ? "padding" : undefined}`. Pair with `ScrollView` or `FlatList` configured with `keyboardShouldPersistTaps="handled"` so users can tap buttons cleanly without losing input focus or experiencing keyboard layout jumps.
- **Deep Link Navigation**: Configure Expo Router deep linking schemes (`tovy://`) in `app.json`. Deep link handler hooks parse route params (e.g., `tovy://chat/[petId]`, `tovy://feed/[postId]`) and use debounced router pushes (`useGuardedRouter`) to open target views safely.
- **Foreground & Background Push Notifications**: Register Expo Push Tokens (`expo-notifications`) on login, handling foreground notification sound alerts (`useChatNotificationSound.ts`) and background taps.
- **Global Error Boundaries & API Interception**: Wrap app roots in React `ErrorBoundary` components. Global API clients (`src/lib/api/client.ts`) catch HTTP 401 (token refresh/logout), HTTP 403 (account suspension redirect), and HTTP 402 (paywall trigger), showing toast alerts (`react-native-toast-message`) rather than unhandled native crashes.

```typescript
// Production Pattern: KeyboardAvoidingView & Persisted Taps (login.tsx / ChatInputBar.tsx)
<SafeAreaView style={styles.sheet}>
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : undefined}
  >
    <ScrollView
      contentContainerStyle={styles.sheetBody}
      keyboardShouldPersistTaps="handled"
    >
      <TextInput
        style={styles.field}
        placeholder="Enter email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.submitBtn} onPress={submit}>
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  </KeyboardAvoidingView>
</SafeAreaView>
```

### Targets Achieved
- Zero input field overlaps or clipping under native iOS and Android virtual keyboards.
- Seamless single-tap form submissions without requiring extra keyboard dismissal taps.
- Instant, crash-proof deep link navigation from background push notifications.

### Bugs & Failure Modes Prevented
- **Keyboard Overlap Bug**: Prevents native virtual keyboards from covering text fields or action buttons on mobile screens.
- **Double-Tap Submit Bug**: Prevents users having to tap submit buttons twice because the first tap only dismissed the native keyboard.
- **Dangling Deep Link Crashes**: Prevents malformed push notification deep links with missing IDs from crashing the app navigation stack.
