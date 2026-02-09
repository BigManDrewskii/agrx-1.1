import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { LinearGradient } from "expo-linear-gradient";

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
  /** Use shimmer animation instead of pulse (default: true) */
  shimmer?: boolean;
}

/**
 * Skeleton — Loading placeholder with shimmer animation
 *
 * Displays a pulsing or shimmering placeholder while content is loading.
 * Uses native driver for smooth 60fps performance.
 *
 * Usage:
 *   <Skeleton width={100} height={20} />
 *   <Skeleton width="100%" height={100} borderRadius={12} />
 */
export function Skeleton({
  width,
  height,
  borderRadius = 8,
  style,
  shimmer = true,
}: SkeletonProps) {
  const colors = useColors();

  // Shimmer animation - horizontal gradient slide
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  // Pulse animation - simple opacity fade
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (shimmer) {
      // Shimmer: slide gradient from left to right
      const animation = Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        })
      );
      animation.start();
      return () => animation.stop();
    } else {
      // Pulse: fade in and out
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.7,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [shimmer, shimmerAnim, pulseAnim]);

  if (shimmer) {
    // Shimmer effect with gradient overlay
    return (
      <View
        style={[
          {
            width: width as any,
            height,
            borderRadius,
            backgroundColor: colors.surfaceSecondary,
            overflow: "hidden",
          },
          style,
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              transform: [
                {
                  translateX: shimmerAnim.interpolate({
                    inputRange: [-1, 1],
                    outputRange: [-300, 300],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[
              colors.surfaceSecondary + "00", // transparent
              colors.surfaceSecondary + "66", // 40% opacity
              colors.surfaceSecondary + "00", // transparent
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      </View>
    );
  }

  // Pulse effect (fallback)
  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.surfaceSecondary,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
}

export function StockRowSkeleton() {
  return (
    <View style={skeletonStyles.row}>
      <View style={skeletonStyles.left}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={skeletonStyles.textGroup}>
          <Skeleton width={60} height={14} />
          <Skeleton width={100} height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
      <View style={skeletonStyles.right}>
        <Skeleton width={50} height={30} />
        <View style={skeletonStyles.priceGroup}>
          <Skeleton width={55} height={14} />
          <Skeleton width={45} height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
    </View>
  );
}

export function StockListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <StockRowSkeleton key={i} />
      ))}
    </View>
  );
}

export function ChartSkeleton() {
  return (
    <View style={skeletonStyles.chart}>
      <Skeleton width="100%" height={200} borderRadius={12} />
    </View>
  );
}

export function SocialFeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={{ paddingHorizontal: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            padding: 16,
            marginBottom: 12,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'transparent',
          }}
        >
          {/* Header: avatar + username + badge */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Skeleton width={48} height={48} borderRadius={24} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Skeleton width={120} height={16} borderRadius={4} />
              <Skeleton width={80} height={12} borderRadius={4} style={{ marginTop: 4 }} />
            </View>
            <Skeleton width={60} height={24} borderRadius={8} />
          </View>

          {/* Content */}
          <Skeleton width="100%" height={16} borderRadius={4} />
          <Skeleton width="100%" height={16} borderRadius={4} style={{ marginTop: 6 }} />
          <Skeleton width={70} height={16} borderRadius={4} style={{ marginTop: 6 }} />

          {/* Footer */}
          <View style={{ flexDirection: 'row', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'transparent' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
              <Skeleton width={16} height={16} borderRadius={4} />
              <Skeleton width={30} height={12} borderRadius={4} style={{ marginLeft: 6 }} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
              <Skeleton width={16} height={16} borderRadius={4} />
              <Skeleton width={30} height={12} borderRadius={4} style={{ marginLeft: 6 }} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Skeleton width={16} height={16} borderRadius={4} />
              <Skeleton width={30} height={12} borderRadius={4} style={{ marginLeft: 6 }} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * PortfolioSkeleton — Portfolio screen loading state
 *
 * Shows placeholder for portfolio value, P&L, and holdings list.
 */
export function PortfolioSkeleton() {
  return (
    <View style={{ paddingHorizontal: 16 }}>
      {/* Portfolio Value Card */}
      <View style={{
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'transparent',
        marginBottom: 20,
      }}>
        <Skeleton width={150} height={14} borderRadius={4} style={{ marginBottom: 8 }} />
        <Skeleton width={200} height={32} borderRadius={4} style={{ marginBottom: 12 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Skeleton width={80} height={20} borderRadius={4} />
          <Skeleton width={60} height={20} borderRadius={4} />
        </View>
      </View>

      {/* Holdings Section */}
      <Skeleton width={120} height={16} borderRadius={4} style={{ marginBottom: 12 }} />

      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i} style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
          marginBottom: 8,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: 'transparent',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Skeleton width={48} height={48} borderRadius={24} />
            <View>
              <Skeleton width={80} height={16} borderRadius={4} />
              <Skeleton width={60} height={12} borderRadius={4} style={{ marginTop: 4 }} />
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Skeleton width={80} height={16} borderRadius={4} />
            <Skeleton width={60} height={12} borderRadius={4} style={{ marginTop: 4 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * TrendingSkeleton — Trending stocks section loading state
 *
 * Shows horizontal scrolling cards for trending stocks.
 */
export function TrendingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Skeleton width={100} height={16} borderRadius={4} />
        <Skeleton width={60} height={12} borderRadius={4} />
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        {Array.from({ length: count }).map((_, i) => (
          <View key={i} style={{
            width: 140,
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'transparent',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Skeleton width={32} height={32} borderRadius={16} />
              <Skeleton width={50} height={14} borderRadius={4} style={{ marginLeft: 8 }} />
            </View>
            <Skeleton width={80} height={16} borderRadius={4} style={{ marginBottom: 4 }} />
            <Skeleton width={60} height={12} borderRadius={4} />
          </View>
        ))}
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  textGroup: {
    gap: 2,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceGroup: {
    alignItems: "flex-end",
  },
  chart: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
