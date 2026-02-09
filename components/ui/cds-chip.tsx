/**
 * CDSChip — AGRX-wrapped CDS Chip
 *
 * Preserves AGRX haptics + motion language while using CDS Chip visuals.
 * API unchanged for backward compatibility.
 *
 * Usage:
 *   <CDSChip
 *     label="Banks"
 *     selected={isActive}
 *     onPress={() => onSelect("Banks")}
 *   />
 *
 *   <CDSChip
 *     label="Technology"
 *     count={42}
 *     selected={true}
 *   />
 */
import React from "react";
import { Chip as CDSChipComp } from "@coinbase/cds-mobile/chips";
import { CDSWrapper } from "./cds-wrapper-base";
import { COMPONENT_HAPTICS } from "@/lib/_core/cds-haptics";
import { useCDSThemeAdapter } from "@/hooks/use-cds-theme-adapter";

export interface CDSChipProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  testID?: string;
  count?: number; // Optional badge count
}

/**
 * AGRX Chip component wrapped with haptic feedback and motion.
 *
 * Wraps the CDS Chip component with:
 * - AGRX haptic feedback (light impact for chips)
 * - AGRX motion language (spring animations)
 * - Selected state styling (uses AGRX brand colors)
 * - Badge count support
 */
export function CDSChip({
  label,
  selected = false,
  disabled = false,
  onPress,
  testID,
  count,
}: CDSChipProps) {
  const { agrx } = useCDSThemeAdapter();

  // Map selected state to CDS background/color props
  // When selected: primary background, onPrimary text
  // When unselected: bgSecondary background, fg text
  const background = selected ? "bgPrimary" : "bgSecondary";
  const color = selected ? "fgInverse" : "fg";

  return (
    <CDSWrapper
      onPress={onPress}
      hapticStyle={COMPONENT_HAPTICS.chip}
      disabled={disabled}
      testID={testID}
    >
      <CDSChipComp
        disabled={disabled}
        onPress={onPress}
        testID={testID}
        background={background}
        color={color}
        end={count !== undefined ? (
          <CDSChipComp
            compact
            background={selected ? "bgPrimary" : "bgTertiary"}
            color={selected ? "fgInverse" : "fgMuted"}
          >
            {count}
          </CDSChipComp>
        ) : undefined}
      >
        {label}
      </CDSChipComp>
    </CDSWrapper>
  );
}
