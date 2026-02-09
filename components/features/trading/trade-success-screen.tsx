/**
 * TradeSuccessScreen — Trade confirmation screen
 *
 * Shows animated success icon, trade details, share CTA, and done button.
 * Clean, centered layout with proper responsive sizing.
 */
import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  FadeInDown,
  ZoomIn,
} from "react-native-reanimated";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors, colorAlpha } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { MonoLargeTitle } from "@/components/ui/typography";
import { Title1, Callout, Subhead, Caption1 } from "@/components/ui/cds-typography";
import { FontFamily } from "@/constants/typography";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const IS_SMALL = SCREEN_HEIGHT < 700;

interface TradeSuccessScreenProps {
  isBuy: boolean;
  shares: string;
  amount: number;
  ticker: string;
  onShare: () => void;
  onDone: () => void;
}

export function TradeSuccessScreen({
  isBuy,
  shares,
  amount,
  ticker,
  onShare,
  onDone,
}: TradeSuccessScreenProps) {
  const colors = useColors();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";
  const accentColor = isBuy ? colors.success : colors.error;

  return (
    <View style={styles.container}>
      {/* Success Icon */}
      <Animated.View
        entering={ZoomIn.duration(400).springify().damping(12)}
        style={styles.iconWrapper}
      >
        <View
          style={[styles.iconRingOuter, { backgroundColor: colorAlpha(accentColor, 0.05) }]}
        >
          <View
            style={[styles.iconRingInner, { backgroundColor: colorAlpha(accentColor, 0.10) }]}
          >
            <View
              style={[styles.iconCircle, { backgroundColor: accentColor }]}
            >
              <IconSymbol name="checkmark" size={IS_SMALL ? 28 : 32} color="#FFFFFF" />
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.View
        entering={FadeInDown.duration(350).delay(150).springify().damping(15)}
      >
        <Title1 style={styles.title}>
          {isBuy ? "Purchase Complete" : "Sale Complete"}
        </Title1>
      </Animated.View>

      {/* Amount */}
      <Animated.View
        entering={FadeInDown.duration(350).delay(250).springify().damping(15)}
      >
        <MonoLargeTitle style={[styles.amount, { color: colors.foreground }]}>
          €{amount.toFixed(2)}
        </MonoLargeTitle>
      </Animated.View>

      {/* Detail card */}
      <Animated.View
        entering={FadeInDown.duration(350).delay(350).springify().damping(15)}
        style={[
          styles.detailCard,
          {
            backgroundColor: colors.foregroundAlpha4,
            borderColor: colors.foregroundAlpha8,
          },
        ]}
      >
        <View style={styles.detailRow}>
          <Caption1
            style={{ fontSize: 12, color: colors.muted }}
          >
            {isBuy ? "Bought" : "Sold"}
          </Caption1>
          <Subhead style={{ fontFamily: FontFamily.semibold, color: colors.foreground }}>
            {shares} shares of {ticker}
          </Subhead>
        </View>
      </Animated.View>

      {/* Spacer */}
      <View style={{ flex: 1, minHeight: IS_SMALL ? 16 : 32 }} />

      {/* CTAs */}
      <Animated.View
        entering={FadeInDown.duration(350).delay(450).springify().damping(15)}
        style={styles.ctaContainer}
      >
        <AnimatedPressable
          variant="button"
          onPress={onShare}
          style={[
            styles.shareButton,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 10,
              elevation: 4,
            },
          ]}
        >
          <IconSymbol name="square.and.arrow.up" size={16} color={colors.onPrimary} />
          <Callout style={{ fontFamily: FontFamily.semibold, color: colors.onPrimary }}>
            Share with friends
          </Callout>
        </AnimatedPressable>

        <AnimatedPressable
          variant="icon"
          onPress={onDone}
          style={styles.doneButton}
        >
          <Subhead style={{ fontFamily: FontFamily.medium, color: colors.muted }}>
            Done
          </Subhead>
        </AnimatedPressable>
      </Animated.View>
    </View>
  );
}

const ICON_OUTER = IS_SMALL ? 96 : 110;
const ICON_INNER = IS_SMALL ? 76 : 88;
const ICON_CIRCLE = IS_SMALL ? 56 : 66;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  iconWrapper: {
    marginBottom: IS_SMALL ? 20 : 28,
  },
  iconRingOuter: {
    width: ICON_OUTER,
    height: ICON_OUTER,
    borderRadius: ICON_OUTER / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  iconRingInner: {
    width: ICON_INNER,
    height: ICON_INNER,
    borderRadius: ICON_INNER / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: ICON_CIRCLE,
    height: ICON_CIRCLE,
    borderRadius: ICON_CIRCLE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginBottom: 6,
    textAlign: "center",
  },
  amount: {
    fontSize: IS_SMALL ? 32 : 38,
    marginBottom: IS_SMALL ? 16 : 24,
    textAlign: "center",
  },
  detailCard: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    width: "100%",
    maxWidth: 280,
  },
  detailRow: {
    alignItems: "center",
    gap: 3,
  },
  ctaContainer: {
    width: "100%",
    alignItems: "center",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    width: "100%",
    marginBottom: 10,
  },
  doneButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
});
