/**
 * ScreenHeader — Unified header component for all screens
 *
 * Handles various header patterns across the app:
 * - Simple title only
 * - Title with actions
 * - Greeting with username
 * - Title with badges (LiveBadge, streak, notifications)
 *
 * Uses design tokens for all spacing.
 */
import React, { ReactNode } from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useColors } from "@/hooks/use-colors";
import { Footnote, Title1, Title2 } from "@/components/ui/cds-typography";
import { Spacing } from "@/constants/spacing";

interface ScreenHeaderProps {
  /** Primary title or greeting */
  title?: string;
  /** Optional subtitle (e.g., holdings count, greeting name) */
  subtitle?: string;
  /** Optional action buttons (right side) */
  actions?: ReactNode;
  /** Optional left side content (e.g., back button) */
  leftContent?: ReactNode;
  /** Custom container style */
  style?: ViewStyle;
  /** Horizontal padding (default: 16) */
  padding?: number;
  /** Show subtitle as greeting (smaller, muted) */
  isGreeting?: boolean;
}

export function ScreenHeader({
  title,
  subtitle,
  actions,
  leftContent,
  style,
  padding = Spacing[4],
  isGreeting = false,
}: ScreenHeaderProps) {
  const colors = useColors();

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={[
        styles.container,
        { paddingHorizontal: padding },
        style,
      ]}
    >
      <View style={styles.row}>
        {leftContent && <View style={styles.leftContent}>{leftContent}</View>}

        <View style={styles.titleSection}>
          {isGreeting && subtitle && (
            <Footnote color="muted" style={{ fontFamily: "System", fontSize: 13, fontWeight: "600" }}>
              {subtitle}
            </Footnote>
          )}
          {title && (isGreeting || !subtitle ? (
            <Title2 style={{ letterSpacing: -0.5 }}>{title}</Title2>
          ) : (
            <Title1>{title}</Title1>
          ))}
          {!isGreeting && subtitle && (
            <Footnote color="muted" style={{ fontFamily: "System", fontSize: 13, fontWeight: "600" }}>
              {subtitle}
            </Footnote>
          )}
        </View>

        {actions && <View style={styles.actions}>{actions}</View>}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing[2],
    paddingBottom: Spacing[3],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftContent: {
    marginRight: Spacing[3],
  },
  titleSection: {
    flex: 1,
    gap: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
  },
});
