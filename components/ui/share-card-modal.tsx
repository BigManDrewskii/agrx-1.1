/**
 * Share Card Modal — Full-screen overlay with the P&L share card preview,
 * time frame selector, and share/close buttons.
 *
 * This modal renders the ShareCard component inside a ViewShot-compatible
 * container, lets the user pick a time frame, then captures and shares.
 */

import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Modal,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { CDSButton } from "@/components/ui/cds-button";
import {
  ShareCard,
  type ShareCardData,
  type ShareTimeFrame,
} from "@/components/ui/share-card";
import { captureAndShare } from "@/lib/share-service";
import { FontFamily } from "@/constants/typography";
import { Radius } from "@/constants/spacing";
import {
  Title3,
  Callout,
  Subhead,
} from "@/components/ui/typography";
import { Caption1 } from "@/components/ui/cds-typography";
import * as Haptics from "expo-haptics";

const TIME_FRAMES: ShareTimeFrame[] = ["Today", "This Week", "This Month", "All Time"];

interface ShareCardModalProps {
  visible: boolean;
  onClose: () => void;
  data: ShareCardData;
  /** Called when time frame changes (parent can update P&L data) */
  onTimeFrameChange?: (timeFrame: ShareTimeFrame) => void;
}

export function ShareCardModal({
  visible,
  onClose,
  data,
  onTimeFrameChange,
}: ShareCardModalProps) {
  const colors = useColors();
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<ShareTimeFrame>(data.timeFrame);

  const handleTimeFrameChange = useCallback(
    (tf: ShareTimeFrame) => {
      setSelectedTimeFrame(tf);
      onTimeFrameChange?.(tf);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [onTimeFrameChange]
  );

  const handleShare = useCallback(async () => {
    setIsSharing(true);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const message = `Check out my ${data.ticker} gains on AGRX!`;
    await captureAndShare(cardRef, message);
    setIsSharing(false);
  }, [data.ticker]);

  const cardData: ShareCardData = {
    ...data,
    timeFrame: selectedTimeFrame,
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: `${colors.background}D9` }]}>
        {/* Close button */}
        <View style={styles.header}>
          <AnimatedPressable
            variant="icon"
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: colors.surface }]}
            accessibilityLabel="Close modal"
            accessibilityHint="Closes the share card modal and returns to the previous screen"
          >
            <IconSymbol name="xmark" size={20} color={colors.foreground} />
          </AnimatedPressable>
          <Title3 style={{ color: colors.foreground }}>Share Your Gains</Title3>
          <View style={{ width: 40 }} />
        </View>

        {/* Card Preview */}
        <View style={styles.cardWrapper}>
          <ShareCard ref={cardRef} data={cardData} />
        </View>

        {/* Time Frame Selector */}
        <View style={styles.timeFrameRow} accessibilityRole="radiogroup">
          {TIME_FRAMES.map((tf) => {
            const isActive = tf === selectedTimeFrame;
            return (
              <Pressable
                key={tf}
                onPress={() => handleTimeFrameChange(tf)}
                style={({ pressed }) => [
                  styles.timeFrameButton,
                  {
                    backgroundColor: isActive
                      ? `${colors.primary}33`
                      : `${colors.surface}0F`,
                  },
                  pressed && { opacity: 0.6 },
                ]}
                accessibilityLabel={tf}
                accessibilityRole="radio"
                accessibilityState={{ selected: isActive }}
              >
                <Caption1
                  style={{
                    fontFamily: isActive ? FontFamily.bold : FontFamily.medium,
                    color: isActive ? colors.primary : colors.muted,
                    fontSize: 11,
                  }}
                >
                  {tf}
                </Caption1>
                {isActive && (
                  <IconSymbol
                    name="checkmark"
                    size={10}
                    color={colors.primary}
                    style={{ position: "absolute", top: 4, right: 4 }}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Share Button */}
        <View style={styles.bottomActions}>
          <CDSButton
            variant="primary"
            onPress={handleShare}
            disabled={isSharing}
            loading={isSharing}
            accessibilityLabel="Share card"
            accessibilityHint="Shares the P&L card to social media or saves it to photos"
            style={styles.shareButton}
          >
            <IconSymbol name="square.and.arrow.up" size={20} color={colors.onPrimary} />
            <Callout
              style={{
                fontFamily: FontFamily.bold,
                color: colors.onPrimary,
                marginLeft: 8,
              }}
            >
              Share
            </Callout>
          </CDSButton>

          <Subhead
            style={{
              color: colors.muted,
              textAlign: "center",
              marginTop: 12,
              fontFamily: FontFamily.medium,
            }}
          >
            Optimized for Instagram Stories & TikTok
          </Subhead>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingTop: 60,
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: Radius[500],
    alignItems: "center",
    justifyContent: "center",
  },
  cardWrapper: {
    alignItems: "center",
    // Slight shadow for the card preview
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  timeFrameRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
    marginBottom: 24,
  },
  timeFrameButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius[300],
  },
  bottomActions: {
    width: "100%",
    paddingHorizontal: 16,
  },
  shareButton: {
    height: 56,
  },
});
