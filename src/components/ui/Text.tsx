import React from "react";
import { Text as RNText, type TextProps } from "react-native";

/** Thin wrapper so a custom font can be applied globally if needed. */
export const Text = React.forwardRef<RNText, TextProps>(function AppText(
  props,
  ref,
) {
  return <RNText ref={ref} {...props} />;
});

export default Text;
