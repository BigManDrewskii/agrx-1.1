import React from "react";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { View, StyleSheet } from "react-native";
import { useColors } from "@/hooks/use-colors";

/**
 * HapticTab — Tab bar button with haptic feedback
 *
 * Wraps the default tab bar button to add haptic feedback on iOS.
 * Provides scale animation on press for visual feedback.
 */
export function HapticTab(props: BottomTabBarButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = (ev: any) => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    scale.value = withSpring(0.9, {
      damping: 15,
      stiffness: 200,
    });

    props.onPressIn?.(ev);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 180,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <PlatformPressable
        {...props}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      />
    </Animated.View>
  );
}

/**
 * AnimatedTabIcon — Tab icon with scale animation + active dot indicator
 *
 * When active: icon scales up slightly and a small dot appears beneath.
 * Uses spring physics for smooth, natural-feeling animation.
 */
export function AnimatedTabIcon({
  focused,
  children,
}: {
  focused: boolean;
  children: React.ReactNode;
}) {
  const colors = useColors();
  const scale = useSharedValue(focused ? 1.08 : 1);
  const dotOpacity = useSharedValue(focused ? 1 : 0);
  const dotScale = useSharedValue(focused ? 1 : 0.3);

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.08 : 1, {
      damping: 14,
      stiffness: 160,
    });
    dotOpacity.value = withTiming(focused ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
    dotScale.value = withSpring(focused ? 1 : 0.3, {
      damping: 14,
      stiffness: 200,
    });
  }, [focused, scale, dotOpacity, dotScale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
    transform: [{ scale: dotScale.value }],
  }));

  return (
    <View style={tabIconStyles.wrapper}>
      <Animated.View style={iconStyle}>{children}</Animated.View>
      <Animated.View
        style={[
          tabIconStyles.dot,
          { backgroundColor: colors.primary },
          dotStyle,
        ]}
      />
    </View>
  );
}

const tabIconStyles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
});
