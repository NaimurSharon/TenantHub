import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Platform,
  Linking,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Shield,
  Lock,
  FileText,
  Mail,
  UserCheck,
  Share2,
  Eye,
  Building2,
  MapPin,
  ExternalLink,
  Info,
} from "lucide-react-native";
import { colors, fonts, radii, shadows } from "@/theme";
import { PRIVACY_POLICY_DATA } from "@/constants/privacyPolicy";
import { ScreenHeader } from "@/components/shared/ScreenHeader";

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [activeSectionId, setActiveSectionId] = useState<string>("overview");
  const scrollViewRef = useRef<ScrollView>(null);

  const renderIcon = (name: string, size = 18, color: string = colors.primary) => {
    switch (name) {
      case "Shield":
        return <Shield size={size} color={color} />;
      case "Lock":
        return <Lock size={size} color={color} />;
      case "FileText":
        return <FileText size={size} color={color} />;
      case "Mail":
        return <Mail size={size} color={color} />;
      case "UserCheck":
        return <UserCheck size={size} color={color} />;
      case "Share2":
        return <Share2 size={size} color={color} />;
      case "Eye":
        return <Eye size={size} color={color} />;
      default:
        return <FileText size={size} color={color} />;
    }
  };

  const handleTabPress = (sectionId: string) => {
    setActiveSectionId(sectionId);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const activeSection =
    PRIVACY_POLICY_DATA.find((s) => s.id === activeSectionId) || PRIVACY_POLICY_DATA[0];

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/login");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header matching app standard */}
      <ScreenHeader title="Privacy Policy" onBack={handleBack} />

      {/* Horizontal Section Navigation Tabs */}
      <View style={styles.tabBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {PRIVACY_POLICY_DATA.map((section) => {
            const isActive = section.id === activeSectionId;
            return (
              <Pressable
                key={section.id}
                onPress={() => handleTabPress(section.id)}
                style={({ pressed }) => [
                  styles.tabItem,
                  isActive && styles.tabItemActive,
                  pressed && styles.pressed,
                ]}
              >
                {renderIcon(section.iconName, 15, isActive ? colors.primaryForeground : colors.primary)}
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {section.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content Body */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.mainScroll,
          isTablet && styles.tabletMainScroll,
          { paddingBottom: insets.bottom + 40 },
        ]}
      >
        <View style={styles.contentCard}>
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderTitleRow}>
              <View style={styles.iconContainer}>
                {renderIcon(activeSection.iconName, 22, colors.primary)}
              </View>
              <Text style={styles.sectionTitle}>{activeSection.title}</Text>
            </View>

            {activeSection.effectiveDate && (
              <View style={styles.metaBadgeRow}>
                <View style={styles.metaPill}>
                  <Text style={styles.metaLabel}>
                    Effective Date: <Text style={styles.metaHighlight}>{activeSection.effectiveDate}</Text>
                  </Text>
                </View>
                <View style={styles.metaPill}>
                  <Text style={styles.metaLabel}>
                    Last Updated: <Text style={styles.metaHighlight}>{activeSection.lastUpdated}</Text>
                  </Text>
                </View>
              </View>
            )}

            {activeSection.content && (
              <Text style={styles.sectionContentText}>{activeSection.content}</Text>
            )}

            {activeSection.noticeBox && (
              <View style={styles.noticeBox}>
                <Info size={18} color={colors.primary} style={{ marginTop: 2 }} />
                <Text style={styles.noticeText}>{activeSection.noticeBox}</Text>
              </View>
            )}
          </View>

          {/* Detailed Cards Section */}
          {activeSection.cards && activeSection.cards.length > 0 && (
            <View style={styles.cardsContainer}>
              {activeSection.cards.map((card, idx) => (
                <View key={idx} style={styles.cardItem}>
                  <View style={styles.cardItemHeader}>
                    {card.iconName && (
                      <View style={styles.smallIconBadge}>
                        {renderIcon(card.iconName, 16, colors.primary)}
                      </View>
                    )}
                    <Text style={styles.cardItemTitle}>{card.title}</Text>
                  </View>

                  {card.description && (
                    <Text style={styles.cardItemDescription}>{card.description}</Text>
                  )}

                  {card.highlightNote && (
                    <View style={styles.highlightNoteBox}>
                      <Text style={styles.highlightNoteText}>{card.highlightNote}</Text>
                    </View>
                  )}

                  {card.items && card.items.length > 0 && (
                    <View style={styles.itemsList}>
                      {card.items.map((item, itemIdx) => (
                        <View key={itemIdx} style={styles.listItem}>
                          <View style={styles.bulletDot} />
                          <Text style={styles.listItemText}>
                            <Text style={styles.listItemLabel}>{item.label}: </Text>
                            {item.description}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Contact Information Section */}
          {activeSection.contactDetails && (
            <View style={styles.contactCardContainer}>
              <View style={styles.contactRow}>
                <View style={styles.contactIconBadge}>
                  <Building2 size={18} color={colors.primary} />
                </View>
                <View style={styles.contactTextCol}>
                  <Text style={styles.contactLabel}>Company</Text>
                  <Text style={styles.contactVal}>{activeSection.contactDetails.company}</Text>
                </View>
              </View>

              <Pressable
                onPress={() =>
                  Linking.openURL(`mailto:${activeSection.contactDetails?.email}`)
                }
                style={({ pressed }) => [styles.contactRow, pressed && styles.pressed]}
              >
                <View style={styles.contactIconBadge}>
                  <Mail size={18} color={colors.primary} />
                </View>
                <View style={styles.contactTextCol}>
                  <Text style={styles.contactLabel}>Email</Text>
                  <View style={styles.emailRow}>
                    <Text style={[styles.contactVal, styles.emailLinkText]}>
                      {activeSection.contactDetails.email}
                    </Text>
                    <ExternalLink size={14} color={colors.primary} style={{ marginLeft: 6 }} />
                  </View>
                </View>
              </Pressable>

              <View style={styles.contactRow}>
                <View style={styles.contactIconBadge}>
                  <MapPin size={18} color={colors.primary} />
                </View>
                <View style={styles.contactTextCol}>
                  <Text style={styles.contactLabel}>Mailing Address</Text>
                  <Text style={styles.contactVal}>{activeSection.contactDetails.address}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>PM System</Text>
          <Text style={styles.footerText}>© SiSCOTEK 2026</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBarContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.borderSoft,
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  tabItemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.mutedForeground,
  },
  tabTextActive: {
    color: colors.primaryForeground,
    fontFamily: fonts.semiBold,
  },
  pressed: {
    opacity: 0.8,
  },
  mainScroll: {
    padding: 16,
  },
  tabletMainScroll: {
    paddingHorizontal: 32,
    paddingTop: 24,
    maxWidth: 900,
    alignSelf: "center",
    width: "100%",
  },
  contentCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    ...shadows.card,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.foreground,
  },
  metaBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  metaPill: {
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.mutedForeground,
  },
  metaHighlight: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  sectionContentText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
    color: colors.foregroundSoft,
    marginBottom: 14,
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.primaryLight,
    borderRadius: radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.2)",
    gap: 10,
  },
  noticeText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
    color: colors.foreground,
  },
  cardsContainer: {
    gap: 14,
  },
  cardItem: {
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  smallIconBadge: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  cardItemTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.foreground,
  },
  cardItemDescription: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.mutedForeground,
  },
  highlightNoteBox: {
    backgroundColor: colors.destructiveLight,
    borderRadius: radii.md,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  highlightNoteText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.destructive,
  },
  itemsList: {
    marginTop: 12,
    gap: 10,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  listItemText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.foregroundSoft,
  },
  listItemLabel: {
    fontFamily: fonts.bold,
    color: colors.foreground,
  },
  contactCardContainer: {
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 14,
    gap: 16,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactIconBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  contactTextCol: {
    flex: 1,
  },
  contactLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.mutedForeground,
    marginBottom: 2,
  },
  contactVal: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.foreground,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  emailLinkText: {
    color: colors.primary,
    textDecorationLine: "underline",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    paddingHorizontal: 4,
  },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.mutedForeground,
  },
});
