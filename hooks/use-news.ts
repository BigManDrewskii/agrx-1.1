/**
 * AGRX News Hooks
 *
 * NEWS API IS CURRENTLY DISABLED.
 * These hooks return empty/idle results to prevent API calls.
 * Re-enable by uncommenting the trpc queries below.
 */

/**
 * Hook to fetch news and sentiment for a specific stock.
 * DISABLED — returns empty idle result.
 */
export function useStockNews(_stockId: string | undefined) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: () => Promise.resolve({} as any),
    isFetching: false,
  };
}

/**
 * Hook to fetch general ATHEX market news.
 * DISABLED — returns empty idle result.
 */
export function useMarketNews() {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: () => Promise.resolve({} as any),
    isFetching: false,
  };
}
