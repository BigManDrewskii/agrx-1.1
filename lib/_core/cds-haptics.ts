/**
 * CDS Haptic Integration Layer
 *
 * Injects AGRX haptic feedback into CDS components without modifying CDS code.
 * Uses React Native Reanimated worklet handlers for performance.
 *
 * Usage:
 *   import { triggerHaptic, COMPONENT_HAPTICS } from '@/lib/_core/cds-haptics';
 *
 *   // In worklet
 *   triggerHaptic('medium');
 *
 *   // Or use predefined haptic styles
 *   const hapticStyle = COMPONENT_HAPTICS.button;
 */
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { runOnJS } from "react-native-reanimated";

export type HapticStyle = "light" | "medium" | "heavy" | "none";

/**
 * Haptic intensity styles mapped to Expo Haptics API
 */
export const HAPTIC_STYLES = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
} as const;

/**
 * Worklet-safe haptic trigger.
 * Call from Reanimated gesture handlers or worklets.
 *
 * @param style - The intensity of haptic feedback
 *
 * Example:
 *   const tapGesture = Gesture.Tap().onEnd(() => {
 *     "worklet";
 *     runOnJS(triggerHaptic)('medium');
 *   });
 */
export function triggerHaptic(style: HapticStyle = "light") {
  "worklet";

  if (Platform.OS === "web") {
    return;
  }

  runOnJS(() => {
    if (style === "none") {
      return;
    }
    Haptics.impactAsync(HAPTIC_STYLES[style]);
  })();
}

/**
 * Predefined haptic styles for different component types.
 * Use these to maintain consistent haptic feedback across the app.
 */
export const COMPONENT_HAPTICS = {
  /** Primary buttons, CTAs - medium impact for confirmation */
  button: "medium" as HapticStyle,

  /** Chips, filters, toggles - light impact for subtle feedback */
  chip: "light" as HapticStyle,

  /** Toggle segments, binary switches - light impact */
  toggle: "light" as HapticStyle,

  /** Icon-only buttons - light impact */
  icon: "light" as HapticStyle,

  /** Cards, list items - no haptic (too frequent) */
  card: "none" as HapticStyle,

  /** Destructive actions - medium impact for warning */
  destructive: "medium" as HapticStyle,
} as const;
