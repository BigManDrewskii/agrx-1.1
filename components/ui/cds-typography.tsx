/**
 * CDS-Backed Typography Components
 *
 * Bridges AGRX type scale to CDS typography components.
 * Preserves AGRX sizing while using CDS components where compatible.
 *
 * Strategy:
 * - Use CDS components when sizes match exactly (Title1, Title3, Footnote)
 * - Apply style overrides for close matches (1-2pt difference)
 * - Use CDS Text with explicit fontSize for components with no match (Caption1/2, Title2)
 * - Keep monospace variants custom (CDS doesn't have monospace)
 *
 * Usage (API identical to original typography.tsx):
 *   <CDSTitle1 color="foreground">Screen Title</CDSTitle1>
 *   <CDSBody color="muted">Description text</CDSBody>
 *   <CDSCaption1 color="muted">2h ago</CDSCaption1>
 */
import React from "react";
import {
  Text,
  TextTitle1,
  TextTitle2,
  TextTitle3,
  TextTitle4,
  TextHeadline,
  TextBody,
  TextLabel1,
  TextLabel2,
  TextCaption,
} from "@coinbase/cds-mobile/typography";
import { useColors } from "@/hooks/use-colors";
import { TypeScale, type TypeScaleKey } from "@/constants/typography";
import type { ThemeColorPalette } from "@/constants/theme";

type ThemeColorKey = keyof ThemeColorPalette;

interface TypographyProps {
  /** Theme color token. Defaults to "foreground". */
  color?: ThemeColorKey;
  /** Additional RN style overrides */
  style?: object;
  /** Children must be renderable content. */
  children: React.ReactNode;
  /** React 19: ref as regular prop */
  ref?: React.Ref<any>;
  /** numberOfLines, ellipsizeMode, selectable, etc. */
  [key: string]: any;
}

/**
 * Base adapter that applies AGRX colors and optional size overrides.
 * Uses CDS typography components with style adjustments for AGRX compatibility.
 */
function createCDSTypographyAdapter(
  CDSComponent: React.ComponentType<any>,
  agrxVariant: TypeScaleKey,
  defaultColor: ThemeColorKey = "foreground"
) {
  const agrxScale = TypeScale[agrxVariant];

  function TypographyComponent({
    color,
    style,
    children,
    ref,
    ...rest
  }: TypographyProps) {
    const colors = useColors();
    const resolvedColor = colors[color ?? defaultColor];

    return (
      <CDSComponent
        ref={ref}
        style={[
          {
            color: resolvedColor,
            // Override CDS font size to match AGRX exactly when needed
            fontSize: agrxScale.fontSize,
            lineHeight: agrxScale.lineHeight,
            // Note: CDS handles fontWeight internally via font prop
          },
          style,
        ]}
        {...rest}
      >
        {children}
      </CDSComponent>
    );
  }

  const componentName =
    agrxVariant.charAt(0).toUpperCase() +
    agrxVariant.slice(1).replace(/([A-Z])/g, "-$1").toLowerCase();
  TypographyComponent.displayName = `CDS${componentName}`;
  return TypographyComponent;
}

// ─── Title Components ────────────────────────────────────────────────────────────

/**
 * 34pt bold — Portfolio value, hero numbers
 *
 * CDS display3 is 40pt (6pt too large).
 * Override with AGRX size for exact match.
 */
export const CDSLargeTitle = createCDSTypographyAdapter(
  Text, // Use base Text with size override since no CDS match
  "largeTitle"
);

/**
 * 28pt bold — Screen titles
 *
 * CDS title1 is exactly 28pt ✅
 */
export const CDSTitle1 = createCDSTypographyAdapter(TextTitle1, "title1");

/**
 * 22pt bold — Section headers
 *
 * CDS title2 is 28pt (6pt too large).
 * Override with AGRX size for exact match.
 */
export const CDSTitle2 = createCDSTypographyAdapter(
  Text, // Use base Text with size override
  "title2"
);

/**
 * 20pt semibold — Card titles
 *
 * CDS title3 is exactly 20pt ✅
 */
export const CDSTitle3 = createCDSTypographyAdapter(TextTitle3, "title3");

// ─── Body Components ─────────────────────────────────────────────────────────────

/**
 * 17pt semibold — Emphasized body text
 *
 * CDS headline is 16pt (1pt smaller).
 * Override with AGRX size for exact match.
 */
export const CDSHeadline = createCDSTypographyAdapter(
  TextHeadline,
  "headline"
);

/**
 * 17pt regular — Default body text
 *
 * CDS body is 16pt (1pt smaller).
 * Override with AGRX size for exact match.
 */
export const CDSBody = createCDSTypographyAdapter(TextBody, "body");

/**
 * 16pt regular — Secondary body text
 *
 * CDS label1 is 14pt (2pt smaller).
 * Override with AGRX size for exact match.
 */
export const CDSCallout = createCDSTypographyAdapter(TextLabel1, "callout");

/**
 * 15pt regular — List subtitles
 *
 * CDS label2 is 14pt (1pt smaller).
 * Override with AGRX size for exact match.
 */
export const CDSSubhead = createCDSTypographyAdapter(TextLabel2, "subhead");

// ─── Caption Components ───────────────────────────────────────────────────────────

/**
 * 13pt regular — Timestamps, metadata
 *
 * CDS caption is exactly 13pt ✅
 */
export const CDSFootnote = createCDSTypographyAdapter(
  TextCaption,
  "footnote",
  "muted"
);

/**
 * 12pt regular — Labels, badges
 *
 * CDS has no 12pt component.
 * Use base Text with explicit AGRX sizing.
 */
export const CDSCaption1 = createCDSTypographyAdapter(
  Text,
  "caption1",
  "muted"
);

/**
 * 11pt regular — Smallest readable text
 *
 * CDS has no 11pt component.
 * Use base Text with explicit AGRX sizing.
 */
export const CDSCaption2 = createCDSTypographyAdapter(
  Text,
  "caption2",
  "muted"
);

// ─── Re-exports for backward compatibility ────────────────────────────────────────
// Note: Monospace variants remain custom - CDS doesn't have monospace typography
// These should be imported from the original typography.tsx file

export {
  MonoLargeTitle,
  MonoHeadline,
  MonoBody,
  MonoSubhead,
  MonoCaption1,
  MonoCaption2,
} from "./typography";

// Export with original names for drop-in replacement
export {
  CDSLargeTitle as LargeTitle,
  CDSTitle1 as Title1,
  CDSTitle2 as Title2,
  CDSTitle3 as Title3,
  CDSHeadline as Headline,
  CDSBody as Body,
  CDSCallout as Callout,
  CDSSubhead as Subhead,
  CDSFootnote as Footnote,
  CDSCaption1 as Caption1,
  CDSCaption2 as Caption2,
};
