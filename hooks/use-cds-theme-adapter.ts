/**
 * CDS Theme Adapter
 *
 * Maps AGRX brand colors for trading components.
 * Previously read CDS theme colors — now fully self-contained using AGRX palette.
 *
 * Usage:
 *   import { useCDSThemeAdapter } from '@/hooks/use-cds-theme-adapter';
 *
 *   function MyComponent() {
 *     const { agrx } = useCDSThemeAdapter();
 *     return <View style={{ backgroundColor: agrx.success }} />;
 *   }
 */
import { useColors } from "@/hooks/use-colors";

/**
 * Theme adapter hook — provides AGRX brand colors for trading UI.
 *
 * Returns:
 * - agrx: AGRX brand colors (success, error, warning, gold, primary)
 * - getTradingColor: Helper to get color based on trading intent
 */
export function useCDSThemeAdapter() {
  const agrxColors = useColors();

  return {
    /** AGRX brand colors — the only color source */
    agrx: {
      success: agrxColors.success,
      error: agrxColors.error,
      warning: agrxColors.warning,
      gold: agrxColors.gold,
      primary: agrxColors.primary,
    },

    /**
     * Get trading color based on intent
     * @param type - Trading intent type
     * @returns Hex color string
     */
    getTradingColor: (type: "buy" | "sell" | "neutral") => {
      switch (type) {
        case "buy":
          return agrxColors.success;
        case "sell":
          return agrxColors.error;
        case "neutral":
          return agrxColors.gold;
      }
    },
  };
}

/**
 * Type for the theme adapter return value
 */
export type CDSThemeAdapter = ReturnType<typeof useCDSThemeAdapter>;
