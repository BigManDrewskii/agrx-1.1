# AGRX 1.1 — Comprehensive UI/UX Design Audit

**Date:** February 9, 2026
**Commit:** `9888d1d` (latest on `main`)
**Scope:** Full codebase audit — all screens, components, design tokens, animations, and interaction patterns

---

## Executive Summary

AGRX has a **solid architectural foundation**: well-structured design tokens (8px grid, iOS HIG type scale, CDS color palette), a clean component hierarchy, and a thoughtful Simple/Pro mode split. However, the app currently reads as **functional but flat** — it lacks the visual depth, spatial hierarchy, and micro-polish that separates a good trading app from a *premium* one.

The recommendations below are organized by **impact tier** (Critical → High → Medium) and grouped by design domain. Each recommendation includes the specific files to modify and concrete implementation guidance. The goal is not to redesign from scratch, but to **elevate what exists** into something that feels like Coinbase × Robinhood × a boutique Greek fintech.

---

## 1. Visual Hierarchy & Spatial Depth

### 1.1 CRITICAL — Cards Lack Elevation and Breathing Room

**Current state:** Cards across the app (trending cards, holding cards, asset rows, quick action cards) use a flat `borderWidth: 1` + `borderColor: colors.border` pattern with no shadow or elevation. This makes every surface feel like it's on the same z-plane.

**Files affected:**
- `components/ui/trending-card.tsx`
- `components/ui/asset-row.tsx`
- `components/features/portfolio/holding-card-pro.tsx`
- `components/features/portfolio/holding-card-simple.tsx`
- `components/features/home/quick-actions.tsx`
- `components/features/home/daily-challenge-card.tsx`

**Recommendation:**

Introduce a **layered elevation system** with three tiers. Create a shared `shadows.ts` constant:

```typescript
// constants/shadows.ts
export const Shadow = {
  /** Cards resting on surface — subtle lift */
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  /** Interactive cards, modals — clear separation */
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  /** Floating elements, sheets — prominent depth */
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
} as const;
```

Apply `Shadow.sm` to all resting cards. Apply `Shadow.md` to the tab bar and floating action elements. In dark mode, reduce `shadowOpacity` by 50% and use a colored shadow tinted with `colors.primary` at 5% opacity for a premium glow effect.

Additionally, **remove `borderWidth: 1`** from cards in dark mode entirely. Borders on dark backgrounds look dated. Instead, rely on the surface color contrast (`background: #0A0B0D` → `surface: #1A1C23`) plus subtle shadow for separation. Keep borders only in light mode where they serve a functional purpose.

### 1.2 HIGH — Insufficient Vertical Rhythm Between Sections

**Current state:** The home screen stacks sections (PortfolioHero → QuickStats → QuickActions → Watchlist → Trending → News → Social) with inconsistent spacing. Some sections have `marginBottom: 16`, others `paddingVertical: 12`, and the overall scroll feels cramped.

**Files affected:**
- `app/(tabs)/index.tsx`
- All `components/features/home/*.tsx`

**Recommendation:**

Establish a **section spacing rhythm** using the existing `Spacing` tokens:

| Between | Spacing | Token |
|---------|---------|-------|
| Hero → first section | 32px | `Spacing[8]` |
| Section → section | 24px | `Spacing[6]` |
| Section header → content | 12px | `Spacing[3]` |
| Card → card (within section) | 12px | `Spacing[3]` |

Add a `SectionGap` component or simply enforce consistent `marginTop` on each home section. The current `scrollContent` padding of `paddingBottom: 20` should be increased to `paddingBottom: 120` to ensure the last section isn't obscured by the tab bar.

### 1.3 HIGH — Section Headers Need More Authority

**Current state:** Section headers like "Watchlist", "Trending on ATHEX", "Market News" use `Title3` (20pt semibold) with a simple text-only layout. They blend into the content below.

**Recommendation:**

Upgrade section headers to include:
1. A **subtle left accent bar** (3px wide, `colors.primary`, `borderRadius: 2`) on the leading edge
2. A **"See All" / chevron** affordance on the trailing edge for navigable sections
3. Consistent `paddingHorizontal: 20` alignment with card content

Example pattern:
```
[|] Trending on ATHEX          See All →
```

This creates a visual anchor point that the eye can scan quickly, similar to how Coinbase and Robinhood structure their home feeds.

---

## 2. Typography & Numeric Display

### 2.1 CRITICAL — Portfolio Value Needs More Visual Weight

**Current state:** The portfolio hero displays the total value using `MonoLargeTitle` (34pt, GeistMono Bold) with a text shadow. While the font choice is correct, the presentation lacks the gravitas of a primary financial figure.

**Files affected:**
- `components/features/home/portfolio-hero.tsx`
- `components/features/portfolio/portfolio-hero-simple.tsx`
- `components/features/portfolio/portfolio-hero-pro.tsx`

**Recommendation:**

1. **Increase the hero number to 40-44pt** — this is the single most important number in the app. Robinhood uses ~42pt for portfolio value. The current 34pt is undersized for a hero metric.
2. **Add a subtle animated gradient underline** or a faint horizontal rule beneath the number to anchor it visually.
3. **Animate the PnL badge** — the current static `▲ +2.34%` should pulse once on load (a single scale-up from 0.9 → 1.0 with `SPRING_BOUNCY`) to draw attention.
4. **Use tabular (monospace) figures consistently** — ensure the `€` symbol uses the same monospace font as the digits to prevent layout shifts when values change.

### 2.2 HIGH — PnL Colors Need More Differentiation

**Current state:** Positive PnL uses `success` (#27AD74 dark) and negative uses `error` (#ED5966 dark). These are fine semantically but lack visual punch.

**Recommendation:**

Add **PnL-specific background pills** for key metrics (portfolio hero, holding cards):
- Positive: `backgroundColor: successAlpha` with `success` text, `borderRadius: 8`, `paddingHorizontal: 10, paddingVertical: 4`
- Negative: `backgroundColor: errorAlpha` with `error` text

This "pill" treatment (used by Robinhood, Revolut, and Coinbase) makes PnL instantly scannable. Currently the PnL numbers just float as colored text, which gets lost in dense layouts.

### 2.3 MEDIUM — Ticker Placeholder Icons Are Generic

**Current state:** Stock icons use a circle with the first 2 letters of the ticker (`{asset.ticker.slice(0, 2)}`). This is functional but visually monotonous — every row looks identical except for the text.

**Recommendation:**

1. **Generate unique background colors per ticker** using a deterministic hash of the ticker string mapped to a curated palette of 12-16 muted colors. This gives each stock a unique visual identity without needing real logos.
2. **Use a single bold letter** instead of two — `A` for ALPHA, `O` for OTE, etc. Single letters at 18pt bold in a 40px circle are more legible and feel more intentional.
3. Long-term: integrate real company logos via a CDN or local asset bundle.

---

## 3. Navigation & Tab Bar

### 3.1 CRITICAL — Tab Bar Feels Utilitarian

**Current state:** The tab bar is a standard iOS-style bar with solid background, 1px top border, and 24px SF Symbol icons. It works but doesn't contribute to the premium feel.

**Files affected:**
- `app/(tabs)/_layout.tsx`
- `components/haptic-tab.tsx`

**Recommendation:**

1. **Add a subtle blur effect** to the tab bar background using `expo-blur` (`BlurView` with `intensity={80}` and `tint="dark"`). This creates a frosted-glass effect that lets content scroll underneath, adding depth without complexity. Set the tab bar `backgroundColor` to `rgba(26, 28, 35, 0.85)` (dark) or `rgba(255, 255, 255, 0.85)` (light) to allow the blur to show through.

2. **Replace the 1px border** with a gradient fade — a 1px line of `rgba(255,255,255,0.06)` in dark mode creates a more refined separation than a solid border.

3. **Add an active indicator dot** beneath the selected tab icon (4px circle, `colors.primary`, animated with spring). This is a modern pattern used by Coinbase, Cash App, and many premium fintech apps. The current text label + color change is functional but adding the dot creates a stronger focal point.

4. **Increase icon size to 26px** for the active tab and keep 24px for inactive. The 2px difference is subtle but creates a clear active state hierarchy.

### 3.2 HIGH — Screen Transitions Need Polish

**Current state:** The app uses `slide_from_right` for most screens and `fade` for onboarding. The `animationDurationMillis: 350` is reasonable.

**Recommendation:**

1. **Add a shared element transition** for the asset detail screen — when tapping an `AssetRow`, the ticker text and sparkline should animate from their position in the list to their position on the detail screen. This is the single most impactful transition upgrade. Use `react-native-reanimated`'s `SharedTransition` API or Expo Router's built-in shared transitions.

2. **Add a parallax header** to the asset detail screen — the stock chart should have a subtle parallax effect on scroll, compressing as the user scrolls down to reveal the action buttons. This is a signature pattern in premium trading apps.

---

## 4. Component-Level Upgrades

### 4.1 CRITICAL — AssetRow Needs a Complete Refresh

**Current state:** The `AssetRow` component is the most-rendered component in the app (Markets list, Watchlist, Trade picker). It currently shows: `[Icon] [Name + Ticker] [Sparkline] [Price + Change]`. The layout is correct but the visual treatment is flat.

**Files affected:**
- `components/ui/asset-row.tsx`

**Recommendation:**

1. **Add a hover/press state background** — on press, the entire row should get a `backgroundColor: colors.surfaceSecondary` with `borderRadius: 12`. Currently the `AnimatedPressable` only scales, which is invisible on a list item.
2. **Increase row height to 72px** (from the current ~64px implied by padding). This gives more breathing room and makes the sparkline more readable.
3. **Make the sparkline wider** — increase from `width={56}` to `width={72}`. The current sparkline is too compressed to convey meaningful price movement.
4. **Add a subtle divider** between rows — use a `View` with `height: 1, backgroundColor: colors.border, marginLeft: 68` (indented past the icon) rather than a full-width line. This is the iOS standard for grouped list dividers.
5. **Right-align the price column** with consistent width (e.g., `minWidth: 90`) to prevent layout jitter when prices change.

### 4.2 HIGH — SwipeToConfirm Needs Visual Refinement

**Current state:** The `SwipeToConfirm` component has been recently enhanced with shadow layers and shimmer effects, but the GestureDetector wrapping was broken (fixed earlier). The component is complex but the visual hierarchy could be clearer.

**Recommendation:**

1. **Simplify the thumb design** — use a clean white circle with a single chevron icon (`chevron.right.2`) instead of multiple shadow layers. The current implementation has 3 shadow views which add complexity without proportional visual benefit.
2. **Add a "slide" text animation** — the label text should have a subtle left-to-right shimmer/pulse animation (using `LinearGradient` with animated `translateX`) to hint at the swipe direction. This is a standard pattern in payment confirmation UIs.
3. **Increase the track height** to 64px for better touch target compliance and visual presence.

### 4.3 HIGH — Quick Actions Cards Need Hierarchy

**Current state:** The three quick action buttons (Trade, Portfolio, Markets) are equal-weight cards in a row. They use colored icon circles with labels.

**Recommendation:**

1. **Make "Trade" the primary action** — it should be visually dominant. Use a filled `colors.primary` background for the Trade card, with white text/icon. The other two cards remain as outlined/surface cards.
2. **Add a subtle gradient** to the Trade card background (`primary` → slightly lighter `primary`) for depth.
3. **Remove the badge text** from Portfolio and Markets cards in Simple mode — badges like "3 holdings" and "Live" add clutter for beginner users. Reserve badges for Pro mode.

### 4.4 MEDIUM — Trending Cards Need Better Composition

**Current state:** Trending cards show `[Icon + Ticker] [Sparkline] [Price + Change]` in a vertical stack. The sparkline takes up significant space but the card feels generic.

**Recommendation:**

1. **Make the sparkline full-width** within the card, extending edge-to-edge behind the price text (with reduced opacity). This creates a more dramatic visual and better uses the card real estate.
2. **Add a rank indicator** — show "#1", "#2", etc. as a small badge in the top-right corner of each trending card.
3. **Use a horizontal scroll snap** — ensure the trending cards scroll with snap-to-card behavior (`snapToInterval`, `decelerationRate: "fast"`) for a polished carousel feel.

---

## 5. Color & Theme Refinements

### 5.1 HIGH — Dark Mode Needs More Depth Layers

**Current state:** The dark palette uses:
- `background: #0A0B0D` (near-black)
- `surface: #1A1C23`
- `surfaceSecondary: #262830`

This is a good foundation but the jump from `background` to `surface` is too subtle in some contexts, making it hard to distinguish elevated cards from the background.

**Recommendation:**

Add an intermediate token and adjust the scale:

| Token | Current | Proposed | Usage |
|-------|---------|----------|-------|
| `background` | `#0A0B0D` | `#0A0B0D` | Screen background |
| `surfaceSubtle` | — | `#12131A` | **NEW** — Slightly elevated (list backgrounds) |
| `surface` | `#1A1C23` | `#1A1C23` | Cards, modals |
| `surfaceSecondary` | `#262830` | `#262830` | Pressed states, nested surfaces |
| `surfaceElevated` | — | `#2E3038` | **NEW** — Popovers, tooltips |

This 5-step gray scale (vs. the current 3-step) gives much more flexibility for creating visual hierarchy in dark mode.

### 5.2 MEDIUM — Add Accent Gradient for Premium Touches

**Recommendation:**

Define a brand gradient that can be used sparingly for premium UI elements:

```typescript
export const BrandGradient = {
  primary: ['#0052FF', '#578BFA'],    // Blue gradient
  success: ['#09854F', '#27AD74'],    // Green gradient
  premium: ['#4257E9', '#8A7BFA'],    // Indigo-purple (accent)
};
```

Use this gradient for:
- The "Pro" badge in the view mode toggle
- The XP progress bar fill
- Achievement card borders (as a `LinearGradient` border)
- The portfolio hero PnL badge background (very subtle, 10% opacity)

This adds a layer of visual richness without breaking the minimal aesthetic.

---

## 6. Motion & Micro-Interactions

### 6.1 HIGH — List Item Stagger Animations Are Missing

**Current state:** The animation system defines `STAGGER_DELAY` (30ms) and `staggerDelay()` but most list items don't use staggered entry animations. The `FlatList` in Markets and Trade renders items without entrance animation.

**Recommendation:**

Add `entering={FadeInDown.duration(200).delay(staggerDelay(index))}` to `AssetRow` when rendered in lists. Cap at `STAGGER_MAX` (12 items) to avoid long waits. This creates a cascading reveal effect that feels polished and intentional.

**Important:** Only apply stagger on initial mount, not on re-renders or scroll. Use a ref to track whether the initial animation has played.

### 6.2 HIGH — Number Animations Need Easing

**Current state:** `AnimatedNumber` exists and is used for prices and portfolio values. However, the animation should use a **counting-up effect** for the portfolio hero on screen load — starting from `€0.00` and counting up to the actual value over ~600ms with an ease-out curve.

This is a signature Robinhood/Coinbase interaction that makes the portfolio feel alive.

### 6.3 MEDIUM — Pull-to-Refresh Needs Custom Treatment

**Current state:** Uses the default `RefreshControl` with `tintColor={colors.primary}`. This is the stock iOS spinner.

**Recommendation:**

Replace with a custom pull-to-refresh animation:
1. Show a small AGRX logo (or a stylized "A") that rotates on pull
2. On release, transition to a subtle progress bar at the top of the screen
3. On completion, flash a brief "Updated" toast with the timestamp

This is a high-effort but high-reward change that signals premium quality.

---

## 7. Onboarding & First Impressions

### 7.1 HIGH — Onboarding Screens Need Visual Assets

**Current state:** The onboarding uses SF Symbol icons (`chart.line.uptrend.xyaxis`, `person.2.fill`, `trophy.fill`) in colored circles. This is functional but looks like a placeholder.

**Files affected:**
- `app/onboarding.tsx`

**Recommendation:**

1. **Replace SF Symbol icons with illustrated graphics** — use Lottie animations or high-quality SVG illustrations for each slide. Even simple geometric illustrations (a stylized chart, connected people, a trophy) would dramatically improve first impressions.
2. **Add a background gradient** to each slide that subtly shifts color based on the `accentToken` — this creates visual variety across the 3 slides.
3. **Animate the transition between slides** — add a parallax effect where the icon/illustration moves at 1.2x the speed of the text during swipe, creating depth.

---

## 8. Information Architecture

### 8.1 MEDIUM — Simple Mode Should Be Simpler

**Current state:** Simple mode still shows a significant amount of information: portfolio hero with PnL, quick stats, quick actions, watchlist, trending, market news. For a "simple" mode targeting beginners, this is still dense.

**Recommendation:**

Reduce Simple mode to:
1. **Portfolio value** (large, centered, no sparkline)
2. **Single PnL number** (today's change)
3. **3 quick action buttons** (Trade, Portfolio, Markets)
4. **Watchlist** (max 5 items, with "Add more" CTA)
5. **1 trending stock** (featured, not a horizontal list)

Move Trending carousel, Market News, and Social Feed Preview to Pro mode only. This creates a genuinely different experience between modes rather than just hiding a few elements.

### 8.2 MEDIUM — Asset Detail Screen Is Too Long

**Current state:** The asset detail screen (`app/asset/[id].tsx`) is 754 lines and packs chart, stats, news, sentiment, and action buttons into a single scroll. The information density is high.

**Recommendation:**

1. **Add a sticky header** that shows `Ticker + Price` when the user scrolls past the hero section. This provides persistent context.
2. **Use a segmented tab** below the chart to switch between "Overview", "News", and "Stats" rather than stacking everything vertically. This reduces scroll depth and lets users focus on what they care about.
3. **Make the Buy/Sell buttons sticky** at the bottom of the screen (above the tab bar) so they're always accessible without scrolling.

---

## 9. Accessibility & Polish

### 9.1 HIGH — Touch Targets Are Inconsistent

**Current state:** The spacing constants define `TouchTarget.minimum: 44` and `TouchTarget.standard: 48`, but many interactive elements don't meet these minimums:
- Close button on trade sheet: `32 × 32` (below minimum)
- Sector filter chips: variable height, often < 44px
- Star/watchlist toggle: depends on icon size

**Recommendation:**

Audit all interactive elements and ensure minimum 44×44 touch targets. Use `hitSlop` for elements that need to remain visually small but require larger touch areas.

### 9.2 MEDIUM — Loading States Need Skeleton Consistency

**Current state:** `StockListSkeleton` and `SocialFeedSkeleton` exist, but not all screens use skeletons. The Markets screen shows skeletons but the Home screen sections don't have individual skeleton states.

**Recommendation:**

Create skeleton variants for:
- `PortfolioHeroSkeleton` (large number placeholder + PnL pill)
- `TrendingCardSkeleton` (card shape with shimmer)
- `QuickStatsSkeleton` (3 stat boxes with shimmer)

Use a consistent shimmer animation across all skeletons (a `LinearGradient` that translates horizontally on a loop).

---

## 10. Priority Implementation Roadmap

### Phase 1 — Immediate Impact (1-2 days)

| Priority | Item | Impact |
|----------|------|--------|
| P0 | Add `Shadow` elevation system to all cards | Instant depth upgrade |
| P0 | Remove dark mode borders, rely on surface contrast | Modern dark theme |
| P0 | Increase portfolio hero number to 40-44pt | Visual authority |
| P0 | Add PnL background pills | Scannable financial data |
| P1 | Tab bar blur effect + active dot indicator | Premium navigation |
| P1 | AssetRow refresh (72px height, wider sparkline, press bg) | Core list upgrade |

### Phase 2 — Polish (3-5 days)

| Priority | Item | Impact |
|----------|------|--------|
| P1 | Section header accent bars + "See All" | Visual hierarchy |
| P1 | Stagger animations on list items | Motion polish |
| P1 | Deterministic ticker icon colors | Visual variety |
| P2 | SwipeToConfirm simplification + shimmer | Trade flow polish |
| P2 | Quick Actions hierarchy (Trade = primary) | Clear CTA |
| P2 | Dark mode 5-step gray scale | Depth flexibility |

### Phase 3 — Premium Touches (1-2 weeks)

| Priority | Item | Impact |
|----------|------|--------|
| P2 | Onboarding illustrations/Lottie | First impression |
| P2 | Asset detail sticky header + segmented tabs | Information architecture |
| P2 | Shared element transitions (list → detail) | Navigation delight |
| P3 | Custom pull-to-refresh | Brand identity |
| P3 | Portfolio value count-up animation | Signature interaction |
| P3 | Brand gradient accents | Premium aesthetic |

---

## Summary of Key Files to Modify

| File | Changes |
|------|---------|
| `constants/shadows.ts` | **NEW** — Elevation system |
| `theme.config.js` | Add `surfaceSubtle`, `surfaceElevated` tokens |
| `app/(tabs)/_layout.tsx` | Blur tab bar, active dot, gradient border |
| `components/ui/asset-row.tsx` | Height, sparkline width, press state, divider |
| `components/ui/trending-card.tsx` | Full-width sparkline, rank badge |
| `components/features/home/portfolio-hero.tsx` | Larger number, PnL pill, animation |
| `components/features/home/quick-actions.tsx` | Trade = primary, remove Simple badges |
| `components/features/home/*.tsx` | Consistent section spacing |
| `components/ui/swipe-to-confirm.tsx` | Simplify thumb, add shimmer label |
| `app/onboarding.tsx` | Illustrations, background gradients |
| `app/asset/[id].tsx` | Sticky header, segmented tabs, sticky CTA |

---

*This audit is designed to be implemented incrementally. Each recommendation is independent and can be shipped separately. The Phase 1 items alone will produce a noticeable visual upgrade.*
