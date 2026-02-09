import React from "react";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { View } from "react-native";

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

    // Scale down slightly on press
    scale.value = withSpring(0.92, {
      damping: 15,
      stiffness: 180,
    });

    props.onPressIn?.(ev);
  };

  const handlePressOut = () => {
    // Scale back to normal
    scale.value = withSpring(1, {
      damping: 15,
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
 * AnimatedTabIcon — Tab icon with scale animation for active state
 *
 * Adds a subtle scale animation (1.0 → 1.1) when the tab becomes active.
 * Uses spring physics for smooth, natural-feeling animation.
 *
 * Usage in tabBarIcon:
 *   <AnimatedTabIcon focused={focused} color={color}>
 *     <IconSymbol size={24} name="house.fill" color={color} />
 *   </AnimatedTabIcon>
 */
export function AnimatedTabIcon({
  focused,
  children,
}: {
  focused: boolean;
  children: React.ReactNode;
}) {
  const scale = useSharedValue(focused ? 1.05 : 1);

  // Animate scale when focused state changes
  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.05 : 1, {
      damping: 12,
      stiffness: 150,
    });
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
