/**
 * QuickActions — Simple mode quick action buttons
 *
 * Clean card-based design with tinted icon backgrounds,
 * staggered entrance animation, and contextual badges.
 * Uses proper rgba alpha tokens instead of hex suffix hacks.
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors, colorAlpha } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { useMarketStatus } from "@/hooks/use-market-status";
import { Caption1, Body } from "@/components/ui/cds-typography";
import { FontFamily } from "@/constants/typography";
import { Radius, Spacing } from "@/constants/spacing";
import { getShadow } from "@/constants/shadows";
import { useDemo } from "@/lib/demo-context";
import { useWatchlist } from "@/lib/watchlist-context";

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  route: string;
  badge?: string;
  accessibilityLabel: string;
  accessibilityHint: string;
}

export function QuickActions() {
  const colors = useColors();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { state } = useDemo();
  const { watchlist } = useWatchlist();
  const { isMarketOpen } = useMarketStatus();

  const holdingsCount = Object.keys(state.holdings).length;

  const QUICK_ACTIONS: QuickAction[] = [
    {
      id: "trade",
      label: "Trade",
      icon: "arrow.up.circle.fill",
      color: colors.primary,
      route: "/(tabs)/trade",
      accessibilityLabel: "Navigate to Trade screen",
      accessibilityHint: "Buy and sell stocks",
    },
    {
      id: "portfolio",
      label: "Portfolio",
      icon: "briefcase.fill",
      color: colors.success,
      route: "/(tabs)/portfolio",
      badge: holdingsCount > 0 ? `${holdingsCount}` : undefined,
      accessibilityLabel: "Navigate to Portfolio screen",
      accessibilityHint: `View your ${holdingsCount} holdings`,
    },
    {
      id: "markets",
      label: "Markets",
      icon: "chart.line.uptrend.xyaxis",
      color: colors.gold,
      route: "/(tabs)/markets",
      badge: isMarketOpen ? "Live" : undefined,
      accessibilityLabel: "Navigate to Markets screen",
      accessibilityHint: "Browse and search all stocks",
    },
  ];

  return (
    <Animated.View style={styles.quickActions}>
      {QUICK_ACTIONS.map((action, index) => (
        <Animated.View
          key={action.id}
          entering={FadeInDown.duration(350)
            .delay(100 + index * 70)
            .springify()
            .damping(18)
          }
          style={styles.actionCardWrapper}
        >
          <AnimatedPressable
            variant="button"
            onPress={() => router.push(action.route as any)}
            style={[
              styles.actionCard,
              {
                backgroundColor: colors.surface,
                borderColor: isDark ? colors.borderSubtle : colors.border,
              },
              getShadow("sm", isDark),
            ]}
            accessibilityLabel={action.accessibilityLabel}
            accessibilityHint={action.accessibilityHint}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colorAlpha(action.color, isDark ? 0.16 : 0.10) },
              ]}
            >
              <IconSymbol
                name={action.icon as any}
                size={22}
                color={action.color}
              />
            </View>
            <Body
              style={{
                fontFamily: FontFamily.semibold,
                color: colors.foreground,
                fontSize: 14,
              }}
            >
              {action.label}
            </Body>
            {action.badge && (
              <View
                style={[
                  styles.actionBadge,
                  {
                    backgroundColor:
                      action.badge === "Live"
                        ? colors.success
                        : colors.primary,
                  },
                ]}
              >
                <Caption1
                  style={{
                    color: "#FFFFFF",
                    fontFamily: FontFamily.bold,
                    fontSize: 9,
                    lineHeight: 11,
                  }}
                >
                  {action.badge === "Live" ? "LIVE" : action.badge}
                </Caption1>
              </View>
            )}
          </AnimatedPressable>
        </Animated.View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: Spacing[4],
    gap: Spacing[3],
    marginBottom: Spacing[5],
  },
  actionCardWrapper: {
    flex: 1,
  },
  actionCard: {
    flex: 1,
    borderRadius: Radius[400],
    padding: Spacing[4],
    alignItems: "center",
    borderWidth: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing[2],
  },
  actionBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: Radius.xs,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
