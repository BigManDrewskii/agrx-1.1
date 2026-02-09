import { Platform } from "react-native";

import themeConfig from "@/theme.config";

export type ColorScheme = "light" | "dark";

export const ThemeColors = themeConfig.themeColors;

type ThemeColorTokens = typeof ThemeColors;
type ThemeColorName = keyof ThemeColorTokens;
type SchemePalette = Record<ColorScheme, Record<ThemeColorName, string>>;
type SchemePaletteItem = SchemePalette[ColorScheme];

function buildSchemePalette(colors: ThemeColorTokens): SchemePalette {
  const palette: SchemePalette = {
    light: {} as SchemePalette["light"],
    dark: {} as SchemePalette["dark"],
  };

  (Object.keys(colors) as ThemeColorName[]).forEach((name) => {
    const swatch = colors[name];
    palette.light[name] = swatch.light;
    palette.dark[name] = swatch.dark;
  });

  return palette;
}

export const SchemeColors = buildSchemePalette(ThemeColors);

/**
 * Full runtime palette — the single source of truth for ALL colors in the app.
 *
 * Every color used anywhere in the app MUST come from this type.
 * No CDS theme colors, no hardcoded hex values, no hex suffix hacks.
 *
 * Tokens from theme.config.js are spread in via `...base`.
 * Computed tokens (aliases, alpha overlays) are added below.
 */
type RuntimePalette = SchemePaletteItem & {
  // ─── Aliases (backward compatibility) ───
  text: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;

  // ─── Computed alpha overlays ───
  // These use rgba() strings with known-good values.
  // Components should use these instead of colorAlpha() for foreground tints.
  foregroundAlpha4: string;
  foregroundAlpha8: string;
  foregroundAlpha12: string;
  foregroundAlpha16: string;
};

function buildRuntimePalette(scheme: ColorScheme): RuntimePalette {
  const base = SchemeColors[scheme];
  return {
    ...base,

    // ─── Aliases ───
    text: base.foreground,
    tint: base.primary,
    icon: base.muted,
    tabIconDefault: base.muted,
    tabIconSelected: base.primary,

    // ─── Foreground alpha overlays ───
    // Derived from foreground color (white in dark, black in light)
    foregroundAlpha4:  scheme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
    foregroundAlpha8:  scheme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
    foregroundAlpha12: scheme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
    foregroundAlpha16: scheme === "dark" ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.12)",
  };
}

export const Colors = {
  light: buildRuntimePalette("light"),
  dark: buildRuntimePalette("dark"),
} satisfies Record<ColorScheme, RuntimePalette>;

export type ThemeColorPalette = (typeof Colors)[ColorScheme];

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
