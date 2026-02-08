/**
 * SectorFilterChips — Horizontal scrollable sector filter chips
 *
 * Filter chips for "All", "Watchlist", and sector categories with badges showing counts.
 *
 * Usage:
 *   <SectorFilterChips
 *     activeFilter="All"
 *     onFilterChange={(filter) => setActiveFilter(filter)}
 *     sectorCounts={{ All: 135, "Banks": 25, ... }}
 *     watchlistCount={5}
 *   />
 */
import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { Caption1, Caption2 } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";
import { SECTORS, SECTOR_ICONS } from "@/lib/sectors";
import type { Sector } from "@/lib/sectors";

type FilterMode = "All" | "Watchlist" | string;

interface SectorFilterChipsProps {
  activeFilter: FilterMode;
  onFilterChange: (filter: FilterMode) => void;
  sectorCounts: Record<string, number>;
  watchlistCount: number;
  /** Animation delay in ms (default: 120) */
  animationDelay?: number;
}

export function SectorFilterChips({
  activeFilter,
  onFilterChange,
  sectorCounts,
  watchlistCount,
  animationDelay = 120,
}: SectorFilterChipsProps) {
  const colors = useColors();

  return (
    <Animated.View entering={FadeInDown.duration(250).delay(animationDelay)} style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipList}
      >
        {/* "All" chip */}
        <FilterChip
          label="All"
          count={sectorCounts.All ?? 0}
          isActive={activeFilter === "All"}
          onPress={() => onFilterChange("All")}
          colors={colors}
          activeColor={colors.primary}
        />

        {/* Watchlist chip */}
        <FilterChip
          label="★ Watchlist"
          count={watchlistCount}
          isActive={activeFilter === "Watchlist"}
          onPress={() => onFilterChange("Watchlist")}
          colors={colors}
          activeColor={colors.gold}
        />

        {/* Sector chips */}
        {SECTORS.map((sector) => {
          const isActive = activeFilter === sector;
          const count = sectorCounts[sector] ?? 0;
          if (count === 0) return null;
          return (
            <FilterChip
              key={sector}
              label={`${SECTOR_ICONS[sector]} ${sector}`}
              count={count}
              isActive={isActive}
              onPress={() => onFilterChange(sector)}
              colors={colors}
              activeColor={colors.primary}
            />
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

interface FilterChipProps {
  label: string;
  count: number;
  isActive: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
  activeColor: string;
}

function FilterChip({ label, count, isActive, onPress, colors, activeColor }: FilterChipProps) {
  return (
    <AnimatedPressable
      variant="chip"
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: isActive ? activeColor : colors.surface,
          borderColor: isActive ? activeColor : colors.border,
        },
      ]}
      accessibilityLabel={label}
      accessibilityRole="radio"
      accessibilityState={{ selected: isActive }}
    >
      <Caption1
        color={isActive ? "onPrimary" : "foreground"}
        style={{
          fontFamily: isActive ? FontFamily.bold : FontFamily.medium,
        }}
      >
        {label}
      </Caption1>
      <Caption2
        color={isActive ? "onPrimary" : "muted"}
        style={{ fontFamily: FontFamily.medium }}
      >
        {count}
      </Caption2>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  chipList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
});
