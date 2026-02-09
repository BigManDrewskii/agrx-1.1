/**
 * AGRX Shadow / Elevation System
 *
 * Three-tier elevation model inspired by Material Design and Coinbase CDS.
 * Dark mode uses reduced opacity + colored glow for premium feel.
 *
 * Usage:
 *   import { Shadow, getShadow } from "@/constants/shadows";
 *   style={[cardStyle, getShadow("sm", isDark, colors.primary)]}
 */
import { Platform, type ViewStyle } from "react-native";

type ShadowStyle = Pick<
  ViewStyle,
  "shadowColor" | "shadowOffset" | "shadowOpacity" | "shadowRadius" | "elevation"
>;

/**
 * Light-mode shadow presets (iOS + Android elevation).
 */
export const Shadow = {
  /** Resting cards — subtle lift off surface */
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  } satisfies ShadowStyle,

  /** Interactive cards, popovers — clear separation */
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  } satisfies ShadowStyle,

  /** Floating elements, sheets, modals — prominent depth */
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  } satisfies ShadowStyle,

  /** No shadow */
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } satisfies ShadowStyle,
} as const;

export type ShadowTier = keyof typeof Shadow;

/**
 * Returns the appropriate shadow for the current color scheme.
 *
 * In dark mode, shadows use a tinted glow (accent color at low opacity)
 * instead of pure black, which looks more premium on dark surfaces.
 *
 * @param tier - Shadow size tier
 * @param isDark - Whether dark mode is active
 * @param tintColor - Optional accent color for dark-mode glow (default: primary blue)
 */
export function getShadow(
  tier: ShadowTier,
  isDark: boolean = false,
  tintColor?: string,
): ShadowStyle {
  if (tier === "none") return Shadow.none;

  const base = Shadow[tier];

  if (!isDark) return base;

  // Dark mode: reduce opacity, use tinted glow
  return {
    ...base,
    shadowColor: tintColor ?? "#578BFA",
    shadowOpacity: base.shadowOpacity * 0.5,
    shadowRadius: base.shadowRadius * 1.2,
  };
}
