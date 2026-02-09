import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Switch,
  Platform,
  Linking,
} from "react-native";
import ReAnimated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext, type ThemePreference } from "@/lib/theme-provider";
import { useDemo } from "@/lib/demo-context";
import { useViewMode } from "@/lib/viewmode-context";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  LargeTitle,
  Title3,
  Body,
  Subhead,
  Caption1,
} from "@/components/ui/typography";
import { Footnote } from "@/components/ui/cds-typography";
import { FontFamily } from "@/constants/typography";
import { Spacing, Radius } from "@/constants/spacing";
import { AvatarSettingsSection } from "@/components/ui/avatar-settings-section";
import { showError, logError } from "@/lib/error-handler";

// ─── Storage Keys ────────────────────────────────────────────────────────────

const NOTIF_KEYS = {
  priceAlerts: "@agrx/notif-price-alerts",
  dailyChallenge: "@agrx/notif-daily-challenge",
  socialActivity: "@agrx/notif-social-activity",
  marketNews: "@agrx/notif-market-news",
};

// ─── Types ───────────────────────────────────────────────────────────────────

type NotifState = {
  priceAlerts: boolean;
  dailyChallenge: boolean;
  socialActivity: boolean;
  marketNews: boolean;
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { preference, setPreference, isDark } = useThemeContext();
  const { state: demoState, resetDemo } = useDemo();
  const { mode } = useViewMode();

  const [notifs, setNotifs] = useState<NotifState>({
    priceAlerts: true,
    dailyChallenge: true,
    socialActivity: false,
    marketNews: true,
  });

  // ── Hydrate notification preferences ──
  useEffect(() => {
    (async () => {
      try {
        const entries = await AsyncStorage.multiGet(Object.values(NOTIF_KEYS));
        const hydrated: Partial<NotifState> = {};
        const keyMap = Object.entries(NOTIF_KEYS);
        entries.forEach(([storageKey, value]) => {
          const match = keyMap.find(([, sk]) => sk === storageKey);
          if (match && value !== null) {
            (hydrated as any)[match[0]] = value === "true";
          }
        });
        setNotifs((prev) => ({ ...prev, ...hydrated }));
      } catch {}
    })();
  }, []);

  const toggleNotif = useCallback(
    (key: keyof NotifState) => {
      setNotifs((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        AsyncStorage.setItem(NOTIF_KEYS[key], String(next[key])).catch(() => {});
        return next;
      });
    },
    [],
  );

  // ── URL handler ──
  const handleOpenURL = useCallback(async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        showError(new Error(`Cannot open URL: ${url}`), {
          title: "Unable to Open Link",
          message: "This app doesn't have a compatible application to open this link.",
        });
      }
    } catch (error) {
      logError(error, "handleOpenURL");
      showError(error, {
        title: "Failed to Open Link",
        message: "An error occurred while trying to open this link.",
      });
    }
  }, []);

  // ── Theme options ──
  const themeOptions: { label: string; value: ThemePreference; icon: string }[] = [
    { label: "System", value: "system", icon: "📱" },
    { label: "Light", value: "light", icon: "☀️" },
    { label: "Dark", value: "dark", icon: "🌙" },
  ];

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <ReAnimated.View entering={FadeIn.duration(200)} style={styles.header}>
          <AnimatedPressable
            variant="icon"
            onPress={() => router.back()}
            style={[
              styles.backButton,
              { backgroundColor: colors.surface },
            ]}
          >
            <IconSymbol name="chevron.right" size={20} color={colors.foreground} style={{ transform: [{ scaleX: -1 }] }} />
          </AnimatedPressable>
          <LargeTitle style={{ letterSpacing: -0.5 }}>Settings</LargeTitle>
        </ReAnimated.View>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION: View Mode
            ═══════════════════════════════════════════════════════════════════ */}
        <ReAnimated.View entering={FadeInDown.duration(250).delay(60)}>
        <SectionLabel text="View Mode" />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: isDark ? colors.borderSubtle : colors.border }]}>
          <View style={[styles.row, { flexDirection: "column", alignItems: "flex-start", gap: 10 }]}>
            <View>
              <Subhead style={{ fontFamily: FontFamily.medium }}>Interface Complexity</Subhead>
              <Caption1 color="muted" style={{ marginTop: 2 }}>
                {mode === "simple"
                  ? "Simple mode — clean, focused interface for beginners"
                  : "Pro mode — full details, charts, and advanced features"}
              </Caption1>
            </View>
            <ViewModeToggle />
          </View>
        </View>
        </ReAnimated.View>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION: Appearance
            ═══════════════════════════════════════════════════════════════════ */}
        <ReAnimated.View entering={FadeInDown.duration(250).delay(120)}>
        <SectionLabel text="Appearance" />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: isDark ? colors.borderSubtle : colors.border }]}>
          {themeOptions.map((opt, i) => {
            const isSelected = preference === opt.value;
            return (
              <AnimatedPressable
                key={opt.value}
                variant="card"
                onPress={() => setPreference(opt.value)}
                style={[
                  styles.row,
                  i < themeOptions.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
                accessibilityLabel={opt.label}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                <View style={styles.rowLeft}>
                  <Body>{opt.icon}</Body>
                  <Subhead style={{ fontFamily: FontFamily.medium, marginLeft: Spacing[3] }}>
                    {opt.label}
                  </Subhead>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    {
                      borderColor: isSelected ? colors.primary : colors.muted,
                      borderWidth: isSelected ? 2 : 1.5,
                    },
                  ]}
                >
                  {isSelected && (
                    <View
                      style={[styles.radioInner, { backgroundColor: colors.primary }]}
                    />
                  )}
                </View>
              </AnimatedPressable>
            );
          })}
        </View>
        </ReAnimated.View>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION: Notifications
            ═══════════════════════════════════════════════════════════════════ */}
        <ReAnimated.View entering={FadeInDown.duration(250).delay(180)}>
        <SectionLabel text="Notifications" />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: isDark ? colors.borderSubtle : colors.border }]}>
          <NotifRow
            label="Price Alerts"
            description="Get notified when stocks hit your target price"
            value={notifs.priceAlerts}
            onToggle={() => toggleNotif("priceAlerts")}
            colors={colors}
            isLast={false}
          />
          <AnimatedPressable
            variant="card"
            onPress={() => router.push("/price-alerts")}
            style={[
              styles.row,
              {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={styles.rowLeft}>
              <View>
                <Subhead style={{ fontFamily: FontFamily.medium, color: colors.primary }}>Manage Price Alerts</Subhead>
                <Caption1 color="muted" style={{ marginTop: 2 }}>View and edit your active price alerts</Caption1>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.muted} />
          </AnimatedPressable>
          <AnimatedPressable
            variant="card"
            onPress={() => router.push("/notification-history")}
            style={[
              styles.row,
              {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={styles.rowLeft}>
              <View>
                <Subhead style={{ fontFamily: FontFamily.medium, color: colors.primary }}>Notification History</Subhead>
                <Caption1 color="muted" style={{ marginTop: 2 }}>View past alerts and notifications</Caption1>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.muted} />
          </AnimatedPressable>
          <NotifRow
            label="Daily Challenge"
            description="Reminder to complete your daily trading challenge"
            value={notifs.dailyChallenge}
            onToggle={() => toggleNotif("dailyChallenge")}
            colors={colors}
            isLast={false}
          />
          <NotifRow
            label="Social Activity"
            description="When someone copies your trade or mentions you"
            value={notifs.socialActivity}
            onToggle={() => toggleNotif("socialActivity")}
            colors={colors}
            isLast={false}
          />
          <NotifRow
            label="Market News"
            description="Breaking ATHEX news and market-moving events"
            value={notifs.marketNews}
            onToggle={() => toggleNotif("marketNews")}
            colors={colors}
            isLast={true}
          />
        </View>
        </ReAnimated.View>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION: Account
            ═══════════════════════════════════════════════════════════════════ */}
        <ReAnimated.View entering={FadeInDown.duration(250).delay(240)}>
        <SectionLabel text="Account" />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: isDark ? colors.borderSubtle : colors.border }]}>
          <AvatarSettingsSection isLast={false} />
          <SettingsRow
            label="Demo Mode"
            value={demoState.isDemo ? "Active" : "Inactive"}
            valueColor={demoState.isDemo ? colors.warning : colors.muted}
            colors={colors}
            isLast={false}
          />
          <SettingsRow
            label="Reset Demo Balance"
            value={`€${demoState.balance.toLocaleString()}`}
            valueColor={colors.muted}
            onPress={() => {
              resetDemo();
            }}
            colors={colors}
            isLast={true}
          />
        </View>
        </ReAnimated.View>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION: About
            ═══════════════════════════════════════════════════════════════════ */}
        <ReAnimated.View entering={FadeInDown.duration(250).delay(300)}>
        <SectionLabel text="About" />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: isDark ? colors.borderSubtle : colors.border }]}>
          <SettingsRow
            label="Version"
            value="1.0.0 (MVP)"
            valueColor={colors.muted}
            colors={colors}
            isLast={false}
          />
          <SettingsRow
            label="Terms of Service"
            value=""
            chevron
            onPress={() => handleOpenURL("https://agrx.io/terms")}
            colors={colors}
            isLast={false}
          />
          <SettingsRow
            label="Privacy Policy"
            value=""
            chevron
            onPress={() => handleOpenURL("https://agrx.io/privacy")}
            colors={colors}
            isLast={false}
          />
          <SettingsRow
            label="Open Source Licenses"
            value=""
            chevron
            onPress={() => handleOpenURL("https://agrx.io/licenses")}
            colors={colors}
            isLast={true}
          />
        </View>
        </ReAnimated.View>

        {/* ── Footer ── */}
        <ReAnimated.View entering={FadeIn.duration(200).delay(360)} style={styles.footer}>
          <Caption1 color="muted" style={{ textAlign: "center" }}>
            AGRX — Agora Greek Exchange
          </Caption1>
          <Caption1 color="muted" style={{ textAlign: "center", marginTop: 2 }}>
            Making investing social for Greece
          </Caption1>
        </ReAnimated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return (
    <View style={styles.sectionLabel}>
      <Footnote
        color="muted"
        style={{
          fontFamily: FontFamily.semibold,
          textTransform: "uppercase",
          letterSpacing: 0.8,
        }}
      >
        {text}
      </Footnote>
    </View>
  );
}

function NotifRow({
  label,
  description,
  value,
  onToggle,
  colors,
  isLast,
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  colors: any;
  isLast: boolean;
}) {
  return (
    <View
      style={[
        styles.row,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={[styles.rowLeft, { flex: 1, marginRight: Spacing[3] }]}>
        <View>
          <Subhead style={{ fontFamily: FontFamily.medium }}>{label}</Subhead>
          <Caption1 color="muted" style={{ marginTop: 2 }}>
            {description}
          </Caption1>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{
          false: colors.surfaceSecondary,
          true: colors.primary,
        }}
        thumbColor={Platform.OS === "android" ? colors.onPrimary : undefined}
        ios_backgroundColor={colors.surfaceSecondary}
      />
    </View>
  );
}

function SettingsRow({
  label,
  value,
  valueColor,
  chevron,
  onPress,
  colors,
  isLast,
}: {
  label: string;
  value: string;
  valueColor?: string;
  chevron?: boolean;
  onPress?: () => void;
  colors: any;
  isLast: boolean;
}) {
  const content = (
    <View
      style={[
        styles.row,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Subhead style={{ fontFamily: FontFamily.medium }}>{label}</Subhead>
      <View style={styles.rowRight}>
        {value ? (
          <Caption1 style={{ color: valueColor || colors.muted }}>{value}</Caption1>
        ) : null}
        {chevron && (
          <IconSymbol
            name="chevron.right"
            size={16}
            color={colors.muted}
            style={{ marginLeft: 4 }}
          />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        variant="card"
        onPress={onPress}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return content;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[6],
    gap: Spacing[3],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius[500],
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[6],
    paddingBottom: Spacing[2],
  },
  card: {
    marginHorizontal: Spacing[4],
    borderRadius: Radius[400],
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: Spacing[4],
    minHeight: 50,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  footer: {
    paddingVertical: Spacing[8],
    paddingHorizontal: Spacing[4],
  },
});
