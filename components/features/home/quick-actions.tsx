/**
 * QuickActions — Simple mode quick action buttons
 *
 * Enhanced card-based design with icons and badges for better UX.
 *
 * Usage:
 *   <QuickActions />
 */
import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useMarketStatus } from "@/hooks/use-market-status";
import { Caption1, Body } from "@/components/ui/cds-typography";
import { FontFamily } from "@/constants/typography";
import { Radius, Spacing } from "@/constants/spacing";
import { useDemo } from "@/lib/demo-context";
import { useWatchlist } from "@/lib/watchlist-context";

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: "primary" | "success" | "warning";
  route: string;
  badge?: string;
  accessibilityLabel: string;
  accessibilityHint: string;
}

export function QuickActions() {
  const colors = useColors();
  const router = useRouter();
  const { state } = useDemo();
  const { watchlist } = useWatchlist();
  const { isMarketOpen } = useMarketStatus();

  // Dynamic badges based on user data
  const holdingsCount = Object.keys(state.holdings).length;

  const QUICK_ACTIONS: QuickAction[] = [
    {
      id: "trade",
      label: "Trade",
      icon: "arrow.up.circle.fill",
      color: "primary",
      route: "/(tabs)/trade",
      accessibilityLabel: "Navigate to Trade screen",
      accessibilityHint: "Buy and sell stocks",
    },
    {
      id: "portfolio",
      label: "Portfolio",
      icon: "briefcase.fill",
      color: "success",
      route: "/(tabs)/portfolio",
      badge: `${holdingsCount} holdings`,
      accessibilityLabel: "Navigate to Portfolio screen",
      accessibilityHint: `View your ${holdingsCount} holdings and performance`,
    },
    {
      id: "markets",
      label: "Markets",
      icon: "chart.line.uptrend.xyaxis",
      color: "warning",
      route: "/(tabs)/markets",
      badge: isMarketOpen ? "Live" : undefined,
      accessibilityLabel: "Navigate to Markets screen",
      accessibilityHint: "Browse and search all stocks",
    },
  ];

  const getColor = (colorName: QuickAction["color"]) => {
    switch (colorName) {
      case "primary":
        return colors.primary;
      case "success":
        return colors.success;
      case "warning":
        return colors.gold;
      default:
        return colors.primary;
    }
  };

  const getSubtitle = (id: string, badge?: string) => {
    if (id === "portfolio" && badge) {
      return badge;
    }
    if (id === "markets" && badge === "Live" && isMarketOpen) {
      return "Market open";
    }
    return undefined;
  };

  return (
    <Animated.View style={styles.quickActions}>
      {QUICK_ACTIONS.map((action, index) => (
        <Animated.View
          key={action.id}
          entering={FadeInDown
            .duration(300)
            .delay(120 + index * 60)
            .springify()
            .damping(20)
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
                borderColor: colors.border,
              },
            ]}
            accessibilityLabel={action.accessibilityLabel}
            accessibilityHint={action.accessibilityHint}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: `${getColor(action.color)}33`, // 20% opacity
                },
              ]}
            >
              <IconSymbol
                name={action.icon as any}
                size={24}
                color={getColor(action.color)}
              />
              {action.badge && (
                <View
                  style={[
                    styles.actionBadge,
                    { backgroundColor: getColor(action.color) },
                  ]}
                >
                  <Caption1
                    style={{
                      color: colors.onPrimary,
                      fontFamily: FontFamily.bold,
                      fontSize: 9,
                      lineHeight: 11,
                    }}
                  >
                    {action.badge === "Live" ? "●" : action.badge.split(" ")[0]}
                  </Caption1>
                </View>
              )}
            </View>
            <Body
              style={{
                fontFamily: FontFamily.semibold,
                color: colors.foreground,
                fontSize: 15,
              }}
            >
              {action.label}
            </Body>
            {action.badge && getSubtitle(action.id, action.badge) && (
              <Caption1
                style={{
                  color: colors.muted,
                  marginTop: 2,
                  fontSize: 11,
                }}
              >
                {getSubtitle(action.id, action.badge)}
              </Caption1>
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
    gap: Spacing[3], // 12px
    marginBottom: Spacing[5], // 20px
  },
  actionCardWrapper: {
    flex: 1,
  },
  actionCard: {
    flex: 1,
    borderRadius: Radius[300], // 12px
    padding: Spacing[4], // 16px
    alignItems: "center",
    borderWidth: 1,
    // Shadow for elevation
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing[2], // 8px
  },
  actionBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
