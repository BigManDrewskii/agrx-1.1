/**
 * HomeHeader — Home screen header
 *
 * Clean, Robinhood-inspired header with avatar, greeting,
 * contextual badges, and action buttons.
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { LiveBadge } from "@/components/ui/live-badge";
import { useColors } from "@/hooks/use-colors";
import { Caption1, Caption2, Footnote, Title2 } from "@/components/ui/cds-typography";
import { FontFamily } from "@/constants/typography";
import { Spacing, Radius } from "@/constants/spacing";

interface HomeHeaderProps {
  greeting: string;
  userName: string;
  isPro: boolean;
  isLive: boolean;
  lastUpdated?: number | null;
  userStreak: number;
  unreadCount: number;
}

export function HomeHeader({
  greeting,
  userName,
  isPro,
  isLive,
  lastUpdated,
  userStreak,
  unreadCount,
}: HomeHeaderProps) {
  const colors = useColors();
  const router = useRouter();

  return (
    <Animated.View entering={FadeIn.duration(250)} style={styles.header}>
      <View style={styles.headerTop}>
        {/* Left: Avatar + Greeting */}
        <View style={styles.headerLeft}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryAlpha }]}>
            <Caption1
              style={{
                fontFamily: FontFamily.bold,
                color: colors.primary,
                fontSize: 15,
              }}
            >
              {userName.charAt(0)}
            </Caption1>
          </View>
          <View style={styles.greetingText}>
            <Footnote color="muted" style={{ letterSpacing: 0.2 }}>
              {greeting}
            </Footnote>
            <Title2 style={{ fontSize: 20 }}>{userName}</Title2>
          </View>
        </View>

        {/* Right: Badges + Actions */}
        <View style={styles.headerActions}>
          {isPro && <LiveBadge isLive={isLive} lastUpdated={lastUpdated} />}
          {isPro && userStreak > 0 && (
            <View
              style={[styles.streakBadge, { backgroundColor: colors.warningAlpha }]}
              accessibilityRole="text"
              accessibilityLabel={`${userStreak} day streak`}
            >
              <IconSymbol name="flame.fill" size={12} color={colors.warning} />
              <Caption1
                style={{
                  color: colors.warning,
                  fontFamily: FontFamily.bold,
                  fontSize: 11,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {userStreak}
              </Caption1>
            </View>
          )}
          <AnimatedPressable
            variant="icon"
            onPress={() => router.push("/notification-history")}
            style={[
              styles.iconButton,
              { backgroundColor: colors.surfaceSecondary },
            ]}
            accessibilityLabel={`Notifications${unreadCount > 0 ? ` (${unreadCount > 9 ? "9+" : unreadCount} unread)` : ""}`}
            accessibilityHint="View notification history"
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <IconSymbol
              name="bell.fill"
              size={17}
              color={unreadCount > 0 ? colors.foreground : colors.muted}
            />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.error }]}>
                <Caption2
                  style={{
                    color: "#FFFFFF",
                    fontFamily: FontFamily.bold,
                    fontSize: 8,
                    lineHeight: 10,
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Caption2>
              </View>
            )}
          </AnimatedPressable>
          <AnimatedPressable
            variant="icon"
            onPress={() => router.push("/settings")}
            style={[
              styles.iconButton,
              { backgroundColor: colors.surfaceSecondary },
            ]}
            accessibilityLabel="Settings"
            accessibilityHint="Open app settings"
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <IconSymbol name="gearshape.fill" size={17} color={colors.muted} />
          </AnimatedPressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[3],
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[3],
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  greetingText: {
    gap: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
});
