/**
 * CDSButton — AGRX-wrapped CDS Button
 *
 * Preserves AGRX haptics + motion language while using CDS Button visuals.
 * API unchanged for backward compatibility.
 *
 * Usage:
 *   <CDSButton variant="primary" onPress={handleSubmit}>
 *     Submit
 *   </CDSButton>
 *
 *   <CDSButton variant="destructive" onPress={handleDelete}>
 *     Delete
 *   </CDSButton>
 */
import React from "react";
import { Button as CDSButtonComp } from "@coinbase/cds-mobile/buttons";
import { CDSWrapper } from "./cds-wrapper-base";
import { COMPONENT_HAPTICS } from "@/lib/_core/cds-haptics";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive";

export interface CDSButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: object;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/**
 * Maps AGRX button variants to CDS button variants.
 *
 * AGRX variants:
 * - primary: Primary CTA (blue)
 * - secondary: Secondary action (outlined)
 * - tertiary: Tertiary action (subtle)
 * - destructive: Destructive action (red)
 *
 * CDS variants:
 * - positive: Green (success/buy)
 * - negative: Red (error/sell)
 * - secondary: Outlined secondary
 * - tertiary: Subtle tertiary
 * - primary: Primary blue
 */
function mapVariantToCDS(variant: ButtonVariant): string {
  switch (variant) {
    case "primary":
      return "primary";
    case "secondary":
      return "secondary";
    case "tertiary":
      return "tertiary";
    case "destructive":
      return "negative";
    default:
      return "primary";
  }
}

/**
 * AGRX Button component wrapped with haptic feedback and motion.
 *
 * Wraps the CDS Button component with:
 * - AGRX haptic feedback (medium impact for buttons)
 * - AGRX motion language (spring animations)
 * - Disabled state handling
 * - Loading state support
 */
export function CDSButton({
  children,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: CDSButtonProps) {
  const cdsVariant = mapVariantToCDS(variant);

  return (
    <CDSWrapper
      onPress={onPress}
      hapticStyle={COMPONENT_HAPTICS.button}
      disabled={disabled || loading}
      testID={testID}
    >
      <CDSButtonComp
        variant={cdsVariant as any}
        disabled={disabled || loading}
        loading={loading}
        style={style}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        {children}
      </CDSButtonComp>
    </CDSWrapper>
  );
}
