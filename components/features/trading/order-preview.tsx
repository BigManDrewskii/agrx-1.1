/**
 * OrderPreview — Order summary card for the trade flow (Pro mode)
 *
 * Clean card with key-value rows: estimated shares, price, commission, balance after.
 * Uses subtle surface background with proper spacing.
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useColors, colorAlpha } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { MonoSubhead } from "@/components/ui/typography";
import { Footnote, Caption1 } from "@/components/ui/cds-typography";
import { FontFamily } from "@/constants/typography";

interface OrderPreviewProps {
  amount: number;
  price: number;
  balanceAfter: number;
  isBuy?: boolean;
}

interface RowProps {
  label: string;
  value: string;
  valueColor?: string;
  badge?: string;
  badgeColor?: string;
  bold?: boolean;
  colors: ReturnType<typeof useColors>;
}

function Row({ label, value, valueColor, badge, badgeColor, bold, colors }: RowProps) {
  return (
    <View style={styles.row}>
      <Footnote
        style={{
          fontFamily: FontFamily.regular,
          color: colors.muted,
          fontSize: 13,
        }}
      >
        {label}
      </Footnote>
      <View style={styles.valueRow}>
        {badge && badgeColor && (
          <View
            style={[
              styles.badge,
              { backgroundColor: `${badgeColor}18` },
            ]}
          >
            <Caption1
              style={{
                fontFamily: FontFamily.bold,
                fontSize: 9,
                letterSpacing: 0.5,
                color: badgeColor,
              }}
            >
              {badge}
            </Caption1>
          </View>
        )}
        <MonoSubhead
          style={{
            fontSize: 13,
            color: valueColor || colors.foreground,
            fontFamily: bold ? FontFamily.monoMedium : FontFamily.mono,
          }}
        >
          {value}
        </MonoSubhead>
      </View>
    </View>
  );
}

export function OrderPreview({ amount, price, balanceAfter, isBuy = true }: OrderPreviewProps) {
  const colors = useColors();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";
  const shares = (amount / price).toFixed(4);

  return (
    <Animated.View
      entering={FadeInDown.duration(250).springify().damping(18)}
      style={[
        styles.container,
        {
          backgroundColor: colors.foregroundAlpha4,
          borderColor: colors.foregroundAlpha8,
        },
      ]}
    >
      {/* Header label */}
      <Caption1
        style={{
          fontFamily: FontFamily.semibold,
          color: colors.muted,
          fontSize: 11,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        Order Summary
      </Caption1>

      <Row label="Est. shares" value={shares} colors={colors} />
      <Row label="Market price" value={`€${price.toFixed(2)}`} colors={colors} />
      <Row
        label="Commission"
        value="€0.00"
        badge="FREE"
        badgeColor={colors.success}
        colors={colors}
      />

      {/* Divider */}
      <View
        style={[
          styles.divider,
          {
            backgroundColor: isDark
              ? colors.foregroundAlpha8
              : colors.foregroundAlpha4,
          },
        ]}
      />

      <Row
        label="Balance after"
        value={`€${balanceAfter.toFixed(2)}`}
        valueColor={balanceAfter >= 0 ? colors.foreground : colors.error}
        bold
        colors={colors}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 6,
  },
});
