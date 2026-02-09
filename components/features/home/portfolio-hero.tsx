/**
 * PortfolioHero — Home screen portfolio hero
 *
 * Robinhood-inspired centered layout with prominent balance,
 * PnL pill, and sparkline with time period selectors (Pro).
 * Responsive: sparkline width adapts to screen size.
 */
import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useColors } from "@/hooks/use-colors";
import { CDSSparkline } from "@/components/ui/cds-sparkline";
import { AnimatedNumber, AnimatedPnLNumber } from "@/components/ui/animated-number";
import { Caption1 } from "@/components/ui/typography";
import { Footnote } from "@/components/ui/cds-typography";
import { FontFamily } from "@/constants/typography";
import { Spacing, Radius } from "@/constants/spacing";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SPARKLINE_WIDTH = Math.min(SCREEN_WIDTH - 48, 360);

interface PortfolioHeroProps {
  totalAccountValue: number;
  portfolioPnl: number;
  portfolioPnlPercent: number;
  isPro: boolean;
  portfolioSparkline: number[];
}

export function PortfolioHero({
  totalAccountValue,
  portfolioPnl,
  portfolioPnlPercent,
  isPro,
  portfolioSparkline,
}: PortfolioHeroProps) {
  const colors = useColors();
  const isPositive = portfolioPnl >= 0;

  return (
    <Animated.View entering={FadeInDown.duration(300).delay(60)} style={styles.portfolioHero}>
      {/* Label */}
      <Footnote color="muted" style={styles.label}>
        Total Balance
      </Footnote>

      {/* Big number */}
      <AnimatedNumber
        value={totalAccountValue}
        prefix="€"
        decimals={2}
        style={[
          styles.bigNumber,
          { color: colors.foreground },
        ]}
      />

      {/* PnL pill row */}
      <View
        style={[
          styles.pnlPill,
          {
            backgroundColor: isPositive ? colors.successAlpha : colors.errorAlpha,
          },
        ]}
      >
        <AnimatedPnLNumber
          value={portfolioPnl}
          format="currency"
          size="md"
          showArrow={true}
          successColor={colors.success}
          errorColor={colors.error}
          mutedColor={colors.muted}
        />
        <Footnote style={{ color: colors.muted, marginHorizontal: 4 }}>·</Footnote>
        <AnimatedPnLNumber
          value={portfolioPnlPercent}
          format="percent"
          size="md"
          showArrow={false}
          successColor={colors.success}
          errorColor={colors.error}
          mutedColor={colors.muted}
        />
      </View>

      {/* Sparkline + time selectors — Pro only */}
      {isPro && (
        <>
          <View style={styles.sparklineContainer}>
            <CDSSparkline
              data={portfolioSparkline}
              width={SPARKLINE_WIDTH}
              height={48}
              positive={isPositive}
              showGradient={true}
              smooth={true}
            />
          </View>
          <View
            style={styles.timePeriodRow}
            accessibilityRole="text"
            accessibilityLabel="Performance time period"
          >
            {["1D", "1W", "1M", "3M", "1Y", "ALL"].map((period, i) => (
              <AnimatedPressable
                key={period}
                variant="chip"
                style={[
                  styles.timePeriodButton,
                  i === 0 && {
                    backgroundColor: colors.primaryAlpha,
                  },
                ]}
                accessibilityLabel={`${period} performance`}
                accessibilityState={{ selected: i === 0 }}
                accessibilityRole="button"
              >
                <Caption1
                  color={i === 0 ? "primary" : "muted"}
                  style={{
                    fontFamily: i === 0 ? FontFamily.bold : FontFamily.medium,
                    letterSpacing: 0.3,
                  }}
                >
                  {period}
                </Caption1>
              </AnimatedPressable>
            ))}
          </View>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  portfolioHero: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[1],
    paddingBottom: Spacing[5],
    alignItems: "center",
  },
  label: {
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
    fontSize: 11,
    marginBottom: 4,
  },
  bigNumber: {
    fontSize: 38,
    lineHeight: 46,
    fontFamily: FontFamily.monoBold,
    letterSpacing: -0.5,
  },
  pnlPill: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  sparklineContainer: {
    marginTop: 16,
    alignItems: "center",
    width: "100%",
  },
  timePeriodRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 4,
  },
  timePeriodButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
});
