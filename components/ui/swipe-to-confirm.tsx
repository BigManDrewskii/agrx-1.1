import React, { useCallback, useEffect } from "react";
import { View, StyleSheet, Platform, LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
  withSpring,
  interpolate,
  runOnJS,
  clamp,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { Subhead } from "@/components/ui/cds-typography";

const THUMB_SIZE = 48; // ✅ Divisible by 4 (was 52)
const TRACK_HEIGHT = 52;
const COMPLETION_THRESHOLD = 0.9;

interface SwipeToConfirmProps {
  label: string;
  enabled?: boolean;
  onConfirm: () => void;
  variant?: "buy" | "sell";
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
  const { colorScheme } = useThemeContext();

  const translateX = useSharedValue(0);
  const trackWidth = useSharedValue(0);
  const isCompleted = useSharedValue(false);
  const labelOpacity = useSharedValue(1);

  const onTrackLayout = useCallback(
    (event: LayoutChangeEvent) => {
      trackWidth.value = event.nativeEvent.layout.width;
    },
    [trackWidth]
  );

  useEffect(() => {
    translateX.value = withTiming(0, { duration: 200 });
    isCompleted.value = false;
    labelOpacity.value = 1;
  }, [enabled, label]);

  const triggerSuccessHaptic = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const activeColor = variant === "buy" ? colors.success : colors.error;
  const activeColorAlpha = variant === "buy" ? colors.successAlpha : colors.errorAlpha;

  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .onStart(() => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    })
    .onChange((event) => {
      if (isCompleted.value) return;

      const maxX = trackWidth.value - THUMB_SIZE;
      if (maxX <= 0) return;

      const newX = clamp(event.translationX, 0, maxX);
      translateX.value = newX;

      const progress = newX / maxX;
      labelOpacity.value = interpolate(progress, [0, 0.25], [1, 0]);
    })
    .onEnd(() => {
      const maxX = trackWidth.value - THUMB_SIZE;
      if (maxX <= 0) return;

      const progress = translateX.value / maxX;

      if (progress >= COMPLETION_THRESHOLD) {
        isCompleted.value = true;
        translateX.value = withSpring(maxX, {
          damping: 12,
          stiffness: 200,
        });
        runOnJS(triggerSuccessHaptic)();
        runOnJS(handleConfirm)();
      } else {
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 200,
        });
        labelOpacity.value = withTiming(1, { duration: 200 });
      }
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: translateX.value + THUMB_SIZE / 2,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
  }));

  // Arrow opacity - shown when not completed
  const arrowOpacity = useDerivedValue(() => {
    return withTiming(isCompleted.value ? 0 : 1, { duration: 150 });
  });

  // Checkmark opacity - shown when completed
  const checkmarkOpacity = useDerivedValue(() => {
    return withTiming(isCompleted.value ? 1 : 0, { duration: 150 });
  });

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
          <Subhead
            style={{
              fontWeight: "600",
              color: colors.muted,
              textAlign: "center",
            }}
          >
            {disabledLabel}
          </Subhead>
        </View>
      </View>
    );
  }

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
            backgroundColor: colorScheme === 'dark' ? activeColorAlpha : activeColorAlpha,
            borderColor: colorScheme === 'dark' ? activeColor + '60' : activeColor + '40',
          },
        ]}
        onLayout={onTrackLayout}
      >
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: activeColor + (colorScheme === 'dark' ? '50' : '30') },
            fillStyle,
          ]}
        />

        <Animated.View style={[styles.labelContainer, labelStyle]}>
          <Subhead
            style={{
              fontWeight: "600",
              color: activeColor,
              textAlign: "center",
            }}
          >
            {label}
          </Subhead>
        </Animated.View>

        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.thumb, thumbStyle, { backgroundColor: colors.surface, shadowColor: colors.muted }]}>
            <Animated.View style={{ opacity: arrowOpacity }}>
              <IconSymbol size={22} name="chevron.right" color={activeColor} />
            </Animated.View>
            <Animated.View style={[styles.iconOverlay, { opacity: checkmarkOpacity }]}>
              <IconSymbol size={22} name="checkmark" color={activeColor} />
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: TRACK_HEIGHT / 2,
  },
  labelContainer: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
  },
  thumb: {
    position: "absolute",
    left: 0,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconOverlay: {
    position: "absolute",
  },
});
