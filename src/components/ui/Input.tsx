import React from "react";
import { View, TextInput, StyleSheet, type TextInputProps } from "react-native";
import { Text } from "@/components/ui/Text";
import { colors, fonts, radii } from "@/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...rest }: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.mutedForeground}
        style={[
          styles.input,
          error ? styles.inputError : null,
          rest.multiline ? styles.multiline : null,
          style,
        ]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.foregroundSoft,
    marginBottom: 6,
  },
  input: {
    height: 48,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.foreground,
  },
  inputError: {
    borderColor: colors.destructive,
  },
  multiline: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  error: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.destructive,
    marginTop: 4,
  },
});
