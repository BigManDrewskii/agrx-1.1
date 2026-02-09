/**
 * Trade Screen — Buy and sell stocks with demo trading
 *
 * Three states: Stock Picker → Order Sheet → Success Screen.
 * Order sheet uses flex layout with fixed bottom SwipeToConfirm
 * that is always visible regardless of content height.
 */
import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  ScrollView,
  Keyboard,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenContainer } from "@/components/screen-container";
import { SearchBarWithClear } from "@/components/features/markets";
import { BuySellToggle, AmountInput, QuickAmountChips, OrderPreview, TradeSuccessScreen } from "@/components/features/trading";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { AssetRow } from "@/components/ui/asset-row";
import { LiveBadge } from "@/components/ui/live-badge";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StockListSkeleton } from "@/components/ui/skeleton";
import { SwipeToConfirm } from "@/components/ui/swipe-to-confirm";
import { ShareCardModal } from "@/components/ui/share-card-modal";
import { useColors, colorAlpha } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { useStockQuotes } from "@/hooks/use-stocks";
import { useDemo } from "@/lib/demo-context";
import { useViewMode } from "@/lib/viewmode-context";
import type { ShareCardData } from "@/components/ui/share-card";
import {
  Title1,
  Subhead,
  Callout,
  Caption1,
  MonoSubhead,
} from "@/components/ui/typography";
import { Footnote } from "@/components/ui/cds-typography";
import { FontFamily } from "@/constants/typography";
import { Spacing, Radius } from "@/constants/spacing";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const IS_SMALL = SCREEN_HEIGHT < 700;
const QUICK_AMOUNTS = [5, 10, 25, 50, 100, 250];

interface SelectedStock {
  id: string;
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline: number[];
  category: string;
}

export default function TradeScreen() {
  const colors = useColors();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { isSimple, isPro } = useViewMode();
  const [search, setSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<SelectedStock | null>(null);
  const [amountText, setAmountText] = useState("");
  const [isBuy, setIsBuy] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [tradeError, setTradeError] = useState<string | null>(null);
  const amountInputRef = useRef<TextInput>(null);
  const { stocks, isLoading, isLive, lastUpdated } = useStockQuotes();
  const { executeTrade, state: demoState, getHolding } = useDemo();

  // Handle URL params for stockId and mode from asset detail navigation
  React.useEffect(() => {
    if (params.stockId && stocks.length > 0) {
      const stock = stocks.find(s => s.id === params.stockId);
      if (stock) {
        setSelectedAsset(stock);
      }
    }
    if (params.mode === "buy" || params.mode === "sell") {
      setIsBuy(params.mode === "buy");
    }
  }, [params.stockId, params.mode, stocks]);

  // Parse amount from text input
  const parsedAmount = useMemo(() => {
    const num = parseFloat(amountText);
    if (isNaN(num) || num <= 0) return 0;
    return Math.round(num * 100) / 100;
  }, [amountText]);

  // Compute current holding for sell validation
  const currentHolding = selectedAsset ? getHolding(selectedAsset.id) : undefined;
  const currentShares = currentHolding?.shares ?? 0;
  const currentHoldingValue = selectedAsset ? currentShares * selectedAsset.price : 0;

  // Max amount available
  const maxAmount = useMemo(() => {
    if (isBuy) {
      return Math.floor(demoState.balance * 100) / 100;
    }
    return Math.floor(currentHoldingValue * 100) / 100;
  }, [isBuy, demoState.balance, currentHoldingValue]);

  // Validation
  const validationError = useMemo(() => {
    if (parsedAmount === 0) return null;
    if (parsedAmount < 1) return "Minimum trade amount is €1.00";
    if (isBuy && parsedAmount > demoState.balance) {
      return `Insufficient balance (€${demoState.balance.toFixed(2)} available)`;
    }
    if (!isBuy && parsedAmount > currentHoldingValue) {
      return `Insufficient shares (€${currentHoldingValue.toFixed(2)} available)`;
    }
    return null;
  }, [parsedAmount, isBuy, demoState.balance, currentHoldingValue]);

  const isValidAmount = parsedAmount >= 1 && !validationError;

  const filteredStocks = useMemo(() => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return stocks.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.ticker.toLowerCase().includes(q)
      );
    }
    return stocks.slice(0, 8);
  }, [stocks, search]);

  const handleAmountChange = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts.length === 2 && parts[1].length > 2) return;
    if (parts[0].length > 1 && parts[0].startsWith("0") && parts[0] !== "0") return;
    if (parts[0].length > 6) return;
    setAmountText(cleaned);
    setTradeError(null);
  }, []);

  const handleQuickAmount = useCallback((amount: number) => {
    setAmountText(amount.toString());
    setTradeError(null);
    Keyboard.dismiss();
  }, []);

  const handleMax = useCallback(() => {
    if (maxAmount > 0) {
      setAmountText(maxAmount.toFixed(2));
      setTradeError(null);
      Keyboard.dismiss();
    }
  }, [maxAmount]);

  const handleConfirm = useCallback(() => {
    if (!selectedAsset || !isValidAmount) return;
    setTradeError(null);
    const result = executeTrade({
      stockId: selectedAsset.id,
      ticker: selectedAsset.ticker,
      name: selectedAsset.name,
      type: isBuy ? "buy" : "sell",
      amount: parsedAmount,
      price: selectedAsset.price,
    });
    if (result.success) {
      setShowSuccess(true);
    } else {
      setTradeError(result.error ?? "Trade failed");
    }
  }, [selectedAsset, isValidAmount, parsedAmount, isBuy, executeTrade]);

  const handleDismissSuccess = useCallback(() => {
    setShowSuccess(false);
    setSelectedAsset(null);
    setAmountText("");
    setTradeError(null);
  }, []);

  // Build share card data from the current trade
  const shareCardData: ShareCardData | null = useMemo(() => {
    if (!selectedAsset || !parsedAmount) return null;
    const shares = parsedAmount / selectedAsset.price;
    return {
      ticker: selectedAsset.ticker,
      companyName: selectedAsset.name,
      price: selectedAsset.price,
      pnlAmount: 0,
      pnlPercent: selectedAsset.changePercent,
      sparkline: selectedAsset.sparkline,
      timeFrame: "Today" as const,
      tradeType: isBuy ? ("buy" as const) : ("sell" as const),
      tradeAmount: parsedAmount,
      shares,
    };
  }, [selectedAsset, parsedAmount, isBuy]);

  // Tab bar height for bottom padding
  const tabBarBottomPad = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 60 + tabBarBottomPad;

  // ─── Success Screen ─────────────────────────────────────────────
  if (showSuccess && selectedAsset && parsedAmount) {
    const shares = (parsedAmount / selectedAsset.price).toFixed(4);
    return (
      <ScreenContainer>
        <TradeSuccessScreen
          isBuy={isBuy}
          shares={shares}
          amount={parsedAmount}
          ticker={selectedAsset.ticker}
          onShare={() => setShowShareModal(true)}
          onDone={handleDismissSuccess}
        />
        {shareCardData && (
          <ShareCardModal
            visible={showShareModal}
            onClose={() => setShowShareModal(false)}
            data={shareCardData}
          />
        )}
      </ScreenContainer>
    );
  }

  // ─── Order Sheet ────────────────────────────────────────────────
  if (selectedAsset) {
    const balanceAfter = isBuy
      ? demoState.balance - parsedAmount
      : demoState.balance + parsedAmount;

    return (
      <ScreenContainer>
        <KeyboardAvoidingView
          style={styles.orderRoot}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? tabBarHeight : 0}
        >
          {/* ── Scrollable content ── */}
          <ScrollView
            contentContainerStyle={styles.sheetScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Header */}
            <View style={styles.sheetHeader}>
              <AnimatedPressable
                variant="icon"
                onPress={() => {
                  setSelectedAsset(null);
                  setAmountText("");
                  setTradeError(null);
                }}
                style={[
                  styles.closeButton,
                  { backgroundColor: colors.foregroundAlpha4 },
                ]}
              >
                <IconSymbol name="xmark" size={14} color={colors.muted} />
              </AnimatedPressable>
              <View style={styles.sheetTitleRow}>
                <Subhead style={{ fontFamily: FontFamily.semibold }}>
                  {selectedAsset.ticker}
                </Subhead>
                <LiveBadge isLive={isLive} />
              </View>
              <View style={{ width: 32 }} />
            </View>

            {/* Buy / Sell Toggle */}
            <BuySellToggle
              isBuy={isBuy}
              onChange={(buy) => { setIsBuy(buy); setTradeError(null); }}
            />

            {/* Asset Info Card */}
            <View
              style={[
                styles.assetCard,
                {
                  backgroundColor: colors.foregroundAlpha4,
                  borderColor: colors.foregroundAlpha8,
                },
              ]}
            >
              <View
                style={[
                  styles.assetIconSmall,
                  { backgroundColor: colors.foregroundAlpha8 },
                ]}
              >
                <Footnote
                  style={{
                    fontFamily: FontFamily.bold,
                    color: colors.primary,
                    fontSize: 11,
                  }}
                >
                  {selectedAsset.ticker.slice(0, 2)}
                </Footnote>
              </View>
              <View style={styles.assetInfoText}>
                <Subhead
                  style={{ fontFamily: FontFamily.semibold }}
                  numberOfLines={1}
                >
                  {selectedAsset.name}
                </Subhead>
              </View>
              <View style={styles.assetPriceBlock}>
                <MonoSubhead style={{ fontSize: 15, lineHeight: 20 }}>
                  €{selectedAsset.price.toFixed(2)}
                </MonoSubhead>
                <MonoSubhead
                  color={selectedAsset.changePercent >= 0 ? "success" : "error"}
                  style={{ fontSize: 11, textAlign: "right" }}
                >
                  {selectedAsset.changePercent >= 0 ? "▲" : "▼"}{" "}
                  {Math.abs(selectedAsset.changePercent).toFixed(2)}%
                </MonoSubhead>
              </View>
            </View>

            {/* Amount Hero */}
            <AmountInput
              ref={amountInputRef}
              value={amountText}
              onChange={handleAmountChange}
              validationError={validationError}
              isBuy={isBuy}
              onMax={handleMax}
            />

            {/* Available balance */}
            <View style={styles.availableRow}>
              {isBuy ? (
                <View style={styles.balanceInfo}>
                  <Footnote style={{ color: colors.muted, fontSize: 12 }}>
                    Available
                  </Footnote>
                  <MonoSubhead style={{ fontSize: 12, color: colors.foreground }}>
                    €{demoState.balance.toFixed(2)}
                  </MonoSubhead>
                </View>
              ) : (
                <View style={styles.balanceInfo}>
                  <Footnote style={{ color: colors.muted, fontSize: 12 }}>
                    You own
                  </Footnote>
                  <MonoSubhead style={{ fontSize: 12, color: colors.foreground }}>
                    {currentShares.toFixed(currentShares % 1 === 0 ? 0 : 4)} shares
                    {currentShares > 0 ? ` (€${currentHoldingValue.toFixed(2)})` : ""}
                  </MonoSubhead>
                </View>
              )}
            </View>

            {/* Validation Error */}
            {validationError && (
              <View
                style={[
                  styles.validationError,
                  { backgroundColor: colorAlpha(colors.error, 0.08) },
                ]}
              >
                <IconSymbol name="xmark" size={10} color={colors.error} />
                <Caption1
                  style={{
                    fontFamily: FontFamily.medium,
                    flex: 1,
                    color: colors.error,
                    fontSize: 12,
                  }}
                >
                  {validationError}
                </Caption1>
              </View>
            )}

            {/* Quick Amount Chips */}
            <QuickAmountChips
              amounts={QUICK_AMOUNTS}
              selectedAmount={parsedAmount}
              maxAmount={maxAmount}
              isBuy={isBuy}
              onSelect={handleQuickAmount}
            />

            {/* Order Preview */}
            {isValidAmount && isPro && (
              <OrderPreview
                amount={parsedAmount}
                price={selectedAsset.price}
                balanceAfter={balanceAfter}
                isBuy={isBuy}
              />
            )}
            {isValidAmount && isSimple && (
              <View style={styles.simplePreviewRow}>
                <Footnote style={{ color: colors.muted }}>
                  Balance after trade
                </Footnote>
                <MonoSubhead
                  style={{
                    fontSize: 13,
                    color: balanceAfter >= 0 ? colors.foreground : colors.error,
                  }}
                >
                  €{balanceAfter.toFixed(2)}
                </MonoSubhead>
              </View>
            )}

            {/* Trade Error */}
            {tradeError && (
              <View
                style={[
                  styles.errorBanner,
                  { backgroundColor: colorAlpha(colors.error, 0.08) },
                ]}
              >
                <IconSymbol name="xmark" size={10} color={colors.error} />
                <Caption1
                  style={{
                    fontFamily: FontFamily.medium,
                    flex: 1,
                    color: colors.error,
                  }}
                >
                  {tradeError}
                </Caption1>
              </View>
            )}
          </ScrollView>

          {/* ── Fixed bottom: Swipe to Confirm ── */}
          <View
            style={[
              styles.stickyBottom,
              {
                borderTopColor: colors.foregroundAlpha4,
                paddingBottom: tabBarHeight + Spacing[2],
              },
            ]}
          >
            <SwipeToConfirm
              label={
                isValidAmount
                  ? `Slide to ${isBuy ? "Buy" : "Sell"} €${parsedAmount.toFixed(2)}`
                  : ""
              }
              enabled={isValidAmount}
              onConfirm={handleConfirm}
              variant={isBuy ? "buy" : "sell"}
              disabledLabel={amountText ? "Fix amount to continue" : "Enter an amount"}
            />
          </View>
        </KeyboardAvoidingView>
      </ScreenContainer>
    );
  }

  // ─── Stock Picker ───────────────────────────────────────────────
  return (
    <ScreenContainer>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(200)} style={styles.header}>
        <Title1>Trade</Title1>
        <LiveBadge isLive={isLive} lastUpdated={lastUpdated} />
      </Animated.View>

      {/* Search */}
      <SearchBarWithClear
        value={search}
        onChange={setSearch}
        placeholder="Search for a stock to trade..."
        animationDelay={60}
      />

      {/* Quick Trade Label */}
      <Animated.View
        entering={FadeIn.duration(200).delay(120)}
        style={styles.quickLabel}
      >
        <Caption1
          style={{
            fontFamily: FontFamily.semibold,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            color: colors.muted,
            fontSize: 11,
          }}
        >
          {search.trim() ? "Search results" : "Popular stocks"}
        </Caption1>
      </Animated.View>

      {/* Stock List */}
      {isLoading ? (
        <StockListSkeleton count={6} />
      ) : (
        <FlatList
          data={filteredStocks}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.duration(250).delay(index * 40)}>
              <AssetRow
                id={item.id}
                name={item.name}
                ticker={item.ticker}
                price={item.price}
                changePercent={item.changePercent}
                sparkline={item.sparkline}
                onPress={() => {
                  setSelectedAsset(item);
                  setAmountText("");
                  setTradeError(null);
                }}
              />
            </Animated.View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconSymbol
                name="magnifyingglass"
                size={32}
                color={colors.muted}
              />
              <Callout
                style={{
                  color: colors.muted,
                  marginTop: Spacing[3],
                  textAlign: "center",
                }}
              >
                No stocks found for "{search}"
              </Callout>
            </View>
          }
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // Stock Picker
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[3],
  },
  quickLabel: {
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[2],
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: Spacing[12],
  },

  // Order Sheet
  orderRoot: {
    flex: 1,
  },
  sheetScroll: {
    flexGrow: 1,
    paddingBottom: Spacing[2],
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[1],
    paddingBottom: 10,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  assetCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing[4],
    marginBottom: IS_SMALL ? Spacing[2] : Spacing[3],
    paddingHorizontal: Spacing[3],
    paddingVertical: 10,
    borderRadius: Radius[300],
    borderWidth: 1,
    gap: 10,
  },
  assetIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  assetInfoText: {
    flex: 1,
  },
  assetPriceBlock: {
    alignItems: "flex-end",
  },
  availableRow: {
    marginTop: 2,
    marginBottom: 4,
    paddingHorizontal: Spacing[4],
    alignItems: "center",
  },
  balanceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  validationError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: Spacing[1],
    marginBottom: Spacing[1],
    marginHorizontal: Spacing[4],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius[200],
  },
  simplePreviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: Spacing[4],
    marginBottom: Spacing[3],
    paddingHorizontal: Spacing[1],
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: Spacing[4],
    marginBottom: Spacing[2],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius[200],
  },
  stickyBottom: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[2],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
