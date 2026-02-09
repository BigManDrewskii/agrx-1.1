/**
 * AGRX News Hooks
 *
 * Client-side React Query hooks for fetching live news and sentiment data.
 */
import { trpc } from "@/lib/trpc";
import { showError, getUserFriendlyMessage, logError } from "@/lib/error-handler";
import { useEffect } from "react";

/**
 * Hook to fetch news and sentiment for a specific stock.
 * Caches for 5 minutes, refetches on window focus.
 */
export function useStockNews(stockId: string | undefined) {
  const result = trpc.news.getStockNews.useQuery(
    { stockId: stockId || "" },
    {
      enabled: !!stockId,
      staleTime: 5 * 60 * 1000,       // 5 min
      gcTime: 15 * 60 * 1000,         // 15 min
      refetchOnWindowFocus: true,
      retry: 1,
    }
  );

  // Show error alert when query fails
  useEffect(() => {
    if (result.error && !result.isLoading) {
      logError(result.error, "useStockNews");
      showError(result.error, {
        title: "Failed to load news",
        message: getUserFriendlyMessage(result.error),
        onRetry: () => result.refetch(),
      });
    }
  }, [result.error, result.isLoading, result.refetch]);

  return result;
}

/**
 * Hook to fetch general ATHEX market news.
 * Caches for 5 minutes.
 */
export function useMarketNews() {
  const result = trpc.news.getMarketNews.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  // Show error alert when query fails
  useEffect(() => {
    if (result.error && !result.isLoading) {
      logError(result.error, "useMarketNews");
      showError(result.error, {
        title: "Failed to load market news",
        message: getUserFriendlyMessage(result.error),
        onRetry: () => result.refetch(),
      });
    }
  }, [result.error, result.isLoading, result.refetch]);

  return result;
}
