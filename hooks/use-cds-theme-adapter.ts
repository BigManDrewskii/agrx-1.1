/**
 * CDS Theme Adapter
 *
 * Maps AGRX brand colors to CDS component themes.
 * Allows CDS components to use AGRX trading colors (success, error, gold).
 *
 * Usage:
 *   import { useCDSThemeAdapter } from '@/hooks/use-cds-theme-adapter';
 *
 *   function MyComponent() {
 *     const { agrx, cds } = useCDSThemeAdapter();
 *     return <View style={{ backgroundColor: agrx.success }} />;
 *   }
 */
import { useColors } from "@/hooks/use-colors";
import { useTheme as useCDSTheme } from "@coinbase/cds-mobile/hooks/useTheme";

/**
 * Theme adapter hook that merges AGRX brand colors with CDS theme.
 *
 * Returns:
 * - cds: CDS semantic colors (fg, bg, fgPrimary, fgPositive, etc.)
 * - agrx: AGRX brand colors (success, error, warning, gold, primary)
 * - getTradingColor: Helper to get color based on trading intent
 */
export function useCDSThemeAdapter() {
  const agrxColors = useColors();
  const cdsTheme = useCDSTheme();

  return {
    /** CDS semantic colors - use these when you want pure CDS styling */
    cds: cdsTheme.color,

    /** AGRX brand colors - preserved for trading interface */
    agrx: {
      /** Success/buy state - #00CC6A */
      success: agrxColors.success,

      /** Error/sell state - #FF5A5F */
      error: agrxColors.error,

      /** Warning state - #F59E0B */
      warning: agrxColors.warning,

      /** Gold/premium - #FFB800 */
      gold: agrxColors.gold,

      /** Primary blue - #0052FF (AGRX version, may differ from CDS blue) */
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
