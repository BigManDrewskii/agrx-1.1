import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useViewMode, type ViewMode } from "@/lib/viewmode-context";
import { Caption1 } from "@/components/ui/cds-typography";
import { FontFamily } from "@/constants/typography";
import { Spacing, Radius } from "@/constants/spacing";
import * as Haptics from "expo-haptics";

const MODES: { key: ViewMode; label: string }[] = [
  { key: "simple", label: "Simple" },
  { key: "pro", label: "Pro" },
];

interface ViewModeToggleProps {
  /** Compact variant for inline use (e.g., in headers) */
  compact?: boolean;
}

export function ViewModeToggle({ compact = false }: ViewModeToggleProps) {
  const colors = useColors();
  const { mode, setMode } = useViewMode();

  const handlePress = (newMode: ViewMode) => {
    if (newMode === mode) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setMode(newMode);
  };

  return (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
        { backgroundColor: colors.surfaceSecondary },
      ]}
    >
      {MODES.map((m) => {
        const isActive = mode === m.key;
        return (
          <AnimatedPressable
            key={m.key}
            variant="toggle"
            onPress={() => handlePress(m.key)}
            haptic={false}
            style={[
              styles.segment,
              compact && styles.segmentCompact,
              isActive && [
                styles.segmentActive,
                {
                  backgroundColor: colors.surface,
                  shadowColor: colors.border,
                },
              ],
            ]}
            accessibilityLabel={m.label}
            accessibilityRole="radio"
            accessibilityState={{ selected: isActive }}
          >
            <Caption1
              style={{
                fontFamily: isActive ? FontFamily.bold : FontFamily.medium,
                color: isActive ? colors.foreground : colors.muted,
                fontSize: compact ? 12 : 13,
                letterSpacing: 0.2,
              }}
            >
              {m.label}
            </Caption1>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: Radius[300],
    padding: Spacing[1],
  },
  containerCompact: {
    borderRadius: Radius[200],
    padding: Spacing[1],
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
    borderRadius: Radius[200],
  },
  segmentCompact: {
    paddingVertical: Spacing[1],
    paddingHorizontal: Spacing[3],
    borderRadius: Radius[200],
  },
  segmentActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
});
