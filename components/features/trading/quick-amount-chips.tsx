/**
 * QuickAmountChips — Horizontal row of preset amount pills
 *
 * Scrollable row with preset amounts and a MAX button.
 * Selected state uses accent color. Disabled chips are dimmed.
 * Uses design tokens for all colors and spacing.
 */
import React from "react";
import { ScrollView, StyleSheet, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useColors, colorAlpha } from "@/hooks/use-colors";
import { Footnote } from "@/components/ui/cds-typography";
import { FontFamily } from "@/constants/typography";
import { Spacing, Radius } from "@/constants/spacing";

interface QuickAmountChipsProps {
  amounts: number[];
  selectedAmount: number;
  maxAmount: number;
  isBuy: boolean;
  onSelect: (amount: number) => void;
}

export function QuickAmountChips({
  amounts,
  selectedAmount,
  maxAmount,
  isBuy,
  onSelect,
}: QuickAmountChipsProps) {
  const colors = useColors();
  const accentColor = isBuy ? colors.success : colors.error;

  const handlePress = (amount: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSelect(amount);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.container}
    >
      {amounts.map((amount) => {
        const isSelected = selectedAmount === amount;
        const isDisabled = amount > maxAmount;

        return (
          <AnimatedPressable
            key={amount}
            variant="chip"
            onPress={() => !isDisabled && handlePress(amount)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected
                  ? colorAlpha(accentColor, 0.10)
                  : colors.foregroundAlpha4,
                borderColor: isSelected
                  ? colorAlpha(accentColor, 0.20)
                  : colors.foregroundAlpha8,
                opacity: isDisabled ? 0.35 : 1,
              },
            ]}
          >
            <Footnote
              style={{
                fontFamily: FontFamily.semibold,
                color: isSelected ? accentColor : colors.foreground,
                fontSize: 13,
              }}
            >
              €{amount}
            </Footnote>
          </AnimatedPressable>
        );
      })}

      {/* MAX chip */}
      <AnimatedPressable
        variant="chip"
        onPress={() => handlePress(maxAmount)}
        style={[
          styles.chip,
          {
            backgroundColor: selectedAmount === maxAmount
              ? colorAlpha(accentColor, 0.10)
              : colors.foregroundAlpha4,
            borderColor: selectedAmount === maxAmount
              ? colorAlpha(accentColor, 0.20)
              : colors.foregroundAlpha8,
          },
        ]}
      >
        <Footnote
          style={{
            fontFamily: FontFamily.bold,
            fontSize: 11,
            letterSpacing: 0.8,
            color: selectedAmount === maxAmount ? accentColor : colors.muted,
          }}
        >
          MAX
        </Footnote>
      </AnimatedPressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing[1],
    marginBottom: Spacing[3],
  },
  scrollContent: {
    paddingHorizontal: Spacing[4],
    gap: Spacing[2],
  },
  chip: {
    paddingHorizontal: Spacing[4],
    paddingVertical: 7,
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
});
