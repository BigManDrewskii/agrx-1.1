/**
 * QuickAmountChips — Robinhood-inspired quick amount selector
 *
 * Horizontally scrollable row of preset amount pills.
 * Selected state shows accent color fill, disabled chips are dimmed.
 *
 * Usage:
 *   <QuickAmountChips
 *     amounts={[5, 10, 25, 50, 100, 250]}
 *     selectedAmount={10}
 *     maxAmount={100}
 *     isBuy={true}
 *     onSelect={(amount) => setAmountText(amount.toString())}
 *   />
 */
import React from "react";
import { View, ScrollView, StyleSheet, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { Footnote } from "@/components/ui/cds-typography";
import { FontFamily } from "@/constants/typography";

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
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";

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
                  ? accentColor
                  : isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.04)",
                borderColor: isSelected
                  ? accentColor
                  : isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
                opacity: isDisabled ? 0.35 : 1,
              },
            ]}
          >
            <Footnote
              style={{
                fontFamily: FontFamily.semibold,
                color: isSelected ? "#FFFFFF" : colors.foreground,
                fontSize: 13,
              }}
            >
              €{amount}
            </Footnote>
          </AnimatedPressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
});
