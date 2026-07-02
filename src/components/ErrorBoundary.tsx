/**
 * Global ErrorBoundary — catches render-phase crashes and shows a recovery UI.
 */
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "@/components/ui/Text";
import { colors, fonts } from "@/theme";

interface Props {
  children: React.ReactNode;
}
interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.warn("[ErrorBoundary]", error.message, info.componentStack);
  }

  private handleRetry = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>😥</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            Don't worry — your data is safe. Tap below to try again.
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.foreground,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: "#FFF",
    fontFamily: fonts.semiBold,
    fontSize: 15,
  },
});
