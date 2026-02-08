/**
 * SortOptionChips — Horizontal sort mode selector chips
 *
 * Sort options for stock list: Default, Top Gainers, Top Losers, Volume, A → Z
 *
 * Usage:
 *   <SortOptionChips
 *     sortMode="gainers"
 *     onSortChange={(mode) => setSortMode(mode)}
 *     stockCount={42}
 *   />
 */
import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useColors } from "@/hooks/use-colors";
import { Caption1, Caption2 } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

type SortMode = "default" | "gainers" | "losers" | "volume" | "alpha";

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: "default", label: "Default" },
  { key: "gainers", label: "Top Gainers" },
  { key: "losers", label: "Top Losers" },
  { key: "volume", label: "Volume" },
  { key: "alpha", label: "A → Z" },
];

interface SortOptionChipsProps {
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
  stockCount: number;
  /** Animation delay in ms (default: 180) */
  animationDelay?: number;
}

export function SortOptionChips({
  sortMode,
  onSortChange,
  stockCount,
  animationDelay = 180,
}: SortOptionChipsProps) {
  const colors = useColors();

  return (
    <Animated.View entering={FadeInDown.duration(250).delay(animationDelay)} style={styles.container}>
      <Caption1 color="muted" style={{ fontFamily: FontFamily.medium }}>
        {stockCount} {stockCount === 1 ? "stock" : "stocks"}
      </Caption1>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipList}
      >
        {SORT_OPTIONS.map((opt) => {
          const isActive = sortMode === opt.key;
          return (
            <AnimatedPressable
              key={opt.key}
              variant="chip"
              onPress={() => onSortChange(opt.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive
                    ? colors.primaryAlpha
                    : "transparent",
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
            >
              <Caption2
                color={isActive ? "primary" : "muted"}
                style={{
                  fontFamily: isActive
                    ? FontFamily.bold
                    : FontFamily.medium,
                }}
              >
                {opt.label}
              </Caption2>
            </AnimatedPressable>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    paddingBottom: 10,
    gap: 12,
  },
  chipList: {
    gap: 6,
    paddingRight: 16,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
});
