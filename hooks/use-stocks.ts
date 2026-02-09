/**
 * Client-side hooks for ATHEX stock data using mock data.
 *
 * Mock-only mode for instant, reliable data without API dependencies.
 * All data is deterministic and uses realistic ATHEX tickers and prices.
 */
import { GREEK_STOCKS, PORTFOLIO_HOLDINGS, generateChartData } from "@/lib/mock-data";
import type { Asset } from "@/lib/mock-data";
import { getSector, type Sector } from "@/lib/sectors";
import { useMemo } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface LiveStockQuote {
  id: string;
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline: number[];
  category: "blue-chip" | "growth" | "dividend";
  sector: Sector;
  marketCap: string;
  dayHigh: number;
  dayLow: number;
  volume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  currency: string;
  isLive: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convert a mock Asset to a LiveStockQuote with isLive: false */
function mockToQuote(s: Asset): LiveStockQuote {
  return {
    id: s.id,
    ticker: s.ticker,
    name: s.name,
    price: s.price,
    change: s.change,
    changePercent: s.changePercent,
    sparkline: s.sparkline,
    category: s.category,
    sector: getSector(s.id),
    marketCap: s.marketCap ?? "N/A",
    dayHigh: s.price * 1.02,
    dayLow: s.price * 0.98,
    volume: 0,
    fiftyTwoWeekHigh: s.price * 1.2,
    fiftyTwoWeekLow: s.price * 0.8,
    currency: "EUR",
    isLive: false,
  };
}

// ─── Hooks ──────────────────────────────────────────────────────────────────

/**
 * Fetch all stock quotes using mock data.
 *
 * Returns all 135 Greek stocks instantly with no API calls.
 */
export function useStockQuotes() {
  // Use useMemo to prevent recreating the array on every render
  const stocks = useMemo(() => GREEK_STOCKS.map(mockToQuote), []);

  return {
    stocks,
    isLoading: false, // Instant data, no loading
    isError: false,
    isLive: false, // Mock data is not live
    lastUpdated: Date.now(), // Number timestamp for LiveBadge compatibility
    refetch: () => {
      // No-op for mock data, but can be used to trigger a refresh
      // if you want to simulate price updates later
      return Promise.resolve();
    },
  };
}

/**
 * Fetch a single stock quote using mock data.
 */
export function useStockQuote(stockId: string) {
  const stock = useMemo(() => {
    const mockStock = GREEK_STOCKS.find((s) => s.id === stockId);
    return mockStock ? mockToQuote(mockStock) : null;
  }, [stockId]);

  return {
    stock,
    isLoading: false, // Instant data, no loading
    isError: !stock, // Error only if stock not found
    isLive: false,
    refetch: () => Promise.resolve(),
  };
}

/**
 * Fetch chart data for a stock using mock data.
 */
export function useStockChart(stockId: string, range: string = "1M") {
  const chartData = useMemo(() => {
    const mockStock = GREEK_STOCKS.find((s) => s.id === stockId);
    if (!mockStock) return [];

    const mockPoints =
      range === "1D"
        ? 48
        : range === "1W"
        ? 168
        : range === "1M"
        ? 30
        : range === "3M"
        ? 90
        : range === "1Y"
        ? 365
        : 730;

    return generateChartData(mockStock.price * 0.9, mockStock.price * 0.02, mockPoints).map(
      (d) => d.value
    );
  }, [stockId, range]);

  return {
    chartData,
    isLoading: false, // Instant data, no loading
    isError: false,
    isLive: false,
    refetch: () => Promise.resolve(),
  };
}

/**
 * Mutation to force-refresh the cache (no-op for mock data).
 */
export function useRefreshCache() {
  return {
    mutateAsync: async () => {
      // No-op for mock data, always succeeds
      return { success: true };
    },
  };
}
