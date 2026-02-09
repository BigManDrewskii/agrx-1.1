/**
 * TradeSuccessScreen — Premium trade confirmation screen
 *
 * Shows animated success icon, trade details with clear hierarchy,
 * share CTA, and done button. Robinhood-inspired celebration feel.
 *
 * Usage:
 *   <TradeSuccessScreen
 *     isBuy={true}
 *     shares={10.5}
 *     amount={100}
 *     ticker="OPAP"
 *     onShare={() => setShowShareModal(true)}
 *     onDone={() => dismiss()}
 *   />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
} from "react-native-reanimated";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { MonoLargeTitle } from "@/components/ui/typography";
import { Title1, Callout, Subhead, Caption1 } from "@/components/ui/cds-typography";
import { FontFamily } from "@/constants/typography";

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
      {/* Success Icon with ring */}
      <Animated.View
        entering={ZoomIn.duration(400).springify().damping(12)}
        style={styles.iconWrapper}
      >
        <View
          style={[
            styles.iconRingOuter,
            { backgroundColor: `${accentColor}10` },
          ]}
        >
          <View
            style={[
              styles.iconRingInner,
              { backgroundColor: `${accentColor}20` },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: accentColor },
              ]}
            >
              <IconSymbol name="checkmark" size={36} color="#FFFFFF" />
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(150).springify().damping(15)}
      >
        <Title1 style={styles.title}>
          {isBuy ? "Purchase Complete" : "Sale Complete"}
        </Title1>
      </Animated.View>

      {/* Amount */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(250).springify().damping(15)}
      >
        <MonoLargeTitle style={[styles.amount, { color: colors.foreground }]}>
          €{amount.toFixed(2)}
        </MonoLargeTitle>
      </Animated.View>

      {/* Details */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(350).springify().damping(15)}
        style={[
          styles.detailCard,
          {
            backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
            borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          },
        ]}
      >
        <View style={styles.detailRow}>
          <Caption1 color="muted" style={{ fontSize: 12 }}>
            {isBuy ? "Bought" : "Sold"}
          </Caption1>
          <Subhead style={{ fontFamily: FontFamily.semibold, color: colors.foreground }}>
            {shares} shares of {ticker}
          </Subhead>
        </View>
      </Animated.View>

      {/* Spacer */}
      <View style={{ flex: 1, minHeight: 32 }} />

      {/* Share Button — Primary CTA */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(450).springify().damping(15)}
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
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 6,
            },
          ]}
        >
          <IconSymbol name="square.and.arrow.up" size={18} color={colors.onPrimary} />
          <Callout color="onPrimary" style={{ fontFamily: FontFamily.semibold }}>
            Share with friends
          </Callout>
        </AnimatedPressable>

        {/* Done Button — Secondary */}
        <AnimatedPressable
          variant="icon"
          onPress={onDone}
          style={styles.doneButton}
        >
          <Subhead color="muted" style={{ fontFamily: FontFamily.medium }}>
            Done
          </Subhead>
        </AnimatedPressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  iconWrapper: {
    marginBottom: 28,
  },
  iconRingOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  iconRingInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
  },
  amount: {
    fontSize: 40,
    marginBottom: 24,
    textAlign: "center",
  },
  detailCard: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    width: "100%",
    maxWidth: 300,
  },
  detailRow: {
    alignItems: "center",
    gap: 4,
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
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 28,
    width: "100%",
    marginBottom: 12,
  },
  doneButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
});
