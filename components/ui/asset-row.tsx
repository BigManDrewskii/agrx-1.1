import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useColors, colorAlpha } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { CDSSparkline } from "./cds-sparkline";
import { AnimatedNumber, AnimatedPnLNumber } from "./animated-number";
import { Caption1, Subhead } from "@/components/ui/cds-typography";
import { FontFamily } from "@/constants/typography";
import { Spacing, Radius } from "@/constants/spacing";
import { IconSymbol } from "./icon-symbol";
import type { Asset } from "@/lib/mock-data";

interface AssetRowProps {
  asset: Asset;
  onPress?: () => void;
  showSparkline?: boolean;
  showStar?: boolean;
  isWatchlisted?: boolean;
  onToggleWatchlist?: () => void;
}

export function AssetRow({
  asset,
  onPress,
  showSparkline = true,
  showStar = false,
  isWatchlisted = false,
  onToggleWatchlist,
}: AssetRowProps) {
  const colors = useColors();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";

  const handleStarPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggleWatchlist?.();
  };

  // Derive a subtle brand tint for the ticker icon
  const isPositive = asset.change >= 0;
  const tintColor = isPositive ? colors.success : colors.error;

  return (
    <AnimatedPressable
      variant="card"
      onPress={onPress}
      style={styles.container}
    >
      {/* Left: Icon + Name */}
      <View style={styles.left}>
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
          <Caption1
            style={{
              fontFamily: FontFamily.bold,
              letterSpacing: 0.5,
              color: tintColor,
            }}
          >
            {asset.ticker.slice(0, 2)}
          </Caption1>
        </View>
        <View style={styles.nameContainer}>
          <Subhead
            style={{ fontFamily: FontFamily.semibold, marginBottom: 1 }}
            numberOfLines={1}
          >
            {asset.ticker}
          </Subhead>
          <Caption1
            color="muted"
            style={{ fontFamily: FontFamily.regular, fontSize: 12 }}
            numberOfLines={1}
          >
            {asset.name}
          </Caption1>
        </View>
      </View>

      {/* Center: Sparkline */}
      {showSparkline && (
        <View style={styles.center}>
          <CDSSparkline
            data={asset.sparkline}
            width={60}
            height={28}
            positive={isPositive}
            showGradient={false}
            smooth={true}
          />
        </View>
      )}

      {/* Right: Price + Change + Star */}
      <View style={styles.rightGroup}>
        <View style={styles.right}>
          <AnimatedNumber
            value={asset.price}
            prefix="€"
            decimals={2}
            style={{
              fontSize: 15,
              lineHeight: 20,
              fontFamily: FontFamily.monoMedium,
              color: colors.foreground,
              marginBottom: 1,
            }}
          />
          <View
            style={[
              styles.changePill,
              {
                backgroundColor: isPositive
                  ? colors.successAlpha
                  : asset.change < 0
                    ? colors.errorAlpha
                    : "transparent",
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
        {showStar && (
          <AnimatedPressable
            variant="icon"
            onPress={handleStarPress}
            hitSlop={{ top: Spacing[2], bottom: Spacing[2], left: Spacing[2], right: Spacing[2] }}
            style={[styles.starButton, { minWidth: 44, minHeight: 44 }]}
            accessibilityLabel={`${isWatchlisted ? "Remove from" : "Add to"} watchlist`}
            accessibilityRole="button"
            accessibilityState={{ selected: isWatchlisted }}
          >
            <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
              <IconSymbol
                name="star.fill"
                size={18}
                color={isWatchlisted ? colors.gold : colorAlpha(colors.muted, 0.30)}
              />
            </View>
          </AnimatedPressable>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: Spacing[4],
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radius[300],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing[3],
  },
  nameContainer: {
    flex: 1,
  },
  center: {
    marginHorizontal: Spacing[3],
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  right: {
    alignItems: "flex-end",
  },
  changePill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.xs,
  },
  starButton: {
    padding: Spacing[1],
  },
});
