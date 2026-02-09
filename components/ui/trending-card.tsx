import React from "react";
import { View, StyleSheet } from "react-native";
import { useColors, colorAlpha } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { CDSSparkline } from "./cds-sparkline";
import { AnimatedNumber, AnimatedPnLNumber } from "./animated-number";
import { Caption1, Caption2, Subhead } from "@/components/ui/cds-typography";
import { FontFamily } from "@/constants/typography";
import { Spacing, Radius } from "@/constants/spacing";
import { getShadow } from "@/constants/shadows";
import { TrendingCardWidth } from "@/constants/layout";
import type { Asset } from "@/lib/mock-data";

interface TrendingCardProps {
  asset: Asset;
  onPress?: () => void;
}

export function TrendingCard({ asset, onPress }: TrendingCardProps) {
  const colors = useColors();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";
  const isPositive = asset.change >= 0;
  const tintColor = isPositive ? colors.success : colors.error;

  return (
    <AnimatedPressable
      variant="card"
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isDark ? colors.borderSubtle : colors.border,
        },
        getShadow("sm", isDark),
      ]}
    >
      {/* Header: Ticker icon + name */}
      <View style={styles.header}>
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: colorAlpha(tintColor, isDark ? 0.14 : 0.08),
              borderColor: colorAlpha(tintColor, isDark ? 0.22 : 0.14),
              borderWidth: 1,
            },
          ]}
        >
          <Caption2 style={{ fontFamily: FontFamily.bold, color: tintColor }}>
            {asset.ticker.slice(0, 2)}
          </Caption2>
        </View>
        <View style={styles.headerText}>
          <Subhead
            style={{ fontFamily: FontFamily.bold, fontSize: 14 }}
            numberOfLines={1}
          >
            {asset.ticker}
          </Subhead>
          <Caption2
            color="muted"
            style={{ fontFamily: FontFamily.regular }}
            numberOfLines={1}
          >
            {asset.name}
          </Caption2>
        </View>
      </View>

      {/* Sparkline */}
      <View style={styles.sparklineContainer}>
        <CDSSparkline
          data={asset.sparkline}
          width={108}
          height={36}
          positive={isPositive}
          showGradient={true}
          smooth={true}
        />
      </View>

      {/* Footer: Price + PnL pill */}
      <View style={styles.footer}>
        <AnimatedNumber
          value={asset.price}
          prefix="€"
          decimals={2}
          style={{
            fontSize: 15,
            lineHeight: 20,
            fontFamily: FontFamily.monoMedium,
            color: colors.foreground,
          }}
        />
        <View
          style={[
            styles.pnlPill,
            {
              backgroundColor: isPositive ? colors.successAlpha : colors.errorAlpha,
            },
          ]}
        >
          <AnimatedPnLNumber
            value={asset.changePercent}
            format="percent"
            size="sm"
            showArrow={false}
            successColor={colors.success}
            errorColor={colors.error}
            mutedColor={colors.muted}
          />
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: TrendingCardWidth,
    maxWidth: 180,
    borderRadius: Radius[400],
    borderWidth: 1,
    padding: Spacing[4],
    marginRight: Spacing[3],
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing[3],
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: Radius[300],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing[2],
  },
  headerText: {
    flex: 1,
  },
  sparklineContainer: {
    alignItems: "center",
    marginBottom: Spacing[3],
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pnlPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
});
