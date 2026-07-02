/**
 * Tenant Hub Design System — centralised tokens for colors, typography,
 * spacing, radii and shadows. Every component references these so the
 * look & feel can be updated in one place.
 */

export const colors = {
  background: "#F8FAFC",
  surface: "#FFFFFF",
  foreground: "#0F172A",
  foregroundSoft: "#334155",
  primary: "#2563EB",
  primaryLight: "#DBEAFE",
  primaryForeground: "#FFFFFF",
  secondary: "#F1F5F9",
  secondaryForeground: "#475569",
  muted: "#F1F5F9",
  mutedForeground: "#64748B",
  success: "#16A34A",
  successLight: "#DCFCE7",
  destructive: "#EF4444",
  destructiveLight: "#FEE2E2",
  warning: "#F59E0B",
  border: "#E2E8F0",
  borderSoft: "#F1F5F9",
  input: "#F1F5F9",
  inputBorder: "#CBD5E1",
  highlight: "#EFF6FF",
  // Accent used for the selected-tenant card left border
  cardAccent: "#2563EB",
  // Tab bar
  tabBar: "#2563EB",
  tabBarActive: "#FFFFFF",
  tabBarInactive: "rgba(255,255,255,0.60)",
} as const;

export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
} as const;

export const radii = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  full: 9999,
} as const;

export const shadows = {
  soft: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

export const typography = {
  h1: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30 },
  h2: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26 },
  h3: { fontFamily: fonts.semiBold, fontSize: 17, lineHeight: 22 },
  h4: { fontFamily: fonts.semiBold, fontSize: 15, lineHeight: 20 },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  bodySemiBold: { fontFamily: fonts.semiBold, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  captionBold: { fontFamily: fonts.semiBold, fontSize: 12, lineHeight: 16 },
  tiny: { fontFamily: fonts.medium, fontSize: 10, lineHeight: 14 },
} as const;
