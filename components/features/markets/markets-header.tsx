/**
 * MarketsHeader — Markets screen header with live badge and market status
 *
 * Displays title, live badge, and ATHEX market status (open/closed) with colored indicator.
 *
 * Usage:
 *   <MarketsHeader
 *     isLive={true}
 *     lastUpdated={lastUpdateTimestamp}
 *   />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";
import { useMarketStatus } from "@/hooks/use-market-status";
import { Caption1 } from "@/components/ui/cds-typography";
import { Title1 } from "@/components/ui/cds-typography";
import { FontFamily } from "@/constants/typography";
import { LiveBadge } from "@/components/ui/live-badge";

interface MarketsHeaderProps {
  isLive: boolean;
  lastUpdated?: number | null;
}

export function MarketsHeader({ isLive, lastUpdated }: MarketsHeaderProps) {
  const colors = useColors();
  const { isMarketOpen } = useMarketStatus();

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.container}>
      <Title1>Markets</Title1>
      <View style={styles.headerRight}>
        <LiveBadge isLive={isLive} lastUpdated={lastUpdated} />
        <View style={styles.marketStatus}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: isMarketOpen
                  ? colors.success
                  : colors.muted,
              },
            ]}
          />
          <Caption1
            color={isMarketOpen ? "success" : "muted"}
            style={{ fontFamily: FontFamily.semibold }}
          >
            {isMarketOpen ? "ATHEX Open" : "ATHEX Closed"}
          </Caption1>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  marketStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
