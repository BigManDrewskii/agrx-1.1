import React from "react";
import { View, StyleSheet } from "react-native";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { Subhead } from "@/components/ui/typography";
import { Title3 } from "@/components/ui/cds-typography";
import { FontFamily } from "@/constants/typography";
import { Spacing } from "@/constants/spacing";
import { useColors } from "@/hooks/use-colors";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={[styles.accent, { backgroundColor: colors.primary }]} />
        <Title3 style={styles.title}>{title}</Title3>
      </View>
      {actionLabel && onAction && (
        <AnimatedPressable
          variant="icon"
          onPress={onAction}
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
        >
          <Subhead color="primary" style={styles.action}>
            {actionLabel}
          </Subhead>
        </AnimatedPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[3],
    marginTop: Spacing[2],
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  accent: {
    width: 3,
    height: 18,
    borderRadius: 1.5,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    letterSpacing: -0.3,
  },
  action: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
  },
});
