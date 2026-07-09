/**
 * TabBar — horizontal scrollable tab link bar.
 * Used by both Financial Hub and Daily Reports.
 */
import React from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { Text } from "@/components/ui/Text";
import * as Haptics from "expo-haptics";
import { colors, fonts } from "@/theme";

export interface TabItem<T extends string> {
  id: T;
  label: string;
}

interface TabBarProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onTabChange: (id: T) => void;
}

export function TabBar<T extends string>({ tabs, activeTab, onTabChange }: TabBarProps<T>) {
  return (
    <View style={styles.tabsWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScrollContent}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => {
                Haptics.selectionAsync();
                onTabChange(tab.id);
              }}
              style={[styles.tabLink, isActive && styles.tabLinkActive]}
            >
              <Text style={[styles.tabLinkLabel, isActive && styles.tabLinkLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabsWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    height: 44,
  },
  tabScrollContent: {
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 4,
    height: 44,
  },
  tabLink: {
    paddingHorizontal: 12,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabLinkActive: {
    borderBottomColor: colors.primary,
  },
  tabLinkLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.foregroundSoft,
  },
  tabLinkLabelActive: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },
});
