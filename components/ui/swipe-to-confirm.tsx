import React, { useCallback, useEffect } from "react";
import { View, StyleSheet, Platform, LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
  interpolateColor,
  runOnJS,
  Easing,
  clamp,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { FontFamily } from "@/constants/typography";
import { Spacing, Size } from "@/constants/spacing";
import { Caption1, Callout, Subhead } from "@/components/ui/cds-typography";

// ─── Constants ──────────────────────────────────────────────────────────
const THUMB_SIZE = 56; // 56px (14 * 4) - Fixed to 4px grid ✅
const TRACK_HEIGHT = 56; // 56px (14 * 4) - Fixed to 4px grid ✅
const TRACK_PADDING = Spacing[2]; // 8px - Fixed to 4px grid ✅
const COMPLETION_THRESHOLD = 0.95; // 95% of track to trigger
const HAPTIC_MILESTONES = [0.25, 0.5, 0.75]; // light haptic at these points

// Shadow layers for depth effect
const SHADOW_LIGHT_OFFSET = 2;
const SHADOW_LIGHT_RADIUS = 4;
const SHADOW_LIGHT_OPACITY = 0.1;

const SHADOW_MEDIUM_OFFSET = 4;
const SHADOW_MEDIUM_RADIUS = 8;
const SHADOW_MEDIUM_OPACITY = 0.15;

const SHADOW_HEAVY_OFFSET = 8;
const SHADOW_HEAVY_RADIUS = 16;
const SHADOW_HEAVY_OPACITY = 0.2;

// Inner glow effect
const INNER_GLOW_WIDTH = 1;
const INNER_GLOW_OPACITY = 0.3;

// Shimmer effect
const SHIMMER_WIDTH = 80;
const SHIMMER_OPACITY_START = 0.6;
const SHIMMER_OPACITY_END = 0.0;

interface SwipeToConfirmProps {
  /** Text displayed on the track (e.g., "Slide to Buy €50.00 OPAP") */
  label: string;
  /** Whether the component is in a valid/enabled state */
  enabled?: boolean;
  /** Called when the user completes the swipe */
  onConfirm: () => void;
  /** Color variant: 'buy' (green) or 'sell' (red) */
  variant?: "buy" | "sell";
  /** Text to show when disabled */
  disabledLabel?: string;
}

export function SwipeToConfirm({
  label,
  enabled = true,
  onConfirm,
  variant = "buy",
  disabledLabel = "Enter an amount",
}: SwipeToConfirmProps) {
  const colors = useColors();

  // ─── Shared values ──────────────────────────────────────────────────
  const translateX = useSharedValue(0);
  const trackWidth = useSharedValue(0);
  const isCompleted = useSharedValue(false);
  const lastMilestone = useSharedValue(0);
  const thumbScale = useSharedValue(1);
  const thumbIconScale = useSharedValue(1); // Icon scales within thumb during drag
  const shimmerTranslate = useSharedValue(0); // Shimmer position follows thumb
  const processingOpacity = useSharedValue(0); // "Processing..." text fade

  // Max distance the thumb can travel
  const maxTranslateX = trackWidth.value - THUMB_SIZE - TRACK_PADDING * 2;

  // Reset when enabled state changes
  useEffect(() => {
    translateX.value = withTiming(0, { duration: 200 });
    isCompleted.value = false;
    lastMilestone.value = 0;
    thumbScale.value = 1;
    thumbIconScale.value = 1;
    shimmerTranslate.value = 0;
    processingOpacity.value = 0;
  }, [enabled, label]);

  // ─── Haptic helpers (run on JS thread) ──────────────────────────────
  const triggerLightHaptic = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const triggerMediumHaptic = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  const triggerSuccessHaptic = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  // ─── Confirm handler (run on JS thread) ─────────────────────────────
  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  // ─── Track layout measurement ───────────────────────────────────────
  const onTrackLayout = useCallback(
    (event: LayoutChangeEvent) => {
      trackWidth.value = event.nativeEvent.layout.width;
    },
    [trackWidth]
  );

  // ─── Pan gesture ────────────────────────────────────────────────────
  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .onBegin(() => {
      thumbScale.value = withTiming(1.03, { duration: 100 });
      runOnJS(triggerLightHaptic)();
    })
    .onChange((event) => {
      if (isCompleted.value) return;

      const maxX = trackWidth.value - THUMB_SIZE - TRACK_PADDING * 2;
      if (maxX <= 0) return;

      const newX = clamp(event.translationX, 0, maxX);
      translateX.value = newX;

      // Progressive icon scale (1.0 → 1.1 based on progress)
      const progress = newX / maxX;
      thumbIconScale.value = 1 + progress * 0.1;

      // Update shimmer position to follow thumb center
      shimmerTranslate.value = newX + THUMB_SIZE / 2 - SHIMMER_WIDTH / 2;

      // Check milestones for haptic feedback
      for (const milestone of HAPTIC_MILESTONES) {
        if (progress >= milestone && lastMilestone.value < milestone) {
          lastMilestone.value = milestone;
          runOnJS(triggerLightHaptic)();
        }
      }
    })
    .onEnd(() => {
      const maxX = trackWidth.value - THUMB_SIZE - TRACK_PADDING * 2;
      if (maxX <= 0) return;

      const progress = translateX.value / maxX;

      if (progress >= COMPLETION_THRESHOLD) {
        // ✅ Completed — snap to end with elastic bounce, trigger confirm
        isCompleted.value = true;
        translateX.value = withSpring(maxX, {
          damping: 10,
          stiffness: 200,
          mass: 0.6,
        });
        thumbScale.value = withSequence(
          withTiming(1.08, { duration: 120 }),
          withTiming(1, { duration: 200 })
        );
        processingOpacity.value = withTiming(1, { duration: 200 });
        runOnJS(triggerSuccessHaptic)();
        runOnJS(handleConfirm)();
      } else {
        // ❌ Not enough — spring back to start
        translateX.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
          mass: 0.8,
        });
        lastMilestone.value = 0;
        runOnJS(triggerMediumHaptic)();
      }
    })
    .onFinalize(() => {
      thumbScale.value = withTiming(1, { duration: 100 });
      thumbIconScale.value = withTiming(1, { duration: 100 });
    });

  // ─── Animated styles ────────────────────────────────────────────────

  // Track fill color (progress bar behind thumb)
  const activeColor = variant === "buy" ? colors.success : colors.error;
  const activeColorAlpha =
    variant === "buy" ? colors.successAlpha : colors.errorAlpha;

  // Thumb position
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: thumbScale.value },
    ],
  }));

  // Progress fill behind the thumb
  const fillStyle = useAnimatedStyle(() => ({
    width: translateX.value + THUMB_SIZE + TRACK_PADDING,
  }));

  // Shimmer effect — follows thumb position
  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmerTranslate.value }],
    };
  });

  // Label opacity — fades as thumb moves
  const labelStyle = useAnimatedStyle(() => {
    const maxX = trackWidth.value - THUMB_SIZE - TRACK_PADDING * 2;
    const progress = maxX > 0 ? translateX.value / maxX : 0;
    return {
      opacity: interpolate(progress, [0, 0.35], [1, 0]),
    };
  });

  // Checkmark on completion
  const checkmarkStyle = useAnimatedStyle(() => {
    return {
      opacity: isCompleted.value ? withTiming(1, { duration: 200 }) : 0,
      transform: [
        {
          scale: isCompleted.value
            ? withSpring(1, { damping: 12, stiffness: 200 })
            : 0.5,
        },
      ],
    };
  });

  // Arrow icon on thumb — hides on completion
  const arrowStyle = useAnimatedStyle(() => {
    return {
      opacity: isCompleted.value ? withTiming(0, { duration: 150 }) : 1,
    };
  });

  // Thumb icon scale — scales within thumb during drag
  const thumbIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: thumbIconScale.value }],
    };
  });

  // Processing text — fades in on completion
  const processingStyle = useAnimatedStyle(() => {
    return {
      opacity: processingOpacity.value,
    };
  });

  // ─── Disabled state ─────────────────────────────────────────────────
  if (!enabled) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.track,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.border,
            },
          ]}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={disabledLabel}
        >
          <Callout
            color="muted"
            style={{ fontFamily: FontFamily.semibold, textAlign: "center" }}
          >
            {disabledLabel}
          </Callout>
        </View>
      </View>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={`Swipe right to ${variant === "buy" ? "buy" : "sell"}`}
      accessibilityState={{ disabled: !enabled }}
    >
      <View
        style={[
          styles.track,
          {
            backgroundColor: activeColorAlpha,
            borderColor: activeColor + "30",
          },
        ]}
        onLayout={onTrackLayout}
      >
        {/* Shimmer effect — gradient that follows thumb */}
        <Animated.View style={[styles.shimmer, shimmerStyle]}>
          <LinearGradient
            colors={[
              `${activeColor}00`,
              activeColor,
              `${activeColor}00`,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>

        {/* Progress fill */}
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: activeColor + "33" },
            fillStyle,
          ]}
        />

        {/* Label text */}
        <Animated.View style={[styles.labelContainer, labelStyle]}>
          <Subhead
            style={{
              fontFamily: FontFamily.semibold,
              color: activeColor,
              textAlign: "center",
              letterSpacing: 0.2,
              lineHeight: 20,
            }}
          >
            {label}
          </Subhead>
        </Animated.View>

        {/* Processing text — fades in on completion */}
        <Animated.View style={[styles.processingText, processingStyle]}>
          <Caption1
            style={{
              fontFamily: FontFamily.medium,
              color: colors.muted,
              textAlign: "center",
              letterSpacing: 0.1,
            }}
          >
            Confirmed
          </Caption1>
        </Animated.View>

        {/* Draggable thumb */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={styles.thumbHitArea}>
            {/* Shadow layer 1 - light */}
            <Animated.View
              style={[
                styles.thumbShadow,
                {
                  backgroundColor: "#000000",
                  opacity: SHADOW_LIGHT_OPACITY,
                  width: THUMB_SIZE,
                  height: THUMB_SIZE,
                  left: TRACK_PADDING + SHADOW_LIGHT_OFFSET,
                  top: SHADOW_LIGHT_OFFSET,
                  borderRadius: THUMB_SIZE / 2,
                },
                thumbStyle,
              ]}
            />
            {/* Shadow layer 2 - medium */}
            <Animated.View
              style={[
                styles.thumbShadow,
                {
                  backgroundColor: "#000000",
                  opacity: SHADOW_MEDIUM_OPACITY,
                  width: THUMB_SIZE,
                  height: THUMB_SIZE,
                  left: TRACK_PADDING + SHADOW_MEDIUM_OFFSET,
                  top: SHADOW_MEDIUM_OFFSET,
                  borderRadius: THUMB_SIZE / 2,
                },
                thumbStyle,
              ]}
            />
            {/* Shadow layer 3 - heavy */}
            <Animated.View
              style={[
                styles.thumbShadow,
                {
                  backgroundColor: "#000000",
                  opacity: SHADOW_HEAVY_OPACITY,
                  width: THUMB_SIZE,
                  height: THUMB_SIZE,
                  left: TRACK_PADDING + SHADOW_HEAVY_OFFSET,
                  top: SHADOW_HEAVY_OFFSET,
                  borderRadius: THUMB_SIZE / 2,
                },
                thumbStyle,
              ]}
            />
            <Animated.View
              style={[
                styles.thumb,
                {
                  backgroundColor: "#FFFFFF",
                  borderWidth: INNER_GLOW_WIDTH,
                  borderColor: `${activeColor}${Math.round(INNER_GLOW_OPACITY * 255).toString(16).padStart(2, '0')}`,
                },
                thumbStyle,
              ]}
            >
              {/* Arrow icon with scale animation */}
              <Animated.View style={[arrowStyle, thumbIconStyle]}>
                <IconSymbol
                  name="chevron.right"
                  size={22}
                  color={activeColor}
                />
              </Animated.View>

              {/* Checkmark icon (on completion) */}
              <Animated.View style={[styles.thumbCheckmark, checkmarkStyle]}>
                <IconSymbol name="checkmark" size={22} color={activeColor} />
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[6],
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    paddingHorizontal: Spacing[1],
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: TRACK_HEIGHT / 2,
  },
  shimmer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: SHIMMER_WIDTH,
    overflow: "hidden",
  },
  shimmerGradient: {
    width: "100%",
    height: "100%",
  },
  labelContainer: {
    position: "absolute",
    left: THUMB_SIZE + TRACK_PADDING + Spacing[3],
    right: Spacing[5],
    paddingHorizontal: Spacing[2],
    alignItems: "center",
  },
  processingText: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbHitArea: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  thumbShadow: {
    position: "absolute",
    borderRadius: THUMB_SIZE / 2,
  },
  thumb: {
    position: "absolute",
    left: TRACK_PADDING,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbCheckmark: {
    position: "absolute",
  },
});
