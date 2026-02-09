/**
 * AmountInput — Robinhood-inspired centered hero amount display
 *
 * Large centered amount with € prefix, subtle cursor blink,
 * and a MAX pill. Clean, minimal, and premium.
 *
 * Usage:
 *   <AmountInput
 *     value={amountText}
 *     onChange={setAmountText}
 *     validationError={error}
 *     isBuy={true}
 *     onMax={() => setAmountText(maxAmount)}
 *   />
 */
import React, { useRef, forwardRef, useEffect } from "react";
import { View, TextInput, StyleSheet, Platform } from "react-native";
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
            withTiming(1, { duration: 500 }),
            withTiming(0, { duration: 500 })
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

    // Dynamic font size based on value length
    const fontSize = value.length > 7 ? 36 : value.length > 5 ? 42 : 48;

    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
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
                  fontSize: fontSize * 0.65,
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
                    height: fontSize * 0.7,
                  },
                  cursorStyle,
                ]}
              />
            )}
          </View>
        </AnimatedPressable>

        {/* MAX pill */}
        <View style={styles.maxRow}>
          <AnimatedPressable
            variant="chip"
            onPress={onMax}
            style={[
              styles.maxButton,
              {
                backgroundColor: `${accentColor}15`,
                borderColor: `${accentColor}30`,
              },
            ]}
          >
            <Caption1
              style={{
                fontFamily: FontFamily.bold,
                fontSize: 11,
                letterSpacing: 1,
                color: accentColor,
              }}
            >
              MAX
            </Caption1>
          </AnimatedPressable>
        </View>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 8,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
  displayArea: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minHeight: 80,
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
    marginRight: 4,
    lineHeight: undefined,
  },
  amountText: {
    fontFamily: FontFamily.monoBold,
    lineHeight: undefined,
  },
  cursor: {
    width: 2.5,
    borderRadius: 1.5,
    marginLeft: 2,
  },
  maxRow: {
    marginTop: 8,
    alignItems: "center",
  },
  maxButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
});
