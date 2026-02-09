import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ width, height, borderRadius = 8, style }: SkeletonProps) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.surfaceSecondary,
          opacity,
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
            <Skeleton width={40} height={40} borderRadius={20} />
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
