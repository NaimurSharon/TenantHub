import React from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { colors, fonts, radii, shadows } from "@/theme";

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

const variants: Record<string, { bg: string; text: string; border?: string }> =
  {
    default: { bg: colors.primary, text: colors.primaryForeground },
    secondary: { bg: colors.secondary, text: colors.secondaryForeground },
    destructive: { bg: colors.destructive, text: colors.destructiveLight },
    outline: {
      bg: "transparent",
      text: colors.foreground,
      border: colors.border,
    },
    ghost: { bg: "transparent", text: colors.foreground },
  };

const sizes: Record<string, { h: number; px: number; fontSize: number }> = {
  sm: { h: 36, px: 12, fontSize: 13 },
  default: { h: 48, px: 20, fontSize: 15 },
  lg: { h: 54, px: 28, fontSize: 16 },
};

export function Button({
  children,
  onPress,
  variant = "default",
  size = "default",
  disabled,
  loading,
  style,
}: ButtonProps) {
  const v = variants[variant];
  const s = sizes[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        {
          height: s.h,
          paddingHorizontal: s.px,
          borderRadius: radii.lg,
          backgroundColor: v.bg,
          borderWidth: v.border ? 1 : 0,
          borderColor: v.border,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.5 : 1,
          ...shadows.soft,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : typeof children === "string" ? (
        <Text
          style={{
            fontFamily: fonts.semiBold,
            fontSize: s.fontSize,
            color: v.text,
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}
