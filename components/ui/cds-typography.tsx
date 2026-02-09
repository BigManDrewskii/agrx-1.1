/**
 * CDS-Backed Typography Components
 *
 * Bridges AGRX type scale to CDS typography components.
 * Currently re-exports from the original typography.tsx which uses
 * react-native Text directly for Expo Go compatibility.
 *
 * TODO: Switch to actual CDS typography components once @coinbase/cds-mobile
 * supports React Native 0.81+ and React 19.
 *
 * Usage (API identical to original typography.tsx):
 *   <CDSTitle1 color="foreground">Screen Title</CDSTitle1>
 *   <CDSBody color="muted">Description text</CDSBody>
 *   <CDSCaption1 color="muted">2h ago</CDSCaption1>
 */

// Re-export all typography components from the original implementation
// which uses react-native Text directly (Expo Go compatible)
export {
  LargeTitle,
  Title1,
  Title2,
  Title3,
  Headline,
  Body,
  Callout,
  Subhead,
  Footnote,
  Caption1,
  Caption2,
  MonoLargeTitle,
  MonoHeadline,
  MonoBody,
  MonoSubhead,
  MonoCaption1,
  MonoCaption2,
} from "./typography";

// CDS-prefixed aliases for backward compatibility
export {
  LargeTitle as CDSLargeTitle,
  Title1 as CDSTitle1,
  Title2 as CDSTitle2,
  Title3 as CDSTitle3,
  Headline as CDSHeadline,
  Body as CDSBody,
  Callout as CDSCallout,
  Subhead as CDSSubhead,
  Footnote as CDSFootnote,
  Caption1 as CDSCaption1,
  Caption2 as CDSCaption2,
} from "./typography";
