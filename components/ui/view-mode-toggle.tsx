import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useViewMode, type ViewMode } from "@/lib/viewmode-context";
import { Caption1, Body } from "@/components/ui/cds-typography";
import { FontFamily } from "@/constants/typography";
import { Spacing, Radius } from "@/constants/spacing";
import * as Haptics from "expo-haptics";
import { IconSymbol } from "@/components/ui/icon-symbol";

const MODES: { key: ViewMode; label: string; icon: string }[] = [
  { key: "simple", label: "Simple", icon: "circle.fill" },
  { key: "pro", label: "Pro", icon: "star.circle.fill" },
];

interface ViewModeToggleProps {
  /** Compact variant for inline use (e.g., in headers) */
  compact?: boolean;
}

export function ViewModeToggle({ compact = false }: ViewModeToggleProps) {
  const colors = useColors();
  const { mode, setMode } = useViewMode();

  const handlePress = async (newMode: ViewMode) => {
    if (newMode === mode) return;

    if (Platform.OS !== "web") {
      // Enhanced haptic pattern: Light → Success/Warning
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await new Promise(resolve => setTimeout(resolve, 50));
      await Haptics.notificationAsync(
        newMode === "pro"
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning
      );
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
                  shadowColor: colors.primary,
                },
              ],
            ]}
            accessibilityLabel={m.label}
            accessibilityRole="radio"
            accessibilityState={{ selected: isActive }}
          >
            <View style={styles.segmentContent}>
              <IconSymbol
                name={m.icon as any}
                size={compact ? 16 : 18}
                color={isActive ? colors.foreground : colors.muted}
              />
              <Body
                style={{
                  fontFamily: isActive ? FontFamily.semibold : FontFamily.medium,
                  color: isActive ? colors.foreground : colors.muted,
                  fontSize: compact ? 13 : 14,
                  letterSpacing: 0.4,
                }}
              >
                {m.label}
              </Body>
            </View>
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
    gap: Spacing[2],
  },
  containerCompact: {
    borderRadius: Radius[300], // Increased from Radius[200] (8px → 12px)
    padding: Spacing[1],
    gap: Spacing[2],
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
    paddingVertical: Spacing[2], // Increased from Spacing[1] (4px → 8px)
    paddingHorizontal: Spacing[4], // Increased from Spacing[3] (12px → 16px)
    borderRadius: Radius[300], // Increased from Radius[200] (8px → 12px)
  },
  segmentContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[1], // 4px gap between icon and text
  },
  segmentActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, // Increased from 0.08
    shadowRadius: 4, // Increased from 2
    elevation: 3, // Increased from 2
  },
});
