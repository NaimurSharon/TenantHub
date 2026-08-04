import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "@/components/ui/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Settings as SettingsIcon, ShieldCheck, ChevronRight } from "lucide-react-native";
import { colors, fonts } from "@/theme";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24 }]}>
      <View style={styles.headerSection}>
        <SettingsIcon size={36} color={colors.primary} strokeWidth={1.5} />
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>App preferences & legal disclosures</Text>
      </View>

      <View style={styles.menuContainer}>
        <Pressable
          onPress={() => router.push("/privacy-policy")}
          style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
        >
          <View style={styles.menuIconBox}>
            <ShieldCheck size={20} color="#0EA5E9" />
          </View>
          <View style={styles.menuTextCol}>
            <Text style={styles.menuTitle}>Privacy Policy</Text>
            <Text style={styles.menuSub}>View data privacy and protection guidelines</Text>
          </View>
          <ChevronRight size={18} color="#64748B" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.foreground,
    marginTop: 12,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  menuItemPressed: {
    backgroundColor: "rgba(15, 23, 42, 0.05)",
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(14, 165, 233, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.foreground,
  },
  menuSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
  },
});
