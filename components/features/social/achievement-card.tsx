/**
 * AchievementCard — Achievement display card
 *
 * Shows achievement icon, title, description, and progress bar (if not unlocked).
 * Unlocked achievements show a badge instead of progress.
 * Uses design tokens for all spacing and colors.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { STAGGER_DELAY, STAGGER_MAX } from "@/lib/animations";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { Caption2 } from "@/components/ui/typography";
import { Subhead } from "@/components/ui/cds-typography";
import { FontFamily } from "@/constants/typography";
import { Spacing, Radius } from "@/constants/spacing";
import { getShadow } from "@/constants/shadows";
import type { Achievement } from "@/lib/mock-data";

interface AchievementCardProps {
  achievement: Achievement;
  index: number;
}

export function AchievementCard({ achievement, index }: AchievementCardProps) {
  const colors = useColors();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";
  const progressPercent = (achievement.progress / achievement.total) * 100;

  return (
    <Animated.View
      entering={FadeInDown.duration(250).delay(Math.min(index, STAGGER_MAX) * STAGGER_DELAY)}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: achievement.unlocked
            ? colors.warningAlpha
            : isDark ? colors.borderSubtle : colors.border,
          opacity: achievement.unlocked ? 1 : 0.7,
        },
        getShadow("sm", isDark),
      ]}
    >
      <Text style={styles.icon}>{achievement.icon}</Text>
      <Subhead
        style={{ fontFamily: FontFamily.bold, textAlign: "center", marginBottom: 4 }}
        numberOfLines={1}
      >
        {achievement.title}
      </Subhead>
      <Caption2
        color="muted"
        style={{ textAlign: "center", lineHeight: 15, marginBottom: Spacing[2] }}
        numberOfLines={2}
      >
        {achievement.description}
      </Caption2>

      {!achievement.unlocked ? (
        // Progress bar
        <View style={styles.progress}>
          <View style={[styles.bar, { backgroundColor: colors.surfaceSecondary }]}>
            <View
              style={[
                styles.fill,
                { backgroundColor: colors.warning, width: `${progressPercent}%` },
              ]}
            />
          </View>
          <Caption2 color="muted" style={{ fontFamily: FontFamily.monoMedium }}>
            {achievement.progress}/{achievement.total}
          </Caption2>
        </View>
      ) : (
        // Unlocked badge
        <View style={[styles.badge, { backgroundColor: colors.warningAlpha }]}>
          <IconSymbol name="checkmark" size={12} color={colors.warning} />
          <Caption2 style={{ color: colors.warning, fontFamily: FontFamily.semibold }}>
            Unlocked
          </Caption2>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "47%",
    borderRadius: Radius[400],
    borderWidth: 1,
    padding: Spacing[4],
    alignItems: "center",
  },
  icon: {
    fontSize: 32,
    marginBottom: Spacing[2],
  },
  progress: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 2,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    borderRadius: Radius[200],
  },
});
