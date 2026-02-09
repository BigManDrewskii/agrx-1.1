/**
 * useColors — Single source of truth for all runtime colors.
 *
 * Returns the resolved color palette for the current theme (light/dark).
 * ALL values come from constants/theme.ts → theme.config.js.
 * NO CDS theme colors are read at runtime.
 *
 * Usage:
 *   const colors = useColors();
 *   <View style={{ backgroundColor: colors.surface }} />
 */
import { Colors, type ColorScheme, type ThemeColorPalette } from "@/constants/theme";
import { useColorScheme } from "./use-color-scheme";

// ─── Color Alpha Utility ────────────────────────────────────────────────────

/**
 * Parse any color string into { r, g, b, a }.
 * Handles: #RGB, #RRGGBB, #RRGGBBAA, rgb(), rgba().
 */
function parseColorToRGB(color: string): { r: number; g: number; b: number; a: number } | null {
  if (!color || typeof color !== "string") return null;
  const trimmed = color.trim();

  // Handle hex: #RGB, #RRGGBB, #RRGGBBAA
  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        a: 1,
      };
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: 1,
      };
    }
    if (hex.length === 8) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: parseInt(hex.slice(6, 8), 16) / 255,
      };
    }
    return null;
  }

  // Handle rgb(r, g, b) and rgba(r, g, b, a)
  const rgbaMatch = trimmed.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/,
  );
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1], 10),
      g: parseInt(rgbaMatch[2], 10),
      b: parseInt(rgbaMatch[3], 10),
      a: rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1,
    };
  }

  return null;
}

/**
 * Create an rgba string from any color value + alpha.
 * Safe fallback: returns neutral gray if parsing fails (prevents Reanimated crashes).
 *
 * Usage:
 *   colorAlpha("#0052FF", 0.10) → "rgba(0,82,255,0.10)"
 *   colorAlpha("rgba(0,82,255,1)", 0.10) → "rgba(0,82,255,0.10)"
 */
export function colorAlpha(color: string, alpha: number): string {
  const parsed = parseColorToRGB(color);
  if (!parsed || isNaN(parsed.r) || isNaN(parsed.g) || isNaN(parsed.b)) {
    // Fallback: neutral gray at requested alpha — prevents Reanimated crashes
    return `rgba(128,128,128,${alpha.toFixed(2)})`;
  }
  return `rgba(${parsed.r},${parsed.g},${parsed.b},${alpha.toFixed(2)})`;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * Returns the current theme's color palette.
 * All values come from AGRX's own theme.config.js — zero CDS dependency.
 */
export function useColors(colorSchemeOverride?: ColorScheme): ThemeColorPalette {
  const colorSchema = useColorScheme();
  const scheme = (colorSchemeOverride ?? colorSchema ?? "light") as ColorScheme;
  return Colors[scheme];
}
