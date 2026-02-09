/**
 * CDS Wrapper Base Component
 *
 * Foundation for all AGRX-wrapped CDS components.
 * Handles:
 * - Haptic feedback injection
 * - Animated press feedback
 * - AGRX brand color mapping
 * - Motion language preservation
 *
 * Usage:
 *   import { CDSWrapper } from '@/components/ui/cds-wrapper-base';
 *
 *   <CDSWrapper onPress={handlePress} hapticStyle="medium" pressVariant="button">
 *     <CDSButton>Click me</CDSButton>
 *   </CDSWrapper>
 */
import React, { useRef } from "react";
import { View, type ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { triggerHaptic, type HapticStyle } from "@/lib/_core/cds-haptics";
import { SPRING_SNAPPY, PRESS } from "@/lib/animations";

export interface CDSWrapperProps {
  /** Content to wrap with haptic + animated press feedback */
  children: React.ReactNode;
  /** Press handler - triggers haptic + animation */
  onPress?: () => void;
  /** Haptic feedback intensity */
  hapticStyle?: HapticStyle;
  /** Press animation variant (affects scale + opacity) */
  pressVariant?: keyof typeof PRESS;
  /** Disable interactions */
  disabled?: boolean;
  /** Additional styles */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Base wrapper component that injects AGRX motion + haptics into any CDS component.
 *
 * This component:
 * 1. Wraps children with gesture detector
 * 2. Applies AGRX spring animations on press
 * 3. Triggers haptic feedback on press (native only)
 * 4. Respects disabled state
 */
export function CDSWrapper({
  children,
  onPress,
  hapticStyle = "light",
  pressVariant = "button",
  disabled = false,
  style,
  testID,
}: CDSWrapperProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const pressedConfig = PRESS[pressVariant];

  const handlePress = () => {
    triggerHaptic(hapticStyle);
    onPress?.();
  };

  const tapGesture = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      "worklet";
      scale.value = withSpring(pressedConfig.scale, SPRING_SNAPPY);
      opacity.value = withSpring(pressedConfig.opacity, SPRING_SNAPPY);
    })
    .onFinalize(() => {
      "worklet";
      scale.value = withSpring(1, SPRING_SNAPPY);
      opacity.value = withSpring(1, SPRING_SNAPPY);
    })
    .onEnd(() => {
      "worklet";
      if (onPress) {
        runOnJS(handlePress)();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        testID={testID}
        style={[animatedStyle, disabled && { opacity: 0.6 }, style]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
