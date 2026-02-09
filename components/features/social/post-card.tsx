/**
 * PostCard — Social feed post display
 *
 * Shows a user's post with avatar, username, content, P&L badge (if applicable),
 * and engagement actions (likes, comments, share).
 * Uses design tokens for all spacing and colors.
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Spacing, Radius } from "@/constants/spacing";
import { STAGGER_DELAY, STAGGER_MAX } from "@/lib/animations";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { AnimatedPnLNumber } from "@/components/ui/animated-number";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { Subhead, Caption1 } from "@/components/ui/typography";
import { Caption2, Footnote, Body } from "@/components/ui/cds-typography";
import { FontFamily } from "@/constants/typography";
import { getShadow } from "@/constants/shadows";
import type { SocialPost } from "@/lib/mock-data";

interface PostCardProps {
  post: SocialPost;
  index: number;
}

export function PostCard({ post, index }: PostCardProps) {
  const colors = useColors();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";

  return (
    <Animated.View
      entering={FadeInDown.duration(250).delay(Math.min(index, STAGGER_MAX) * STAGGER_DELAY)}
      style={[
        styles.postCard,
        {
          backgroundColor: colors.surface,
          borderColor: isDark ? colors.borderSubtle : colors.border,
        },
        getShadow("sm", isDark),
      ]}
    >
      {/* Header: avatar + username + timestamp + P&L badge */}
      <View style={styles.postHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryAlpha }]}>
          <Caption1 color="primary" style={{ fontFamily: FontFamily.bold }}>
            {post.avatar}
          </Caption1>
        </View>
        <View style={styles.postMeta}>
          <Subhead style={{ fontFamily: FontFamily.semibold }}>{post.username}</Subhead>
          <Caption1 color="muted" style={{ fontFamily: FontFamily.medium }}>{post.timestamp}</Caption1>
        </View>
        {post.pnlPercent !== undefined && (
          <View
            style={[
              styles.pnlBadge,
              {
                backgroundColor:
                  post.pnlPercent >= 0 ? colors.successAlpha : colors.errorAlpha,
              },
            ]}
          >
            <AnimatedPnLNumber
              value={post.pnlPercent}
              size="sm"
              showArrow={false}
              successColor={colors.success}
              errorColor={colors.error}
              mutedColor={colors.muted}
            />
          </View>
        )}
      </View>

      {/* Post content */}
      <Body style={{ lineHeight: 21, marginBottom: Spacing[3] }}>{post.content}</Body>

      {/* Asset tag (if present) */}
      {post.assetTag && (
        <View style={[styles.assetTag, { backgroundColor: colors.primaryAlpha }]}>
          <Footnote color="primary" style={{ fontFamily: FontFamily.semibold }}>
            ${post.assetTag}
          </Footnote>
        </View>
      )}

      {/* Footer: engagement actions */}
      <View style={[styles.postFooter, { borderTopColor: colors.border }]}>
        <AnimatedPressable
          variant="icon"
          style={styles.postAction}
          accessibilityLabel={`Like post by ${post.username}`}
          accessibilityRole="button"
        >
          <IconSymbol name="star.fill" size={16} color={colors.muted} />
          <Caption1 color="muted" style={{ fontFamily: FontFamily.semibold }}>
            {post.likes}
          </Caption1>
        </AnimatedPressable>
        <AnimatedPressable
          variant="icon"
          style={styles.postAction}
          accessibilityLabel={`Comment on post by ${post.username}`}
          accessibilityRole="button"
        >
          <IconSymbol name="paperplane.fill" size={16} color={colors.muted} />
          <Caption1 color="muted" style={{ fontFamily: FontFamily.semibold }}>
            {post.comments}
          </Caption1>
        </AnimatedPressable>
        <AnimatedPressable
          variant="icon"
          style={styles.postAction}
          accessibilityLabel={`Share post by ${post.username}`}
          accessibilityRole="button"
        >
          <IconSymbol name="square.and.arrow.up" size={16} color={colors.muted} />
        </AnimatedPressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  postCard: {
    borderRadius: Radius[400],
    borderWidth: 1,
    padding: Spacing[4],
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing[3],
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing[3],
  },
  postMeta: {
    flex: 1,
  },
  pnlBadge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 4,
    borderRadius: Radius[200],
  },
  assetTag: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing[3],
    paddingVertical: 4,
    borderRadius: Radius[200],
    marginBottom: Spacing[3],
  },
  postFooter: {
    flexDirection: "row",
    gap: Spacing[5],
    paddingTop: Spacing[3],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  postAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
