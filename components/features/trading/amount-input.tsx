/**
 * AmountInput — Centered hero amount display
 *
 * Large centered amount with € prefix. Clean, minimal.
 * Uses Dimensions for responsive sizing. Smooth font scaling.
 */
import React, { forwardRef, useEffect } from "react";
import { View, TextInput, StyleSheet, Dimensions, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  FadeIn,
} from "react-native-reanimated";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useColors } from "@/hooks/use-colors";
import { FontFamily } from "@/constants/typography";
import { Caption1 } from "@/components/ui/cds-typography";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface AmountInputProps {
  value: string;
  onChange: (text: string) => void;
  validationError?: string | null;
  isBuy: boolean;
  onMax: () => void;
}

export const AmountInput = forwardRef<TextInput, AmountInputProps>(
  ({ value, onChange, validationError, isBuy, onMax }, ref) => {
    const colors = useColors();

    // Blinking cursor when empty
    const cursorOpacity = useSharedValue(1);

    useEffect(() => {
      if (!value) {
        cursorOpacity.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 530 }),
            withTiming(0, { duration: 530 })
          ),
          -1,
          true
        );
      } else {
        cursorOpacity.value = 1;
      }
    }, [value]);

    const cursorStyle = useAnimatedStyle(() => ({
      opacity: cursorOpacity.value,
    }));

    const accentColor = validationError
      ? colors.error
      : isBuy
      ? colors.success
      : colors.error;

    const displayColor = value
      ? validationError
        ? colors.error
        : colors.foreground
      : colors.muted;

    // Smooth font size based on character count — responsive to screen width
    const baseFontSize = Math.min(SCREEN_WIDTH * 0.12, 52);
    const getFontSize = () => {
      const len = value.length;
      if (len > 8) return baseFontSize * 0.62;
      if (len > 6) return baseFontSize * 0.72;
      if (len > 4) return baseFontSize * 0.85;
      return baseFontSize;
    };
    const fontSize = getFontSize();

    return (
      <Animated.View entering={FadeIn.duration(250)} style={styles.container}>
        {/* Hidden TextInput for keyboard */}
        <TextInput
          ref={ref}
          style={styles.hiddenInput}
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          returnKeyType="done"
          maxLength={10}
          autoFocus={false}
          caretHidden={true}
        />

        {/* Visual display */}
        <AnimatedPressable
          variant="card"
          onPress={() => (ref as any)?.current?.focus()}
          style={styles.displayArea}
        >
          <View style={styles.amountRow}>
            <Animated.Text
              style={[
                styles.currencySign,
                {
                  color: displayColor,
                  fontSize: fontSize * 0.6,
                },
              ]}
            >
              €
            </Animated.Text>
            <Animated.Text
              style={[
                styles.amountText,
                {
                  color: displayColor,
                  fontSize,
                },
              ]}
            >
              {value || "0"}
            </Animated.Text>
            {!value && (
              <Animated.View
                style={[
                  styles.cursor,
                  {
                    backgroundColor: accentColor,
                    height: fontSize * 0.65,
                  },
                  cursorStyle,
                ]}
              />
            )}
          </View>
        </AnimatedPressable>

        {/* Use Max pill */}
        <AnimatedPressable
          variant="chip"
          onPress={onMax}
          style={[
            styles.maxButton,
            {
              backgroundColor: `${accentColor}12`,
              borderColor: `${accentColor}25`,
            },
          ]}
        >
          <Caption1
            style={{
              fontFamily: FontFamily.bold,
              fontSize: 10,
              letterSpacing: 1.2,
              color: accentColor,
            }}
          >
            USE MAX
          </Caption1>
        </AnimatedPressable>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 12,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
  displayArea: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    minHeight: 72,
    justifyContent: "center",
    alignItems: "center",
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },
  currencySign: {
    fontFamily: FontFamily.monoBold,
    marginRight: 3,
  },
  amountText: {
    fontFamily: FontFamily.monoBold,
  },
  cursor: {
    width: 2,
    borderRadius: 1,
    marginLeft: 2,
  },
  maxButton: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
});
