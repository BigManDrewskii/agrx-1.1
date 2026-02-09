/**
 * CDSButton — Coinbase Design System Button with AGRX haptics
 *
 * Wraps button styling with AGRX's superior haptic feedback and animations.
 * Combines CDS visual design with AGRX motion language.
 * Supports both text-only and icon+text layouts.
 *
 * Usage:
 *   <CDSButton variant="primary" onPress={handleSubmit}>
 *     Submit
 *   </CDSButton>
 */
import React from "react";
import { Platform, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { FontFamily } from "@/constants/typography";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive" | "success";

interface CDSButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: object;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function CDSButton({
  children,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: CDSButtonProps) {
  const colors = useColors();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress?.();
  };

  const tapGesture = Gesture.Tap()
    .enabled(!disabled && !loading)
    .onBegin(() => {
      "worklet";
      scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
    })
    .onFinalize(() => {
      "worklet";
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    })
    .onEnd(() => {
      "worklet";
      // Handled by onResponderRelease
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: colors.primary,
          borderWidth: 0,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.2,
          shadowRadius: 8,
          elevation: 3,
        };
      case "secondary":
        return {
          backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
          borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)",
          borderWidth: 1,
        };
      case "tertiary":
        return {
          backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
          borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          borderWidth: 1,
        };
      case "destructive":
        return {
          backgroundColor: colors.error,
          borderWidth: 0,
          shadowColor: colors.error,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.2,
          shadowRadius: 8,
          elevation: 3,
        };
      case "success":
        return {
          backgroundColor: colors.success,
          borderWidth: 0,
          shadowColor: colors.success,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.2,
          shadowRadius: 8,
          elevation: 3,
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderWidth: 0,
        };
    }
  };

  const getContentColor = () => {
    switch (variant) {
      case "primary":
      case "destructive":
      case "success":
        return colors.onPrimary;
      case "secondary":
        return colors.primary;
      case "tertiary":
        return colors.foreground;
      default:
        return colors.primary;
    }
  };

  const contentColor = getContentColor();

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        testID={testID}
        onStartShouldSetResponder={() => !disabled && !loading}
        onResponderRelease={handlePress}
        style={[
          styles.button,
          animatedStyle,
          getVariantStyles(),
          { opacity: disabled || loading ? 0.5 : 1 },
          style,
        ]}
        accessible={!!accessibilityLabel}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: disabled || loading }}
      >
        {loading ? (
          <ActivityIndicator color={contentColor} />
        ) : typeof children === "string" ? (
          <Text style={[styles.text, { color: contentColor }]}>
            {children}
          </Text>
        ) : (
          <View style={styles.customContent}>
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                if (child.type === Text) {
                  const childProps = child.props as { style?: object; children?: React.ReactNode };
                  return React.cloneElement(child as React.ReactElement<any>, {
                    style: [childProps.style, { color: contentColor }],
                  });
                }
                if (child.type === View) {
                  const childProps = child.props as { style?: object; children?: React.ReactNode };
                  return React.cloneElement(child as React.ReactElement<any>, {
                    children: React.Children.map(childProps.children, (grandChild) => {
                      if (React.isValidElement(grandChild) && grandChild.type === Text) {
                        const grandChildProps = grandChild.props as { style?: object; children?: React.ReactNode };
                        return React.cloneElement(grandChild as React.ReactElement<any>, {
                          style: [grandChildProps.style, { color: contentColor }],
                        });
                      }
                      return grandChild;
                    }),
                  });
                }
              }
              return child;
            })}
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    minHeight: 50,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.2,
  },
  customContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
