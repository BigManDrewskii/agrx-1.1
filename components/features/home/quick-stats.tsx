/**
 * QuickStats — Valuable at-a-glance metrics for Simple view
 *
 * Shows key stats without overwhelming beginners:
 * - Holdings count
 * - Today's P&L (passed from parent)
 * - Current streak
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Caption1, Body } from "@/components/ui/cds-typography";
import { FontFamily } from "@/constants/typography";
import { Radius, Spacing } from "@/constants/spacing";
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
      <IconSymbol
        name={icon as any}
        size={16}
        color={trend ? getTrendColor() : colors.muted}
      />
      <Caption1 style={{ color: colors.muted }}>{label}</Caption1>
      <Body
        style={{
          fontFamily: FontFamily.semibold,
          color: trend === "up" ? colors.success : trend === "down" ? colors.error : colors.foreground,
        }}
      >
        {value}
      </Body>
    </View>
  );
}

export function QuickStats({ todayPnL = 0 }: QuickStatsProps) {
  const colors = useColors();
  const { state } = useDemo();

  // Calculate stats from demo data
  const holdingsCount = Object.keys(state.holdings).length;
  const streak = state.streak;

  return (
    <Animated.View
      entering={FadeInDown.duration(250).delay(180)}
      style={[styles.quickStats, { backgroundColor: colors.surfaceSecondary }]}
    >
      <QuickStat
        label="Holdings"
        value={holdingsCount}
        icon="folder.fill"
      />
      <QuickStat
        label="Today"
        value={todayPnL >= 0 ? `+€${todayPnL.toFixed(0)}` : `€${todayPnL.toFixed(0)}`}
        trend={todayPnL >= 0 ? "up" : "down"}
        icon="chart.line.uptrend.xyaxis"
      />
      <QuickStat
        label="Streak"
        value={`${streak} days`}
        icon="flame.fill"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  quickStats: {
    flexDirection: "row",
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    justifyContent: "space-around",
    marginHorizontal: Spacing[4],
    borderRadius: Radius[300], // 12px
    marginBottom: Spacing[4],
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
});
