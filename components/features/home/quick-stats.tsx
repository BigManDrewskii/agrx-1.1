/**
 * QuickStats — At-a-glance metrics for Simple view
 *
 * Shows key stats in a clean card row:
 * - Holdings count
 * - Today's P&L
 * - Current streak
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Caption1, Body } from "@/components/ui/cds-typography";
import { FontFamily } from "@/constants/typography";
import { Radius, Spacing } from "@/constants/spacing";
import { getShadow } from "@/constants/shadows";
import { useDemo } from "@/lib/demo-context";

interface QuickStatsProps {
  todayPnL?: number;
}

interface QuickStatProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  icon: string;
}

function QuickStat({ label, value, trend, icon }: QuickStatProps) {
  const colors = useColors();

  const getTrendColor = () => {
    if (trend === "up") return colors.success;
    if (trend === "down") return colors.error;
    return colors.warning;
  };

  return (
    <View style={styles.statItem}>
      <View
        style={[
          styles.iconBg,
          {
            backgroundColor: trend
              ? `${getTrendColor()}14`
              : `${colors.muted}14`,
          },
        ]}
      >
        <IconSymbol
          name={icon as any}
          size={16}
          color={trend ? getTrendColor() : colors.muted}
        />
      </View>
      <Body
        style={{
          fontFamily: FontFamily.semibold,
          fontSize: 16,
          color:
            trend === "up"
              ? colors.success
              : trend === "down"
                ? colors.error
                : colors.foreground,
        }}
      >
        {value}
      </Body>
      <Caption1 style={{ color: colors.muted, fontSize: 11 }}>{label}</Caption1>
    </View>
  );
}

export function QuickStats({ todayPnL = 0 }: QuickStatsProps) {
  const colors = useColors();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";
  const { state } = useDemo();

  const holdingsCount = Object.keys(state.holdings).length;
  const streak = state.streak;

  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(180)}
      style={[
        styles.quickStats,
        {
          backgroundColor: colors.surface,
          borderColor: isDark ? colors.borderSubtle : colors.border,
        },
        getShadow("sm", isDark),
      ]}
    >
      <QuickStat
        label="Holdings"
        value={holdingsCount}
        icon="folder.fill"
      />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <QuickStat
        label="Today"
        value={todayPnL >= 0 ? `+€${todayPnL.toFixed(0)}` : `€${todayPnL.toFixed(0)}`}
        trend={todayPnL >= 0 ? "up" : "down"}
        icon="chart.line.uptrend.xyaxis"
      />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <QuickStat
        label="Streak"
        value={`${streak}d`}
        icon="flame.fill"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  quickStats: {
    flexDirection: "row",
    paddingVertical: Spacing[4],
    justifyContent: "space-evenly",
    alignItems: "center",
    marginHorizontal: Spacing[4],
    borderRadius: Radius[400],
    borderWidth: 1,
    marginBottom: Spacing[5],
  },
  statItem: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 40,
    opacity: 0.5,
  },
});
