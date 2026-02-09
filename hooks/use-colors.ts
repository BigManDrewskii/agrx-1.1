import { Colors, type ColorScheme, type ThemeColorPalette } from "@/constants/theme";
import { useColorScheme } from "./use-color-scheme";
import { useTheme } from "@coinbase/cds-mobile/hooks/useTheme";

/**
 * Utility: convert a hex color + 0-1 opacity into an rgba string.
 * Works for both #RGB and #RRGGBB hex values.
 */
function hexAlpha(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  let r: number, g: number, b: number;
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else {
    r = parseInt(clean.slice(0, 2), 16);
    g = parseInt(clean.slice(2, 4), 16);
    b = parseInt(clean.slice(4, 6), 16);
  }
  return `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
}

/**
 * Returns the current theme's color palette.
 * Integrates CDS semantic colors with AGRX brand colors.
 * Usage: const colors = useColors(); then colors.text, colors.background, etc.
 */
export function useColors(colorSchemeOverride?: ColorScheme): ThemeColorPalette {
  const colorSchema = useColorScheme();
  const scheme = (colorSchemeOverride ?? colorSchema ?? "light") as ColorScheme;
  const agrxColors = Colors[scheme];

  // Get CDS theme colors
  const cdsTheme = useTheme();

  // Merge CDS colors with AGRX brand colors
  return {
    // CDS semantic colors
    foreground: cdsTheme.color.fg,
    background: cdsTheme.color.bg,
    surfaceSubtle: agrxColors.surfaceSubtle,
    surface: cdsTheme.color.bgAlternate,
    surfaceSecondary: cdsTheme.color.bgTertiary,
    surfaceElevated: agrxColors.surfaceElevated,
    primary: cdsTheme.color.fgPrimary,
    primaryAlpha: cdsTheme.color.fgPrimary + "20", // Add transparency
    muted: cdsTheme.color.fgMuted,
    onPrimary: cdsTheme.color.bgInverse,
    border: agrxColors.border,
    borderSubtle: agrxColors.borderSubtle,

    // Standardized alpha overlays for icon backgrounds, tints, etc.
    foregroundAlpha4: agrxColors.foregroundAlpha4,
    foregroundAlpha8: agrxColors.foregroundAlpha8,
    foregroundAlpha12: agrxColors.foregroundAlpha12,
    foregroundAlpha16: agrxColors.foregroundAlpha16,

    // AGRX brand colors (preserve for trading interface)
    success: agrxColors.success,
    successAlpha: agrxColors.successAlpha,
    warning: agrxColors.warning || "#F59E0B",
    warningAlpha: agrxColors.warningAlpha || "#F59E0B20",
    error: agrxColors.error,
    errorAlpha: agrxColors.errorAlpha,
    gold: agrxColors.gold,
    bronze: agrxColors.bronze || "#CD7F32",
    accent: agrxColors.accent || "#4257E9",
    accentAlpha: agrxColors.accentAlpha || "rgba(66,87,233,0.10)",
    silver: agrxColors.silver || "#89909E",

    // Computed colors for backward compatibility
    text: cdsTheme.color.fg,
    tint: cdsTheme.color.fgPrimary,
    icon: cdsTheme.color.fgMuted,
    tabIconDefault: cdsTheme.color.fgMuted,
    tabIconSelected: cdsTheme.color.fgPrimary,
  };
}

/**
 * Create a tinted alpha background from any hex color.
 * Replaces the broken `${color}14` pattern used throughout the app.
 *
 * Usage:
 *   import { colorAlpha } from "@/hooks/use-colors";
 *   backgroundColor: colorAlpha(colors.success, 0.10)
 */
export { hexAlpha as colorAlpha };
