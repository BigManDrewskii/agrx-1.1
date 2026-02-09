/**
 * P&L Share Card — The viral growth engine
 *
 * A beautifully designed 9:16 card optimized for Instagram Stories and TikTok.
 * Captures a user's trade or portfolio gain as a branded, shareable image.
 *
 * Design references: Robinhood confetti share, Coinbase share card, Binance PnL card.
 *
 * Features:
 *   - Multi-layer background with gradient overlay
 *   - Stock ticker + company name
 *   - P&L amount and percentage with color coding
 *   - Mini sparkline chart with gradient fill
 *   - Sentiment badge (Bullish/Bearish/Neutral)
 *   - Time frame label (Today / This Week / All Time)
 *   - AGRX branding footer with app logo reference
 *   - Light/dark theme support
 */

import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import Svg, {
  Polyline,
  Defs,
  LinearGradient,
  Stop,
  Path,
  Rect,
  Circle,
} from "react-native-svg";
import { FontFamily } from "@/constants/typography";
import { useColors } from "@/hooks/use-colors";
import { Spacing, Radius } from "@/constants/spacing";

// ─── Types ──────────────────────────────────────────────────────────────────

export type ShareTimeFrame = "Today" | "This Week" | "This Month" | "All Time";
export type ShareSentiment = "Bullish" | "Bearish" | "Neutral";

export interface ShareCardData {
  /** Stock ticker symbol (e.g., "OPAP") */
  ticker: string;
  /** Full company name */
  companyName: string;
  /** Current stock price */
  price: number;
  /** P&L amount in euros */
  pnlAmount: number;
  /** P&L percentage */
  pnlPercent: number;
  /** Sparkline data points for the mini chart */
  sparkline: number[];
  /** Time frame for the P&L */
  timeFrame: ShareTimeFrame;
  /** AI sentiment label */
  sentiment?: ShareSentiment;
  /** Sentiment confidence score (-1 to 1) */
  sentimentScore?: number;
  /** Number of shares held (optional, for trade cards) */
  shares?: number;
  /** Whether this is a buy or sell trade */
  tradeType?: "buy" | "sell";
  /** Trade amount in euros (for trade confirmation cards) */
  tradeAmount?: number;
  /** Theme preference for the share card */
  theme?: "light" | "dark";
}

// ─── Mini Chart Component ───────────────────────────────────────────────────

interface ShareCardChartProps {
  data: number[];
  width: number;
  height: number;
  positive: boolean;
  theme: "light" | "dark";
  colors: ReturnType<typeof useColors>;
}

function ShareCardChart({
  data,
  width,
  height,
  positive,
  theme,
  colors,
}: ShareCardChartProps) {
  if (!data || data.length < 2) return null;

  const color = positive ? colors.success : colors.error;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = Spacing[1]; // 4px
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartW;
    const y = padding + chartH - ((value - min) / range) * chartH;
    return { x, y };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Area fill path
  const areaPath = `M${points[0].x},${points[0].y} ${points
    .map((p) => `L${p.x},${p.y}`)
    .join(" ")} L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`;

  // Gradient opacity based on theme
  const gradientStart = theme === 'dark' ? 0.30 : 0.20;
  const gradientMid = theme === 'dark' ? 0.05 : 0.02;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="shareChartGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={gradientStart} />
          <Stop offset="0.7" stopColor={color} stopOpacity={gradientMid} />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={areaPath} fill="url(#shareChartGrad)" />
      <Polyline
        points={polylinePoints}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Sentiment Badge ────────────────────────────────────────────────────────

interface SentimentBadgeProps {
  sentiment: ShareSentiment;
  theme: "light" | "dark";
  colors: ReturnType<typeof useColors>;
}

function SentimentBadge({ sentiment, theme, colors }: SentimentBadgeProps) {
  // Helper function to add alpha to hex color
  const addAlpha = (hex: string, alpha: number) => {
    const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0');
    return `${hex}${alphaHex}`;
  };

  const bgColor =
    sentiment === "Bullish"
      ? addAlpha(colors.success, theme === 'dark' ? 0.12 : 0.15)
      : sentiment === "Bearish"
      ? addAlpha(colors.error, theme === 'dark' ? 0.12 : 0.15)
      : addAlpha(colors.warning, theme === 'dark' ? 0.12 : 0.15);
  const textColor =
    sentiment === "Bullish"
      ? colors.success
      : sentiment === "Bearish"
      ? colors.error
      : colors.warning;
  const icon = sentiment === "Bullish" ? "▲" : sentiment === "Bearish" ? "▼" : "●";

  return (
    <View style={[styles.sentimentBadge, { backgroundColor: bgColor }]}>
      <Text style={[styles.sentimentIcon, { color: textColor }]}>{icon}</Text>
      <Text style={[styles.sentimentText, { color: textColor }]}>{sentiment}</Text>
    </View>
  );
}

// ─── Main Share Card ────────────────────────────────────────────────────────

export function ShareCard({ data, ref }: { data: ShareCardData; ref?: React.Ref<View> }) {
    const colors = useColors();
    const theme = data.theme ?? 'dark'; // Default to dark mode

    const {
      ticker,
      companyName,
      price,
      pnlAmount,
      pnlPercent,
      sparkline,
      timeFrame,
      sentiment,
      shares,
      tradeType,
      tradeAmount,
    } = data;

    const isPositive = pnlPercent >= 0;
    const pnlColor = isPositive ? colors.success : colors.error;

    // Helper function to add alpha to hex color
    const addAlpha = (hex: string, alpha: number) => {
      const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0');
      return `${hex}${alphaHex}`;
    };

    // Theme-aware colors
    const bgColor = colors.background;
    const bgGradientColor = colors.surface;
    const pnlGlow = addAlpha(pnlColor, theme === 'dark' ? 0.25 : 0.15);
    const surfaceColor = colors.surface;
    const surfaceLightColor = addAlpha(colors.muted, theme === 'dark' ? 0.15 : 0.08);
    const primaryColor = colors.primary;

    const textPrimary = colors.foreground;
    const textSecondary = colors.muted;
    const textTertiary = colors.muted;

    const arrow = isPositive ? "▲" : "▼";
    const sign = isPositive ? "+" : "";

    const isTrade = tradeType !== undefined;

    return (
      <View ref={ref} style={[styles.card, { backgroundColor: bgColor }]} collapsable={false}>
        {/* Background gradient overlay */}
        <View style={[styles.bgGradient, { backgroundColor: bgGradientColor }]}>
          {/* Subtle radial glow behind P&L */}
          <View
            style={[
              styles.pnlGlow,
              { backgroundColor: pnlGlow },
            ]}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Top Row: Time frame + Sentiment */}
          <View style={styles.topRow}>
            <View style={[styles.timeFrameBadge, { backgroundColor: surfaceLightColor }]}>
              <Text style={[styles.timeFrameText, { color: textSecondary }]}>{timeFrame}</Text>
            </View>
            {sentiment && <SentimentBadge sentiment={sentiment} theme={theme} colors={colors} />}
          </View>

          {/* Trade Type Badge (for trade confirmations) */}
          {isTrade && (
            <View style={styles.tradeTypeBadge}>
              <View
                style={[
                  styles.tradeTypeDot,
                  {
                    backgroundColor: tradeType === "buy" ? colors.success : colors.error,
                  },
                ]}
              />
              <Text style={[styles.tradeTypeText, { color: textSecondary }]}>
                {tradeType === "buy" ? "Bought" : "Sold"}
                {tradeAmount ? ` €${tradeAmount.toFixed(0)}` : ""}
              </Text>
            </View>
          )}

          {/* Stock Ticker + Name */}
          <View style={styles.tickerSection}>
            <View style={[styles.tickerIconContainer, { backgroundColor: surfaceColor, borderColor: addAlpha(colors.border, 0.3) }]}>
              <Text style={[styles.tickerIconText, { color: primaryColor }]}>{ticker.slice(0, 2)}</Text>
            </View>
            <View style={styles.tickerInfo}>
              <Text style={[styles.tickerText, { color: textPrimary }]}>{ticker}</Text>
              <Text style={[styles.companyText, { color: textSecondary }]} numberOfLines={1}>
                {companyName}
              </Text>
            </View>
          </View>

          {/* Price */}
          <Text style={[styles.priceText, { color: textSecondary }]}>
            €{price.toFixed(2)}
          </Text>

          {/* P&L Hero */}
          <View style={styles.pnlSection}>
            <Text style={[styles.pnlAmount, { color: pnlColor }]}>
              {sign}€{Math.abs(pnlAmount).toFixed(2)}
            </Text>
            <View style={[styles.pnlPercentBadge, { backgroundColor: addAlpha(pnlColor, theme === 'dark' ? 0.12 : 0.15) }]}>
              <Text style={[styles.pnlPercentText, { color: pnlColor }]}>
                {arrow} {sign}{Math.abs(pnlPercent).toFixed(2)}%
              </Text>
            </View>
          </View>

          {/* Shares info */}
          {shares !== undefined && shares > 0 && (
            <Text style={[styles.sharesText, { color: textTertiary }]}>
              {shares.toFixed(4)} shares
            </Text>
          )}

          {/* Chart */}
          <View style={styles.chartContainer}>
            <ShareCardChart
              data={sparkline}
              width={280}
              height={120}
              positive={isPositive}
              theme={theme}
              colors={colors}
            />
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: addAlpha(colors.border, 0.3) }]} />

          {/* Footer: AGRX Branding */}
          <View style={styles.footer}>
            <View style={styles.brandRow}>
              <View style={[styles.logoContainer, { backgroundColor: primaryColor }]}>
                <Text style={[styles.logoText, { color: colors.onPrimary }]}>AGRX</Text>
              </View>
              <View style={styles.brandInfo}>
                <Text style={[styles.brandName, { color: textPrimary }]}>AGRX</Text>
                <Text style={[styles.brandTagline, { color: textTertiary }]}>Greek Stock Trading</Text>
              </View>
            </View>
            <View style={[styles.qrPlaceholder, { backgroundColor: surfaceColor, borderColor: addAlpha(colors.border, 0.3) }]}>
              <Text style={[styles.downloadText, { color: textTertiary }]}>Download{"\n"}the app</Text>
            </View>
          </View>
        </View>
      </View>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const CARD_WIDTH = 320;
const CARD_HEIGHT = 568; // ~9:16 ratio

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: Radius[300], // 24px
    overflow: "hidden",
  },
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  pnlGlow: {
    position: "absolute",
    top: "25%",
    left: "10%",
    width: "80%",
    height: "30%",
    borderRadius: 100,
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: Spacing[6], // 24px
    justifyContent: "space-between",
  },

  // Top row
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing[4], // 16px
  },
  timeFrameBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius[100], // 8px (pill)
  },
  timeFrameText: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // Sentiment
  sentimentBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius[100], // 8px (pill)
    gap: 4,
  },
  sentimentIcon: {
    fontSize: 9,
    fontFamily: FontFamily.bold,
  },
  sentimentText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // Trade type
  tradeTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: Spacing[2], // 8px
  },
  tradeTypeDot: {
    width: Spacing[2], // 8px
    height: Spacing[2], // 8px
    borderRadius: Radius[100], // 4px
  },
  tradeTypeText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
  },

  // Ticker
  tickerSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[3], // 12px
    marginBottom: Spacing[4], // 16px
  },
  tickerIconContainer: {
    width: 48, // ✅ 48px minimum touch target (was 44)
    height: 48, // ✅ 48px minimum touch target (was 44)
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  tickerIconText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
  },
  tickerInfo: {
    flex: 1,
  },
  tickerText: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    letterSpacing: 0.5,
  },
  companyText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    marginTop: 1,
  },

  // Price
  priceText: {
    fontFamily: FontFamily.monoBold,
    fontSize: 16,
    marginBottom: Spacing[1], // 4px
  },

  // P&L
  pnlSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[3], // 12px
    marginBottom: Spacing[1], // 4px
  },
  pnlAmount: {
    fontFamily: FontFamily.monoBold,
    fontSize: 32,
    letterSpacing: -0.5,
  },
  pnlPercentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius[100], // 8px (pill)
  },
  pnlPercentText: {
    fontFamily: FontFamily.monoBold,
    fontSize: 14,
  },

  // Shares
  sharesText: {
    fontFamily: FontFamily.mono,
    fontSize: 13,
    marginBottom: Spacing[2], // 8px
  },

  // Chart
  chartContainer: {
    alignItems: "center",
    marginVertical: Spacing[2], // 8px
  },

  // Divider
  divider: {
    height: 1,
    marginVertical: Spacing[3], // 12px
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: Radius[200], // 10px
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  brandInfo: {},
  brandName: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    letterSpacing: 1,
  },
  brandTagline: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    marginTop: 1,
  },
  qrPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: Radius[200], // 10px
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  downloadText: {
    fontFamily: FontFamily.semibold,
    fontSize: 8,
    textAlign: "center",
    lineHeight: 11,
  },
});
