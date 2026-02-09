/**
 * CDSNumpad — Clean numeric keypad for trade amount entry
 *
 * Minimal design: no key backgrounds, subtle press highlight.
 * Responsive grid with proper touch targets.
 */
import React from "react";
import { View, StyleSheet, Dimensions, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { useColors, colorAlpha } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { FontFamily } from "@/constants/typography";
import { IconSymbol } from "./icon-symbol";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const IS_SMALL_SCREEN = SCREEN_HEIGHT < 700;

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

function NumpadKeyButton({
  keyValue,
  disabled,
}: {
  keyValue: NumpadKey;
  disabled: boolean;
}) {
  const colors = useColors();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";
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
      scale.value = withSpring(0.92, { damping: 15, stiffness: 250 });
      bgOpacity.value = withSpring(1, { damping: 15, stiffness: 250 });
    })
    .onFinalize(() => {
      "worklet";
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      bgOpacity.value = withSpring(0, { damping: 12, stiffness: 200 });
    })
    .onEnd(() => {
      "worklet";
      if (Platform.OS !== "web") {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {}
      }
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
        {/* Subtle press highlight */}
        <Animated.View
          style={[
            styles.keyHighlight,
            {
              backgroundColor: isDark
                ? colors.foregroundAlpha8
                : colors.foregroundAlpha4,
            },
            bgStyle,
          ]}
        />

        {isDelete ? (
          <IconSymbol
            name="delete.left"
            size={IS_SMALL_SCREEN ? 20 : 22}
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
}

export function CDSNumpad({
  onKeyPress,
  onDelete,
  disabled = false,
}: CDSNumpadProps) {
  // Wrap the key press handler to call the right callback
  const handleKeyPress = React.useCallback(
    (key: NumpadKey) => {
      if (key === "delete") {
        onDelete?.();
      } else {
        onKeyPress(key);
      }
    },
    [onKeyPress, onDelete]
  );

  return (
    <View style={styles.container}>
      {NUMPAD_LAYOUT.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((keyValue, keyIndex) => (
            <View key={`${rowIndex}-${keyIndex}`} style={styles.keyWrapper}>
              <NumpadKeyButton
                keyValue={keyValue}
                disabled={disabled}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const KEY_HEIGHT = IS_SMALL_SCREEN ? 48 : 54;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: IS_SMALL_SCREEN ? 2 : 4,
  },
  row: {
    flexDirection: "row",
    gap: 4,
  },
  keyWrapper: {
    flex: 1,
  },
  key: {
    height: KEY_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  keyHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  keyText: {
    fontSize: IS_SMALL_SCREEN ? 22 : 26,
    fontFamily: FontFamily.medium,
    lineHeight: IS_SMALL_SCREEN ? 28 : 32,
  },
  keyDisabled: {
    opacity: 0.4,
  },
});
