/**
 * CDSChip — Coinbase Design System Chip with AGRX haptics
 *
 * Wraps CDS Chip component with AGRX's superior haptic feedback.
 * Maintains CDS styling while adding consistent press feedback.
 *
 * Usage:
 *   <CDSChip
 *     label="Banks"
 *     selected={isActive}
 *     onPress={() => onSelect("Banks")}
 *   />
 */
import React from "react";
import { Platform, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { Caption1, Caption2 } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

interface CDSChipProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  testID?: string;
  count?: number;
}

export function CDSChip({
  label,
  selected = false,
  disabled = false,
  onPress,
  testID,
  count,
}: CDSChipProps) {
  const colors = useColors();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const tapGesture = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      "worklet";
      scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
    })
    .onFinalize(() => {
      "worklet";
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    })
    .onEnd(() => {
      "worklet";
      if (onPress) {
        runOnJS(handlePress)();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const selectedBg = isDark ? colors.primaryAlpha : colors.primary;
  const selectedTextColor = isDark ? colors.primary : colors.onPrimary;
  const unselectedBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const unselectedBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        testID={testID}
        style={[
          styles.chip,
          animatedStyle,
          {
            backgroundColor: selected ? selectedBg : unselectedBg,
            borderColor: selected ? (isDark ? colors.primary + "40" : colors.primary) : unselectedBorder,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Caption1
          style={{
            color: selected ? selectedTextColor : colors.foreground,
            fontFamily: selected ? FontFamily.semibold : FontFamily.medium,
            letterSpacing: 0.1,
          }}
        >
          {label}
        </Caption1>
        {count !== undefined && (
          <Caption2
            style={{
              color: selected ? selectedTextColor : colors.muted,
              fontFamily: FontFamily.medium,
              opacity: 0.7,
            }}
          >
            {count}
          </Caption2>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    gap: 5,
  },
});
