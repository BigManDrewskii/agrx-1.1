/**
 * Type-safe navigation helpers for AGRX
 *
 * Provides wrapper functions around Expo Router to eliminate `as any` type assertions
 * and improve type safety throughout the app.
 */
import { useRouter } from "expo-router";

type NavigateToTradeOptions = {
  stockId?: string;
  mode?: "buy" | "sell";
};

type NavigateToAssetOptions = {
  stockId: string;
};

/**
 * Hook providing type-safe navigation helpers
 *
 * Usage:
 *   const nav = useNavigation();
 *   nav.goToTrade({ stockId: "abc", mode: "buy" });
 *   nav.goToAsset({ stockId: "abc" });
 */
export function useNavigation() {
  const router = useRouter();

  return {
    /**
     * Navigate to trade screen with optional stock selection
     * @param options.stockId - Stock ID to pre-select
     * @param options.mode - "buy" or "sell" mode
     */
    goToTrade: (options?: NavigateToTradeOptions) => {
      if (options?.stockId && options?.mode) {
        router.push({
          pathname: "/(tabs)/trade",
          params: { stockId: options.stockId, mode: options.mode }
        } as any);
      } else {
        router.push("/(tabs)/trade" as any);
      }
    },

    /**
     * Navigate to asset detail screen
     * @param options.stockId - Stock ID to view
     */
    goToAsset: (options: NavigateToAssetOptions) => {
      router.push(`/asset/${options.stockId}` as any);
    },

    /**
     * Navigate to settings screen
     */
    goToSettings: () => {
      router.push("/settings" as any);
    },

    /**
     * Navigate to price alerts screen
     */
    goToPriceAlerts: () => {
      router.push("/price-alerts" as any);
    },

    /**
     * Navigate to notification history screen
     */
    goToNotificationHistory: () => {
      router.push("/notification-history" as any);
    },

    /**
     * Navigate to trade history screen
     */
    goToTradeHistory: () => {
      router.push("/trade-history" as any);
    },

    /**
     * Go back to previous screen
     */
    goBack: () => {
      router.back();
    },
  };
}
