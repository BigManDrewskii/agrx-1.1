/**
 * CDSNumpad — Robinhood-inspired numeric keypad
 *
 * Clean, minimal number pad with transparent key backgrounds,
 * haptic feedback, and smooth press animations.
 * Keys are large touch targets with no visible borders.
 *
 * Usage:
 *   <CDSNumpad
 *     onKeyPress={(key) => handleInput(key)}
 *     onDelete={() => deleteChar()}
 *   />
 */
import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { FontFamily } from "@/constants/typography";
import { IconSymbol } from "./icon-symbol";

export type NumpadKey =
  | "1" | "2" | "3"
  | "4" | "5" | "6"
  | "7" | "8" | "9"
  | "." | "0"
  | "delete";

interface CDSNumpadProps {
  onKeyPress: (key: string) => void;
  onDelete?: () => void;
  disabled?: boolean;
}

const NUMPAD_LAYOUT: NumpadKey[][] = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "delete"],
];

export function CDSNumpad({
  onKeyPress,
  onDelete,
  disabled = false,
}: CDSNumpadProps) {
  const colors = useColors();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";

  const handleKeyPress = (key: NumpadKey) => {
    if (disabled) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (key === "delete") {
      onDelete?.();
    } else {
      onKeyPress(key);
    }
  };

  const NumpadKeyButton = ({ keyValue }: { keyValue: NumpadKey }) => {
    const scale = useSharedValue(1);
    const bgOpacity = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const bgStyle = useAnimatedStyle(() => ({
      opacity: bgOpacity.value,
    }));

    const tapGesture = Gesture.Tap()
      .enabled(!disabled)
      .onBegin(() => {
        "worklet";
        scale.value = withSpring(0.9, { damping: 15, stiffness: 250 });
        bgOpacity.value = withSpring(1, { damping: 15, stiffness: 250 });
      })
      .onFinalize(() => {
        "worklet";
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
        bgOpacity.value = withSpring(0, { damping: 12, stiffness: 200 });
      })
      .onEnd(() => {
        "worklet";
        handleKeyPress(keyValue);
      });

    const isDelete = keyValue === "delete";

    return (
      <GestureDetector gesture={tapGesture}>
        <Animated.View
          style={[
            styles.key,
            animatedStyle,
            disabled && styles.keyDisabled,
          ]}
        >
          {/* Press highlight */}
          <Animated.View
            style={[
              styles.keyHighlight,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.05)",
              },
              bgStyle,
            ]}
          />

          {isDelete ? (
            <IconSymbol
              name="delete.left"
              size={24}
              color={disabled ? colors.border : colors.muted}
            />
          ) : (
            <Animated.Text
              style={[
                styles.keyText,
                {
                  color: disabled ? colors.border : colors.foreground,
                },
              ]}
            >
              {keyValue}
            </Animated.Text>
          )}
        </Animated.View>
      </GestureDetector>
    );
  };

  return (
    <View style={styles.container}>
      {NUMPAD_LAYOUT.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((keyValue, keyIndex) => (
            <NumpadKeyButton key={`${rowIndex}-${keyIndex}`} keyValue={keyValue} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    gap: 4,
  },
  row: {
    flexDirection: "row",
    gap: 4,
  },
  key: {
    flex: 1,
    aspectRatio: 1.6,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  keyHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  keyText: {
    fontSize: 28,
    fontFamily: FontFamily.medium,
    lineHeight: 34,
  },
  keyDisabled: {
    opacity: 0.4,
  },
});
