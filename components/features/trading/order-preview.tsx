/**
 * OrderPreview — Premium order summary card (Pro mode)
 *
 * Displays estimated shares, live price, commission, and balance after trade.
 * Clean card with subtle elevation and refined row layout.
 *
 * Usage:
 *   <OrderPreview
 *     amount={100}
 *     price={25.50}
 *     balanceAfter={4500}
 *     isBuy={true}
 *   />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { MonoSubhead } from "@/components/ui/typography";
import { Footnote, Caption1 } from "@/components/ui/cds-typography";
import { FontFamily } from "@/constants/typography";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface OrderPreviewProps {
  amount: number;
  price: number;
  balanceAfter: number;
  isBuy?: boolean;
}

export function OrderPreview({ amount, price, balanceAfter, isBuy = true }: OrderPreviewProps) {
  const colors = useColors();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";

  const shares = (amount / price).toFixed(4);

  return (
    <Animated.View
      entering={FadeInDown.duration(300).springify().damping(18)}
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
          borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        },
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <IconSymbol
            name="doc.text"
            size={14}
            color={colors.muted}
          />
          <Caption1
            color="muted"
            style={{
              fontFamily: FontFamily.semibold,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              fontSize: 11,
            }}
          >
            Order Summary
          </Caption1>
        </View>
      </View>

      {/* Rows */}
      <Row
        label="Est. shares"
        value={shares}
        colors={colors}
      />
      <Row
        label="Price (live)"
        value={`€${price.toFixed(2)}`}
        colors={colors}
      />
      <Row
        label="Commission"
        value="€0.00"
        valueColor={colors.success}
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
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.06)",
          },
        ]}
      />

      {/* Balance after */}
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
      <Footnote color="muted" style={{ fontSize: 13 }}>
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
            fontFamily: bold ? FontFamily.monoBold : FontFamily.monoMedium,
          }}
        >
          {value}
        </MonoSubhead>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
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
