/**
 * Asset Detail Screen — Stock detail with chart, stats, and trade CTAs
 *
 * News section disabled. Uses design tokens for all spacing and colors.
 */
import React, { useState, useCallback, useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import ReAnimated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { CDSButton } from "@/components/ui/cds-button";
import { ScreenContainer } from "@/components/screen-container";
import { useColors, colorAlpha } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { AnimatedNumber, AnimatedPnLNumber } from "@/components/ui/animated-number";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { LiveBadge } from "@/components/ui/live-badge";
import { ChartSkeleton, Skeleton } from "@/components/ui/skeleton";
import { useStockQuote, useStockChart } from "@/hooks/use-stocks";
import { GREEK_STOCKS } from "@/lib/mock-data";
import { ShareCardModal } from "@/components/ui/share-card-modal";
import type { ShareCardData, ShareSentiment } from "@/components/ui/share-card";
import {
  Title3,
  Headline,
  Body,
  Callout,
  Subhead,
  Caption1,
  MonoBody,
  MonoSubhead,
} from "@/components/ui/typography";
import { Caption2, Footnote } from "@/components/ui/cds-typography";
import { FontFamily } from "@/constants/typography";
import { Spacing, Radius } from "@/constants/spacing";
import { CDSLineChart } from "@/components/ui/cds-line-chart";
import { useWatchlist } from "@/lib/watchlist-context";
import { useNotifications } from "@/lib/notification-context";
import { AddAlertModal } from "@/components/ui/add-alert-modal";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const TIME_PERIODS = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(0)}K`;
  return vol.toString();
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function AssetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";
  const [activePeriod, setActivePeriod] = useState("1D");
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const { getAlertsForStock } = useNotifications();
  const stockAlerts = getAlertsForStock(id ?? "");
  const hasActiveAlerts = stockAlerts.some((a) => a.enabled);

  const { stock, isLoading: quoteLoading, isLive } = useStockQuote(id ?? "");
  const { isWatchlisted, toggle: toggleWatchlist } = useWatchlist();
  const starred = isWatchlisted(id ?? "");
  const { chartData, isLoading: chartLoading } = useStockChart(id ?? "", activePeriod);

  // Fallback to mock data if stock not found
  const mockAsset = GREEK_STOCKS.find((s) => s.id === id);

  const ticker = stock?.ticker ?? mockAsset?.ticker ?? "---";
  const name = stock?.name ?? mockAsset?.name ?? "Unknown";
  const price = stock?.price ?? mockAsset?.price ?? 0;
  const change = stock?.change ?? mockAsset?.change ?? 0;
  const changePercent = stock?.changePercent ?? mockAsset?.changePercent ?? 0;
  const dayHigh = stock?.dayHigh ?? price * 1.02;
  const dayLow = stock?.dayLow ?? price * 0.98;
  const volume = stock?.volume ?? 0;
  const fiftyTwoWeekHigh = stock?.fiftyTwoWeekHigh ?? price * 1.2;
  const fiftyTwoWeekLow = stock?.fiftyTwoWeekLow ?? price * 0.8;
  const marketCap = stock?.marketCap ?? "N/A";

  const isPositive = change >= 0;

  // Build share card data
  const shareCardData: ShareCardData = {
    ticker,
    companyName: name,
    price,
    pnlAmount: change,
    pnlPercent: changePercent,
    sparkline: chartData.length > 0 ? chartData : (mockAsset?.sparkline ?? []),
    timeFrame: "Today",
  };

  const handleShare = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowShareModal(true);
  }, []);

  const handleAddAlert = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowAlertModal(true);
  }, []);

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ReAnimated.View entering={FadeIn.duration(200)} style={styles.header}>
          <AnimatedPressable
            variant="icon"
            onPress={() => router.back()}
            style={[
              styles.backButton,
              { backgroundColor: colors.surface },
            ]}
          >
            <IconSymbol name="chevron.right" size={20} color={colors.foreground} style={{ transform: [{ scaleX: -1 }] }} />
          </AnimatedPressable>
          <View style={styles.headerCenter}>
            <View style={styles.headerTitleRow}>
              <Title3>{ticker}</Title3>
              <LiveBadge isLive={isLive} />
            </View>
            <Footnote color="muted">{name}</Footnote>
          </View>
          <View style={styles.headerActions}>
            <AnimatedPressable
              variant="icon"
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                toggleWatchlist(id ?? "");
              }}
              style={[
                styles.iconButton,
                { backgroundColor: colors.surface },
              ]}
            >
              <IconSymbol
                name="star.fill"
                size={18}
                color={starred ? colors.gold : colors.muted}
              />
            </AnimatedPressable>
            <AnimatedPressable
              variant="icon"
              onPress={handleAddAlert}
              style={[
                styles.iconButton,
                {
                  backgroundColor: hasActiveAlerts
                    ? colorAlpha(colors.primary, 0.12)
                    : colors.surface,
                },
              ]}
            >
              <IconSymbol
                name={hasActiveAlerts ? "bell.badge.fill" : "bell.fill"}
                size={18}
                color={hasActiveAlerts ? colors.primary : colors.muted}
              />
            </AnimatedPressable>
            <AnimatedPressable
              variant="icon"
              onPress={handleShare}
              style={[
                styles.iconButton,
                { backgroundColor: colors.surface },
              ]}
            >
              <IconSymbol name="square.and.arrow.up" size={18} color={colors.foreground} />
            </AnimatedPressable>
          </View>
        </ReAnimated.View>

        {/* Price */}
        <ReAnimated.View entering={FadeInDown.duration(250).delay(60)} style={styles.priceContainer}>
          {quoteLoading ? (
            <>
              <Skeleton width={120} height={36} borderRadius={8} />
              <Skeleton width={80} height={20} borderRadius={6} style={{ marginTop: 8 }} />
            </>
          ) : (
            <>
              <AnimatedNumber
                value={price}
                prefix="€"
                decimals={2}
                style={{
                  fontSize: 36,
                  letterSpacing: -1,
                  marginBottom: Spacing[1],
                  fontFamily: FontFamily.monoBold,
                  color: colors.foreground,
                }}
              />
              <View style={styles.changeRow}>
                <AnimatedPnLNumber value={change} format="currency" size="md" showArrow={true} successColor={colors.success} errorColor={colors.error} mutedColor={colors.muted} />
                <Footnote color="muted"> · </Footnote>
                <AnimatedPnLNumber value={changePercent} format="percent" size="md" showArrow={false} successColor={colors.success} errorColor={colors.error} mutedColor={colors.muted} />
              </View>
            </>
          )}
        </ReAnimated.View>

        {/* Chart */}
        <ReAnimated.View entering={FadeInDown.duration(250).delay(120)} style={styles.chartContainer}>
          {chartLoading ? (
            <ChartSkeleton />
          ) : chartData.length < 2 ? (
            <View style={[styles.chartEmpty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Footnote color="muted">No chart data available</Footnote>
            </View>
          ) : (
            <CDSLineChart
              data={chartData.length > 0 ? chartData : (mockAsset?.sparkline ?? [])}
              height={200}
              positive={isPositive}
              showGradient={true}
              smooth={true}
              showDots={false}
              showGrid={true}
              gridLines={5}
            />
          )}
        </ReAnimated.View>

        {/* Time Period Selector */}
        <ReAnimated.View entering={FadeInDown.duration(250).delay(180)} style={styles.periodRow}>
          {TIME_PERIODS.map((period) => {
            const isActive = period === activePeriod;
            return (
              <AnimatedPressable
                key={period}
                variant="chip"
                onPress={() => setActivePeriod(period)}
                style={[
                  styles.periodButton,
                  isActive && { backgroundColor: colorAlpha(colors.primary, 0.12) },
                ]}
              >
                <Caption1
                  color={isActive ? "primary" : "muted"}
                  style={{
                    fontFamily: isActive ? FontFamily.bold : FontFamily.medium,
                    letterSpacing: 0.3,
                  }}
                >
                  {period}
                </Caption1>
              </AnimatedPressable>
            );
          })}
        </ReAnimated.View>

        {/* Key Stats */}
        <ReAnimated.View
          entering={FadeInDown.duration(250).delay(240)}
          style={[
            styles.statsCard,
            {
              backgroundColor: colors.surface,
              borderColor: isDark ? colors.borderSubtle : colors.border,
            },
          ]}
        >
          <View style={styles.statsGrid}>
            {[
              { label: "Market Cap", value: marketCap },
              { label: "Day Range", value: `€${dayLow.toFixed(2)} – €${dayHigh.toFixed(2)}` },
              { label: "Volume", value: volume > 0 ? formatVolume(volume) : "N/A" },
              { label: "52W Range", value: `€${fiftyTwoWeekLow.toFixed(2)} – €${fiftyTwoWeekHigh.toFixed(2)}` },
            ].map((stat) => (
              <View key={stat.label} style={styles.statItem}>
                <Caption1 color="muted" style={{ fontFamily: FontFamily.medium, marginBottom: 2 }}>
                  {stat.label}
                </Caption1>
                <Subhead style={{ fontFamily: FontFamily.semibold, fontSize: 14 }}>{stat.value}</Subhead>
              </View>
            ))}
          </View>
        </ReAnimated.View>

        {/* About Section */}
        <ReAnimated.View entering={FadeInDown.duration(250).delay(300)} style={styles.aboutSection}>
          <Title3 style={{ marginBottom: Spacing[3] }}>About {ticker}</Title3>
          <View
            style={[
              styles.aboutCard,
              {
                backgroundColor: colors.surface,
                borderColor: isDark ? colors.borderSubtle : colors.border,
              },
            ]}
          >
            <Body style={{ lineHeight: 22, color: colors.muted }}>
              {name} is listed on the Athens Stock Exchange (ATHEX). View real-time pricing, historical charts, and key statistics above. Use the Buy/Sell buttons below to execute demo trades.
            </Body>
          </View>
        </ReAnimated.View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View
        style={[
          styles.ctaContainer,
          {
            backgroundColor: colorAlpha(colors.background, 0.92),
            borderTopColor: colors.borderSubtle,
          },
        ]}
      >
        <CDSButton
          variant="success"
          onPress={() => router.push(`/(tabs)/trade?stockId=${id}&mode=buy`)}
          style={styles.ctaButton}
          accessibilityLabel={`Buy ${id}`}
        >
          Buy
        </CDSButton>
        <CDSButton
          variant="destructive"
          onPress={() => router.push(`/(tabs)/trade?stockId=${id}&mode=sell`)}
          style={styles.ctaButton}
          accessibilityLabel={`Sell ${id}`}
        >
          Sell
        </CDSButton>
      </View>

      {/* Share Card Modal */}
      <ShareCardModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        data={shareCardData}
      />

      {/* Add Price Alert Modal */}
      <AddAlertModal
        visible={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        stockId={id ?? ""}
        stockName={name}
        currentPrice={price}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing[5],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[3],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: Spacing[2],
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  priceContainer: {
    alignItems: "center",
    paddingBottom: Spacing[4],
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  chartContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: Spacing[4],
  },
  chartEmpty: {
    width: "100%",
    height: 200,
    borderRadius: Radius[400],
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  periodRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: Spacing[3],
    gap: 6,
  },
  periodButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius[200],
  },
  statsCard: {
    marginHorizontal: Spacing[4],
    borderRadius: Radius[400],
    borderWidth: 1,
    padding: Spacing[4],
    marginBottom: Spacing[5],
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  statItem: {
    width: "50%",
    paddingVertical: Spacing[2],
  },
  aboutSection: {
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[5],
  },
  aboutCard: {
    borderRadius: Radius[400],
    borderWidth: 1,
    padding: Spacing[4],
  },
  ctaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[3],
    paddingBottom: 36,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  ctaButton: {
    flex: 1,
    height: 52,
    borderRadius: Radius[400],
    alignItems: "center",
    justifyContent: "center",
  },
});
